'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, provider, signInWithPopup } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function Home() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const [splashOpacity, setSplashOpacity] = useState(1);
  const [showInstallScreen, setShowInstallScreen] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 2;
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const isLoggingIn = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !isLoggingIn.current) {
        router.push('/login_pin');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashOpacity(0);
      setTimeout(() => setShowSplash(false), 500);
    }, 6500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setShowInstallScreen(false);
    } else {
      setShowInstallScreen(true);
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setInstallPromptEvent(e);
      };
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      const handleAppInstalled = () => setShowInstallScreen(false);
      window.addEventListener('appinstalled', handleAppInstalled);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const handleInstallClick = async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      if (outcome === 'accepted') {
        setInstallPromptEvent(null);
      }
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    if (touchEndX.current < touchStartX.current - 40) {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }
    if (touchEndX.current > touchStartX.current + 40) {
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
  };

  const iniciarSesion = async () => {
    isLoggingIn.current = true;
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const docRef = doc(db, 'clientes', user.email);
      const docSnap = await getDoc(docRef);
      
      const ticket = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('sesion_token_yape', ticket);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          nombre: user.displayName || 'Usuario',
          email: user.email,
          estado: 'inactivo',
          fecha: new Date().toISOString(),
          sesion_token: ticket
        });
      } else {
        await updateDoc(docRef, {
          sesion_token: ticket
        });
      }
      
      router.push('/login_pin');
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Error al iniciar sesión. Intenta de nuevo.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="main-container">
        {showSplash && (
          <div id="splash-screen-anim" style={{ opacity: splashOpacity }}>
            <div className="contenedor-principal">
              <div className="contenedor-logo">
                  <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 500.000000 500.000000" preserveAspectRatio="xMidYMid meet">
                      <g transform="translate(0.000000,500.000000) scale(0.100000,-0.100000)">
                          <path d="M1318 2601 c-72 -46 -139 -142 -275 -396 l-48 -90 -60 -7 c-84 -11 -160 -50 -174 -89 -10 -29 -6 -79 6 -79 3 0 18 10 35 21 30 22 118 53 126 44 7 -7 -43 -87 -109 -174 -96 -128 -189 -184 -259 -155 -36 15 -50 8 -50 -27 -1 -83 74 -132 163 -105 107 32 214 152 333 374 l66 122 70 0 c57 0 69 -3 65 -14 -13 -33 -18 -182 -8 -209 14 -35 50 -52 87 -40 l27 9 1 133 c1 121 3 135 20 145 68 38 90 104 33 98 -27 -3 -28 -2 -21 35 9 50 79 306 99 362 11 33 12 47 4 57 -20 24 -81 16 -131 -15z m-42 -267 c-20 -71 -39 -145 -44 -164 -8 -34 -10 -35 -60 -38 -32 -2 -52 1 -52 8 0 32 175 338 187 327 2 -2 -12 -62 -31 -133z"/>
                          <path d="M1583 2269 c-29 -30 -31 -30 -37 -11 -16 48 -71 38 -81 -16 -7 -39 -108 -506 -125 -579 -16 -67 -13 -91 15 -109 47 -31 57 -18 77 91 10 55 23 124 29 153 l11 54 22 -21 c43 -41 114 -15 161 58 61 97 95 278 66 354 -25 65 -87 77 -138 26z m47 -74 c27 -32 -7 -198 -55 -271 -21 -32 -53 -31 -66 3 -24 63 54 283 100 283 5 0 14 -7 21 -15z"/>
                          <path d="M2230 2362 c-17 -18 -30 -44 -35 -71 -4 -24 -13 -58 -20 -75 -14 -32 -71 -96 -86 -96 -5 0 -9 26 -9 58 0 77 -16 129 -45 148 -31 20 -75 11 -105 -22 -28 -29 -36 -30 -43 -4 -4 14 -14 20 -35 20 -33 0 -35 -4 -47 -75 -8 -51 -121 -576 -136 -632 -8 -29 -18 -45 -33 -49 -92 -28 -251 -130 -340 -218 -198 -195 -261 -465 -134 -583 74 -69 209 -53 311 37 44 38 132 169 175 261 34 71 96 254 108 313 4 24 14 41 28 47 76 33 778 173 1024 204 28 4 52 9 52 12 0 4 -22 29 -48 57 -27 28 -53 60 -59 70 -11 19 -13 19 -139 2 -217 -30 -531 -84 -689 -120 -82 -18 -151 -32 -153 -31 -3 3 24 152 44 243 l5 23 26 -21 c14 -11 35 -20 47 -20 47 0 118 75 148 156 8 24 21 37 43 44 33 11 84 59 104 98 7 12 15 22 20 22 12 0 41 -109 41 -152 0 -71 -62 -94 -68 -25 -3 31 -7 37 -26 37 -37 0 -60 -34 -57 -83 2 -32 56 -77 92 -77 45 0 111 34 131 67 33 56 32 92 -6 206 -20 59 -36 113 -36 120 0 7 11 28 25 47 30 41 32 66 6 80 -31 16 -51 12 -81 -18z m-245 -151 c7 -34 -10 -136 -32 -195 -18 -47 -50 -86 -70 -86 -46 0 -36 136 17 249 24 50 33 61 54 61 19 0 26 -7 31 -29z m-425 -973 c-53 -132 -110 -228 -175 -295 -53 -55 -82 -65 -109 -37 -50 50 31 234 153 346 58 54 163 115 169 98 2 -5 -15 -55 -38 -112z"/>
                          <path d="M2570 2754 c-194 -52 -318 -204 -234 -288 33 -33 52 -33 59 -1 3 14 7 36 10 50 16 77 155 165 260 165 95 0 134 -35 135 -118 0 -62 -23 -112 -72 -158 -50 -48 -151 -93 -157 -71 -5 15 12 73 46 166 39 104 36 113 -27 109 -29 -3 -38 -9 -51 -38 -68 -144 -156 -525 -147 -635 3 -37 6 -40 35 -43 47 -5 73 26 73 86 0 76 35 262 50 262 4 0 18 -26 31 -57 96 -243 260 -475 382 -542 85 -47 178 -33 218 33 29 48 25 53 -34 48 -41 -3 -64 1 -102 19 -109 51 -256 228 -345 414 -22 46 -40 88 -40 94 0 5 28 25 61 42 123 66 191 163 192 274 2 159 -147 241 -343 189z"/>
                          <path d="M3288 2699 c-26 -15 -110 -295 -134 -447 -8 -52 -52 -121 -103 -161 -68 -54 -114 -48 -127 16 -6 31 -4 34 41 53 75 32 106 59 132 118 28 60 27 110 -3 143 -21 23 -74 25 -113 4 -81 -42 -151 -188 -151 -317 0 -104 32 -148 108 -148 58 0 124 38 168 95 l28 38 8 -30 c24 -93 133 -100 206 -13 29 34 73 134 88 197 17 72 12 138 -12 185 -18 34 -65 46 -99 24 -13 -9 -27 -16 -30 -16 -8 0 3 42 38 149 30 91 30 94 12 107 -22 16 -34 17 -57 3z m63 -343 c15 -33 -5 -144 -38 -212 -62 -126 -109 -48 -68 111 29 110 80 159 106 101z m-314 -33 c-7 -40 -54 -93 -83 -93 -17 0 -13 22 14 75 22 44 32 55 55 55 17 0 19 -5 14 -37z"/>
                          <path d="M3475 1864 c-11 -2 -110 -11 -220 -20 -244 -21 -254 -23 -193 -53 37 -17 55 -20 100 -15 64 7 88 -8 88 -60 l0 -32 183 18 c223 22 223 22 243 53 19 29 13 66 -16 95 -17 17 -32 20 -92 19 -40 -1 -82 -3 -93 -5z"/>
                          <path d="M3849 2539 c-18 -26 -21 -39 -15 -84 6 -50 4 -55 -20 -74 -37 -29 -44 -27 -44 18 0 51 -39 101 -80 101 -56 0 -118 -36 -150 -87 -89 -141 -105 -316 -33 -373 82 -64 197 28 249 199 11 35 21 50 46 62 18 8 47 34 63 57 27 37 61 53 78 36 3 -3 -8 -33 -24 -67 -57 -121 -62 -221 -13 -253 33 -22 80 -12 120 27 30 29 32 30 38 11 8 -24 52 -37 71 -22 7 6 16 30 20 53 17 110 82 275 120 307 34 28 35 -5 5 -110 -38 -132 -39 -192 -5 -225 29 -30 37 -31 84 -5 66 38 145 170 128 214 -10 26 -21 19 -52 -40 -35 -65 -58 -89 -80 -81 -21 9 -19 20 15 133 42 133 47 177 26 209 -29 45 -92 25 -144 -46 l-31 -41 -3 32 c-4 40 -30 60 -55 44 -12 -7 -25 -44 -40 -110 -30 -132 -47 -175 -92 -225 -73 -83 -82 -8 -16 145 31 72 36 94 28 115 -8 24 -13 26 -61 23 -52 -3 -52 -2 -52 27 0 44 -10 61 -35 61 -15 0 -32 -12 -46 -31z m-149 -160 c0 -31 -9 -36 -28 -17 -13 13 -16 50 -5 61 12 13 33 -15 33 -44z m-40 -87 c36 -20 35 -41 -8 -112 -21 -34 -35 -46 -56 -48 -35 -4 -46 10 -46 64 0 44 25 141 43 162 8 10 13 6 23 -18 7 -17 27 -38 44 -48z"/>
                      </g>
                  </svg>
              </div>
              <div className="firma">
                  <span>D</span><span>e</span><span>&nbsp;</span><span>M</span><span>a</span><span>i</span><span>k</span><span>o</span><span>l</span><span>&nbsp;</span><span>E</span><span>s</span><span>l</span><span>e</span><span>i</span><span>t</span><span>e</span><span>r</span>
              </div>
            </div>
          </div>
        )}

        {showInstallScreen && (
          <div id="pantallaInstalacion">
            <div className="top-shape-left">
                <img src="/img/secondlogo.png" alt="AppsReborn" />
            </div>
            <div className="top-shape-right">
                <img src="/img/logo_yape_header.png" alt="Logo" />
            </div>

            <div className="install-title">
                Antes de continuar;<br/>instala la app en tu<br/>dispositivo:
            </div>

            <div className="action-box">
                {installPromptEvent && (
                  <button onClick={handleInstallClick} className="btn-install">
                      <i className="fa-solid fa-download"></i> Instalar ahora
                  </button>
                )}
                <button onClick={() => setShowInstallScreen(false)} className="btn-omitir">Omitir por ahora</button>
                <a href="https://t.me/appsreborn_dev" className="btn-apk"><i className="fa-brands fa-android"></i> Instalar APK</a>
                <button className="btn-help" onClick={() => setIsHelpOpen(true)}>¿Necesitas ayuda?</button>
            </div>

            <div className="carousel-wrapper">
                <div className="carousel-slider-container" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                    <div className="carousel-slider" style={{ transform: `translateX(-${currentSlide * 50}%)` }}>
                        <img src="/img/present1ype.svg" className="carousel-img" alt="Promo 1" />
                        <img src="/img/Presentación2viaype.svg" className="carousel-img" alt="Promo 2" />
                    </div>
                </div>
                <div className="carousel-indicators">
                    <div className={`indicator ${currentSlide === 0 ? 'active' : ''}`} onClick={() => setCurrentSlide(0)}><div className="progress-bar" style={currentSlide === 0 ? { animation: 'fillProgress 7s linear forwards' } : {}}></div></div>
                    <div className={`indicator ${currentSlide === 1 ? 'active' : ''}`} onClick={() => setCurrentSlide(1)}><div className="progress-bar" style={currentSlide === 1 ? { animation: 'fillProgress 7s linear forwards' } : {}}></div></div>
                </div>
            </div>
          </div>
        )}

        <div className="top-shape-left">
            <img src="/img/secondlogo.png" alt="AppsReborn" />
        </div>
        <div className="top-shape-right">
            <img src="/img/logo_yape_header.png" alt="Logo" />
        </div>

        <div className="welcome-title">
            ¡Bienvenido!<br/>Tenemos funciones nuevas<br/>y mejoradas para ti...
        </div>

        <div className="action-box">
            <button className="btn-google" onClick={iniciarSesion}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" className="google-icon" />
                <span>Continuar con Google</span>
            </button>

            <a href="https://t.me/vendedoresappsreborn" className="btn-access">
                <i className="fa-brands fa-telegram" style={{ fontSize: '18px' }}></i> Obtén acceso
            </a>

            <a href="https://www.appsreborn.shop/" className="btn-buy" target="_blank" rel="noreferrer">
                <i className="fa-solid fa-cart-shopping" style={{ fontSize: '18px' }}></i> Comprar acceso
            </a>

            <a href="https://t.me/appsreborn_dev" className="btn-apk">
                <i className="fa-brands fa-android" style={{ fontSize: '18px' }}></i> Instalar APK
            </a>
            
            <button className="btn-help" onClick={() => setIsHelpOpen(true)}>¿Necesitas ayuda?</button>
        </div>

        <div className="carousel-wrapper">
            <div className="carousel-slider-container" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <div className="carousel-slider" style={{ transform: `translateX(-${currentSlide * 50}%)` }}>
                    <img src="/img/present1ype.svg" className="carousel-img" alt="Promo 1" />
                    <img src="/img/Presentación2viaype.svg" className="carousel-img" alt="Promo 2" />
                </div>
            </div>
            <div className="carousel-indicators">
                <div className={`indicator ${currentSlide === 0 ? 'active' : ''}`} onClick={() => setCurrentSlide(0)}><div className="progress-bar" style={currentSlide === 0 ? { animation: 'fillProgress 7s linear forwards' } : {}}></div></div>
                <div className={`indicator ${currentSlide === 1 ? 'active' : ''}`} onClick={() => setCurrentSlide(1)}><div className="progress-bar" style={currentSlide === 1 ? { animation: 'fillProgress 7s linear forwards' } : {}}></div></div>
            </div>
        </div>

        <div className="footer-links">
            <span className="footer-link" onClick={() => setIsTermsOpen(true)}>Términos y Condiciones</span>
            <a href="https://t.me/MaikolEsleiter" className="footer-link">Centro de Ayuda</a>
        </div>

        {isTermsOpen && (
          <div className="modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if(e.target.className.includes('modal-overlay')) setIsTermsOpen(false); }}>
              <div className="modal-card">
                  <div className="modal-title">Términos y Condiciones</div>
                  <div className="modal-body">
                      <strong>Lee atentamente esto:</strong><br/><br/>
                      El personal de administración no se hace responsable del mal uso de la app. No hay devoluciones ni cargos a enfrentar.<br/>
                      <span className="warning-text">
                          <i className="fa-solid fa-triangle-exclamation"></i>
                          NO TOLERAMOS el uso de varios dispositivos enlazados. Si compartes acceso, tu cuenta quedará BANEADA DE FORMA PERMANENTE.
                      </span><br/>
                      Tendrás que comprar otro acceso para remediar eso. Avisados están.
                      <span className="dev-credits">Desarrollador/Dev: @MaikolEsleiter</span>
                  </div>
                  <a href="https://t.me/appsreborn" className="btn-telegram"><i className="fa-brands fa-telegram"></i> Grupo Oficial</a>
                  <button className="btn-close" onClick={() => setIsTermsOpen(false)}>Entendido</button>
              </div>
          </div>
        )}

        {isHelpOpen && (
          <div className="modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if(e.target.className.includes('modal-overlay')) setIsHelpOpen(false); }}>
              <div className="modal-card" style={{ textAlign: 'left', paddingBottom: '20px' }}>
                  <div className="modal-title" style={{ textAlign: 'center', color: 'var(--brand-purple)' }}>Guía de Instalación</div>
                  <div className="modal-body" style={{ marginBottom: '5px' }}>
                      
                      <h4 style={{ color: '#333', marginBottom: '8px', marginTop: 0, fontSize: '15px' }}><i className="fa-brands fa-apple"></i> Para usuarios Apple (iOS)</h4>
                      <p style={{ fontSize: '13.5px', color: '#555', marginBottom: '20px', marginTop: 0, lineHeight: '1.4' }}>
                          Para garantizar el correcto funcionamiento de la plataforma a pantalla completa, siga estos pasos:<br/><br/>
                          1. Abra este enlace de forma nativa en el navegador <strong>Safari</strong>.<br/>
                          2. Seleccione el ícono de <strong>Compartir</strong> (cuadrado con flecha hacia arriba).<br/>
                          3. Elija la opción <strong>"Agregar a inicio"</strong> (ícono +) y confirme la acción.
                      </p>

                      <h4 style={{ color: '#00b551', marginBottom: '8px', fontSize: '15px' }}><i className="fa-brands fa-android"></i> Para usuarios Android</h4>
                      <p style={{ color: '#555', fontSize: '13.5px', marginTop: 0, marginBottom: '5px', lineHeight: '1.4' }}>
                          Por favor, seleccione la opción <strong>"Instalar APK"</strong> en el menú principal o acceda a nuestro grupo oficial para realizar la descarga directa.
                      </p>

                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '15px' }}>
                      <img src="/img/mascota.png" alt="Mascota Guía" style={{ width: '80px', height: 'auto', objectFit: 'contain' }} />
                      <button className="btn-close" style={{ width: '55%' }} onClick={() => setIsHelpOpen(false)}>Entendido</button>
                  </div>
              </div>
          </div>
        )}

        {isLoading && (
          <div className="modal-overlay" style={{ display: 'flex', zIndex: 9999999 }}>
            <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M 50 50 L 90 20 A 40 40 0 1 0 90 80 Z" fill="#6A2080">
                 <animate attributeName="d" values="M 50 50 L 90 20 A 40 40 0 1 0 90 80 Z; M 50 50 L 90 45 A 40 40 0 1 0 90 55 Z; M 50 50 L 90 20 A 40 40 0 1 0 90 80 Z" dur="0.5s" repeatCount="indefinite" />
              </path>
              <circle cx="90" cy="50" r="5" fill="#6A2080">
                 <animate attributeName="cx" values="90; 50" dur="0.5s" repeatCount="indefinite" />
                 <animate attributeName="opacity" values="1; 0" dur="0.5s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
        )}
      </div>

      <style jsx>{`
        .main-container {
            --brand-purple: #6A2080;
            --brand-dark: #511973;
            --bg-light: #ffffff;
            --text-color: #333333;
            background-color: var(--bg-light);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: var(--text-color);
            padding: 20px;
            overflow-y: auto;
            overflow-x: hidden;
            position: relative;
            max-width: 480px;
            margin: 0 auto;
            font-family: 'Nunito', sans-serif;
        }

        .top-shape-left {
            position: absolute;
            top: -100px;
            left: -100px;
            width: 350px;
            height: 350px;
            background-color: var(--brand-purple);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 0;
        }
        .top-shape-left img {
            width: 140px;
            margin-top: 80px;
            margin-left: 80px;
            object-fit: contain;
        }

        .top-shape-right {
            position: absolute;
            top: -80px;
            right: -80px;
            width: 200px;
            height: 200px;
            background-color: var(--brand-purple);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 0;
        }
        .top-shape-right img {
            width: 40px;
            border-radius: 8px;
            margin-top: 60px;
            margin-right: 60px;
            object-fit: contain;
        }

        .welcome-title, .install-title {
            font-size: 20px;
            font-weight: 800;
            color: var(--brand-dark);
            text-align: center;
            line-height: 1.4;
            z-index: 2;
            position: relative;
            margin-top: 50px; 
            margin-bottom: 20px;
        }

        .install-title { font-size: 22px; margin-top: 30px; }

        .action-box {
            background-color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            width: 100%;
            max-width: 320px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 2;
            position: relative;
            border: 1px solid #f0f0f0;
        }
        
        .btn-google {
            background-color: white; color: var(--text-color); width: 100%; padding: 14px;
            border-radius: 8px; border: 1px solid #e0e4e8; font-size: 15px; font-weight: 700;
            display: flex; align-items: center; justify-content: center; gap: 12px; cursor: pointer;
            transition: transform 0.2s, background-color 0.2s; text-decoration: none;
        }
        .btn-access {
            background-color: var(--brand-purple); color: white; width: 100%; padding: 14px;
            border-radius: 8px; border: none; font-size: 15px; font-weight: 700;
            display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer;
            transition: background 0.2s, transform 0.2s; text-decoration: none;
        }
        .btn-apk {
            background-color: var(--brand-dark); color: white; width: 100%; padding: 14px;
            border-radius: 8px; border: none; font-size: 15px; font-weight: 700;
            display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer;
            transition: background 0.2s, transform 0.2s; text-decoration: none;
        }
        .btn-buy {
            background-color: #202020; color: white; width: 100%; padding: 14px;
            border-radius: 8px; border: none; font-size: 15px; font-weight: 700;
            display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer;
            transition: background 0.2s, transform 0.2s; text-decoration: none;
        }
        .btn-help {
            background-color: transparent; color: var(--brand-purple); width: 100%; padding: 5px;
            border: none; font-size: 13.5px; font-weight: 700; cursor: pointer; text-decoration: underline; margin-top: 5px;
        }
        
        .btn-google:active, .btn-access:active, .btn-apk:active, .btn-buy:active { transform: scale(0.97); }
        .btn-google:active { background-color: #f5f5f5; }
        .btn-access:active { background-color: #511973; }
        .btn-apk:active { background-color: #3b1154; }
        .btn-buy:active { background-color: #000000; }
        .google-icon { width: 20px; height: 20px; }

        #pantallaInstalacion { 
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
            background-color: var(--bg-light); z-index: 999999; 
            display: flex; flex-direction: column; justify-content: center; align-items: center; 
        }

        .btn-install {
            background-color: var(--brand-purple); color: white; width: 100%; padding: 14px;
            border-radius: 30px; border: none; font-size: 15px; font-weight: 700;
            display: flex; justify-content: center; align-items: center; gap: 8px;
            cursor: pointer; box-shadow: 0 4px 15px rgba(106, 32, 128, 0.3);
        }
        .btn-omitir { 
            background: transparent; color: #888; border: none; 
            font-size: 13px; font-weight: 600; cursor: pointer; 
            text-decoration: underline; margin-top: 5px; 
        }

        .carousel-wrapper {
            width: 100%;
            max-width: 320px;
            margin-top: 20px;
            z-index: 2;
            position: relative;
        }
        .carousel-slider-container {
            width: 100%;
            border-radius: 15px; 
            overflow: hidden;
            box-shadow: 0 6px 15px rgba(0,0,0,0.06);
            background-color: white;
            cursor: grab;
            border: 1px solid #f0f0f0;
        }
        .carousel-slider-container:active { cursor: grabbing; }
        .carousel-slider {
            display: flex;
            width: 200%;
            transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .carousel-img {
            width: 50%; 
            object-fit: cover;
            display: block;
            pointer-events: none;
        }
        
        .carousel-indicators {
            display: flex;
            justify-content: center;
            gap: 6px;
            margin-top: 12px;
        }
        .indicator {
            width: 8px;
            height: 8px;
            border-radius: 4px;
            background-color: #d4d4d4;
            position: relative;
            overflow: hidden;
            transition: width 0.3s ease;
            cursor: pointer;
        }
        .indicator.active {
            width: 24px; 
            background-color: #e0e0e0;
        }
        .progress-bar {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 0%;
            background-color: var(--brand-purple); 
        }

        .footer-links { position: absolute; bottom: 20px; font-size: 13.5px; font-weight: 600; text-align: center; width: 100%; display: flex; justify-content: center; gap: 20px; z-index: 2; }
        .footer-link { color: var(--brand-purple); text-decoration: none; cursor: pointer; opacity: 0.8; }
        .footer-link:active { opacity: 1; }

        .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; justify-content: center; align-items: center; padding: 20px; backdrop-filter: blur(3px); }
        .modal-card { background: white; color: #333; width: 100%; max-width: 340px; border-radius: 16px; padding: 25px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.15); animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .modal-title { font-size: 18px; font-weight: 800; margin-bottom: 15px; color: var(--brand-purple); }
        .modal-body { font-size: 14px; line-height: 1.5; color: #555; margin-bottom: 20px; text-align: left; }
        .warning-text { color: #d32f2f; font-weight: 700; margin-top: 12px; display: block; border: 1px solid #ffcdd2; background: #ffebee; padding: 12px; border-radius: 8px; font-size: 13px; }
        .dev-credits { font-size: 12px; color: #888; margin-top: 15px; font-weight: 700; display: block; text-align: center; }
        .btn-telegram { background-color: #229ED9; color: white; width: 100%; padding: 14px; border: none; border-radius: 10px; font-weight: 700; font-size: 15px; cursor: pointer; margin-bottom: 10px; text-decoration: none; display: block; }
        .btn-close { background: #f0f4f8; color: var(--brand-purple); width: 100%; padding: 14px; border: none; border-radius: 10px; font-weight: 800; font-size: 15px; cursor: pointer; }

        
          .contenedor-principal { display: flex; flex-direction: column; align-items: center; }
          .contenedor-logo { width: 400px; max-width: 90vw; }
          svg g path { fill: transparent; stroke: #742284; stroke-width: 30; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 15000; stroke-dashoffset: 15000; animation: trazar 1.5s ease-out forwards, rellenar 0.5s ease-in forwards; }
          svg g path:nth-child(1) { animation-delay: 0s, 1.5s; } svg g path:nth-child(2) { animation-delay: 0.4s, 1.9s; } svg g path:nth-child(3) { animation-delay: 0.8s, 2.3s; } svg g path:nth-child(4) { animation-delay: 1.2s, 2.7s; } svg g path:nth-child(5) { animation-delay: 1.6s, 3.1s; } svg g path:nth-child(6) { animation-delay: 2.0s, 3.5s; } svg g path:nth-child(7) { animation-delay: 2.4s, 3.9s; }
          @keyframes trazar { 100% { stroke-dashoffset: 0; } } @keyframes rellenar { 100% { fill: #742284; stroke: transparent; } }
  
          .firma { font-family: 'Caveat', cursive; font-size: 2.5rem; color: #742284; margin-top: -60px; display: flex; }
          .firma span { opacity: 0; transform: translateY(10px); animation: aparecerFirmaLetra 0.5s ease-out forwards; }
          .firma span:nth-child(1) { animation-delay: 4.50s; } .firma span:nth-child(2) { animation-delay: 4.55s; } .firma span:nth-child(4) { animation-delay: 4.65s; } .firma span:nth-child(5) { animation-delay: 4.70s; } .firma span:nth-child(6) { animation-delay: 4.75s; } .firma span:nth-child(7) { animation-delay: 4.80s; } .firma span:nth-child(8) { animation-delay: 4.85s; } .firma span:nth-child(9) { animation-delay: 4.90s; } .firma span:nth-child(11) { animation-delay: 5.00s; } .firma span:nth-child(12) { animation-delay: 5.05s; } .firma span:nth-child(13) { animation-delay: 5.10s; } .firma span:nth-child(14) { animation-delay: 5.15s; } .firma span:nth-child(15) { animation-delay: 5.20s; } .firma span:nth-child(16) { animation-delay: 5.25s; } .firma span:nth-child(17) { animation-delay: 5.30s; } .firma span:nth-child(18) { animation-delay: 5.35s; } 
          @keyframes aparecerFirmaLetra { 100% { opacity: 1; transform: translateY(0); } }

          #splash-screen-anim { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: #ffffff; z-index: 9999999; display: flex; justify-content: center; align-items: center; transition: opacity 0.5s ease; }

        
        @keyframes fillProgress {
            0% { width: 0%; }
            100% { width: 100%; }
        }
      `}</style>
      <style dangerouslySetInnerHTML={{__html: `
        body { margin: 0; background-color: #ffffff; overflow-y: auto; overflow-x: hidden; }
      `}} />
    </>
  );
}
