"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db, doc, setDoc } from '../firebase';
import jsQR from 'jsqr';

export default function AgregarQR() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [destino, setDestino] = useState('Yape');
    const [previewSrc, setPreviewSrc] = useState(null);
    const [scannedQrCode, setScannedQrCode] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const [toast, setToast] = useState({ message: '', type: '', show: false });
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const showToast = (message, type) => {
        setToast({ message, type, show: true });
        setTimeout(() => setToast({ message: '', type: '', show: false }), 3000);
    };

    const resetUpload = () => {
        setPreviewSrc(null);
        setScannedQrCode(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    const previewFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        setPreviewSrc(objectUrl);

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            
            context.drawImage(img, 0, 0, width, height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert"
            });

            if (code) {
                setScannedQrCode(code.data);
                showToast("Código QR detectado correctamente", "success");
            } else {
                setScannedQrCode(null);
                showToast("No se detectó ningún QR en la imagen", "error");
            }

            URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;
    };

    const handleGuardar = async () => {
        if (!previewSrc) {
            showToast("Falta capturar o subir la imagen", "error");
            return;
        }
        if (name.trim() === "") {
            showToast("Falta el nombre", "error");
            return;
        }
        if (!scannedQrCode) {
            showToast("La imagen no contiene un QR válido", "error");
            return;
        }

        setIsLoading(true);

        try {
            const safeId = scannedQrCode.replace(/\//g, '_slash_');

            await setDoc(doc(db, "codigos_qr", safeId), {
                nombre: name,
                destino: destino,
                codigo_original: scannedQrCode,
                fecha: new Date().toISOString()
            });
            
            setIsLoading(false);
            showToast("¡QR Guardado en la Nube!", "success");

            setTimeout(() => {
                router.push('/opciones');
            }, 1500);

        } catch (e) {
            console.error(e);
            setIsLoading(false);
            showToast("Error al guardar en la nube", "error");
        }
    };

    return (
        <>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            <div className="page-wrapper">
                {isLoading && (
                    <div className="custom-loader-overlay">
                        <div style={{position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '90px', height: '90px'}}>
                            <div className="custom-spinner" style={{width: '90px', height: '90px', border: '4px solid rgba(255,255,255,0.2)', borderTop: '4px solid #00BFA5', position: 'absolute', margin: 0}}></div>
                            <img src="/img/secondlogo.png" alt="Loading" style={{width: '50px', height: '50px', objectFit: 'contain', zIndex: 1}} />
                        </div>
                        <p style={{ marginTop: '20px', fontWeight: 700, color: 'white', fontSize: '15px' }}>Guardando QR en la Nube...</p>
                    </div>
                )}

                <div className={`toast ${toast.show ? 'show' : ''} ${toast.type}`}>
                    {toast.message}
                </div>

                <div className="container">
                    <div className="header-hero">
                        <i className="fa-solid fa-arrow-left back-icon" onClick={() => router.push('/opciones')}></i>
                        <img src="/img/secondlogo.png" alt="Logo" className="logo-img-custom" />
                    </div>

                    <div className="info-card">
                        <div className="section-title">Nuevo Código QR</div>

                        <label className="label">Imagen del QR</label>
                        <div className="upload-area">
                            {!previewSrc ? (
                                <div id="uploadPlaceholder" style={{ width: '100%', textAlign: 'center' }}>
                                    <div className="scan-options-container">
                                        <div className="scan-action" onClick={() => cameraInputRef.current.click()}>
                                            <i className="fa-solid fa-camera upload-icon"></i>
                                            <div className="upload-text">Tomar Foto</div>
                                        </div>
                                        
                                        <div className="scan-action" onClick={() => fileInputRef.current.click()}>
                                            <i className="fa-solid fa-images upload-icon"></i>
                                            <div className="upload-text">Subir Galería</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '5px' }}>
                                        (Toca la imagen para borrarla si te equivocas)
                                    </div>
                                </div>
                            ) : (
                                <img id="previewImg" src={previewSrc} alt="QR Preview" onClick={resetUpload} />
                            )}
                            
                            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={previewFile} />
                            <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" style={{ display: 'none' }} onChange={previewFile} />
                        </div>

                        <div className="form-group">
                            <label className="label">Nombre del Negocio / Persona</label>
                            <div className="input-card">
                                <i className="fa-solid fa-store input-icon"></i>
                                <input type="text" className="input-field" placeholder="Bodega Don Pepe" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">Destino</label>
                            <div className="input-card">
                                <i className="fa-solid fa-building-columns input-icon"></i>
                                <select className="input-field" value={destino} onChange={e => setDestino(e.target.value)}>
                                    <option value="Yape">Yape</option>
                                    <option value="Plin">Plin</option>
                                    <option value="Bim">Bim</option>
                                    <option value="Tunki">Tunki</option>
                                    <option value="Agora / oh!">Agora / oh!</option>
                                    <option value="BCP">BCP</option>
                                    <option value="BBVA">BBVA</option>
                                    <option value="Interbank">Interbank</option>
                                    <option value="Financiera Efectiva">Financiera Efectiva</option>
                                    <option value="Dale">Dale</option>
                                    <option value="IziPay">IziPay</option>
                                    <option value="SIP">SIP</option>
                                </select>
                            </div>
                        </div>

                        <div style={{display: 'flex', alignItems: 'flex-start', background: 'rgba(0,191,165,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '25px', marginTop: '10px'}}>
                            <svg style={{width: '20px', height: '20px', flexShrink: 0, marginRight: '10px', color: '#00BFA5'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            <div style={{fontSize: '13px', lineHeight: '1.4', color: '#555', fontWeight: '600'}}>
                                Recuerda que el QR estará disponible para todos los usuarios y para toda APP en general.
                            </div>
                        </div>

                        <button className="btn-save" onClick={handleGuardar}>Guardar</button>
                    </div>
                </div>

                <style jsx>{`
                    .page-wrapper {
                        --brand-purple: #742385;
                        --brand-dark-purple: #511973;
                        --brand-teal: #00BFA5;
                        --bg-gray: #f2f4f6;
                        --text-dark: #333;
                        --text-muted: #888;
                        --border-color: #e0e0e0;
                        --input-bg: #f9f9fb;

                        overscroll-behavior-y: none;
                        margin: 0;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        background-color: var(--bg-gray);
                        color: var(--text-dark);
                        height: calc(100dvh / var(--app-zoom, 1));
                        box-sizing: border-box;
                        overflow-y: auto;
                    }

                    .page-wrapper * {
                        -webkit-tap-highlight-color: transparent;
                        outline: none;
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                        user-select: none;
                        box-sizing: border-box;
                    }

                    .page-wrapper input, .page-wrapper textarea, .page-wrapper select {
                        -webkit-user-select: auto;
                        -moz-user-select: auto;
                        -ms-user-select: auto;
                        user-select: auto;
                    }

                    .page-wrapper img {
                        -webkit-touch-callout: none !important;
                        -webkit-user-drag: none !important;
                        -webkit-user-select: none !important;
                        pointer-events: none;
                    }

                    #previewImg {
                        pointer-events: auto !important; 
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                        position: absolute;
                        top: 0;
                        left: 0;
                        background: transparent;
                        cursor: pointer;
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

                    .upload-area {
                        background-color: var(--input-bg);
                        border: 2px dashed #ccc;
                        border-radius: 16px;
                        height: 180px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        margin-bottom: 20px;
                        position: relative;
                        overflow: hidden;
                        transition: all 0.3s ease;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.02);
                    }
                    
                    .scan-options-container {
                        display: flex;
                        gap: 30px;
                        justify-content: center;
                        width: 100%;
                        z-index: 1;
                    }

                    .scan-action {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        cursor: pointer;
                        padding: 15px;
                        border-radius: 12px;
                        transition: background 0.2s;
                    }

                    .scan-action:active {
                        background: rgba(116, 34, 132, 0.1);
                    }
                    
                    .upload-icon { font-size: 35px; color: var(--brand-purple); margin-bottom: 10px; opacity: 0.8;}
                    .upload-text { font-size: 14px; color: var(--text-muted); font-weight: 600;}

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

                    select.input-field {
                        -webkit-appearance: none; appearance: none; background-color: transparent;
                    }
                    select.input-field option {
                        background-color: white; color: var(--text-dark);
                    }

                    .btn-save {
                        width: 100%; margin-top: 10px; background-color: var(--brand-teal);
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
            </div>
        </>
    );
}

