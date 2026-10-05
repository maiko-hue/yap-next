"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPin() {
    const router = useRouter();

    const [currentPin, setCurrentPin] = useState("");
    const maxDigits = 6;
    
    // UI states
    const [showSplash, setShowSplash] = useState(true);
    const [showErrorScreen, setShowErrorScreen] = useState(false);
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [accessTextDynamic, setAccessTextDynamic] = useState("");
    const [showLoaderModal, setShowLoaderModal] = useState(false);
    const [showBioModal, setShowBioModal] = useState(false);
    const [bioText, setBioText] = useState("Escanea tu huella digital");
    const [isScanning, setIsScanning] = useState(false);
    const [showCustomAlertModal, setShowCustomAlertModal] = useState(false);
    const [alertText, setAlertText] = useState("");
    const [userEmail, setUserEmail] = useState(null);

    const scanTimerRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/");
                return;
            }
            setUserEmail(user.email);

            const userRef = doc(db, "clientes", user.email);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();

                // Anti-clone check
                const localToken = localStorage.getItem("sesion_token_yape");
                if (userData.sesion_token && userData.sesion_token !== localToken) {
                    setAccessTextDynamic(
                        `Hola, <b>${userData.nombre || "Usuario"}</b>. Tu cuenta ha sido bloqueada por uso simultáneo (Clonación detectada).<br><br>Contacta a soporte.`
                    );
                    setShowAccessModal(true);
                    return;
                }

                if (userData.estado !== "activo") {
                    const nombreUsr = userData.nombre || "Usuario";
                    const correoUsr = user.email;
                    
                    setAccessTextDynamic(
                        `Hola, <b>${nombreUsr}</b> tu correo <b>${correoUsr}</b> no se encuentra activo.<br><br>Compra tu acceso con:`
                    );
                    setShowAccessModal(true);
                }
            } else {
                 setAccessTextDynamic(
                     `Hola, tu correo <b>${user.email}</b> no se encuentra activo.<br><br>Compra tu acceso con:`
                 );
                 setShowAccessModal(true);
            }
        });

        return () => unsubscribe();
    }, [router]);

    const pressNum = (num) => {
        if (currentPin.length < maxDigits) {
            const newPin = currentPin + num;
            setCurrentPin(newPin);

            if (newPin.length === maxDigits) {
                const customPin = localStorage.getItem("yape_custom_pin");

                if (newPin === "000000") {
                      setShowErrorScreen(true);
                      setCurrentPin("");
                  } else if (customPin && newPin !== customPin) {
                    setAlertText("Credenciales inválidas. Puede recuperar tu clave en la sección 'Olvido o cambio de clave'.");
                    setShowCustomAlertModal(true);
                    setCurrentPin("");
                } else {
                    setTimeout(() => {
                        setShowLoaderModal(true);
                        setTimeout(() => {
                            localStorage.setItem('sesion_iniciada', 'true');
                            router.push('/inicio');
                        }, 2000);
                    }, 150);
                }
            }
        }
    };

    const deleteNum = () => {
        if (currentPin.length > 0) {
            setCurrentPin(currentPin.slice(0, -1));
        }
    };

    const olvidoClave = () => {
        const customPin = localStorage.getItem('yape_custom_pin');
        if (customPin) {
            setAlertText("Tu clave anteriormente definida es: " + customPin);
        } else {
            setAlertText("No has definido ningún PIN personalizado aún. Cualquier combinación de 6 dígitos te dará acceso.");
        }
        setShowCustomAlertModal(true);
    };

    const closeCustomAlert = () => {
        setShowCustomAlertModal(false);
    };

    const abrirBiometrico = () => {
        setShowBioModal(true);
    };

    const cerrarBiometrico = () => {
        setShowBioModal(false);
        detenerEscaneo();
    };

    const iniciarEscaneo = (e) => {
        if (e) e.preventDefault();
        setBioText("Escaneando tu huella digital");
        setIsScanning(true);
        
        scanTimerRef.current = setTimeout(() => {
            cerrarBiometrico();
            setShowLoaderModal(true);
            
            setTimeout(() => {
                localStorage.setItem('sesion_iniciada', 'true');
                router.push('/inicio');
            }, 2000);
        }, 4000);
    };

    const detenerEscaneo = () => {
        if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
        setBioText("Escanea tu huella digital");
        setIsScanning(false);
    };

    const handleVolverIndex = () => {
        signOut(auth).then(() => {
            localStorage.removeItem('sesion_iniciada');
            router.push('/');
        }).catch(() => {
            router.push('/');
        });
    };

    return (
        <>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            <div className="container">
                {showSplash && (
                    <div id="splashScreen">
                        <img src="/img/logo_splash.png" alt="Cargando Yape..." />
                    </div>
                )}

                <div id="loginScreen" style={{ display: showSplash || showErrorScreen ? 'none' : 'flex' }}>
                    <div className="login-header">
                        {/* Botón de Ayuda superior eliminado */}
                    </div>

                    <div className="qr-section">
                        <div className="qr-image">
                            <img src="/img/qr_login.png" alt="QR Login" />
                        </div>
                    </div>

                    <div className="security-section options-grid">
                        <div className="option-wrapper" onClick={olvidoClave}>
                            <div className="option-box">
                                <img src="/img/olvidemiclave.svg" alt="Olvido de clave" />
                            </div>
                            <span>Olvido de<br />clave</span>
                        </div>
                        <div className="option-wrapper">
                            <div className="option-box">
                                <img src="/img/changuenum.svg" alt="Cambio de número" />
                            </div>
                            <span>Cambio de<br />número</span>
                        </div>
                        <div className="option-wrapper">
                            <div className="option-box">
                                <img src="/img/supporticon.svg" alt="Ayuda" />
                            </div>
                            <span>Ayuda</span>
                        </div>
                    </div>

                    <div className="bottom-panel">
                        <div className="login-title">Ingresa tu clave</div>

                        <div className="dots-container">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                <div key={index} className={`pin-dot ${index < currentPin.length ? 'active' : ''}`}></div>
                            ))}
                        </div>

                        <div className="keypad">
                            <div className="key" onClick={() => pressNum('9')}>9</div>
                            <div className="key" onClick={() => pressNum('1')}>1</div>
                            <div className="key" onClick={() => pressNum('5')}>5</div>
                            <div className="key" onClick={() => pressNum('7')}>7</div>
                            <div className="key" onClick={() => pressNum('4')}>4</div>
                            <div className="key" onClick={() => pressNum('0')}>0</div>
                            <div className="key" onClick={() => pressNum('6')}>6</div>
                            <div className="key" onClick={() => pressNum('3')}>3</div>
                            <div className="key" onClick={() => pressNum('2')}>2</div>
                            
                            <div className="key" onClick={abrirBiometrico} style={{ background: 'transparent' }}>
                                <img src="/img/loginanim1.gif" alt="QR" className="key-img-qr" />
                            </div>
                            
                            <div className="key" onClick={() => pressNum('8')}>8</div>
                            <div className="key" onClick={deleteNum} style={{ background: 'transparent' }}>
                                <i className="fa-solid fa-delete-left" style={{ color: '#888' }}></i>
                            </div>
                        </div>
                    </div>
                </div>

                {showErrorScreen && (
                    <div id="errorScreen" style={{ display: 'flex' }}>
                        <img src="/img/errorfix.png" alt="Error Yape" className="error-img" />
                        <div className="error-title">Tenemos un inconveniente</div>
                        <div className="error-text">Estamos para resolverlo lo más rápido posible,<br />te pedimos disculpas por las molestias.</div>
                    </div>
                )}
            </div>

            {showAccessModal && (
                <div className="access-overlay" id="accessModal" style={{ display: 'flex' }}>
                    <div className="access-card">
                        <div className="access-icon">
                            <i className="fa-solid fa-lock" style={{ color: '#742284', fontSize: '30px' }}></i>
                        </div>
                        <div className="access-title">Acceso Restringido</div>
                        
                        <div className="access-text" dangerouslySetInnerHTML={{ __html: accessTextDynamic }}></div>
                        
                        <a href="https://t.me/MaikolEsleiter" className="access-btn primary">
                            Comprar Acceso <i className="fa-solid fa-money-bill-wave"></i>
                        </a>
                        <a href="https://t.me/appsreborn" className="access-btn secondary">
                            Grupo Oficial <i className="fa-brands fa-telegram"></i>
                        </a>
                        
                        <button onClick={handleVolverIndex} className="yape-btn-text-only" style={{ marginTop: '15px', color: '#888' }}>
                            VOLVER AL INICIO
                        </button>
                    </div>
                </div>
            )}

            <div className={`loader-overlay ${showLoaderModal ? 'show' : ''}`} id="loaderModal">
                <div className="loader-card">
                    <div className="custom-spinner"></div>
                    <div className="loader-text">Validando datos...</div>
                </div>
            </div>

            {showBioModal && (
                <div className="bio-overlay" id="bioModal" style={{ display: 'flex' }}>
                    <div className="bio-card">
                        <div className="bio-title">Confirma tu dato biometrico</div>
                        <div className={`bio-instruction ${isScanning ? 'scanning' : ''}`} id="bioText">{bioText}</div>
                        
                        <div 
                            className={`bio-btn-circle ${isScanning ? 'active' : ''}`} 
                            onMouseDown={iniciarEscaneo}
                            onMouseUp={detenerEscaneo}
                            onMouseLeave={detenerEscaneo}
                            onTouchStart={iniciarEscaneo}
                            onTouchEnd={detenerEscaneo}
                            onTouchCancel={detenerEscaneo}
                        >
                            <img src="/img/huella-dactilar.svg" alt="Huella" />
                        </div>
                        
                        <div className="bio-cancel" onClick={cerrarBiometrico}>Cancelar</div>
                    </div>
                </div>
            )}

            {showCustomAlertModal && (
                <div className="yape-alert-overlay" id="customAlertModal" style={{ display: 'flex' }}>
                    <div className="yape-alert-card-native">
                        <div className="yape-alert-text-native">{alertText}</div>
                        <div className="yape-alert-actions-native">
                            <button className="yape-btn-text-only" onClick={closeCustomAlert}>ENTENDIDO</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                :root {
                    --brand-purple: #742284;
                    --brand-teal: #00BFA5;
                    --keypad-bg: #e5e5e5;
                    --main-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }

                * {
                    box-sizing: border-box;
                    -webkit-tap-highlight-color: transparent;
                    outline: none;
                    user-select: none;
                }

                :global(body) {
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    background-color: #742284;
                    color: white;
                    height: calc(100dvh / var(--app-zoom, 1));
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                img {
                    -webkit-touch-callout: none !important;
                    -webkit-user-drag: none !important;
                    -webkit-user-select: none !important;
                    pointer-events: none;
                }

                .container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                }

                #splashScreen {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: #742284;
                    z-index: 2000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                #splashScreen img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                #loginScreen {
                    flex-direction: column;
                    height: 100%;
                    justify-content: space-between;
                    background-color: #742284;
                }

                .login-header {
                    display: flex;
                    justify-content: flex-end;
                    padding: 20px;
                    padding-top: 40px; 
                }

                .qr-section {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-bottom: 0px; 
                }

                .qr-image {
                    width: 150px;
                    height: 150px;
                    background-color: white;
                    padding: 10px;
                    border-radius: 12px;
                }
                
                .qr-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .security-section {
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    margin-top: 15px;
                    margin-bottom: 25px;
                }

                .options-grid {
                    display: flex;
                    justify-content: center;
                    gap: 35px;
                    width: 100%;
                }

                .option-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }

                .option-box {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #FFFFFF;
                    border-radius: 14px;
                    width: 58px;
                    height: 58px;
                    border: none;
                    cursor: pointer;
                }

                .option-box img {
                    width: 26px;
                    height: 26px;
                    object-fit: contain;
                }

                .option-wrapper span {
                    color: #FFFFFF;
                    font-size: 11px;
                    font-weight: 500;
                    line-height: 1.2;
                    text-align: center;
                }

                .bottom-panel {
                    background-color: white;
                    border-top-left-radius: 25px;
                    border-top-right-radius: 25px;
                    padding: 30px 20px 25px 20px;
                    color: #333;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .login-title {
                    color: #742284;
                    font-size: 18px;
                    font-weight: 700;
                    margin-bottom: 25px;
                }

                .dots-container {
                    display: flex;
                    gap: 33px;
                    margin-bottom: 30px;
                    height: 20px;
                    align-items: center;
                }

                .pin-dot {
    width: 11px;
    height: 11px;
    background-color: #ccc;
    border-radius: 50%;
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

                .pin-dot.active {
    background-color: #999;
    transform: scale(1.3);
}

                .keypad {
                    width: 100%;
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-bottom: 0px;
                    max-width: 350px; 
                }

                .key {
                    background-color: #e5e5e5;
                    height: 55px;
                    border-radius: 12px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 24px;
                    font-weight: 600;
                    color: #333;
                    cursor: pointer;
                    transition: background-color 0.1s;
                }

                .key:active {
                    background-color: #d1d1d1;
                }
                
                .key-img-qr {
                    width: 70px;
                    height: 70px;
                    object-fit: contain;
                }

                .loader-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: calc(100dvh / var(--app-zoom, 1));
                    background-color: rgba(0,0,0,0.6); z-index: 3000;
                    display: flex; justify-content: center; align-items: center;
                    opacity: 0; pointer-events: none; transition: opacity 0.3s;
                }
                .loader-overlay.show { opacity: 1; pointer-events: all; }

                .loader-card {
                    background: white; 
                    width: 200px; height: 95px; 
                    border-radius: 12px; 
                    display: flex; 
                    flex-direction: column;
                    justify-content: center; 
                    align-items: center; 
                    text-align: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2); 
                    padding: 0;
                }

                .custom-spinner {
                    width: 30px; height: 30px;
                    border: 3px solid #e0e0e0;
                    border-top: 3px solid #00BFA5;
                    border-radius: 50%;
                    animation: spin 1s linear infinite; 
                    margin-bottom: 15px; 
                }

                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

                .loader-text { 
                    font-size: 14.5px; font-weight: 700; 
                    color: #333333 !important; 
                    line-height: 1.2; 
                    white-space: nowrap; 
                }

                .bio-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: calc(100dvh / var(--app-zoom, 1));
                    background-color: rgba(0,0,0,0.6); z-index: 4000;
                    justify-content: center; align-items: flex-end;
                    backdrop-filter: blur(3px);
                }

                .bio-card {
                    margin-bottom: 40px;
                    background: white; color: #333;
                    width: 310px; border-radius: 20px; padding: 30px 20px;
                    display: flex; flex-direction: column; align-items: center; text-align: center;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    animation: popInBio 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                @keyframes popInBio { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

                .bio-title { font-size: 18px; font-weight: 700; margin-bottom: 10px; color: #742284; }
                .bio-instruction { font-size: 15px; color: #555; margin-bottom: 30px; transition: color 0.3s ease; }
                
                .bio-instruction.scanning {
                    color: #00BFA5;
                    font-weight: 700;
                }

                .bio-btn-circle {
                    width: 85px; height: 85px;
                    background-color: #f5f5f5;
                    border-radius: 50%;
                    display: flex; justify-content: center; align-items: center;
                    margin-bottom: 30px;
                    box-shadow: inset 0 4px 10px rgba(0,0,0,0.05), 0 4px 15px rgba(0,0,0,0.1);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    -webkit-touch-callout: none;
                }

                .bio-btn-circle:active, .bio-btn-circle.active {
                    transform: scale(0.92);
                    background-color: #e8f9f6;
                    box-shadow: inset 0 4px 15px rgba(0,191,165,0.2);
                }

                .bio-btn-circle img {
                    width: 45px; height: 45px;
                    pointer-events: none;
                }

                .bio-cancel {
                    font-size: 15px; font-weight: 700; color: #d32f2f;
                    cursor: pointer; padding: 10px;
                }

                #errorScreen {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: #742284;
                    z-index: 5000;
                    flex-direction: column;
                    padding-bottom: 15vh;
                    align-items: center;
                    text-align: center;
                    padding: 30px;
                    animation: fadeInError 0.4s ease;
                }

                @keyframes fadeInError { from { opacity: 0; } to { opacity: 1; } }

                .error-img {
                    width: 220px;
                    max-width: 85%;
                    margin-bottom: 25px;
                }

                .error-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 12px;
                }

                .error-text {
                    font-size: 14px;
                    line-height: 1.4;
                    color: white;
                    font-weight: 400;
                    opacity: 0.9;
                }

                .access-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: calc(100dvh / var(--app-zoom, 1));
                    background-color: rgba(0,0,0,0.7); z-index: 6000;
                    justify-content: center; align-items: center;
                    backdrop-filter: blur(4px);
                }

                .access-card {
                    background: white; color: #333;
                    width: 85%; max-width: 330px; border-radius: 20px; padding: 35px 25px;
                    display: flex; flex-direction: column; align-items: center; text-align: center;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    animation: popInBio 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .access-icon {
                    width: 70px; height: 70px; background-color: #f3e5f5; border-radius: 50%;
                    display: flex; justify-content: center; align-items: center; margin-bottom: 20px;
                }

                .access-title { font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #742284; }
                .access-text { font-size: 15px; color: #666; margin-bottom: 25px; line-height: 1.4; }

                .access-btn {
                    width: 100%; padding: 14px; border-radius: 25px; font-size: 14.5px; font-weight: 700;
                    text-decoration: none; display: flex; justify-content: center; align-items: center; gap: 10px;
                    margin-bottom: 12px; transition: transform 0.1s;
                }
                
                .access-btn:active { transform: scale(0.96); }
                
                .access-btn.primary { background-color: #00BFA5; color: white; }
                .access-btn.secondary { background-color: #0088cc; color: white; margin-bottom: 0; }

                .yape-alert-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: calc(100dvh / var(--app-zoom, 1));
                    background-color: rgba(0,0,0,0.6); z-index: 7000;
                    justify-content: center; align-items: center;
                }
                
                .yape-alert-card-native {
                    background: white; border-radius: 4px; padding: 24px; width: 85%; max-width: 320px;
                    display: flex; flex-direction: column; align-items: flex-start; text-align: left;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                
                .yape-alert-text-native { font-size: 14px; color: #333; margin-bottom: 25px; line-height: 1.4; }
                .yape-alert-actions-native { display: flex; justify-content: flex-end; width: 100%; }
                
                .yape-btn-text-only { background: transparent; border: none; color: #00BFA5; font-weight: 700; font-size: 14px; cursor: pointer; text-transform: uppercase; padding: 8px; transition: 0.2s; outline: none; }
                .yape-btn-text-only:active { background: #f0f0f0; border-radius: 4px; }

                @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
            `}</style>
        </>
    );
}
