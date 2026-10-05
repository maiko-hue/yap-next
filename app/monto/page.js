"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db, doc, getDoc, setDoc } from '../firebase';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw5h6Q9mRk9E5ug_oNSI_B4EPxse2f4KLfbxUJoSx0zOSyzFoe3_eLC7zmjeM4qePes/exec";

function MontoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  let rawNumber = searchParams.get('numero') || "999999999";
  let passedName = searchParams.get('nombre');
  let qrData = searchParams.get('qr_data');
  let passedDestino = searchParams.get('destino') || "Yape";

  const [loadingName, setLoadingName] = useState(true);
  const [recipientName, setRecipientName] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  
  // Modals state
  const [showLoader, setShowLoader] = useState(false);
  const [showBanksOverlay, setShowBanksOverlay] = useState(false);
  const [showConfirmBankOverlay, setShowConfirmBankOverlay] = useState(false);
  
  // Others Banks Confirmation
  const [bancoSeleccionado, setBancoSeleccionado] = useState("");
  const [showAccordion, setShowAccordion] = useState(false);
  const [showPhoneCheckbox, setShowPhoneCheckbox] = useState(false);

  // Computed
  const maskedNumber = passedDestino === "Yape" ? (qrData ? (passedDestino) : `*** *** ${rawNumber.slice(-3)}`) : passedDestino;

  useEffect(() => {
    async function loadContactData() {
      if (qrData) {
        try {
          const safeId = qrData.replace(/\//g, '_slash_');
          const docRef = doc(db, "codigos_qr", safeId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            displayLoadedName(docSnap.data().nombre);
          } else {
            displayLoadedName("Negocio QR");
          }
        } catch (error) {
          displayLoadedName("Error QR");
        }
        return;
      }

      if (passedName && passedName !== "null" && passedName !== "undefined") {
        displayLoadedName(decodeURIComponent(passedName));
      } else {
        try {
          const docRef = doc(db, "usuarios_yape", rawNumber);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            displayLoadedName(docSnap.data().nombre);
          } else {
            const botActivo = localStorage.getItem('yape_bot_telegram_activo') === 'true';
            if (botActivo) {
              try {
                const response = await fetch(`/api/bot/${rawNumber}`);
                if (!response.ok) throw new Error('Bot API no disponible');
                const contentType = response.headers.get('content-type') || '';
                if (!contentType.includes('application/json')) throw new Error('Respuesta no es JSON');
                const data = await response.json();
                if (data.status === 'success' && data.nombre) {
                  displayLoadedName(data.nombre);
                  await setDoc(doc(db, "usuarios_yape", rawNumber), { nombre: data.nombre });
                } else {
                  displayLoadedName("Desconocido");
                }
              } catch (botError) {
                console.log("Bot no disponible, mostrando como Desconocido");
                displayLoadedName("Desconocido");
              }
            } else {
              displayLoadedName("Desconocido");
            }
          }
        } catch (error) {
          displayLoadedName("Error de Red");
        }
      }
    }
    loadContactData();
  }, [qrData, rawNumber, passedName]);

  const displayLoadedName = (name) => {
    let nombreMostrar = name;
    if (localStorage.getItem('yape_censurar_baucher') === 'true' && typeof nombreMostrar === 'string') {
      let partes = nombreMostrar.trim().split(/\s+/);
      if (partes.length === 2) {
        nombreMostrar = partes[0] + " " + partes[1].substring(0, 3) + "*";
      } else if (partes.length >= 3) {
        nombreMostrar = partes[0] + " " + partes[2].substring(0, 3) + "*";
      }
    }
    setRecipientName(nombreMostrar);
    setLoadingName(false);
  };

  const handleAmountChange = (e) => {
    let val = e.target.value.replace(/[^0-9.]/g, ''); 
    if ((val.match(/\./g) || []).length > 1) val = val.substring(0, val.length - 1);
    if (val.length > 1 && val.startsWith('0') && val[1] !== '.') val = val.substring(1);
    let numVal = parseFloat(val);
    if (numVal > 500) val = "500";
    setAmount(val);
  };

  function getCurrentDateTime() {
    const now = new Date();
    const dateOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    let dateStr = now.toLocaleDateString('es-ES', dateOptions);
    if (!dateStr.endsWith('.')) {
      const parts = dateStr.split(' ');
      if (parts.length >= 2 && !parts[1].includes('.')) parts[1] += '.';
      dateStr = parts.join(' ');
    }
    let timeStr = now.toLocaleTimeString('en-US', timeOptions).toLowerCase().replace('pm', 'p. m.').replace('am', 'a. m.');
    return { date: dateStr, time: timeStr, full: `${dateStr} - ${timeStr}` };
  }

  function procesarEnvioCorreo(datosOperacion) {
    if (localStorage.getItem('yape_envio_correo_activo') !== 'true') return;
    const correoDestino = localStorage.getItem('yape_correo');
    const celularOrigen = localStorage.getItem('yape_user_phone');
    const nombreUsuario = localStorage.getItem('yape_name');
    if (!correoDestino || !celularOrigen) return;

    const payload = {
      correo: correoDestino,
      nombre_usuario: nombreUsuario,
      celular_origen: celularOrigen,
      monto: parseFloat(datosOperacion.monto).toFixed(2),
      nombre: datosOperacion.nombre,
      destino: datosOperacion.destino,
      numero: datosOperacion.numero,
      fecha: datosOperacion.fechaSolo,
      hora: datosOperacion.horaSolo,
      operacion: datosOperacion.operacion
    };

    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(e => console.log("Envío en segundo plano completado"));

    let contador = parseInt(localStorage.getItem('yape_correo_contador') || '0');
    contador++;
    if (contador >= 3) {
      localStorage.setItem('yape_envio_correo_activo', 'false');
      localStorage.setItem('yape_correo_contador', '0');
    } else {
      localStorage.setItem('yape_correo_contador', contador.toString());
    }
  }

  const handleYapear = () => {
    setShowLoader(true);
    const montoFinal = amount;
    const nombreFinal = recipientName;
    const mensajeFinal = message;
    const dateTime = getCurrentDateTime();
    const operacionRandom = Math.floor(10000000 + Math.random() * 90000000).toString();
    const codigoSeguridadRandom = Math.floor(100 + Math.random() * 900).toString();

    let destinoReal = passedDestino; 
    let esQrLogica = "false";
    
    if (qrData) {
      destinoReal = maskedNumber;
      esQrLogica = "true";
    }

    let tipoMovimiento = 'gasto';
    if (mensajeFinal.trim() === "Auto") tipoMovimiento = 'ingreso';

    let saldoActual = localStorage.getItem('yape_balance') || "1200.00"; 
    let saldoNumerico = parseFloat(saldoActual.replace(/,/g, ''));
    let montoRestar = parseFloat(montoFinal);
    if (!isNaN(saldoNumerico) && !isNaN(montoRestar)) {
      if(tipoMovimiento === 'ingreso') saldoNumerico += montoRestar;
      else saldoNumerico -= montoRestar;
      localStorage.setItem('yape_balance', saldoNumerico.toFixed(2));
    }

    const nuevoMovimiento = {
      nombre: nombreFinal, monto: montoFinal, fecha: dateTime.full,
      fechaSolo: dateTime.date, horaSolo: dateTime.time,
      numero: esQrLogica === "true" ? destinoReal : rawNumber,
      operacion: operacionRandom, codigo: codigoSeguridadRandom,
      mensaje: mensajeFinal, destino: destinoReal, tipo: tipoMovimiento,
      mostrar_celular: destinoReal === "Yape" ? "asteriscos" : "false" 
    };

    let movimientos = JSON.parse(localStorage.getItem('yape_movements')) || [];
    movimientos.unshift(nuevoMovimiento);
    localStorage.setItem('yape_movements', JSON.stringify(movimientos));

    if (tipoMovimiento === 'gasto') procesarEnvioCorreo(nuevoMovimiento);

    setTimeout(() => {
      let url = `/exito?monto=${montoFinal}&nombre=${encodeURIComponent(nombreFinal)}&destino=${encodeURIComponent(destinoReal)}&es_qr=${esQrLogica}&numero=${rawNumber}&mensaje=${encodeURIComponent(mensajeFinal)}&operacion=${operacionRandom}&codigo=${codigoSeguridadRandom}&fecha=${dateTime.date.replace(/\./g,'')}&hora=${dateTime.time.replace(/\./g,'')}&mostrar_celular=${destinoReal === "Yape" ? "asteriscos" : "false"}&recien_yapeado=true`;
      if (tipoMovimiento === 'ingreso') url += '&tipo=ingreso';
      router.push(url);
    }, 3000 * (typeof window !== 'undefined' ? parseFloat(localStorage.getItem('yape_anim_speed') || '1') : 1));
  };

  const handleBankSelect = (banco) => {
    setBancoSeleccionado(banco);
    setShowAccordion(false);
    setShowPhoneCheckbox(false);
    setShowBanksOverlay(false);
    setShowConfirmBankOverlay(true);
  };

  const handleConfirmBankYape = () => {
    setShowConfirmBankOverlay(false);
    setShowLoader(true);

    const montoFinal = amount;
    const nombreFinal = recipientName;
    const mensajeFinal = message;
    const dateTime = getCurrentDateTime();
    const operacionRandom = Math.floor(10000000 + Math.random() * 90000000).toString();
    const codigoSeguridadRandom = Math.floor(100 + Math.random() * 900).toString();

    let destinoReal = bancoSeleccionado;
    let esQrLogica = "false";
    let mostrarCelular = showPhoneCheckbox ? "true" : "false";

    let tipoMovimiento = 'gasto';
    if (mensajeFinal.trim() === "Auto") tipoMovimiento = 'ingreso';

    let saldoActual = localStorage.getItem('yape_balance') || "1200.00"; 
    let saldoNumerico = parseFloat(saldoActual.replace(/,/g, ''));
    let montoRestar = parseFloat(montoFinal);
    if (!isNaN(saldoNumerico) && !isNaN(montoRestar)) {
        if(tipoMovimiento === 'ingreso') saldoNumerico += montoRestar;
        else saldoNumerico -= montoRestar;
        localStorage.setItem('yape_balance', saldoNumerico.toFixed(2));
    }

    const nuevoMovimiento = {
        nombre: nombreFinal, monto: montoFinal, fecha: dateTime.full,
        fechaSolo: dateTime.date, horaSolo: dateTime.time,
        numero: rawNumber, operacion: operacionRandom,
        codigo: codigoSeguridadRandom, mensaje: mensajeFinal,
        destino: destinoReal, tipo: tipoMovimiento,
        mostrar_celular: mostrarCelular 
    };

    let movimientos = JSON.parse(localStorage.getItem('yape_movements')) || [];
    movimientos.unshift(nuevoMovimiento);
    localStorage.setItem('yape_movements', JSON.stringify(movimientos));

    if(tipoMovimiento === 'gasto') procesarEnvioCorreo(nuevoMovimiento);

    setTimeout(() => {
        let url = `/exito?monto=${montoFinal}&nombre=${encodeURIComponent(nombreFinal)}&destino=${encodeURIComponent(destinoReal)}&es_qr=${esQrLogica}&numero=${rawNumber}&mensaje=${encodeURIComponent(mensajeFinal)}&operacion=${operacionRandom}&codigo=${codigoSeguridadRandom}&fecha=${dateTime.date.replace(/\./g,'')}&hora=${dateTime.time.replace(/\./g,'')}&mostrar_celular=${mostrarCelular}&recien_yapeado=true`;
        if (tipoMovimiento === 'ingreso') url += '&tipo=ingreso';
        router.push(url);
    }, 3000 * (typeof window !== 'undefined' ? parseFloat(localStorage.getItem('yape_anim_speed') || '1') : 1));
  };

  const isAmountValid = amount.length > 0 && parseFloat(amount) > 0;

  return (
    <div className="container-monto">
      <div className="header-monto">
        <a onClick={() => router.push('/inicio')} className="back-btn-monto"><i className="fa-solid fa-chevron-left"></i> Yapear a</a>
        <a onClick={() => router.push('/inicio')} className="close-btn-monto"><i className="fa-solid fa-xmark"></i></a>
      </div>
      
      <div className="content-monto">
        {loadingName ? (
          <div className="skeleton-box-monto"></div>
        ) : (
          <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} className="recipient-name-monto" spellCheck="false" style={{ display: 'block' }} />
        )}
        
        <div className="recipient-number-monto">{qrData ? (passedDestino || 'Yape') : maskedNumber}</div>
        
        <div className="amount-wrapper-monto">
          <span className="currency-symbol-monto" style={{ color: isAmountValid ? '#a86cc1' : '#bfaec4' }}>S/</span>
          <input 
            type="tel" 
            className="amount-input-monto" 
            placeholder="0" 
            maxLength="7" 
            autoComplete="off" 
            inputMode="decimal"
            value={amount}
            onChange={handleAmountChange}
            style={{ width: amount ? `${amount.length}ch` : '1ch' }}
          />
        </div>
        <div className="limit-text-monto">Límite por yapeo S/500, límite por día S/2,000</div>
      </div>

      <div className="bottom-section-monto">
        <div className="message-container-monto">
          <input type="text" className="message-input-monto" placeholder="Agregar mensaje" value={message} onChange={e => setMessage(e.target.value)} />
        </div>
        <div className="divider-line-monto"></div>
        <div className="footer-monto">
          <button className="btn-monto btn-outline-monto" onClick={() => isAmountValid && setShowBanksOverlay(true)}>Otros bancos</button>
          <button className={`btn-monto btn-primary-monto ${isAmountValid ? 'active' : ''}`} onClick={handleYapear}>Yapear</button>
        </div>
      </div>

      {/* Loader Overlay */}
      <div className={`loader-overlay-monto ${showLoader ? 'show' : ''}`}>
        <div className="loader-card-monto">
          <div className="custom-spinner-monto"></div>
          <div className="loader-text-monto">Yapeando...</div>
        </div>
      </div>

      {/* Banks Overlay */}
      <div className={`loader-overlay-monto ${showBanksOverlay ? 'show' : ''}`}>
        <div className="bottom-sheet-monto">
          <div className="modal-header-nav-monto">
            <div className="modal-back-title-monto" onClick={() => setShowBanksOverlay(false)}>
              <i className="fa-solid fa-chevron-left"></i> Yapear a
            </div>
            <div className="modal-close-icon-monto" onClick={() => setShowBanksOverlay(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
          </div>
          
          <div className="bank-list-scroll-monto">
            <div className="bank-item-monto" onClick={() => handleBankSelect('Yape')}>
              <div className="bank-item-icon-monto" style={{ background: 'transparent' }}><img src="/img/icon-96x96.png" style={{ width: '34px', height: '34px', borderRadius: '50%' }} alt="Yape" /></div>
              <div className="bank-item-text-monto" style={{ fontWeight: 700 }}>Yape</div>
            </div>
            <div className="subtitle-banks-monto">Selecciona una entidad financiera</div>
            {['Plin', 'Bim', 'Tunki', 'Agora / Oh!', 'BCP', 'BBVA', 'Interbank', 'Financiera Efectiva', 'Dale', 'IziPay'].map(b => (
              <div key={b} className="bank-item-monto" onClick={() => handleBankSelect(b)}>
                <div className="bank-item-icon-monto"><img src="/img/arrows.svg" alt="" /></div>
                <div className="bank-item-text-monto">{b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Bank Overlay */}
      <div className={`loader-overlay-monto ${showConfirmBankOverlay ? 'show' : ''}`}>
        <div className="bottom-sheet-monto" style={{ height: 'auto', maxHeight: '95dvh' }}>
          <div className="modal-header-nav-monto">
            <div className="modal-back-title-monto" onClick={() => setShowConfirmBankOverlay(false)}>
              <i className="fa-solid fa-chevron-left"></i> Yapear a
            </div>
            <div className="modal-close-icon-monto" onClick={() => setShowConfirmBankOverlay(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '10px' }}>
            <div className="bank-item-icon-monto" style={{ width: '52px', height: '52px', marginRight: 0, marginBottom: '12px' }}>
              <img src="/img/arrows.svg" style={{ width: '28px', height: '28px' }} alt="" />
            </div>
            <div style={{ color: '#666', fontSize: '15px', marginBottom: '5px' }}>Vas a yapear a:</div>
            <div style={{ color: '#742284', fontWeight: 700, fontSize: '19px', marginBottom: '25px', textAlign: 'center' }}>{recipientName}</div>

            <div className="confirm-summary-monto">
              <div className="summary-row-monto"><span className="summary-label-monto">Monto:</span><span className="summary-val-monto">S/ {parseFloat(amount || 0).toFixed(2)}</span></div>
              <div className="summary-row-monto"><span className="summary-label-monto">Destino:</span><span className="summary-val-monto">{bancoSeleccionado}</span></div>
            </div>

            <div style={{ width: '100%', marginTop: '15px' }}>
              <div onClick={() => setShowAccordion(!showAccordion)} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', color: '#555', fontSize: '14px', cursor: 'pointer' }}>
                Más opciones <i className={`fa-solid fa-chevron-${showAccordion ? 'up' : 'down'}`} style={{ marginLeft: '8px' }}></i>
              </div>
              {showAccordion && (
                <div style={{ marginTop: '15px' }}>
                  <label className="custom-checkbox-container-monto">
                    <input type="checkbox" checked={showPhoneCheckbox} onChange={e => setShowPhoneCheckbox(e.target.checked)} />
                    <span>Mostrar Nro. Celular</span>
                  </label>
                </div>
              )}
            </div>
            
            <div style={{ width: '100%', marginTop: '30px', paddingBottom: '10px' }}>
              <button className="btn-monto btn-primary-monto active" style={{ width: '100%', marginBottom: '12px' }} onClick={handleConfirmBankYape}>CONFIRMAR YAPEO</button>
              <button className="btn-monto btn-outline-monto" style={{ width: '100%', borderColor: '#ddd', color: '#666' }} onClick={() => setShowConfirmBankOverlay(false)}>CANCELAR</button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .container-monto { width: 100%; height: calc(100dvh / var(--app-zoom, 1)); display: flex; flex-direction: column; position: relative; background-color: white; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .header-monto { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; flex-shrink: 0; }
        .back-btn-monto { display: flex; align-items: center; text-decoration: none; color: #444; font-weight: 700; font-size: 17px; cursor: pointer; }
        .back-btn-monto i { margin-right: 10px; color: #666; font-size: 18px; }
        .close-btn-monto { color: #666; font-size: 26px; text-decoration: none; font-weight: bold; cursor: pointer; }
        .content-monto { flex: 1; display: flex; flex-direction: column; align-items: center; padding-top: 20px; overflow-y: auto; min-height: 0; }
        
        .skeleton-box-monto { width: 140px; height: 18px; background-color: #e2e5e7; border-radius: 6px; margin-bottom: 2px; position: relative; overflow: hidden; }
        .skeleton-box-monto::after { content: ""; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); animation: shimmer-monto 1.5s infinite; }
        @keyframes shimmer-monto { 100% { left: 200%; } }

        .recipient-name-monto { font-size: 22px; font-weight: 700; color: #742284; border: none; text-align: center; background: transparent; width: 100%; margin-bottom: 2px; font-family: inherit; }
        .recipient-number-monto { font-size: 15px; color: #888; font-weight: 600; margin-bottom: 40px; letter-spacing: 1px; }
        .amount-wrapper-monto { display: flex; align-items: center; justify-content: center; margin-bottom: 15px; width: 100%; }
        .currency-symbol-monto { font-size: 45px; font-weight: 500; margin-right: 5px; margin-bottom: 8px; transition: color 0.3s; }
        .amount-input-monto { font-size: 85px; font-weight: 500; color: #742284; border: none; text-align: left; background: transparent; font-family: inherit; line-height: 1; padding: 0; caret-color: #742284; }
        .amount-input-monto::placeholder { color: #742284; }
        .limit-text-monto { background-color: #f4f4f4; color: #888; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; text-align: center; margin: 0 20px 20px 20px; }
        
        .bottom-section-monto { width: 100%; padding-bottom: max(20px, env(safe-area-inset-bottom)); flex-shrink: 0; background-color: white; z-index: 10; }
        .message-container-monto { width: 100%; padding: 0 25px; position: relative; }
        .message-input-monto { width: 100%; border: none; text-align: center; font-size: 16px; color: #333; font-family: inherit; padding-bottom: 15px; background: transparent; }
        .message-input-monto::placeholder { color: #aaa; outline: none; }
        .divider-line-monto { width: 90%; height: 1px; background-color: #e0e0e0; margin: 0 auto 20px auto; }
        
        .footer-monto { padding: 0 20px; display: flex; gap: 15px; background-color: white; }
        .btn-monto { flex: 1; padding: 16px; border-radius: 8px; font-weight: 700; font-size: 16px; cursor: pointer; text-align: center; border: none; transition: all 0.2s; }
        .btn-outline-monto { background-color: white; border: 1px solid #00BFA5; color: #00BFA5; }
        .btn-primary-monto { background-color: #e0e0e0; color: white; pointer-events: none; }
        .btn-primary-monto.active { background-color: #00BFA5; color: white; pointer-events: all; box-shadow: 0 4px 12px rgba(0, 191, 165, 0.3); }
        .btn-primary-monto.active:active { transform: scale(0.98); }
        
        .loader-overlay-monto { position: fixed; top: 0; left: 0; width: 100%; height: calc(100dvh / var(--app-zoom, 1)); background-color: rgba(0,0,0,0.6); z-index: 3000; display: flex; justify-content: center; align-items: center; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
        .loader-overlay-monto.show { opacity: 1; pointer-events: all; }
        .loader-card-monto { background: white; width: 273px; height: 117px; border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        .custom-spinner-monto { width: 38px; height: 38px; border: 4px solid #e0e0e0; border-top: 4px solid #00BFA5; border-radius: 50%; animation: spin-monto 1.5s linear infinite; margin-bottom: 12px; }
        @keyframes spin-monto { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .loader-text-monto { font-size: 16px; font-weight: 700; color: #333; }
        
        .bottom-sheet-monto { position: absolute; bottom: 0; left: 0; width: 100%; height: 92dvh; background: white; border-top-left-radius: 20px; border-top-right-radius: 20px; display: flex; flex-direction: column; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); padding: 20px; }
        .loader-overlay-monto.show .bottom-sheet-monto { transform: translateY(0); }
        .modal-header-nav-monto { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-shrink: 0; }
        .modal-back-title-monto { display: flex; align-items: center; color: #1a1a1a; font-weight: 700; font-size: 17px; cursor: pointer; }
        .modal-back-title-monto i { margin-right: 15px; font-size: 18px; color: #555; }
        .modal-close-icon-monto { cursor: pointer; display: flex; justify-content: center; align-items: center; width: 24px; height: 24px; }
        
        .bank-list-scroll-monto { flex: 1; overflow-y: auto; padding-bottom: 20px; }
        .bank-item-monto { display: flex; align-items: center; border: 1px solid #f2f2f2; border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); cursor: pointer; background: white; transition: background-color 0.2s; }
        .bank-item-monto:active { background-color: #fafafa; }
        .bank-item-icon-monto { width: 34px; height: 34px; border-radius: 50%; background-color: #F7E1F8; display: flex; justify-content: center; align-items: center; margin-right: 15px; flex-shrink: 0; }
        .bank-item-icon-monto img { width: 18px; height: 18px; object-fit: contain; }
        .bank-item-text-monto { font-size: 15px; font-weight: 500; color: #1a1a1a; }
        .subtitle-banks-monto { color: #742284; font-weight: 700; font-size: 14px; margin: 25px 0 15px 5px; }
        
        .confirm-summary-monto { background-color: #f7f7f9; width: 100%; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
        .summary-row-monto { display: flex; justify-content: space-between; font-size: 14.5px; }
        .summary-label-monto { color: #666; }
        .summary-val-monto { font-weight: 700; color: #1a1a1a; }
        
        .custom-checkbox-container-monto { display: flex; align-items: center; background: white; border: 1px solid #f0f0f0; padding: 15px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.03); cursor: pointer; }
        .custom-checkbox-container-monto input { accent-color: #00BFA5; width: 22px; height: 22px; margin-right: 12px; cursor: pointer; }
        .custom-checkbox-container-monto span { font-size: 14.5px; color: #333; font-weight: 400; }
      `}} />
    </div>
  );
}

export default function MontoPage() {
  return (
    <Suspense fallback={<div style={{height:'calc(100dvh / var(--app-zoom, 1))', background:'white'}}></div>}>
      <MontoContent />
    </Suspense>
  );
}

