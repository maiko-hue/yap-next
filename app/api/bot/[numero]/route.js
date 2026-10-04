import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { numero } = await params;

  try {
    const response = await fetch(`http://116.203.222.62:8000/buscar/${numero}`, {
      method: 'GET',
      headers: {
        'X-API-Key': 'Maikol_Dev_2026_Secure' 
      }
    });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ status: 'error', nombre: 'Desconocido', detalle: error.message }, { status: 500 });
  }
}
