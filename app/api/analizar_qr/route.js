import { NextResponse } from 'next/server';

// Parser para estándar EMVCo (usado en códigos QR oficiales de Yape, BCP, Plin, Niubiz)
function parseEMVCo(payload) {
  if (!payload || typeof payload !== 'string' || !payload.startsWith('000201')) {
    return null;
  }
  try {
    const tags = {};
    let i = 0;
    while (i < payload.length) {
      const id = payload.substring(i, i + 2);
      const len = parseInt(payload.substring(i + 2, i + 4), 10);
      if (isNaN(len) || i + 4 + len > payload.length) break;
      const val = payload.substring(i + 4, i + 4 + len);
      tags[id] = val;
      i = i + 4 + len;
    }

    // Tag 59: Merchant Name
    // Tag 54: Transaction Amount
    const nombre = tags['59'] ? tags['59'].trim() : null;
    const monto = tags['54'] && !isNaN(parseFloat(tags['54'])) ? parseFloat(tags['54']).toFixed(2) : null;

    let destino = 'Yape';
    const tag26 = tags['26'] || '';
    const tag62 = tags['62'] || '';
    const combined = (tag26 + ' ' + tag62).toLowerCase();

    if (combined.includes('plin')) destino = 'Plin';
    else if (combined.includes('interbank')) destino = 'Interbank';
    else if (combined.includes('bbva')) destino = 'BBVA';
    else if (combined.includes('scotiabank')) destino = 'Scotiabank';
    else if (combined.includes('bcp')) destino = 'BCP';

    if (nombre && nombre.length > 1) {
      return { nombre, destino, monto };
    }
  } catch (e) {
    console.error('Error parseando EMVCo:', e);
  }
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { image, qrData } = body;

    // 1. Prioridad: Revisar si el QR contiene metadatos nativos EMVCo (0 ms de latencia)
    if (qrData) {
      const emvcoData = parseEMVCo(qrData);
      if (emvcoData && emvcoData.nombre) {
        return NextResponse.json({
          status: 'success',
          source: 'emvco',
          nombre: emvcoData.nombre,
          destino: emvcoData.destino,
          monto: emvcoData.monto
        });
      }
    }

    // 2. Si no hay imagen disponible para analizar por IA, retornar fallback
    if (!image) {
      return NextResponse.json({ status: 'no_image', nombre: null, destino: 'Yape', monto: null });
    }

    // 3. Preparar imagen Base64 para Gemini Vision
    let mimeType = 'image/jpeg';
    let cleanBase64 = image;
    if (image.includes(',')) {
      const parts = image.split(',');
      cleanBase64 = parts[1];
      const mimeMatch = parts[0].match(/:(.*?);/);
      if (mimeMatch) mimeType = mimeMatch[1];
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        status: 'fallback',
        message: 'GEMINI_API_KEY no configurada',
        nombre: null,
        destino: 'Yape',
        monto: null
      });
    }

    const prompt = `Analiza esta imagen que contiene un letrero, cartel, tarjeta o soporte de pago con código QR en Perú (como Yape, Plin, BCP, BBVA, Interbank, etc.).
Extrae con precisión la información de pago que aparezca impresa o escrita cerca o alrededor del código QR:
1. "nombre": El nombre del titular, persona o negocio (ejemplo: "Bodega Don Pepe", "Juan Carlos Pérez", "Librería San Martín"). Si no hay ningún nombre visible cerca del QR, devuelve null.
2. "destino": La billetera o banco destinatario. Si aparece el logo o palabra de "Plin" pon "Plin". Si dice "BCP" pon "BCP". Si dice "Interbank" pon "Interbank". Si dice "BBVA" pon "BBVA". Si dice "Scotiabank" pon "Scotiabank". Si no se especifica o es un cartel de Yape, pon "Yape".
3. "monto": Si hay un monto o precio escrito claramente cerca del QR (ejemplo en una pizarra de menú, boleta o letrero con "S/ 12.00"), extrae solo el número decimal como texto (ejemplo: "12.00"). Si no hay monto especificado, devuelve null.

Responde ÚNICAMENTE en formato JSON con la siguiente estructura exacta:
{"nombre": null o "string", "destino": "Yape" o banco, "monto": null o "string"}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: cleanBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.1
        }
      })
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.warn('Gemini Vision API respondió status no-ok:', geminiRes.status, errText);
      return NextResponse.json({
        status: 'fallback',
        error: `API error ${geminiRes.status}`,
        nombre: null,
        destino: 'Yape',
        monto: null
      });
    }

    const data = await geminiRes.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json({ status: 'not_found', nombre: null, destino: 'Yape', monto: null });
    }

    try {
      const parsed = JSON.parse(rawText.trim());
      return NextResponse.json({
        status: 'success',
        source: 'ia',
        nombre: parsed.nombre || null,
        destino: parsed.destino || 'Yape',
        monto: parsed.monto || null
      });
    } catch (parseError) {
      console.error('Error parseando JSON de Gemini:', rawText);
      return NextResponse.json({ status: 'parse_error', nombre: null, destino: 'Yape', monto: null });
    }

  } catch (error) {
    console.error('Error en /api/analizar_qr:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      nombre: null,
      destino: 'Yape',
      monto: null
    });
  }
}
