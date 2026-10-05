'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, doc, setDoc } from '../firebase';

export default function AgregarContacto() {
    const router = useRouter();
    const [numero, setNumero] = useState('');
    const [nombre, setNombre] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: '' });
        }, 3000);
    };

    const handleSave = async () => {
        if (numero.length !== 9 || nombre.trim() === '') {
            showToast('Datos Erroneos', 'error');
            return;
        }

        setIsLoading(true);

        try {
            await setDoc(doc(db, 'usuarios_yape', numero), {
                nombre: nombre
            });

            setTimeout(() => {
                setIsLoading(false);
                showToast('¡Guardado en la Nube!', 'success');
                setTimeout(() => {
                    router.push('/opciones');
                }, 1500);
            }, 2000);
        } catch (error) {
            console.error('Error al guardar:', error);
            setIsLoading(false);
            showToast('Error de conexión', 'error');
        }
    };

    const handlePhoneInput = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
        setNumero(val);
    };

    return (
        <>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            
            {isLoading && (
                <div className="custom-loader-overlay">
                    <svg height="108px" width="108px" viewBox="0 0 128 128" className="loader">
                        <defs>
                          <clipPath id="loader-eyes">
                            <circle transform="rotate(-40,64,64) translate(0,-56)" r="8" cy="64" cx="64" className="loader__eye1"></circle>
                            <circle transform="rotate(40,64,64) translate(0,-56)" r="8" cy="64" cx="64" className="loader__eye2"></circle>
                          </clipPath>
                          <linearGradient y2="1" x2="0" y1="0" x1="0" id="loader-grad">
                            <stop stopColor="#000" offset="0%"></stop>
                            <stop stopColor="#fff" offset="100%"></stop>
                          </linearGradient>
                          <mask id="loader-mask">
                            <rect fill="url(#loader-grad)" height="128" width="128" y="0" x="0"></rect>
                          </mask>
                        </defs>
                        <g strokeDasharray="175.93 351.86" strokeWidth="12" strokeLinecap="round">
                          <g>
                            <rect clipPath="url(#loader-eyes)" height="64" width="128" fill="hsl(193,90%,50%)"></rect>
                            <g stroke="hsl(193,90%,50%)" fill="none">
                              <circle transform="rotate(180,64,64)" r="56" cy="64" cx="64" className="loader__mouth1"></circle>
                              <circle transform="rotate(0,64,64)" r="56" cy="64" cx="64" className="loader__mouth2"></circle>
                            </g>
                          </g>
                          <g mask="url(#loader-mask)">
                            <rect clipPath="url(#loader-eyes)" height="64" width="128" fill="hsl(223,90%,50%)"></rect>
                            <g stroke="hsl(223,90%,50%)" fill="none">
                              <circle transform="rotate(180,64,64)" r="56" cy="64" cx="64" className="loader__mouth1"></circle>
                              <circle transform="rotate(0,64,64)" r="56" cy="64" cx="64" className="loader__mouth2"></circle>
                            </g>
                          </g>
                        </g>
                    </svg>
                    <p style={{ marginTop: '20px', fontWeight: 600, color: 'white' }}>Guardando en la Nube...</p>
                </div>
            )}

            <div className={`toast ${toast.show ? 'show' : ''} ${toast.type}`}>
                {toast.message || 'Mensaje aquí'}
            </div>

            <div className="container">
                <div className="header-hero">
                    <i className="fa-solid fa-arrow-left back-icon" onClick={() => router.push('/opciones')}></i>
                    <img src="/img/secondlogo.png" alt="Logo" className="logo-img-custom" />
                </div>

                <div className="info-card">
                    <div className="section-title">Agregar Contacto Rápido</div>

                    <div className="form-group">
                        <label className="label">Número de Celular</label>
                        <div className="input-card">
                            <i className="fa-solid fa-mobile-screen input-icon"></i>
                            <input 
                                type="tel" 
                                className="input-field" 
                                placeholder="999 999 999" 
                                maxLength="9" 
                                value={numero}
                                onChange={handlePhoneInput}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Nombre y Apellido</label>
                        <div className="input-card">
                            <i className="fa-regular fa-user input-icon"></i>
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="Ej. Juan Pérez"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                            />
                        </div>
                    </div>

                    <button className="btn-save" onClick={handleSave}>Guardar</button>
                </div>
            </div>

            <style jsx global>{`
                /* Original styles are included and adapted here with camelCase animations for React... */
                * {
                    -webkit-tap-highlight-color: transparent;
                    outline: none !important;
                    -webkit-user-select: none; 
                    -moz-user-select: none; 
                    -ms-user-select: none; 
                    user-select: none; 
                    box-sizing: border-box;
                }

                input, textarea {
                    -webkit-user-select: auto;
                    -moz-user-select: auto;
                    -ms-user-select: auto;
                    user-select: auto;
                }

                :root {
                    --brand-purple: #742385;
                    --brand-dark-purple: #511973;
                    --brand-teal: #00BFA5;
                    --bg-gray: #f2f4f6;
                    --text-dark: #333;
                    --text-muted: #888;
                    --border-color: #e0e0e0;
                }

                img {
                    -webkit-touch-callout: none !important;
                    -webkit-user-drag: none !important;
                    -webkit-user-select: none !important;
                    pointer-events: none;
                }

                body { 
                    overscroll-behavior-y: none;
                    margin: 0; 
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                    background-color: var(--bg-gray); 
                    color: var(--text-dark); 
                    height: calc(100dvh / var(--app-zoom, 1));
                    overflow-y: auto;
                }

                .container { 
                    max-width: 100%; 
                    margin: 0 auto; 
                    height: calc(100dvh / var(--app-zoom, 1)); 
                    display: flex; 
                    flex-direction: column; 
                    position: relative;
                }

                .header-hero {
                    background: linear-gradient(135deg, var(--brand-purple) 0%, var(--brand-dark-purple) 100%);
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
                    gap: 5px;
                }

                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .section-title {
                    font-size: 15px;
                    font-weight: 800;
                    color: var(--brand-purple);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 15px;
                }

                .form-group { margin-bottom: 20px; }
                .label { 
                    font-size: 13px; 
                    color: var(--brand-purple); 
                    text-transform: uppercase; 
                    font-weight: 700; 
                    margin-bottom: 8px; 
                    display: block; 
                    letter-spacing: 0.5px; 
                    margin-left: 5px;
                }
                
                .input-card {
                    background-color: white; border-radius: 12px; padding: 14px 18px;
                    border: 1px solid var(--border-color); display: flex; align-items: center;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.02); transition: all 0.3s ease;
                }
                .input-card:focus-within { border-color: var(--brand-teal); box-shadow: 0 2px 8px rgba(0, 191, 165, 0.2); }
                
                .input-field {
                    background: transparent; border: none; color: var(--text-dark); width: 100%;
                    font-size: 15px; font-weight: 600; outline: none; font-family: inherit;
                }
                .input-field::placeholder { color: #aaa; font-weight: 400; }
                .input-icon { color: var(--brand-purple); font-size: 18px; margin-right: 15px; width: 24px; text-align: center; opacity: 0.8; }

                .btn-save {
                    width: 100%; margin-top: 15px; background-color: var(--brand-teal);
                    color: white; padding: 16px; border-radius: 30px; border: none; 
                    font-size: 16px; font-weight: 700; cursor: pointer;
                    box-shadow: 0 4px 15px rgba(0, 191, 165, 0.3); transition: transform 0.1s, background-color 0.2s;
                }
                .btn-save:active { transform: scale(0.97); background-color: #00a892; }

                .custom-loader-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.85); z-index: 9999;
                    display: flex; justify-content: center; align-items: center;
                    flex-direction: column; backdrop-filter: blur(4px);
                }

                .loader { width: 8em; height: 8em; }
                .loader__eye1, .loader__eye2, .loader__mouth1, .loader__mouth2 { animation: eye1 3s ease-in-out infinite; }
                .loader__eye1, .loader__eye2 { transform-origin: 64px 64px; }
                .loader__eye2 { animation-name: eye2; }
                .loader__mouth1 { animation-name: mouth1; }
                .loader__mouth2 { animation-name: mouth2; visibility: hidden; }

                @keyframes eye1 {
                    from { transform: rotate(-260deg) translate(0, -56px); }
                    50%, 60% { animation-timing-function: cubic-bezier(0.17, 0, 0.58, 1); transform: rotate(-40deg) translate(0, -56px) scale(1); }
                    to { transform: rotate(225deg) translate(0, -56px) scale(0.35); }
                }
                @keyframes eye2 {
                    from { transform: rotate(-260deg) translate(0, -56px); }
                    50% { transform: rotate(40deg) translate(0, -56px) rotate(-40deg) scale(1); }
                    52.5% { transform: rotate(40deg) translate(0, -56px) rotate(-40deg) scale(1, 0); }
                    55%, 70% { animation-timing-function: cubic-bezier(0, 0, 0.28, 1); transform: rotate(40deg) translate(0, -56px) rotate(-40deg) scale(1); }
                    to { transform: rotate(150deg) translate(0, -56px) scale(0.4); }
                }
                @keyframes mouth1 {
                    from { animation-timing-function: ease-in; stroke-dasharray: 0 351.86; stroke-dashoffset: 0; }
                    25% { animation-timing-function: ease-out; stroke-dasharray: 175.93 351.86; stroke-dashoffset: 0; }
                    50% { animation-timing-function: steps(1, start); stroke-dasharray: 175.93 351.86; stroke-dashoffset: -175.93; visibility: visible; }
                    75%, to { visibility: hidden; }
                }
                @keyframes mouth2 {
                    from { animation-timing-function: steps(1, end); visibility: hidden; }
                    50% { animation-timing-function: ease-in-out; visibility: visible; stroke-dashoffset: 0; }
                    to { stroke-dashoffset: -351.86; }
                }

                .toast {
                    visibility: hidden; min-width: 250px; margin-left: -125px;
                    background-color: #333; color: #fff; text-align: center;
                    border-radius: 50px; padding: 16px; position: fixed;
                    z-index: 10000; left: 50%; bottom: 30px; font-size: 14px; font-weight: 600;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3); opacity: 0;
                    transition: opacity 0.3s, bottom 0.3s;
                }

                .toast.show { visibility: visible; opacity: 1; bottom: 50px; }
                .toast.success { background-color: var(--brand-teal); color: white; }
                .toast.error { background-color: #ff5252; color: white; }
            `}</style>
        </>
    );
}

