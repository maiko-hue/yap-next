"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditarDatos() {
  const router = useRouter();

  // Skeleton loading state
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [isPopupEnabled, setIsPopupEnabled] = useState(true);
  const [isBotEnabled, setIsBotEnabled] = useState(false);
  const [isCorreoEnabled, setIsCorreoEnabled] = useState(false);
  const [correo, setCorreo] = useState('');
  const [phoneError, setPhoneError] = useState(false);
  const [correoError, setCorreoError] = useState(false);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    // Load existing data from localStorage
    setName(localStorage.getItem('yape_name') || '');
    
    let savedBal = parseFloat(localStorage.getItem('yape_balance'));
    if (!isNaN(savedBal)) {
      setBalance(savedBal.toFixed(2));
    } else {
      setBalance('0.00');
    }

    setIsPopupEnabled(localStorage.getItem('yape_show_popup') !== 'false');
    setIsBotEnabled(localStorage.getItem('yape_bot_telegram_activo') === 'true');
    setCorreo(localStorage.getItem('yape_correo') || '');
    setPhone(localStorage.getItem('yape_user_phone') || '');
    setIsCorreoEnabled(localStorage.getItem('yape_envio_correo_activo') === 'true');

    // Remove skeleton after 1s
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleBalanceChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value === '') {
      setBalance('0.00');
      return;
    }
    let amount = parseInt(value, 10) / 100;
    setBalance(amount.toFixed(2));
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value.replace(/[^0-9]/g, ''));
  };

  const toggleCorreo = (e) => {
    // Evitamos activar accidentalmente al escribir en inputs
    if (e.target.tagName === 'INPUT') return;

    if (!isCorreoEnabled) {
      let canActivate = true;
      if (phone.trim().length !== 9) {
        canActivate = false;
        setPhoneError(true);
        setTimeout(() => setPhoneError(false), 1500);
      }
      if (!correo.trim() || !correo.includes('@')) {
        canActivate = false;
        setCorreoError(true);
        setTimeout(() => setCorreoError(false), 1500);
      }
      if (!canActivate) return;
    }

    setIsCorreoEnabled(!isCorreoEnabled);
  };

  const handleSave = () => {
    localStorage.setItem('yape_name', name);
    localStorage.setItem('yape_balance', balance);
    localStorage.setItem('yape_show_popup', isPopupEnabled);
    localStorage.setItem('yape_bot_telegram_activo', isBotEnabled);
    localStorage.setItem('yape_correo', correo);
    localStorage.setItem('yape_user_phone', phone);
    localStorage.setItem('yape_envio_correo_activo', isCorreoEnabled);
    
    if (isCorreoEnabled) {
      localStorage.setItem('yape_correo_contador', '0');
    }

    // Go back to opciones
    router.push('/opciones');
  };

  return (
    <>
      <div className="container-ed">
        
        <div className="header-hero-ed">
          <i className="fa-solid fa-arrow-left back-icon-ed" onClick={() => router.push('/opciones')}></i>
          <img src="/img/secondlogo.png" alt="Logo" className="logo-img-custom-ed" />
        </div>

        <div className="info-card-ed">
          
          <h1 className="main-title-ed">Configuración</h1>
          <p className="subtitle-ed">Modifica los datos y ajustes de tu app</p>

          {/* SECCIÓN 1: INPUTS PRINCIPALES */}
          <div className="settings-section-ed">
            <div className="input-block-ed">
              <label>Nombre de Usuario</label>
              <div className={`input-container-ed ${loading ? 'skeleton-box-ed' : ''}`}>
                <i className="fa-solid fa-user"></i>
                <input type="text" value={name} onChange={e => setName(e.target.value)} autoComplete="off" />
              </div>
            </div>

            <div className="input-block-ed">
              <label>Saldo Inicial</label>
              <div className={`input-container-ed ${loading ? 'skeleton-box-ed' : ''}`}>
                <i className="fa-solid fa-sack-dollar"></i>
                <input type="text" inputMode="decimal" value={balance} onChange={handleBalanceChange} autoComplete="off" />
              </div>
            </div>
          </div>

          <hr className="divider-ed" />

          {/* SECCIÓN 2: AJUSTES RÁPIDOS */}
          <div className="settings-section-ed">
            <div className="setting-item-ed" onClick={() => setIsPopupEnabled(!isPopupEnabled)}>
              <div className="setting-left-ed">
                <div className="icon-circle-ed bg-red-ed"><i className="fa-regular fa-clone"></i></div>
                <div className="setting-text-ed">
                  <span className="st-title-ed">Popup Publicidad</span>
                  <span className="st-desc-ed" style={{ color: isPopupEnabled ? '#00BFA5' : '#666' }}>{isPopupEnabled ? 'Activado' : 'Desactivado'}</span>
                </div>
              </div>
              <div className={`toggle-switch-ed ${isPopupEnabled ? 'active' : ''}`}><div className="toggle-knob-ed"></div></div>
            </div>

            <div className="setting-item-ed" onClick={() => setIsBotEnabled(!isBotEnabled)}>
              <div className="setting-left-ed">
                <div className="icon-circle-ed bg-orange-ed"><i className="fa-solid fa-robot"></i></div>
                <div className="setting-text-ed">
                  <span className="st-title-ed">Auto Completado</span>
                  <span className="st-desc-ed" style={{ color: isBotEnabled ? '#00BFA5' : '#666' }}>{isBotEnabled ? 'Activado' : 'Desactivado'}</span>
                </div>
              </div>
              <div className={`toggle-switch-ed ${isBotEnabled ? 'active' : ''}`}><div className="toggle-knob-ed"></div></div>
            </div>

            <div className="setting-item-ed column-item-ed" onClick={toggleCorreo}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer' }}>
                <div className="setting-left-ed">
                  <div className="icon-circle-ed bg-purple-ed"><i className="fa-solid fa-envelope-open-text"></i></div>
                  <div className="setting-text-ed">
                    <span className="st-title-ed">Constancias a Correo</span>
                    <span className="st-desc-ed" style={{ color: isCorreoEnabled ? '#00BFA5' : '#666' }}>{isCorreoEnabled ? 'Activado' : 'Desactivado'}</span>
                  </div>
                </div>
                <div className={`toggle-switch-ed ${isCorreoEnabled ? 'active' : ''}`}><div className="toggle-knob-ed"></div></div>
              </div>

              <div className="expandable-box-ed">
                <div className="input-block-ed" style={{ marginBottom: '12px' }}>
                  <label>Correo Electrónico</label>
                  <div className={`input-container-ed ${loading ? 'skeleton-box-ed' : ''}`}>
                    <i className="fa-solid fa-at"></i>
                    <input type="email" placeholder="ejemplo@correo.com" value={correo} onChange={e => setCorreo(e.target.value)} autoComplete="off" spellCheck="false" />
                  </div>
                </div>
                <div className="input-block-ed">
                  <label>Número de Celular</label>
                  <div className={`input-container-ed ${loading ? 'skeleton-box-ed' : ''}`}>
                    <i className="fa-solid fa-phone"></i>
                    <input type="tel" placeholder="999 999 999" value={phone} onChange={handlePhoneChange} autoComplete="off" maxLength="9" />
                  </div>
                </div>
                <p className="hint-msg-ed">Constancias directamente a tu correo, se desactiva cada 3 yapeos, debes volver a activarlo.</p>
              </div>
            </div>
          </div>

          <hr className="divider-ed" />

          {/* SECCIÓN 3: LINKS ÚTILES */}
          <div className="settings-section-ed">
            <a href="https://t.me/+6weA5d0fVzFlYTcx" target="_blank" className="setting-item-ed" style={{ textDecoration: 'none' }}>
              <div className="setting-left-ed">
                <div className="icon-circle-ed bg-blue-ed"><i className="fa-brands fa-telegram"></i></div>
                <div className="setting-text-ed">
                  <span className="st-title-ed">Grupo Telegram</span>
                  <span className="st-desc-ed">Únete al canal oficial</span>
                </div>
              </div>
              <i className="fa-solid fa-arrow-up-right-from-square arrow-icon-ed"></i>
            </a>

            <div className="setting-item-ed" onClick={() => alert('Módulo en construcción: Sobre esto')}>
              <div className="setting-left-ed">
                <div className="icon-circle-ed bg-gray-ed"><i className="fa-solid fa-info"></i></div>
                <div className="setting-text-ed">
                  <span className="st-title-ed">Información</span>
                  <span className="st-desc-ed">Créditos y detalles técnicos</span>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right arrow-icon-ed"></i>
            </div>
          </div>

          <button className="btn-primary-ed" onClick={handleSave}>Guardar Cambios</button>
          
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .container-ed { max-width: 480px; margin: 0 auto; min-height: 100dvh; height: 100dvh; overflow-y: auto; display: flex; flex-direction: column; position: relative; background-color: #f2f4f6; }
        .header-hero-ed { background: linear-gradient(135deg, #742385 0%, #511973 100%); height: 200px; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; position: relative; display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 15px rgba(81, 25, 115, 0.3); flex-shrink: 0; }
        .back-icon-ed { position: absolute; top: 25px; left: 25px; color: white; font-size: 24px; cursor: pointer; background: rgba(255,255,255,0.2); width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; transition: background 0.3s; }
        .back-icon-ed:active { background: rgba(255,255,255,0.4); }
        .logo-img-custom-ed { width: 120px; height: 120px; object-fit: contain; margin-top: -20px; opacity: 0.95; border-radius: 15px; }

        .info-card-ed { background: white; margin: -50px 20px 20px 20px; padding: 30px 20px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); position: relative; z-index: 2; animation: slideUpEd 0.4s ease-out; }
        @keyframes slideUpEd { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .main-title-ed { font-size: 22px; font-weight: 800; color: #511973; margin: 0 0 5px 0; text-align: center; }
        .subtitle-ed { font-size: 13px; color: #888; font-weight: 500; margin-bottom: 25px; text-align: center; }

        .settings-section-ed { margin-bottom: 25px; display: flex; flex-direction: column; gap: 15px; }
        .input-block-ed { display: flex; flex-direction: column; gap: 6px; }
        .input-block-ed label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-left: 5px; }
        
        .input-container-ed { display: flex; align-items: center; background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0 15px; height: 50px; transition: all 0.2s; }
        .input-container-ed:focus-within { border-color: #742385; box-shadow: 0 0 0 3px rgba(116, 35, 133, 0.1); background: white; }
        .input-container-ed i { color: #742385; font-size: 18px; margin-right: 12px; transition: opacity 0.3s; }
        .input-container-ed input { border: none; background: transparent; width: 100%; height: 100%; font-size: 16px; font-weight: 600; color: #333; outline: none; transition: opacity 0.3s; }

        .skeleton-box-ed { position: relative; overflow: hidden; background-color: #e2e8f0 !important; border-color: #e2e8f0 !important; }
        .skeleton-box-ed::after { content: ""; position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%); animation: skeletonShimmerEd 1.2s infinite; }
        @keyframes skeletonShimmerEd { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .skeleton-box-ed i, .skeleton-box-ed input { opacity: 0 !important; pointer-events: none; }

        .divider-ed { border: 0; border-top: 1px solid #eee; margin: 25px 0; }

        .setting-item-ed { display: flex; justify-content: space-between; align-items: center; padding: 12px 10px; border-radius: 12px; background: white; cursor: pointer; transition: background 0.2s; border: 1px solid transparent; }
        .setting-item-ed:active { background: #f8f9fa; border-color: #eee; }
        .setting-item-ed.column-item-ed { flex-direction: column; align-items: stretch; cursor: default; }
        .setting-item-ed.column-item-ed:active { background: white; border-color: transparent; }

        .setting-left-ed { display: flex; align-items: center; gap: 15px; }
        .icon-circle-ed { width: 40px; height: 40px; border-radius: 10px; display: flex; justify-content: center; align-items: center; font-size: 18px; flex-shrink: 0; }
        .bg-red-ed { background: rgba(255, 82, 82, 0.1); color: #FF5252; }
        .bg-orange-ed { background: rgba(255, 152, 0, 0.1); color: #FF9800; }
        .bg-purple-ed { background: rgba(116, 35, 133, 0.1); color: #742385; }
        .bg-blue-ed { background: rgba(0, 136, 204, 0.1); color: #0088cc; }
        .bg-gray-ed { background: #f2f2f2; color: #666; }

        .setting-text-ed { display: flex; flex-direction: column; gap: 3px; }
        .st-title-ed { font-weight: 700; font-size: 14px; color: #333; }
        .st-desc-ed { font-size: 12px; color: #888; font-weight: 600; }

        .toggle-switch-ed { width: 46px; height: 26px; background: #ddd; border-radius: 20px; position: relative; transition: background 0.3s; cursor: pointer; }
        .toggle-switch-ed.active { background: #742385; }
        .toggle-knob-ed { width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 3px; left: 3px; transition: left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
        .toggle-switch-ed.active .toggle-knob-ed { left: 23px; }

        .arrow-icon-ed { color: #ccc; font-size: 14px; }
        .expandable-box-ed { display: block; margin-top: 15px; border-top: 1px dashed #eee; padding-top: 15px; }
        .hint-msg-ed { font-size: 11px; color: #888; margin: 12px 5px 0 5px; line-height: 1.4; text-align: center; }

        .btn-primary-ed { background: linear-gradient(135deg, #742385 0%, #511973 100%); color: white; padding: 16px; border-radius: 14px; border: none; width: 100%; font-size: 16px; font-weight: 700; cursor: pointer; text-align: center; margin-top: 15px; box-shadow: 0 4px 15px rgba(116, 35, 133, 0.3); transition: transform 0.1s; }
        .btn-primary-ed:active { transform: scale(0.98); }
      `}} />
    </>
  );
}





