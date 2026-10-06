"use client";

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Inicio() {
  const router = useRouter();
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [balance, setBalance] = useState("1,200.00");

  const [movementsVisible, setMovementsVisible] = useState(false);
  const [isMovementsLoading, setIsMovementsLoading] = useState(false);
  const [movements, setMovements] = useState([]);

  const [showSplash, setShowSplash] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showYapear, setShowYapear] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showFullMenu, setShowFullMenu] = useState(false);
  const [zoomLevel, setZoomLevel] = useState("1");
  const [showLoader, setShowLoader] = useState(false);
  const [searchYapear, setSearchYapear] = useState('');
  const [showYapearLoader, setShowYapearLoader] = useState(false);
  const [frecuentes, setFrecuentes] = useState([]);
  const [contacts, setContacts] = useState([]);
  
    // Slider state
  const [notiSwipe, setNotiSwipe] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  
  const handleNotiTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleNotiTouchMove = (e) => setNotiSwipe(e.touches[0].clientX - touchStartX);
  const handleNotiTouchEnd = () => {
    if (Math.abs(notiSwipe) > 100) {
      setNoti({ ...noti, show: false });
    }
    setNotiSwipe(0);
  };

  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 6;
  const lottieRef = useRef(null);

  const [sliderTouchStartX, setSliderTouchStartX] = useState(null);
  const handleSliderTouchStart = (e) => setSliderTouchStartX(e.touches[0].clientX);
  const handleSliderTouchEnd = (e) => {
    if (sliderTouchStartX === null) return;
    const diff = sliderTouchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setCurrentSlide(prev => (prev + 1) % totalSlides);
      else setCurrentSlide(prev => (prev === 0 ? totalSlides - 1 : prev - 1));
    }
    setSliderTouchStartX(null);
  };

  useEffect(() => {
    // Splash screen timer
    const animSpeed = typeof window !== "undefined" ? parseFloat(localStorage.getItem("yape_anim_speed") || "1") : 1;
    const timer = setTimeout(() => {
      setShowSplash(false);
      const popupPref = localStorage.getItem('yape_show_popup');
      if (popupPref !== 'false') {
        setTimeout(() => setShowPopup(true), 500);
      }
    }, 1500 * animSpeed);

    // Initialize Lottie
    let anim;
    if (window.lottie && lottieRef.current) {
      anim = window.lottie.loadAnimation({
        container: lottieRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/img/animated_2.json' 
      });
    }

    // Load initial data from localStorage
    const savedBalance = localStorage.getItem('yape_balance') || "1200.00";
    const cleanBalance = parseFloat(savedBalance.replace(/,/g, ''));
    if (!isNaN(cleanBalance)) {
      setBalance(cleanBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }

    const savedMovements = JSON.parse(localStorage.getItem('yape_movements')) || [];
    setMovements(savedMovements.slice(0, 7));

    return () => {
      clearTimeout(timer);
      if (anim) anim.destroy();
    };
  }, []);

  // Auto Slider Effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(slideInterval);
  }, []);

  const toggleBalance = () => {
    if (isBalanceLoading) return;
    if (!balanceVisible) {
      setIsBalanceLoading(true);
      const s = typeof window !== 'undefined' ? parseFloat(localStorage.getItem('yape_anim_speed') || '1') : 1;
      setTimeout(() => {
        setIsBalanceLoading(false);
        setBalanceVisible(true);
      }, 3000 * s);
    } else {
      setBalanceVisible(false);
    }
  };

  const toggleMovements = () => {
    if (isMovementsLoading) return;
    if (!movementsVisible) {
      setIsMovementsLoading(true);
      setTimeout(() => {
        setIsMovementsLoading(false);
        setMovementsVisible(true);
      }, 2000);
    } else {
      setMovementsVisible(false);
    }
  };

  // Notification State
  const [noti, setNoti] = useState({ show: false, dark: false, nombre: '', monto: '', codigo: '', hora: '' });
  const [isNotifying, setIsNotifying] = useState(false);

  const generarPagoFalso = () => {
    if (isNotifying) return;
    setIsNotifying(true);
    setShowFullMenu(false);

    let isRandom = localStorage.getItem('yape_noti_random') !== 'false';
    let isDark = localStorage.getItem('yape_noti_dark') === 'true';

    let nombreCompleto = "";
    let montoRandom = "0.00";
    let codigoRandom = "";

    if (isRandom) {
      const nombres = ["Juan", "Maria", "Carlos", "Ana", "Luis", "Jorge", "Lucia", "Diego", "Valeria", "Maikol", "Jose", "Cristian", "Armando", "Pedro", "Sofia"];
      const apellidos = ["Perez", "Garcia", "Torres", "Rojas", "Flores", "Sanchez", "Diaz", "Chavez", "Gomez", "Huaman", "Crisanto", "Gonzales", "Ramirez"];
      nombreCompleto = nombres[Math.floor(Math.random() * nombres.length)] + " " + apellidos[Math.floor(Math.random() * apellidos.length)];
    } else {
      let customNames = JSON.parse(localStorage.getItem('yape_noti_remitentes')) || [];
      if(customNames.length > 0) {
        nombreCompleto = customNames[Math.floor(Math.random() * customNames.length)];
      } else {
        nombreCompleto = "Usuario Desconocido"; 
      }
    }

    if (isRandom) {
      montoRandom = (Math.random() * (500 - 100) + 100).toFixed(2);
    } else {
      let tipoMonto = localStorage.getItem('yape_noti_monto_tipo') || 'rango';
      if (tipoMonto === 'rango') {
        let min = parseFloat(localStorage.getItem('yape_noti_monto_min')) || 0;
        let max = parseFloat(localStorage.getItem('yape_noti_monto_max')) || 500;
        if (min > max) { let t = min; min = max; max = t; } 
        montoRandom = (Math.random() * (max - min) + min).toFixed(2);
      } else {
        let fijo = parseFloat(localStorage.getItem('yape_noti_monto_fijo')) || 70;
        montoRandom = fijo.toFixed(2);
      }
    }

    let numOpRandom = Math.floor(10000000 + Math.random() * 90000000).toString();
    
    if (isRandom) {
      codigoRandom = numOpRandom.slice(-3); 
    } else {
      let isCodRandom = localStorage.getItem('yape_noti_cod_random') !== 'false';
      if (isCodRandom) {
        codigoRandom = numOpRandom.slice(-3);
      } else {
        codigoRandom = localStorage.getItem('yape_noti_cod_fijo') || "123";
        codigoRandom = codigoRandom.padStart(3, '0');
        numOpRandom = numOpRandom.slice(0, 5) + codigoRandom; 
      }
    }

    let nombreNoti = getShortName(nombreCompleto);

    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampmNoti = hours >= 12 ? 'p.m.' : 'a.m.'; 
    hours = hours % 12;
    hours = hours ? hours : 12; 
    let minStr = minutes < 10 ? '0' + minutes : minutes;
    const horaString = `${hours}:${minStr} ${ampmNoti}`;
    
    // Update balance natively
    let currentBalance = parseFloat(balance.replace(/,/g, '')) || 0;
    let newBalance = currentBalance + parseFloat(montoRandom);
    setBalance(newBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    localStorage.setItem('yape_balance', newBalance.toFixed(2));
    
    // Add movement
    let movs = [...movements];
    const mesesStr = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."];
    const ampmHist = now.getHours() >= 12 ? 'p. m.' : 'a. m.';
    let hrHist = now.getHours() % 12 || 12;
    const fechaLarga = `${now.getDate()} ${mesesStr[now.getMonth()]} ${now.getFullYear()}`;
    const horaStringHist = `${hrHist < 10 ? '0'+hrHist : hrHist}:${minStr} ${ampmHist}`;
    
    movs.unshift({
        monto: montoRandom,
        nombre: nombreCompleto,
        fecha: `${fechaLarga} - ${horaStringHist}`,
        fechaSolo: fechaLarga,
        horaSolo: horaStringHist,
        tipo: 'ingreso',
        numero: "9" + Math.floor(10000000 + Math.random() * 90000000),
        operacion: numOpRandom,
        codigo: codigoRandom,
        destino: 'Yape'
    });
    setMovements(movs.slice(0,7));
    localStorage.setItem('yape_movements', JSON.stringify(movs));

    // Display Notification
    setNoti({ show: true, dark: isDark, nombre: nombreNoti, monto: parseFloat(montoRandom) % 1 === 0 ? parseInt(montoRandom) : parseFloat(montoRandom).toFixed(2), codigo: codigoRandom, hora: horaString });
    try {
      new Audio('/img/ysnid.mp3').play();
    } catch(e) {}
    
    setTimeout(() => {
      setNoti(prev => ({ ...prev, show: false }));
      setIsNotifying(false);
    }, 4500);
  };

  useEffect(() => {
    if (showYapear) {
      // Load frecuentes
      let frecs = JSON.parse(localStorage.getItem('yape_frecuentes')) || [];
      if (frecs.length === 0) {
        frecs = [
          { nombre: "Maikol Crisanto", celular: "942555010" },
          { nombre: "Anghelo Huaman", celular: "977459001" },
          { nombre: "Maria Magdalena", celular: "934014267" }
        ];
      }
      setFrecuentes(frecs);

      // Load contacts
      const useCustom = localStorage.getItem('yape_use_custom_contacts') === 'true';
      if (useCustom) {
        setContacts(JSON.parse(localStorage.getItem('yape_custom_contacts')) || []);
      } else {
        setContacts([
          { nombre: "Armando Garcia", celular: "966346842" },
          { nombre: "Jose Torres", celular: "983651056" },
          { nombre: "Cristian Crisanto", celular: "922150468" },
          { nombre: "Anghelo Huaman", celular: "977459001" },
          { nombre: "Ernesto Villafuerte", celular: "976591314" },
          { nombre: "Juana Diaz", celular: "956045770" },
          { nombre: "Maria Magdalena", celular: "934014267" },
          { nombre: "Piero Almanestar", celular: "921111379" }
        ]);
      }
    }
  }, [showYapear]);

  const handleSearchYapear = (e) => {
    let val = e.target.value;
    if (/^\d/.test(val)) {
      let cleanValue = val.replace(/\D/g, ''); 
      if (cleanValue.length > 9) cleanValue = cleanValue.slice(0, 9);
      setSearchYapear(cleanValue);
    } else {
      setSearchYapear('');
    }
  };

  const handleContactClick = (numero, nombre) => {
    setShowYapearLoader(true);
    const speed = typeof window !== "undefined" ? parseFloat(localStorage.getItem('yape_anim_speed') || '1') : 1;
    setTimeout(() => {
      let url = '/monto?numero=' + numero;
      if (nombre) url += '&nombre=' + encodeURIComponent(nombre);
      router.push(url);
    }, 3000 * speed);
  };

  const getInitials = (nombre) => {
    let partes = nombre.trim().split(/\s+/);
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
    if (partes.length === 1 && partes[0].length > 0) return partes[0].substring(0, 2).toUpperCase();
    return "";
  };

  const getShortName = (nombre) => {
    let partes = nombre.trim().split(/\s+/);
    if (partes.length === 2) {
      return partes[0] + " " + partes[1].substring(0, 3) + "*";
    } else if (partes.length >= 3) {
      return partes[0] + " " + partes[2].substring(0, 3) + "*";
    }
    return nombre;
  };

  return (
    <>
      {showSplash && (
        <div id="splash-screen" style={{ opacity: 1, display: 'flex' }}>
          <div id="splash-card">
            <div className="custom-spinner"></div>
          </div>
        </div>
      )}

      {/* POPUP PUBLICIDAD */}
      <div className={`modal-overlay ${showPopup ? 'show' : ''}`} id="modalPopup">
        <div className="modal-content">
            <div className="modal-close-btn" id="closeModal" onClick={() => setShowPopup(false)}>X</div>
            <img src="/img/popup.png" alt="Promo" onError={(e) => { e.target.src = 'https://via.placeholder.com/350x450?text=Popup'; }} />
        </div>
      </div>

      {/* NOTIFICACION FALSA */}
      <div id="fake-notification" className={`fake-notification ${noti.show ? 'show' : ''} ${noti.dark ? 'noti-dark' : ''}`} style={{ transform: `translateX(calc(-50% + ${notiSwipe}px))`, transition: notiSwipe === 0 ? 'transform 0.3s ease, top 0.3s ease, opacity 0.3s ease' : 'none' }} onTouchStart={handleNotiTouchStart} onTouchMove={handleNotiTouchMove} onTouchEnd={handleNotiTouchEnd}>
        <img src="/img/icon-96x96.png" className="notif-icon" alt="Yape" />
        <div className="notif-content">
            <div className="notif-header">
                <span className="notif-title">Confirmación de Pago</span>
                <span className="notif-time">{noti.hora}</span>
            </div>
            <div className="notif-text">{noti.nombre} te envió un pago por S/ {noti.monto}. El cód. de seguridad es: {noti.codigo}</div>
        </div>
      </div>

      <div className="app-container">
        
        {/* HEADER */}
        <div className="header">
          <div className="user-profile" onClick={() => setShowProfile(true)}>
            <div className="icon-bg-circle">
              <img src="/img/person.svg" alt="Perfil" className="profile-img" onError={(e) => e.target.src='https://via.placeholder.com/30/ffffff/742284?text=U'} />
            </div>
          </div>
          
          <div className="header-search-bar" onClick={() => setShowYapear(true)}>
            <img src="/img/lupanueva.svg" alt="Buscar" className="search-bar-icon" />
            <span className="search-bar-text">Buscar en Yape</span>
          </div>

          <div className="header-actions">
            <div className="icon-bg-circle">
              <img src="/img/headphones.svg" alt="Soporte" className="header-icon-img" />
            </div>
            <div className="icon-bg-circle" onClick={() => setShowLoader(true)}>
              <img src="/img/bell.svg" alt="Campana" className="header-icon-img" />
            </div>
          </div>
        </div>

        {showLoader && (
          <div className="loader-overlay show" onClick={() => setShowLoader(false)}>
              <div className="loader-card">
                  <div className="custom-spinner"></div>
                  <div className="loader-text">Verifica tu conexión a<br/>internet...</div>
              </div>
          </div>
        )}

        {/* SCROLL PRINCIPAL */}
        <div className="main-scroll">
          
          {/* SECCIÓN MORADA */}
          <div className="purple-section">
            <div className="icon-grid">
              <div className="grid-item"><div className="icon-circle"><img src="/img/icono1.png" alt="" /></div><span className="grid-label">Recargar celular</span></div>
              <div className="grid-item" onClick={() => router.push('/servicios')}><div className="icon-circle"><img src="/img/icono2.png" alt="" /></div><span className="grid-label">Yapear servicios</span></div>
              <div className="grid-item"><div className="icon-circle" style={{padding:0, overflow:'hidden'}}><img src="/img/descarga.gif" alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} /></div><span className="grid-label">Promos</span></div>
              <div className="grid-item"><div className="icon-circle"><img src="/img/icono4.png" alt="" /></div><span className="grid-label">Código aprobación</span></div>
              
              <div className="grid-item" onClick={generarPagoFalso}>
                  <div ref={lottieRef} className="icon-circle" style={{padding:0, overflow:'hidden', backgroundColor: 'white'}}></div>
                  <span className="grid-label">Créditos</span>
              </div>
              
              <div className="grid-item"><div className="icon-circle"><img src="/img/icono6.png" alt="" /></div><span className="grid-label">Tienda</span></div>
              <div className="grid-item"><div className="icon-circle"><img src="/img/icono7.png" alt="" /></div><span className="grid-label">Dólares</span></div>
              <div className="grid-item"><div className="icon-circle"><img src="/img/icono8.png" alt="" /></div><span className="grid-label">Remesas</span></div>
              <div className="grid-item"><div className="icon-circle"><img src="/img/icono9.png" alt="" /></div><span className="grid-label">SOAT</span></div>
              <div className="grid-item"><div className="icon-circle"><img src="/img/icono10.png" alt="" /></div><span className="grid-label">Viajar en bus</span></div>
              <div className="grid-item"><div className="icon-circle"><img src="/img/icono11.png" alt="" /></div><span className="grid-label">Gaming</span></div>
              
              <div className="grid-item" onClick={() => setShowFullMenu(true)}>
                  <div className="icon-circle" style={{background:'transparent', boxShadow:'none', padding:0}}>
                      <img src="/img/todoicon.svg" alt="" style={{width:'100%', height:'100%', objectFit:'contain'}} />
                  </div>
                  <span className="grid-label">Ver más</span>
              </div>
            </div>

            {/* CARRUSEL DE PROMOS */}
            <div className="slider-container" id="promoSlider" onTouchStart={handleSliderTouchStart} onTouchEnd={handleSliderTouchEnd}>
              <div className="slider-track" id="sliderTrack" style={{ transform: `translateX(-${currentSlide * (100 / totalSlides)}%)`, transition: 'transform 0.3s ease-out' }}>
                  <div className="slide"><div className="banner-card"><img src="/img/h_fondo1.jpg" alt="" /></div></div>
                  <div className="slide"><div className="banner-card"><img src="/img/h_fondo2.jpg" alt="" /></div></div>
                  <div className="slide"><div className="banner-card"><img src="/img/h_fondo3.jpg" alt="" /></div></div>
                  <div className="slide"><div className="banner-card"><img src="/img/h_fondo5.jpg" alt="" /></div></div>
                  <div className="slide"><div className="banner-card"><img src="/img/h_fondo6.jpg" alt="" /></div></div>
                  <div className="slide"><div className="banner-card"><img src="/img/h_fondo4.jpg" alt="" /></div></div>
              </div>
            </div>
            <div className="pagination">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <div key={idx} className={`dot ${currentSlide === idx ? 'active' : ''}`} onClick={() => setCurrentSlide(idx)}></div>
                ))}
            </div>
          </div>

          {/* SECCIÓN BLANCA */}
          <div className="white-section">
            
            <div className="card-block" id="balanceCard" onClick={toggleBalance}>
                <div className="card-header-toggle">
                    <div className="action-left">
                        <img src={balanceVisible ? "/img/ojo_cerrado.png" : "/img/ojo_abierto.webp"} className="action-icon-img" alt="Ojo" />
                        <span className="action-text">{balanceVisible ? "Ocultar saldo" : "Mostrar saldo"}</span>
                    </div>
                    <span className="balance-amount" style={{ display: balanceVisible ? 'block' : 'none' }}>S/ {balance}</span>
                    <div className="balance-spinner" style={{ display: isBalanceLoading ? 'block' : 'none' }}></div>
                </div>
            </div>
            
            <div className="card-block" id="movementsBlock">
                <div className="card-header-toggle" onClick={toggleMovements}>
                    <div className="action-left">
                        <img src="/img/icono_movimientos.png" className="action-icon-img" alt="Movimientos" />
                        <span className="action-text">{movementsVisible ? "Ocultar movimientos" : "Mostrar movimientos"}</span>
                    </div>
                    <i className={`fa-solid ${movementsVisible ? 'fa-chevron-up' : 'fa-chevron-down'} chevron`}></i>
                </div>

                {isMovementsLoading && (
                  <div className="movements-list" style={{ display: 'block' }}>
                      <div className="movement-item" style={{ pointerEvents: 'none', borderBottom: '1px solid #f0f0f0' }}>
                          <div className="mov-info" style={{ flex: 1, paddingRight: '15px' }}>
                              <div className="skeleton-block" style={{ width: '70%', height: '16px', marginBottom: '6px' }}></div>
                              <div className="skeleton-block" style={{ width: '45%', height: '12px' }}></div>
                          </div>
                          <div className="skeleton-block" style={{ width: '75px', height: '16px' }}></div>
                      </div>
                  </div>
                )}

                {movementsVisible && (
                  <div className="movements-list" style={{ display: 'block' }}>
                      {movements.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No hay movimientos recientes</div>
                      ) : (
                        movements.map((mov, idx) => {
                          let nombreMostrado = getShortName(mov.nombre);
                          let destinoHistorial = mov.destino || "Yape";
                          if (destinoHistorial !== "Yape") {
                              nombreMostrado = `${destinoHistorial} - ${nombreMostrado}`;
                          }
                          return (
                            <div key={idx} className="movement-item" onClick={() => {
                                let rawNum = mov.numero || "999";
                                let isQr = isNaN(rawNum.replace(/\s/g, ''));
                                let mostrarCelular = mov.mostrar_celular || "asteriscos";
                                const url = `/exito?monto=${mov.monto}&nombre=${encodeURIComponent(mov.nombre)}&fecha=${encodeURIComponent(mov.fechaSolo || '')}&hora=${encodeURIComponent(mov.horaSolo || '')}&numero=${encodeURIComponent(rawNum)}&operacion=${mov.operacion || '00000000'}&codigo=${mov.codigo || '000'}&mensaje=${encodeURIComponent(mov.mensaje || '')}&destino=${encodeURIComponent(mov.destino || 'Yape')}&tipo=${mov.tipo || 'gasto'}&es_qr=${isQr}&mostrar_celular=${mostrarCelular}`;
                                router.push(url);
                            }}>
                                <div className="mov-info">
                                    <span className="mov-name">{nombreMostrado}</span>
                                    <span className="mov-date">{mov.fecha}</span>
                                </div>
                                <span className={`mov-amount ${mov.tipo === 'ingreso' ? 'amount-black' : 'amount-red'}`}>
                                  {mov.tipo === 'ingreso' ? '' : '- '}S/ {parseFloat(mov.monto).toFixed(2)}
                                </span>
                            </div>
                          );
                        })
                      )}
                      <a className="ver-todos-btn" onClick={() => router.push('/movimientos')}>VER TODOS</a>
                  </div>
                )}
            </div>

            <div className="footer-spacer"></div>

            <div className="footer-buttons-container">
                <button className="btn btn-outline">
                    <img src="/img/qr-icon.svg" className="btn-img-icon" alt="" /> ESCANEAR QR
                </button>
                <a className="btn btn-fill" onClick={() => setShowYapear(true)}>
                    <img src="/img/flecha-icon.svg" className="btn-img-icon" alt="" /> YAPEAR
                </a>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL YAPEAR */}
      <div id="pantalla-yapear" style={{ display: showYapear ? 'flex' : 'none', position: 'fixed', top: 0, left: 0, width: '100%', height: 'calc(100dvh / var(--app-zoom, 1))', backgroundColor: 'white', zIndex: 2000, flexDirection: 'column' }}>
          <div className="top-bar">
              <div className="close-btn" onClick={() => { setShowYapear(false); setSearchYapear(''); }}>
                  <i className="fa-solid fa-xmark"></i>
              </div>
              <div className="page-title">Yapear a</div>
          </div>

          <div className="search-section">
              <div className="search-box">
                  <i className="fa-solid fa-magnifying-glass search-icon"></i>
                  <input type="tel" className="search-input" placeholder="Busca el celular o contacto" value={searchYapear} onChange={handleSearchYapear} maxLength="9" />
              </div>
          </div>

          {searchYapear.length === 9 ? (
              <div className="new-contact-container" id="newContactResult" style={{ display: 'block' }} onClick={() => handleContactClick(searchYapear)}>
                  <div className="new-contact-card">
                      <div className="nc-info">
                          <span className="nc-title">A nuevo celular</span>
                          <span className="nc-number">{searchYapear.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}</span>
                      </div>
                      <div className="nc-icon">
                          <img src="/img/icono_yapear.png" alt="Yape" onError={(e) => { e.target.style.display='none'; e.target.parentElement.innerHTML="<i class='fa-solid fa-paper-plane' style='color:#742284; font-size: 24px;'></i>" }} />
                      </div>
                  </div>
                  <div className="nc-footer-msg">
                      No necesitas guardarlo en tus contactos
                  </div>
              </div>
          ) : (
              <div id="mainYapearContent" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                  <div className="nuevo-numero-row" onClick={() => document.querySelector('.search-input').focus()}>
                      <div className="nn-left">
                          <img src="/img/fonoicon.svg" className="nn-icon" alt="" />
                          <span className="nn-text">Nuevo número</span>
                      </div>
                      <i className="fa-solid fa-chevron-right nn-arrow"></i>
                  </div>
                  
                  <div className="section-title-yapear">Yaperos frecuentes</div>
                  <div className="frecuentes-scroll">
                      {frecuentes.map((f, i) => (
                          <div className="frecuente-item" key={i} onClick={() => handleContactClick(f.celular, f.nombre)}>
                              <div className="frecuente-circle">{getInitials(f.nombre)}</div>
                              <div className="frecuente-name">{getShortName(f.nombre)}</div>
                              <div className="frecuente-num">*** *** {f.celular.slice(-3)}</div>
                          </div>
                      ))}
                  </div>

                  <div className="section-title-yapear">Contactos</div>
                  <div className="contact-list" style={{ padding: '0 20px', width: '100%', flex: 1 }}>
                      {contacts.map((c, i) => {
                          const rawNum = c.celular.replace(/\D/g, '');
                          const numFormatted = rawNum.length === 9 ? rawNum.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3') : rawNum;
                          return (
                              <div className="contact-item" key={i} onClick={() => handleContactClick(rawNum, c.nombre)}>
                                  <span className="contact-name">{c.nombre}</span>
                                  <span className="contact-phone">{numFormatted}</span>
                              </div>
                          );
                      })}
                      {contacts.length === 0 && (
                          <div style={{ textAlign: 'center', padding: '30px 20px', color: '#999', fontSize: '15px' }}>No tienes contactos guardados.</div>
                      )}
                  </div>
              </div>
          )}
      </div>

      <div className={`loader-overlay ${showYapearLoader ? 'show' : ''}`} id="loaderyapear">
          <div className="loader-card">
              <div className="custom-spinner"></div>
          </div>
      </div>

      {/* PANEL PERFIL */}
      <div className={`perfil-panel ${showProfile ? 'show' : ''}`}>
        <div className="perfil-header">
            <div className="perfil-header-left">
                <i className="fa-solid fa-arrow-left perfil-back-icon" onClick={() => setShowProfile(false)}></i>
            </div>
            <div className="perfil-help-btn">
                <i className="fa-solid fa-headset"></i> Ayuda
            </div>
        </div>
        
        <div className="perfil-title-header">Mi Perfil</div>

        <div className="perfil-section-title">Mi cuenta</div>
        <ul className="perfil-menu-list">
            <li className="perfil-menu-item" onClick={() => router.push('/opciones')}>
                <img src="/img/mp-datos-icon.svg" className="perfil-menu-icon-img" alt="" />
                <div className="perfil-menu-text">Mis datos</div>
            </li>
            <li className="perfil-menu-item">
                <img src="/img/mp-qr-icon.svg" className="perfil-menu-icon-img" alt="" />
                <div className="perfil-menu-text">Mi QR</div>
            </li>
            <li className="perfil-menu-item">
                <img src="/img/mp-direcciones-icon.svg" className="perfil-menu-icon-img" alt="" />
                <div className="perfil-menu-text">Mis direcciones</div>
            </li>
            <li className="perfil-menu-item">
                <img src="/img/mp-eliminar-icon.svg" className="perfil-menu-icon-img" alt="" />
                <div className="perfil-menu-text">Eliminar mi cuenta</div>
            </li>
        </ul>

        <div className="perfil-section-title">Ajustes</div>
        <ul className="perfil-menu-list">
            <li className="perfil-menu-item">
                <img src="/img/mp-biometria-icon.svg" className="perfil-menu-icon-img" alt="" />
                <div className="perfil-menu-text">Biometría digital</div>
            </li>
            <li className="perfil-menu-item">
                <img src="/img/mp-compras-icon.svg" className="perfil-menu-icon-img" alt="" />
                <div className="perfil-menu-text">Compras por internet y POS</div>
            </li>
            <li className="perfil-menu-item">
                <img src="/img/mp-informacion-icon.svg" className="perfil-menu-icon-img" alt="" />
                <div className="perfil-menu-text">Confirmación de yapeo alto</div>
            </li>
            <li className="perfil-menu-item">
                <img src="/img/mp-limites-icon.svg" className="perfil-menu-icon-img" alt="" />
                <div className="perfil-menu-text">Límites Transaccionales</div>
            </li>
            <li className="perfil-menu-item" style={{borderBottom: 'none'}}> 
                <img src="/img/mp-notificaciones-icon.svg" className="perfil-menu-icon-img" alt="" />
                <div className="perfil-menu-text">Notificaciones por yapeo</div>
            </li>
        </ul>

        <div className="perfil-footer-section">
            <div className="perfil-version-info">
                Versión Yape: 3.41.0<br/>
                Tipo de Cuenta: Yape con BCP<br/>
                BANCO DE CRÉDITO DEL PERÚ<br/>
                <strong>RUC: 20100047218</strong>
            </div>

            <div className="perfil-footer-menu-item">
                <img src="/img/terminos-icon.svg" className="perfil-footer-icon-img" alt="" />
                <span className="perfil-footer-menu-text">Términos y Condiciones</span>
            </div>
            
            <div className="perfil-footer-menu-item">
                <img src="/img/politica-icon.svg" className="perfil-footer-icon-img" alt="" />
                <span className="perfil-footer-menu-text">Política de privacidad</span>
            </div>
            
            <div className="perfil-footer-menu-item">
                <img src="/img/cerrar-cuenta-icon.svg" className="perfil-footer-icon-img" alt="" />
                <span className="perfil-footer-menu-text">Cerrar sesión</span>
            </div>
        </div>
      </div>

      {/* MENÚ COMPLETO OVERLAY */}
      <div className={`full-menu-overlay ${showFullMenu ? 'show' : ''}`}>
          <div className="menu-handle-container" onClick={() => setShowFullMenu(false)}>
              <div className="menu-handle"></div>
          </div>
          
          <div className="menu-content">
              
              <div className="menu-section-title">Yapeos</div>
              <div className="menu-grid">
                  <div className="grid-item"><div className="icon-circle"><img src="/img/icono1.png" alt="" /></div><span className="grid-label">Recargar<br/>celular</span></div>
                  <div className="grid-item" onClick={() => router.push('/servicios')}><div className="icon-circle"><img src="/img/icono2.png" alt="" /></div><span className="grid-label">Yapear<br/>servicios</span></div>
                  <div className="grid-item"><div className="icon-circle"><img src="/img/icono4.png" alt="" /></div><span className="grid-label">Código de<br/>aprobación</span></div>
                  <div className="grid-item"><div className="icon-circle" style={{padding:0, overflow:'hidden'}}><img src="/img/prom-4.jpg" className="menu-icon-rounded" alt="" /></div><span className="grid-label">Giro/retiro<br/>de efectivo</span></div>
                  <div className="grid-item"><div className="icon-circle"><img src="/img/icono7.png" alt="" /></div><span className="grid-label">Dólares</span></div>
              </div>

              <div className="menu-section-title">Finanzas</div>
              <div className="menu-grid">
                  <div className="grid-item" onClick={generarPagoFalso}><div className="icon-circle"><img src="/img/icono5.png" alt="" /></div><span className="grid-label">Créditos</span></div>
                  <div className="grid-item"><div className="icon-circle"><img src="/img/seguros-icon.svg" alt="" /></div><span className="grid-label">Seguros</span></div>
                  <div className="grid-item"><div className="icon-circle"><img src="/img/icono9.png" alt="" /></div><span className="grid-label">SOAT</span></div>
                  <div className="grid-item"><div className="icon-circle"><img src="/img/icono8.png" alt="" /></div><span className="grid-label">Remesas</span></div>
                  <div className="grid-item"><div className="icon-circle"><img src="/img/aprende-yape-icon.svg" alt="" /></div><span className="grid-label">Aprende<br/>con Yape</span></div>
              </div>

              <div className="menu-section-title">Compras</div>
              <div className="menu-grid">
                  <div className="grid-item"><div className="icon-circle"><img src="/img/icono10.png" alt="" /></div><span className="grid-label">Viajar en<br/>bus</span></div>
                  <div className="grid-item"><div className="icon-circle"><img src="/img/icono6.png" alt="" /></div><span className="grid-label">Tienda</span></div>
                  <div className="grid-item"><div className="icon-circle" style={{padding:0, overflow:'hidden'}}><img src="/img/prom-1.jpg" className="menu-icon-rounded" alt="" /></div><span className="grid-label">Entradas</span></div>
                  <div className="grid-item"><div className="icon-circle"><img src="/img/icono11.png" alt="" /></div><span className="grid-label">Gaming</span></div>
                  <div className="grid-item"><div className="icon-circle"><img src="/img/promos-il-icon.svg" alt="" /></div><span className="grid-label">Promos</span></div>
                  <div className="grid-item"><div className="icon-circle" style={{padding:0, overflow:'hidden'}}><img src="/img/prom-6.jpg" className="menu-icon-rounded" alt="" /></div><span className="grid-label">Delivery</span></div>
                  <div className="grid-item"><div className="icon-circle" style={{padding:0, overflow:'hidden'}}><img src="/img/prom-3.jpg" className="menu-icon-rounded" alt="" /></div><span className="grid-label">Pedir gas</span></div>
              </div>

          </div>
      </div>

      {/* ESTILOS INTERNOS EXTRAÍDOS DEL HTML ORIGINAL */}
      <style dangerouslySetInnerHTML={{__html: `
        .nuevo-numero-row {
            display: flex; justify-content: space-between; align-items: center;
            padding: 16px 20px; border-bottom: 1px solid #f0f0f0; cursor: pointer;
        }
        .nuevo-numero-row:active { background-color: #fafafa; }
        .nn-left { display: flex; align-items: center; gap: 15px; }
        .nn-icon { width: 20px; height: 20px; object-fit: contain; }
        .nn-text { font-size: 15.5px; font-weight: 700; color: #333; }
        .nn-arrow { color: #888; font-size: 16px; }
        .section-title-yapear { font-size: 16.5px; font-weight: 800; color: #111; padding: 20px 20px 12px 20px; }
        .frecuentes-scroll { display: flex; overflow-x: auto; padding: 0 20px; gap: 18px; scrollbar-width: none; border-bottom: 1px solid #f0f0f0; padding-bottom: 20px; }
        .frecuentes-scroll::-webkit-scrollbar { display: none; }
        .frecuente-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; min-width: 65px; }
        .frecuente-circle { width: 52px; height: 52px; background-color: #f0f0f0; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: #742284; font-weight: 700; font-size: 18px; margin-bottom: 8px; }
        .frecuente-name { font-size: 13px; font-weight: 600; color: #333; text-align: center; line-height: 1.1; margin-bottom: 3px; }
        .frecuente-num { font-size: 11px; color: #888; text-align: center; }
      `}} />
    </>
  );
}





