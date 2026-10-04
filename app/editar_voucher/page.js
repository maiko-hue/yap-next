'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

export default function EditarVoucher() {
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [celular, setCelular] = useState('');
  const [monto, setMonto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [destino, setDestino] = useState('Yape');
  const [isCensorActive, setIsCensorActive] = useState(true);
  
  const [checkFecha, setCheckFecha] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');

  const [checkOp, setCheckOp] = useState(true);
  const [opInput, setOpInput] = useState('');

  // Inicializar fecha, hora y num de operación
  useEffect(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    setCustomDate(`${yyyy}-${mm}-${dd}`);

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setCustomTime(`${hours}:${minutes}`);

    setOpInput(Math.floor(10000000 + Math.random() * 90000000).toString());
  }, []);

  const handleRegenerate = () => {
    setOpInput(Math.floor(10000000 + Math.random() * 90000000).toString());
  };

  const handleCelularChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 9) val = val.slice(0, 9);
    setCelular(val);
  };

  const hasName = nombre.trim().length > 0;
  const hasCell = celular.length === 9;
  const hasAmount = monto.trim().length > 0 && parseFloat(monto) > 0;
  const isFormValid = hasName && hasCell && hasAmount;

  const handleYapear = () => {
    const params = new URLSearchParams({
      nombre,
      numero: celular,
      destino,
      monto,
      operacion: opInput,
      mensaje,
      tipo: isCensorActive ? 'editable_censurar' : 'editable'
    });

    if (checkFecha) {
      params.append('fecha', customDate);
      params.append('hora', customTime);
    }

    router.push(`/exito?${params.toString()}`);
  };

  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>
      <div className="container">
        
        {/* HEADER HERO */}
        <div className="header-hero">
          <i className="fa-solid fa-arrow-left back-icon" onClick={() => router.push('/opciones')}></i>
          <img src="/img/secondlogo.png" alt="Logo" className="logo-img-custom" />
        </div>

        {/* INFO CARD */}
        <div className="info-card">
          <div className="section-title">Edita tus comprobantes aqui:</div>

          <input 
            type="text" 
            className="custom-input" 
            placeholder="Nombre y Apellido" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <div className="censor-container">
            <span className="censor-text">Censurar nombre (*)</span>
            <div 
              className={`toggle-switch ${isCensorActive ? 'active' : ''}`} 
              onClick={() => setIsCensorActive(!isCensorActive)}
            >
              <div className="toggle-knob"></div>
            </div>
          </div>

          <input 
            type="tel" 
            className="custom-input" 
            placeholder="Celular" 
            maxLength="9" 
            value={celular}
            onChange={handleCelularChange}
          />

          <select 
            className="custom-input custom-select" 
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
          >
            <option value="Yape">Yape</option>
            <option value="Plin">Plin</option>
            <option value="IziPay">IziPay</option>
            <option value="Bim">Bim</option>
            <option value="Tunki">Tunki</option>
            <option value="Agora / Oh!">Agora / Oh!</option>
            <option value="BCP">BCP</option>
            <option value="BBVA">BBVA</option>
            <option value="Interbank">Interbank</option>
            <option value="Financiera Efectiva">Financiera Efectiva</option>
            <option value="Dale">Dale</option>
          </select>

          <input 
            type="text" 
            className="custom-input" 
            placeholder="Agregar mensaje (opcional)"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
          />

          <div className="checkbox-row">
            <input 
              type="checkbox" 
              id="checkFecha" 
              checked={checkFecha}
              onChange={(e) => setCheckFecha(e.target.checked)}
            />
            <label htmlFor="checkFecha" className="checkbox-label">Elegir fecha y hora manualmente</label>
          </div>

          {checkFecha && (
            <div className="datetime-container show">
              <input 
                type="date" 
                className="custom-input" 
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
              <input 
                type="time" 
                className="custom-input" 
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
              />
            </div>
          )}

          <div className="amount-container">
            <span className="currency-symbol">S/</span>
            <input 
              type="tel" className="amount-input" placeholder="0.00" value={monto} onChange={(e) => { let raw = e.target.value.replace(/\D/g, ""); if (!raw) { setMonto(""); } else { setMonto((parseInt(raw, 10) / 100).toFixed(2)); } }}
            />
          </div>
          <div className="helper-text">Puedes Yapear hasta S/500 diarios</div>

          <div className="checkbox-row">
            <input 
              type="checkbox" 
              id="checkOp" 
              checked={checkOp}
              onChange={(e) => setCheckOp(e.target.checked)}
            />
            <label htmlFor="checkOp" className="checkbox-label">Ingresar N° de operación manual</label>
          </div>

          <div className="operation-row">
            <input 
              type="number" 
              className="custom-input" 
              value={opInput}
              onChange={(e) => setOpInput(e.target.value)}
              disabled={!checkOp}
            />
            <button 
              className="btn-regenerate" 
              onClick={handleRegenerate}
              disabled={!checkOp}
            >
              Regenerar
            </button>
          </div>

          <div className="disclaimer">
            Se usará como "Nro. de operación". En Yape, el "Código de seguridad" son los 3 últimos dígitos.
          </div>

          <button 
            className={`yapear-btn ${isFormValid ? 'active' : ''}`} 
            onClick={handleYapear}
            disabled={!isFormValid}
          >
            Yapear
          </button>
        </div>

        <style jsx>{`
          * {
            -webkit-tap-highlight-color: transparent;
            outline: none !important;
            -webkit-user-select: none; 
            -moz-user-select: none; 
            -ms-user-select: none; 
            user-select: none; 
            box-sizing: border-box;
          }
          input, textarea, select {
            -webkit-user-select: auto;
            -moz-user-select: auto;
            -ms-user-select: auto;
            user-select: auto;
          }
          
          .container {
            max-width: 480px; 
            margin: 0 auto; 
            height: 100dvh; 
            display: flex; 
            flex-direction: column; 
            position: relative;
            background-color: #f2f4f6;
            color: #333;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            overflow-y: auto;
          }

          .header-hero {
            background: linear-gradient(135deg, #742385 0%, #511973 100%);
            height: 220px;
            border-bottom-left-radius: 40px;
            border-bottom-right-radius: 40px;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4px 15px rgba(81, 25, 115, 0.3);
            flex-shrink: 0;
            padding-bottom: 20px;
          }

          .back-icon {
            position: absolute;
            top: 25px;
            left: 25px;
            color: white;
            font-size: 24px;
            cursor: pointer;
            background: rgba(255,255,255,0.2);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: background 0.3s;
            z-index: 10;
          }
          .back-icon:active { background: rgba(255,255,255,0.4); }

          .logo-img-custom {
            width: 150px;
            height: 150px;
            object-fit: contain;
            margin-top: -10px;
            opacity: 0.95;
            filter: drop-shadow(0px 10px 10px rgba(0,0,0,0.2));
            pointer-events: none;
          }

          .info-card {
            background: white;
            margin: -60px 20px 20px 20px;
            padding: 30px 20px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            position: relative;
            z-index: 2;
            animation: slideUp 0.4s ease-out;
            padding-bottom: 30px;
            display: flex;
            flex-direction: column;
            gap: 15px;
          }

          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          .section-title {
            font-size: 15px;
            font-weight: 800;
            color: #742385;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }

          .custom-input {
            width: 100%;
            background-color: #f9f9fb;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            padding: 16px;
            font-size: 15px;
            color: #555;
            font-family: inherit;
            box-shadow: 0 1px 2px rgba(0,0,0,0.02);
            transition: border-color 0.3s;
          }
          .custom-input:focus { border-color: #00BFA5; }
          .custom-input::placeholder { color: #aaa; font-weight: 400; }
          .custom-input:disabled { background-color: #e9ecef; color: #999; }

          .custom-select {
            appearance: none;
            -webkit-appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 15px center;
            background-size: 16px;
          }

          .checkbox-row {
            display: flex;
            align-items: center;
            margin-top: 5px;
            margin-bottom: 5px;
          }
          
          .checkbox-label { font-size: 14px; color: #333; margin-left: 10px; font-weight: 500; }
          input[type="checkbox"] { width: 18px; height: 18px; accent-color: #742385; cursor: pointer; }

          .censor-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 5px;
            margin-top: -10px; 
            margin-bottom: 5px;
          }
          .censor-text { font-size: 13px; color: #888; font-weight: 600; }
          
          .toggle-switch {
            width: 40px; height: 22px; background: #ccc; border-radius: 20px; position: relative; transition: background 0.3s; cursor: pointer;
          }
          .toggle-switch.active { background: #742385; }
          .toggle-knob {
            width: 18px; height: 18px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: left 0.3s;
          }
          .toggle-switch.active .toggle-knob { left: 20px; }

          .datetime-container { display: none; gap: 10px; margin-bottom: 5px; }
          .datetime-container.show { display: flex; }

          .amount-container {
            background-color: #f9f9fb;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            padding: 15px 20px;
            display: flex;
            align-items: center;
          }
          .currency-symbol { font-size: 28px; color: #742385; font-weight: 600; margin-right: 10px; }
          .amount-input { border: none; background: transparent; font-size: 32px; width: 100%; outline: none; color: #333; font-weight: 600; }
          .amount-input::placeholder { color: #ccc; font-weight: 400; }

          .helper-text { font-size: 12px; color: #999; margin-top: -10px; margin-bottom: 5px; margin-left: 5px; }

          .operation-row { display: flex; gap: 10px; align-items: center; }
          
          .btn-regenerate {
            background-color: #742385;
            color: white;
            border: none;
            border-radius: 12px;
            padding: 0 15px;
            height: 52px;
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
            transition: opacity 0.3s, transform 0.1s;
          }
          .btn-regenerate:active { transform: scale(0.95); }
          .btn-regenerate:disabled { background-color: #ccc; cursor: default; transform: none; }

          .disclaimer { font-size: 11px; color: #999; line-height: 1.4; margin-top: -5px; padding: 0 5px; }

          .yapear-btn {
            width: 100%;
            background-color: #bfaec4; 
            color: white;
            border: none;
            padding: 18px;
            border-radius: 30px;
            font-size: 18px;
            font-weight: 700;
            cursor: pointer;
            pointer-events: none;
            transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.1s;
            margin-top: 10px;
          }
          
          .yapear-btn.active {
            background-color: #00BFA5;
            pointer-events: all;
            box-shadow: 0 4px 15px rgba(0, 191, 165, 0.3);
          }
          .yapear-btn.active:active { transform: scale(0.97); background-color: #00a892; }
        `}</style>
      </div>
    </>
  );
}


