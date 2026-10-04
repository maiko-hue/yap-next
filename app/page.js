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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
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
            <img src="/img/SplashYapeOficial.gif" alt="Splash" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
