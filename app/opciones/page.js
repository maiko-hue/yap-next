"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function Opciones() {
  const router = useRouter();
  
  // TOAST
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2000);
  };

  // MODALS STATE
  const [showNotiModal, setShowNotiModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);

  // NOTI CONFIG STATE
  const [notiRandom, setNotiRandom] = useState(true);
  const [notiDark, setNotiDark] = useState(false);
  const [notiNames, setNotiNames] = useState([]);
  const [notiMontoTipo, setNotiMontoTipo] = useState('rango');
  const [notiMontoMin, setNotiMontoMin] = useState('');
  const [notiMontoMax, setNotiMontoMax] = useState('');
  const [notiMontoFijo, setNotiMontoFijo] = useState('');
  const [notiCodRandom, setNotiCodRandom] = useState(true);
  const [notiCodFijo, setNotiCodFijo] = useState('');
  const [newNotiName, setNewNotiName] = useState('');

  // ADVANCED CONFIG STATE
  const [censurarNombres, setCensurarNombres] = useState(true);
  const [censurarBaucher, setCensurarBaucher] = useState(false);
  const [frecuentes, setFrecuentes] = useState([]);
  const [newFreqName, setNewFreqName] = useState('');
  const [newFreqNum, setNewFreqNum] = useState('');

  // CONTACTS STATE
  const [useCustomContacts, setUseCustomContacts] = useState(false);
  const [customContacts, setCustomContacts] = useState([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactNum, setNewContactNum] = useState('');

  // ZOOM STATE
  const [zoomLevel, setZoomLevel] = useState('1');
  const [iosMode, setIosMode] = useState(false);
  const [animSpeed, setAnimSpeed] = useState('1');

  useEffect(() => {
    // Load Noti Config
    setNotiRandom(localStorage.getItem('yape_noti_random') !== 'false');
    setNotiDark(localStorage.getItem('yape_noti_dark') === 'true');
    setNotiNames(JSON.parse(localStorage.getItem('yape_noti_remitentes')) || []);
    setNotiMontoTipo(localStorage.getItem('yape_noti_monto_tipo') || 'rango');
    setNotiMontoMin(localStorage.getItem('yape_noti_monto_min') || '');
    setNotiMontoMax(localStorage.getItem('yape_noti_monto_max') || '');
    setNotiMontoFijo(localStorage.getItem('yape_noti_monto_fijo') || '');
    setNotiCodRandom(localStorage.getItem('yape_noti_cod_random') !== 'false');
    setNotiCodFijo(localStorage.getItem('yape_noti_cod_fijo') || '');

    // Load Advanced Config
    setCensurarNombres(localStorage.getItem('yape_censurar_nombres') !== 'false');
    setCensurarBaucher(localStorage.getItem('yape_censurar_baucher') === 'true');
    setFrecuentes(JSON.parse(localStorage.getItem('yape_frecuentes')) || []);

    setAnimSpeed(localStorage.getItem('yape_anim_speed') || '1');
    // Load Contacts Config
    setUseCustomContacts(localStorage.getItem('yape_use_custom_contacts') === 'true');
    setCustomContacts(JSON.parse(localStorage.getItem('yape_custom_contacts')) || []);

    // Load Zoom
    setZoomLevel(localStorage.getItem('yape_zoom_level') || '1');
    setIosMode(localStorage.getItem('yape_ios_spinner') === 'true');
  }, []);

  // Handlers for Noti
  const handleNotiRandomChange = (e) => {
    const val = e.target.checked;
    setNotiRandom(val);
    localStorage.setItem('yape_noti_random', val);
  };
  const handleNotiDarkChange = (e) => {
    const val = e.target.checked;
    setNotiDark(val);
    localStorage.setItem('yape_noti_dark', val);
  };
  const handleAddNotiName = () => {
    if (notiNames.length >= 2) return showToast("Solo 2 nombres máximo");
    if (!newNotiName.trim()) return showToast("Escribe un nombre");
    if (newNotiName.trim().split(/\\s+/).length > 2) return showToast("Solo 1 o 2 palabras");
    
    const updated = [...notiNames, newNotiName.trim()];
    setNotiNames(updated);
    localStorage.setItem('yape_noti_remitentes', JSON.stringify(updated));
    setNewNotiName('');
    showToast("Remitente agregado");
  };
  const handleDelNotiName = (idx) => {
    const updated = notiNames.filter((_, i) => i !== idx);
    setNotiNames(updated);
    localStorage.setItem('yape_noti_remitentes', JSON.stringify(updated));
  };
  const handleMontoChange = (field, val) => {
    let num = parseFloat(val);
    if (num > 500) { val = '500'; showToast("El máximo es 500"); }
    if (num < 0) { val = '0'; }
    
    if (field === 'min') { setNotiMontoMin(val); localStorage.setItem('yape_noti_monto_min', val); }
    if (field === 'max') { setNotiMontoMax(val); localStorage.setItem('yape_noti_monto_max', val); }
    if (field === 'fijo') { setNotiMontoFijo(val); localStorage.setItem('yape_noti_monto_fijo', val); }
  };
  const handleCodRandomChange = (e) => {
    const val = e.target.checked;
    setNotiCodRandom(val);
    localStorage.setItem('yape_noti_cod_random', val);
  };
  const handleCodFijoChange = (val) => {
    const clean = val.replace(/[^0-9]/g, '');
    setNotiCodFijo(clean);
    localStorage.setItem('yape_noti_cod_fijo', clean);
  };

  // Handlers for Advanced Config
  const handleCensurarNombres = (e) => {
    const val = e.target.checked;
    setCensurarNombres(val);
    localStorage.setItem('yape_censurar_nombres', val);
    showToast(val ? "Nombres se ocultarán con *" : "Nombres se mostrarán completos");
  };
  const handleCensurarBaucher = (e) => {
    const val = e.target.checked;
    setCensurarBaucher(val);
    localStorage.setItem('yape_censurar_baucher', val);
    showToast(val ? "Nombres del baucher se reducirán" : "Nombres del baucher completos");
  };
  const handleAddFrecuente = () => {
    if (!newFreqName.trim()) return showToast("Escribe un nombre");
    if (newFreqNum.length !== 9) return showToast("El celular debe tener 9 números");
    const updated = [...frecuentes, { nombre: newFreqName.trim(), celular: newFreqNum }];
    setFrecuentes(updated);
    localStorage.setItem('yape_frecuentes', JSON.stringify(updated));
    setNewFreqName(''); setNewFreqNum('');
    showToast("¡Frecuente guardado localmente!"); // Removed Firebase integration for safety/simplicity
  };
  const handleDelFrecuente = (idx) => {
    const updated = frecuentes.filter((_, i) => i !== idx);
    setFrecuentes(updated);
    localStorage.setItem('yape_frecuentes', JSON.stringify(updated));
    showToast("Frecuente Eliminado");
  };

  // Handlers for Contacts
  const handleUseCustomContacts = (e) => {
    const val = e.target.checked;
    setUseCustomContacts(val);
    localStorage.setItem('yape_use_custom_contacts', val);
    showToast(val ? "Lista Propia Activada" : "Contactos por defecto Activados");
  };
  const handleAddContact = () => {
    if (!newContactName.trim()) return showToast("Escribe un nombre");
    if (newContactNum.length !== 9) return showToast("El celular debe tener 9 números");
    const updated = [...customContacts, { nombre: newContactName.trim(), celular: newContactNum }];
    setCustomContacts(updated);
    localStorage.setItem('yape_custom_contacts', JSON.stringify(updated));
    setNewContactName(''); setNewContactNum('');
    showToast("Contacto añadido");
  };
  const handleDelContact = (idx) => {
    const updated = customContacts.filter((_, i) => i !== idx);
    setCustomContacts(updated);
    localStorage.setItem('yape_custom_contacts', JSON.stringify(updated));
    showToast("Contacto Eliminado");
  };

  // Handlers for Delete Movements
  const handleDeleteMovements = () => {
    localStorage.removeItem('yape_movements');
    setShowDeleteModal(false);
    showToast("Movimientos borrados");
  };

  // Handler for Zoom
    const handleAnimSpeed = (speed) => {
    setAnimSpeed(speed);
    localStorage.setItem('yape_anim_speed', speed);
    showToast("Velocidad de animacion actualizada");
  };
  const handleIosModeChange = (e) => {
    const val = e.target.checked;
    setIosMode(val);
    localStorage.setItem('yape_ios_spinner', val);
    if(val) document.documentElement.classList.add('ios-mode');
    else document.documentElement.classList.remove('ios-mode');
    showToast(val ? "Modo iPhone activado" : "Modo iPhone desactivado");
  };
  const handleZoom = (level) => {
    setZoomLevel(level);
    localStorage.setItem('yape_zoom_level', level);
      document.documentElement.style.zoom = level;
      document.documentElement.style.setProperty('--app-zoom', level);
    showToast("Tamaño de Inicio actualizado");
  };

  // PIN CONFIG
  const [showPinConfirmModal, setShowPinConfirmModal] = useState(false);
  const [showPinPromptModal, setShowPinPromptModal] = useState(false);
  const [pinStep, setPinStep] = useState(1);
  const [tempPin, setTempPin] = useState('');
  const [pinInput, setPinInput] = useState('');

  const handleStartPin = () => setShowPinConfirmModal(true);
  const proceedToPin = () => {
    setShowPinConfirmModal(false);
    setPinStep(1);
    setTempPin('');
    setPinInput('');
    setShowPinPromptModal(true);
  };
  const submitCustomPin = () => {
    if (pinInput.length !== 6) return showToast("El PIN debe tener 6 números.");
    if (pinStep === 1) {
      setTempPin(pinInput);
      setPinStep(2);
      setPinInput('');
    } else {
      if (pinInput === tempPin) {
        localStorage.setItem('yape_custom_pin', pinInput);
        setShowPinPromptModal(false);
        showToast("PIN definido correctamente");
      } else {
        showToast("Los PINs no coinciden. Inténtalo de nuevo.");
        setPinStep(1);
        setTempPin('');
        setPinInput('');
      }
    }
  };

  return (
    <>
      <div className="container-opciones">
        
        {/* HEADER HERO */}
        <div className="header-hero">
          <i className="fa-solid fa-arrow-left back-icon" onClick={() => router.push('/inicio')}></i>
          <img src="/img/mascota.png" alt="Opciones" className="logo-img-custom" />
        </div>

        {/* INFO CARD */}
        <div className="info-card">
          
          <div className="section-title">Cuenta y Pagos</div>
          <div className="settings-section">
            <div className="setting-item" onClick={() => router.push('/editar_datos')}>
              <div className="setting-left">
                <div className="icon-circle bg-purple"><i className="fa-solid fa-user-pen"></i></div>
                <div className="setting-text">
                  <span className="st-title">Datos de mi cuenta</span>
                  <span className="st-desc">Modifica tu perfil y saldo</span>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right arrow-icon"></i>
            </div>

            <div className="setting-item" onClick={() => setShowNotiModal(true)}>
              <div className="setting-left">
                <div className="icon-circle bg-orange"><i className="fa-solid fa-comment-dots"></i></div>
                <div className="setting-text">
                  <span className="st-title">Administrar noti falsa</span>
                  <span className="st-desc">Personaliza el mensaje push</span>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right arrow-icon"></i>
            </div>

            <div className="setting-item" onClick={() => router.push('/editar_voucher')}>
              <div className="setting-left">
                <div className="icon-circle bg-teal"><i className="fa-solid fa-receipt"></i></div>
                <div className="setting-text">
                  <span className="st-title">Editar Voucher</span>
                  <span className="st-desc">Personaliza los comprobantes</span>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right arrow-icon"></i>
            </div>

            <div className="setting-item" onClick={handleStartPin}>
              <div className="setting-left">
                <div className="icon-circle bg-orange" style={{ background: 'rgba(255, 152, 0, 0.1)', color: '#FF9800' }}><i className="fa-solid fa-lock"></i></div>
                <div className="setting-text">
                  <span className="st-title">Definir Pin</span>
                  <span className="st-desc">Configura tu seguridad</span>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right arrow-icon"></i>
            </div>

            <div className="setting-item" onClick={() => setShowDeleteModal(true)}>
              <div className="setting-left">
                <div className="icon-circle bg-red"><i className="fa-solid fa-trash-can"></i></div>
                <div className="setting-text">
                  <span className="st-title">Borrar movimientos</span>
                  <span className="st-desc">Elimina tu historial de operaciones</span>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right arrow-icon"></i>
            </div>
          </div>

          <hr className="divider" />

          <div className="section-title">Accesos y Contactos</div>
          <div className="settings-section">

            <div className="setting-item" onClick={() => router.push('/agregar_contacto')}>
              <div className="setting-left">
                <div className="icon-circle bg-blue"><i className="fa-solid fa-user-plus"></i></div>
                <div className="setting-text">
                  <span className="st-title">Agregar contacto</span>
                  <span className="st-desc">Nuevo a tu agenda</span>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right arrow-icon"></i>
            </div>

            <div className="setting-item" onClick={() => router.push('/agregar_qr')}>
              <div className="setting-left">
                <div className="icon-circle" style={{ background: 'rgba(0,0,0,0.05)', color: '#111' }}><i className="fa-solid fa-qrcode"></i></div>
                <div className="setting-text">
                  <span className="st-title">Agregar QR</span>
                  <span className="st-desc">Registra un nuevo código</span>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right arrow-icon"></i>
            </div>

            <div className="setting-item" onClick={() => setShowContactsModal(true)}>
              <div className="setting-left">
                <div className="icon-circle bg-gray"><i className="fa-solid fa-address-book"></i></div>
                <div className="setting-text">
                  <span className="st-title">Lista de Contactos</span>
                  <span className="st-desc">Gestiona tus destinatarios</span>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right arrow-icon"></i>
            </div>

            <div className="setting-item" onClick={() => setShowConfigModal(true)}>
              <div className="setting-left">
                <div className="icon-circle bg-dark"><i className="fa-solid fa-gear"></i></div>
                <div className="setting-text">
                  <span className="st-title">Configuración Avanzada</span>
                  <span className="st-desc">Ajustes del sistema</span>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right arrow-icon"></i>
            </div>
          </div>

          <hr className="divider" />

          <div className="section-title">Mas de AppsReborn</div>
          <div className="settings-section">
            <a href="https://reniecdni.vercel.app" target="_blank" className="setting-item" style={{textDecoration: 'none'}}>
              <div className="setting-left">
                <div className="icon-circle bg-purple"><i className="fa-solid fa-globe"></i></div>
                <div className="setting-text">
                  <span className="st-title">reniecdni.vercel.app</span>
                  <span className="st-desc">Consulta de documentos</span>
                </div>
              </div>
              <i className="fa-solid fa-arrow-up-right-from-square arrow-icon"></i>
            </a>
          </div>

          <hr className="divider" />

          <div className="section-title">Accesibilidad (Zoom Inicio)</div>
          <div className="settings-section">
            <div className="zoom-container">
              <button className={`zoom-btn ${zoomLevel === '0.85' ? 'active' : ''}`} onClick={() => handleZoom('0.85')}>
                <i className="fa-solid fa-magnifying-glass-minus"></i>
                <span style={{ fontSize: '11px' }}>Pequeño</span>
              </button>
              <button className={`zoom-btn ${zoomLevel === '1' ? 'active' : ''}`} onClick={() => handleZoom('1')}>
                <i className="fa-solid fa-expand"></i>
                <span style={{ fontSize: '11px' }}>Normal</span>
              </button>
              <button className={`zoom-btn ${zoomLevel === '1.15' ? 'active' : ''}`} onClick={() => handleZoom('1.15')}>
                <i className="fa-solid fa-magnifying-glass-plus"></i>
                <span style={{ fontSize: '11px' }}>Grande</span>
              </button>
              <button className={`zoom-btn ${zoomLevel === '1.3' ? 'active' : ''}`} onClick={() => handleZoom('1.3')}>
                <i className="fa-solid fa-magnifying-glass-plus" style={{ transform: 'scale(1.2)' }}></i>
                <span style={{ fontSize: '11px' }}>Extra</span>
              </button>
                          </div>
            </div>
            <hr className="divider" />

            <div className="section-title">Diseño de carga</div>
            <div className="settings-section">
              <div className="switch-container-opciones" style={{ marginBottom: 0 }}>
                <span className="switch-label-opciones">Modo iPhone (Spinners)</span>
                <label className="switch-opciones">
                  <input type="checkbox" checked={iosMode} onChange={handleIosModeChange} />
                  <span className="slider-opciones"></span>
                </label>
              </div>
            </div>
            <hr className="divider" />
            
            <div className="section-title">Tiempos de animaciones</div>
          <div className="settings-section">
            <div className="zoom-container">
              <button className={`zoom-btn ${animSpeed === '0.01' ? 'active' : ''}`} onClick={() => handleAnimSpeed('0.01')}>
                <i className="fa-solid fa-bolt"></i>
                <span style={{ fontSize: '11px' }}>Ultra</span>
              </button>
              <button className={`zoom-btn ${animSpeed === '0.5' ? 'active' : ''}`} onClick={() => handleAnimSpeed('0.5')}>
                <i className="fa-solid fa-gauge-high"></i>
                <span style={{ fontSize: '11px' }}>Rápido</span>
              </button>
              <button className={`zoom-btn ${animSpeed === '1' ? 'active' : ''}`} onClick={() => handleAnimSpeed('1')}>
                <i className="fa-solid fa-gauge"></i>
                <span style={{ fontSize: '11px' }}>Normal</span>
              </button>
              <button className={`zoom-btn ${animSpeed === '2' ? 'active' : ''}`} onClick={() => handleAnimSpeed('2')}>
                <i className="fa-solid fa-gauge-simple"></i>
                <span style={{ fontSize: '11px' }}>Lento</span>
              </button>
            </div>
          </div>
          <hr className="divider" />
          <div className="section-title">Sistema</div>
          <div className="settings-section">
            <div className="setting-item" onClick={() => { window.location.reload(); }}>
              <div className="setting-left">
                <div className="icon-circle bg-teal"><i className="fa-solid fa-arrows-rotate"></i></div>
                <div className="setting-text">
                  <span className="st-title">Actualizar App</span>
                  <span className="st-desc">Limpia el caché del sistema</span>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right arrow-icon"></i>
            </div>
            <a href="https://t.me/MaikolEsleiter" target="_blank" className="setting-item" style={{textDecoration: 'none'}}>
              <div className="setting-left">
                <div className="icon-circle bg-blue"><i className="fa-solid fa-headset"></i></div>
                <div className="setting-text">
                  <span className="st-title">Contactar soporte</span>
                  <span className="st-desc">Ayuda y asistencia técnica</span>
                </div>
              </div>
              <i className="fa-solid fa-arrow-up-right-from-square arrow-icon"></i>
            </a>
            <div className="setting-item" onClick={() => router.push("/mi_cuenta")}>
                <div className="setting-left">
                  <div className="icon-circle bg-gray"><i className="fa-solid fa-user"></i></div>
                <div className="setting-text">
                  <span className="st-title">Mi cuenta</span>
                  <span className="st-desc">Información de tu cuenta</span>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right arrow-icon"></i>
            </div>
              <div className="setting-item" onClick={() => setShowLogoutModal(true)}>
                <div className="setting-left">
                  <div className="icon-circle bg-red"><i className="fa-solid fa-right-from-bracket"></i></div>
                  <div className="setting-text">
                    <span className="st-title">Cerrar sesión</span>
                    <span className="st-desc">Salir de tu cuenta</span>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right arrow-icon"></i>
              </div>
          </div>

        </div>
      </div>

      {/* MODAL: NOTI FALSA */}
      <div className={`modal-overlay-opciones ${showNotiModal ? 'show' : ''}`} onClick={() => setShowNotiModal(false)}>
        <div className="modal-panel-opciones" onClick={e => e.stopPropagation()}>
          <div className="modal-header-opciones">
            <div className="modal-title-opciones">Configurar Notificación</div>
            <button className="close-modal-btn-opciones" onClick={() => setShowNotiModal(false)}><i className="fa-solid fa-xmark"></i></button>
          </div>
          
          <div className="switch-container-opciones">
            <span className="switch-label-opciones">Notificaciones con datos randoms</span>
            <label className="switch-opciones">
              <input type="checkbox" checked={notiRandom} onChange={handleNotiRandomChange} />
              <span className="slider-opciones"></span>
            </label>
          </div>

          <div className="switch-container-opciones" style={{ marginBottom: '20px' }}>
            <span className="switch-label-opciones">Modo Oscuro (#202020)</span>
            <label className="switch-opciones">
              <input type="checkbox" checked={notiDark} onChange={handleNotiDarkChange} />
              <span className="slider-opciones"></span>
            </label>
          </div>

          {!notiRandom && (
            <div id="panelNotiCustom">
              <hr className="divider" />
              <div className="section-title-opciones" style={{ margin: '15px 0 5px 0', color: '#333' }}>Remitentes Personalizados</div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '15px', fontWeight: 500 }}>Máximo 2 nombres. Solo 1 o 2 palabras (Ej: Juan Perez).</div>
              <div className="add-contact-form">
                <div className="input-group">
                  <input type="text" className="contact-input" placeholder="Ingresa un nombre" value={newNotiName} onChange={e => setNewNotiName(e.target.value)} />
                </div>
                <button className="btn-add" onClick={handleAddNotiName}>Añadir</button>
              </div>
              <div className="custom-contact-list">
                {notiNames.map((name, idx) => (
                  <div key={idx} className="custom-item">
                    <div className="ci-info"><span className="ci-name">{name}</span></div>
                    <button className="btn-delete" onClick={() => handleDelNotiName(idx)}><i className="fa-solid fa-trash-can"></i></button>
                  </div>
                ))}
              </div>

              <hr className="divider" style={{ marginTop: '25px' }} />
              <div className="section-title-opciones" style={{ margin: '15px 0 10px 0', color: '#333' }}>Configuración de Monto</div>
              <select className="contact-input" style={{ width: '100%', marginBottom: '15px', padding: '14px' }} value={notiMontoTipo} onChange={e => { setNotiMontoTipo(e.target.value); localStorage.setItem('yape_noti_monto_tipo', e.target.value); }}>
                <option value="rango">Rango de monto aleatorio</option>
                <option value="fijo">Monto fijo</option>
              </select>

              {notiMontoTipo === 'rango' ? (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <div className="input-group">
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#777', marginBottom: '2px' }}>Mínimo</span>
                    <input type="number" className="contact-input" placeholder="0" value={notiMontoMin} onChange={e => handleMontoChange('min', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#777', marginBottom: '2px' }}>Máximo</span>
                    <input type="number" className="contact-input" placeholder="500" value={notiMontoMax} onChange={e => handleMontoChange('max', e.target.value)} />
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '15px' }}>
                  <div className="input-group">
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#777', marginBottom: '2px' }}>Monto exacto</span>
                    <input type="number" className="contact-input" placeholder="Ej: 70" style={{ width: '100%' }} value={notiMontoFijo} onChange={e => handleMontoChange('fijo', e.target.value)} />
                  </div>
                </div>
              )}

              <hr className="divider" style={{ marginTop: '25px' }} />
              <div className="section-title-opciones" style={{ margin: '15px 0 10px 0', color: '#333' }}>Código de Seguridad</div>
              <div className="switch-container-opciones" style={{ marginBottom: '15px' }}>
                <span className="switch-label-opciones">Generar código random</span>
                <label className="switch-opciones">
                  <input type="checkbox" checked={notiCodRandom} onChange={handleCodRandomChange} />
                  <span className="slider-opciones"></span>
                </label>
              </div>

              {!notiCodRandom && (
                <div style={{ marginBottom: '40px' }}>
                  <div className="input-group">
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#777', marginBottom: '2px' }}>Código personalizado</span>
                    <input type="tel" className="contact-input" placeholder="Ej: 106" maxLength="3" style={{ width: '100%' }} value={notiCodFijo} onChange={e => handleCodFijoChange(e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CONTACTOS */}
      <div className={`modal-overlay-opciones ${showContactsModal ? 'show' : ''}`} onClick={() => setShowContactsModal(false)}>
        <div className="modal-panel-opciones" onClick={e => e.stopPropagation()}>
          <div className="modal-header-opciones">
            <div className="modal-title-opciones">Contactos Personalizados</div>
            <button className="close-modal-btn-opciones" onClick={() => setShowContactsModal(false)}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="switch-container-opciones">
            <span className="switch-label-opciones">Activar Lista Propia</span>
            <label className="switch-opciones">
              <input type="checkbox" checked={useCustomContacts} onChange={handleUseCustomContacts} />
              <span className="slider-opciones"></span>
            </label>
          </div>
          <div className="add-contact-form">
            <div className="input-group">
              <input type="text" className="contact-input" placeholder="Nombre completo" value={newContactName} onChange={e => setNewContactName(e.target.value)} />
              <input type="tel" className="contact-input" placeholder="Celular (9 dígitos)" maxLength="9" value={newContactNum} onChange={e => setNewContactNum(e.target.value.replace(/[^0-9]/g, ''))} />
            </div>
            <button className="btn-add" onClick={handleAddContact}>Añadir</button>
          </div>
          <div className="custom-contact-list">
            {customContacts.length === 0 ? <div className="empty-msg">No has agregado ningún contacto aún.</div> : customContacts.map((contact, idx) => (
              <div key={idx} className="custom-item">
                <div className="ci-info">
                  <span className="ci-name">{contact.nombre}</span>
                  <span className="ci-number">{contact.celular}</span>
                </div>
                <button className="btn-delete" onClick={() => handleDelContact(idx)}><i className="fa-solid fa-trash-can"></i></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: CONFIG AVANZADA */}
      <div className={`modal-overlay-opciones ${showConfigModal ? 'show' : ''}`} onClick={() => setShowConfigModal(false)}>
        <div className="modal-panel-opciones" onClick={e => e.stopPropagation()} style={{ height: '85vh' }}>
          <div className="modal-header-opciones">
            <div className="modal-title-opciones">Configuración Avanzada</div>
            <button className="close-modal-btn-opciones" onClick={() => setShowConfigModal(false)}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="switch-container-opciones">
            <span className="switch-label-opciones">Censurar Nombres (En Inicio)</span>
            <label className="switch-opciones">
              <input type="checkbox" checked={censurarNombres} onChange={handleCensurarNombres} />
              <span className="slider-opciones"></span>
            </label>
          </div>
          <div className="switch-container-opciones">
            <span className="switch-label-opciones">Censurar nombres (En Monto)</span>
            <label className="switch-opciones">
              <input type="checkbox" checked={censurarBaucher} onChange={handleCensurarBaucher} />
              <span className="slider-opciones"></span>
            </label>
          </div>
          <div style={{ fontWeight: 700, color: '#333', marginTop: '10px', marginBottom: '10px', fontSize: '15px' }}>Yaperos Frecuentes (Pantalla de Inicio)</div>
          <div className="add-contact-form">
            <div className="input-group">
              <input type="text" className="contact-input" placeholder="Nombre completo" value={newFreqName} onChange={e => setNewFreqName(e.target.value)} />
              <input type="tel" className="contact-input" placeholder="Celular (9 dígitos)" maxLength="9" value={newFreqNum} onChange={e => setNewFreqNum(e.target.value.replace(/[^0-9]/g, ''))} />
            </div>
            <button className="btn-add" onClick={handleAddFrecuente}>Añadir</button>
          </div>
          <div className="custom-contact-list">
            {frecuentes.length === 0 ? <div className="empty-msg">No has agregado Yaperos Frecuentes aún.</div> : frecuentes.map((contact, idx) => (
              <div key={idx} className="custom-item">
                <div className="ci-info">
                  <span className="ci-name">{contact.nombre}</span>
                  <span className="ci-number">{contact.celular}</span>
                </div>
                <button className="btn-delete" onClick={() => handleDelFrecuente(idx)}><i className="fa-solid fa-trash-can"></i></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: BORRAR MOVIMIENTOS */}
      <div className={`modal-overlay-opciones ${showDeleteModal ? 'show' : ''}`} style={{ alignItems: 'center' }}>
        <div className="yape-alert-card">
          <div className="yape-alert-title">Advertencia</div>
          <div className="yape-alert-text">Estas a punto de borrar todos tus movimientos ¿Esta usted seguro?</div>
          <div className="yape-alert-actions">
            <button className="yape-btn-cancel" onClick={() => setShowDeleteModal(false)}>No</button>
            <button className="yape-btn-confirm" onClick={handleDeleteMovements}>Si</button>
          </div>
        </div>
      </div>

      {/* PANTALLA COMPLETA PIN */}
      <div className={`pin-screen-overlay ${showPinConfirmModal ? 'show' : ''}`}>
        <div className="pin-header">
            <i className="fa-solid fa-chevron-left pin-header-icon" onClick={() => setShowPinConfirmModal(false)}></i>
            <span className="pin-header-title">Cambiar PIN</span>
        </div>
        <div className="pin-hero">
            <img src="/img/change_password.webp" alt="Lock" />
        </div>
        <div className="pin-btn-container">
            <button className="btn-teal-pin" onClick={() => setShowPinConfirmModal('native_alert')}>Definir Pin</button>
        </div>
      </div>

      {/* MODAL: PIN NATIVE CONFIRMACION */}
      <div className={`modal-overlay-opciones ${showPinConfirmModal === 'native_alert' ? 'show' : ''}`} style={{ alignItems: 'center', zIndex: 7000 }}>
        <div className="yape-alert-card-native">
          <div className="yape-alert-title" style={{ color: '#333', marginBottom: '5px' }}>¿Estás seguro?</div>
          <div className="yape-alert-text-native">Estás a punto de cambiar y definir tu PIN.</div>
          <div className="yape-alert-actions-native">
            <button className="yape-btn-text-only" style={{ marginRight: '15px', color: '#888' }} onClick={() => setShowPinConfirmModal(true)}>NO</button>
            <button className="yape-btn-text-only" onClick={proceedToPin}>SÍ</button>
          </div>
        </div>
      </div>

      {/* MODAL: DEFINIR PIN INPUT */}
      <div className={`modal-overlay-opciones ${showPinPromptModal ? 'show' : ''}`} style={{ alignItems: 'center', zIndex: 7000 }}>
        <div className="yape-alert-card-native">
          <div className="yape-alert-title" style={{ color: '#333', marginBottom: '5px' }}>{pinStep === 1 ? 'Nuevo PIN' : 'Confirmar PIN'}</div>
          <div className="yape-alert-text-native">{pinStep === 1 ? 'Ingresa tu nuevo PIN de 6 dígitos' : 'Vuelve a ingresar tu nuevo PIN de 6 dígitos'}</div>
          <input 
            type="tel" 
            maxLength="6" 
            className="yape-pin-input" 
            style={{ marginBottom: '25px' }} 
            placeholder="------"
            value={pinInput} 
            onChange={e => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
          />
          <div className="yape-alert-actions-native">
            <button className="yape-btn-text-only" style={{ marginRight: '15px', color: '#888' }} onClick={() => setShowPinPromptModal(false)}>CANCELAR</button>
            <button className="yape-btn-text-only" onClick={submitCustomPin}>ACEPTAR</button>
          </div>
        </div>
      </div>

      {/* TOAST NATIVO */}
      <div id="modalToast" style={{ opacity: toast.show ? 1 : 0 }}>{toast.msg}</div>

      {showLogoutModal && (
          <div className="loader-overlay show" style={{ zIndex: 10000 }} onClick={(e) => { if (e.target.className.includes('loader-overlay')) setShowLogoutModal(false); }}>
            <div className="yape-alert-card">
              <div className="yape-alert-title" style={{ fontSize: '18px', fontWeight: '700', color: '#742385', marginBottom: '10px' }}>Cerrar sesión</div>
              <div className="yape-alert-text" style={{ fontSize: '14.5px', color: '#555', marginBottom: '20px', lineHeight: '1.4' }}>¿Está usted seguro que quiere salir de la cuenta?</div>
              <div className="yape-alert-actions" style={{ display: 'flex', width: '100%', gap: '10px' }}>
                <button className="yape-btn-cancel" onClick={() => setShowLogoutModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #ccc', background: 'white', color: '#666', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Cancelar</button>
                <button className="yape-btn-confirm" onClick={() => {
                  localStorage.removeItem("sesion_token_yape");
                  localStorage.removeItem("sesion_iniciada");
                  localStorage.removeItem("pase_vip_activo");
                  signOut(auth).then(() => {
                    window.location.href = '/';
                  });
                }} style={{ flex: 1, padding: '12px', borderRadius: '25px', border: 'none', background: '#00BFA5', color: 'white', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Sí, salir</button>
              </div>
            </div>
          </div>
        )}
        <style dangerouslySetInnerHTML={{__html: `
        .pin-screen-overlay { position: fixed; top: 0; left: 0; right: 0; margin: 0 auto; width: 100%; max-width: 480px; height: 100dvh; background-color: white; z-index: 6000; display: none; flex-direction: column; opacity: 0; transition: opacity 0.3s; }
        .pin-screen-overlay.show { display: flex; opacity: 1; }
        .pin-header { background-color: #742385; padding: 20px; display: flex; align-items: center; color: white; padding-top: max(20px, env(safe-area-inset-top)); }
        .pin-header-icon { font-size: 20px; cursor: pointer; padding: 5px; margin-right: 15px; }
        .pin-header-title { font-weight: 600; font-size: 17px; }
        .pin-hero { width: 100%; line-height: 0; background-color: white; }
        .pin-hero img { width: 100%; height: auto; display: block; object-fit: cover; }
        .pin-btn-container { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 40px 25px; }
        .btn-teal-pin { background-color: #00BFA5; color: white; padding: 18px; border-radius: 8px; border: none; font-size: 16px; font-weight: 700; width: 100%; cursor: pointer; text-align: center; box-shadow: 0 4px 10px rgba(0, 191, 165, 0.2); transition: transform 0.1s; }
        .btn-teal-pin:active { transform: scale(0.97); }
        .yape-pin-input { width: 100%; padding: 15px; border-radius: 10px; border: 2px solid #e0e0e0; font-size: 24px; text-align: center; letter-spacing: 8px; font-weight: 700; color: #333; outline: none; transition: border-color 0.2s; font-family: monospace; }
        .yape-pin-input:focus { border-color: #742385; }
        .yape-alert-card-native { background: white; border-radius: 4px; padding: 24px; width: 85%; max-width: 320px; display: flex; flex-direction: column; align-items: flex-start; text-align: left; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .yape-alert-text-native { font-size: 15px; color: #333; margin-bottom: 25px; line-height: 1.4; }
        .yape-alert-actions-native { display: flex; justify-content: flex-end; width: 100%; }
        .yape-btn-text-only { background: transparent; border: none; color: #00BFA5; font-weight: 700; font-size: 14px; cursor: pointer; text-transform: uppercase; padding: 8px; transition: 0.2s; }
        .yape-btn-text-only:active { background: #f0f0f0; border-radius: 4px; }
        .container-opciones { max-width: 480px; margin: 0 auto; min-height: 100dvh; height: 100dvh; overflow-y: auto; display: flex; flex-direction: column; position: relative; background-color: #f2f4f6; }
        .header-hero { background: linear-gradient(135deg, #742385 0%, #511973 100%); height: 220px; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; position: relative; display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 15px rgba(81, 25, 115, 0.3); flex-shrink: 0; padding-bottom: 20px; }
        .back-icon { position: absolute; top: 25px; left: 25px; color: white; font-size: 24px; cursor: pointer; background: rgba(255,255,255,0.2); width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; transition: background 0.3s; z-index: 10; }
        .back-icon:active { background: rgba(255,255,255,0.4); }
        .logo-img-custom { width: 150px; height: 150px; object-fit: contain; margin-top: -10px; opacity: 0.95; filter: drop-shadow(0px 10px 10px rgba(0,0,0,0.2)); }
        .info-card { background: white; margin: -60px 20px 20px 20px; padding: 30px 20px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); position: relative; z-index: 2; padding-bottom: 40px; }
        .section-title { font-size: 13px; font-weight: 800; color: #888; margin: 25px 0 10px 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .section-title:first-child { margin-top: 0; }
        .settings-section { display: flex; flex-direction: column; gap: 5px; }
        .setting-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 10px; border-radius: 12px; background: white; cursor: pointer; transition: background 0.2s; border: 1px solid transparent; }
        .setting-item:active { background: #f8f9fa; border-color: #eee; }
        .setting-left { display: flex; align-items: center; gap: 15px; }
        .icon-circle { width: 42px; height: 42px; border-radius: 10px; display: flex; justify-content: center; align-items: center; font-size: 18px; flex-shrink: 0; }
        .bg-purple { background: rgba(116, 35, 133, 0.1); color: #742385; }
        .bg-teal { background: rgba(0, 191, 165, 0.1); color: #00BFA5; }
        .bg-orange { background: rgba(255, 152, 0, 0.1); color: #FF9800; }
        .bg-blue { background: rgba(0, 136, 204, 0.1); color: #0088cc; }
        .bg-red { background: rgba(255, 82, 82, 0.1); color: #FF5252; }
        .bg-gray { background: #f2f2f2; color: #666; }
        .bg-dark { background: #333; color: white; }
        .setting-text { display: flex; flex-direction: column; gap: 3px; }
        .st-title { font-weight: 700; font-size: 14px; color: #333; }
        .st-desc { font-size: 12px; color: #888; font-weight: 600; }
        .arrow-icon { color: #ccc; font-size: 14px; }
        .divider { border: 0; border-top: 1px solid #eee; margin: 15px 0; }
        .zoom-container { display: flex; background: white; border-radius: 12px; padding: 8px; gap: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); border: 1px solid #f0f0f0; }
        .zoom-btn { flex: 1; padding: 12px 0; border: none; background: #f2f4f6; color: #888; font-weight: 700; border-radius: 8px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .zoom-btn i { font-size: 16px; }
        .zoom-btn.active { background: #00BFA5; color: white; box-shadow: 0 4px 10px rgba(0, 191, 165, 0.3); }

        .modal-overlay-opciones { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); z-index: 5000; display: none; justify-content: center; align-items: flex-end; opacity: 0; transition: opacity 0.3s ease; }
        .modal-overlay-opciones.show { display: flex; opacity: 1; }
        .modal-panel-opciones { background-color: white; width: 100%; max-width: 480px; border-top-left-radius: 24px; border-top-right-radius: 24px; padding: 25px 20px; display: flex; flex-direction: column; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1); max-height: 85vh; overflow-y: auto; }
        .modal-overlay-opciones.show .modal-panel-opciones { transform: translateY(0); }
        .modal-header-opciones { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0;}
        .modal-title-opciones { font-size: 18px; font-weight: 700; color: #333; }
        .close-modal-btn-opciones { background: none; border: none; font-size: 24px; color: #666; cursor: pointer; }
        
        .switch-container-opciones { display: flex; justify-content: space-between; align-items: center; background-color: #f5f5f5; padding: 15px; border-radius: 12px; margin-bottom: 20px; flex-shrink: 0; }
        .switch-label-opciones { font-size: 15px; font-weight: 600; color: #444; }
        .switch-opciones { position: relative; display: inline-block; width: 50px; height: 28px; }
        .switch-opciones input { opacity: 0; width: 0; height: 0; }
        .slider-opciones { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px; }
        .slider-opciones:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        .switch-opciones input:checked + .slider-opciones { background-color: #00BFA5; }
        .switch-opciones input:checked + .slider-opciones:before { transform: translateX(22px); }

        .add-contact-form { display: flex; gap: 10px; margin-bottom: 20px; flex-shrink: 0; }
        .input-group { flex: 1; display: flex; flex-direction: column; gap: 5px; }
        .contact-input { padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; background-color: #fafafa; }
        .contact-input:focus { border-color: #742385; background-color: white; outline: none; }
        .btn-add { background-color: #742385; color: white; border: none; border-radius: 8px; padding: 0 20px; font-weight: 700; cursor: pointer; transition: 0.1s; }
        .btn-add:active { transform: scale(0.95); }
        .custom-contact-list { overflow-y: auto; flex: 1; padding-right: 5px; }
        .empty-msg { text-align: center; color: #999; font-size: 14px; margin-top: 20px; }
        .custom-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee; }
        .ci-info { display: flex; flex-direction: column; }
        .ci-name { font-weight: 600; color: #333; font-size: 15px; margin-bottom: 3px; }
        .ci-number { color: #888; font-size: 13px; }
        .btn-delete { background: none; border: none; color: #FF5252; font-size: 18px; cursor: pointer; padding: 5px; }

        .yape-alert-card { background: white; border-radius: 16px; padding: 24px; width: 85%; max-width: 320px; display: flex; flex-direction: column; align-items: center; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .yape-alert-title { font-size: 18px; font-weight: 700; color: #742385; margin-bottom: 10px; }
        .yape-alert-text { font-size: 14.5px; color: #555; margin-bottom: 20px; line-height: 1.4; }
        .yape-alert-actions { display: flex; width: 100%; gap: 10px; }
        .yape-btn-cancel { flex: 1; padding: 12px; border-radius: 25px; border: 1px solid #ccc; background: white; color: #666; font-weight: 700; font-size: 14px; cursor: pointer; transition: 0.2s; }
        .yape-btn-confirm { flex: 1; padding: 12px; border-radius: 25px; border: none; background: #00BFA5; color: white; font-weight: 700; font-size: 14px; cursor: pointer; transition: 0.2s; }

        #modalToast { background-color: #333; color: white; text-align: center; border-radius: 30px; padding: 10px 20px; position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); font-size: 13px; font-weight: 600; pointer-events: none; z-index: 10000; transition: opacity 0.3s; }
        @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}} />
    </>
  );
}




