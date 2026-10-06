"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';

export default function EscanearQR() {
    const router = useRouter();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [loaderText, setLoaderText] = useState("Cargando...");
    const [isScanning, setIsScanning] = useState(true);

    useEffect(() => {
        let animationFrameId;
        const video = videoRef.current;
        const canvasElement = canvasRef.current;
        const canvas = canvasElement.getContext('2d');

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(stream => {
                if (video) {
                    video.srcObject = stream;
                    video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
                    video.play();
                    requestAnimationFrame(scanVideo);
                }
            })
            .catch(err => {
                console.error("Error accessing camera: ", err);
                // Fallback handling or notification can go here
            });
        }

        const scanVideo = () => {
            if (!isScanning) return;
            if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
                canvasElement.height = video.videoHeight;
                canvasElement.width = video.videoWidth;
                canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
                
                const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });

                if (code) {
                    handleQRDetected(code.data);
                }
            }
            if (isScanning) {
                animationFrameId = requestAnimationFrame(scanVideo);
            }
        };

        return () => {
            setIsScanning(false);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (video && video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, [isScanning]);

    const handleQRDetected = (qrData) => {
        setIsScanning(false);
        setLoaderText("");
        setIsLoading(true);
        setTimeout(() => {
            router.push(`/monto?qr_data=${encodeURIComponent(qrData)}`);
        }, 1000);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvasElement = document.createElement('canvas');
                const context = canvasElement.getContext('2d');
                canvasElement.width = img.width;
                canvasElement.height = img.height;
                context.drawImage(img, 0, 0, img.width, img.height);
                const imageData = context.getImageData(0, 0, img.width, img.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                
                if (code) {
                    handleQRDetected(code.data);
                } else {
                    alert("No se detectó ningún QR en la imagen.");
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleClose = (e) => {
        e.preventDefault();
        setLoaderText("");
        setIsLoading(true);
        setTimeout(() => {
            router.push('/inicio');
        }, 800);
    };

    return (
        <div className="escanear-wrapper">
            <video ref={videoRef} className="camera-stream" autoPlay playsInline muted></video>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            
            <div className={`loader-overlay ${isLoading ? 'show' : ''}`}>
                <div className="loader-card">
                    <div className="custom-spinner"></div>
                    <div className="loader-msg">{loaderText}</div>
                </div>
            </div>

            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />

            <div className="container-escanear">
                <a href="#" onClick={handleClose} className="close-btn"><i className="fa-solid fa-xmark"></i></a>

                <div className="center-content">
                    <div className="scan-text">Escanea un QR con tu cámara</div>
                    <div className="scan-box"></div>
                    <button className="joke-btn">Encender Linterna</button>
                </div>

                <div className="bottom-sheet">
                    <div className="upload-btn" onClick={() => fileInputRef.current.click()}>
                        <img src="/img/subir-imagen-icon.svg" className="upload-icon" alt="" />
                        Subir una imagen
                    </div>
                </div>
            </div>

            <style jsx global>{`
                body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: black; }
                .escanear-wrapper {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    background-color: black; color: white; width: 100%; height: calc(100dvh / var(--app-zoom, 1)); display: flex; flex-direction: column; position: relative; overflow: hidden;
                }
                .camera-stream { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
                .container-escanear { max-width: 480px; margin: 0 auto; width: 100%; height: 100%; display: flex; flex-direction: column; position: relative; z-index: 1; }
                .close-btn { position: absolute; top: max(40px, env(safe-area-inset-top)); right: 20px; color: white; font-size: 28px; text-decoration: none; z-index: 10; text-shadow: 0 2px 4px rgba(0,0,0,0.5); cursor: pointer; }
                .center-content { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
                .scan-text { font-size: 16px; margin-bottom: 20px; font-weight: 500; text-shadow: 0 2px 4px rgba(0,0,0,0.8); }
                .scan-box { width: 250px; height: 250px; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 16px; margin-bottom: 30px; position: relative; }
                .scan-box::before, .scan-box::after { content: ''; position: absolute; width: 40px; height: 40px; border-color: #00BFA5; border-style: solid; }
                .scan-box::before { top: -2px; left: -2px; border-width: 4px 0 0 4px; border-top-left-radius: 16px; }
                .scan-box::after { bottom: -2px; right: -2px; border-width: 0 4px 4px 0; border-bottom-right-radius: 16px; }
                .joke-btn { background-color: rgba(77, 77, 77, 0.8); border: none; color: white; padding: 10px 20px; border-radius: 20px; font-size: 14px; font-weight: 500; cursor: pointer; backdrop-filter: blur(5px); }
                .bottom-sheet { background-color: white; border-top-left-radius: 20px; border-top-right-radius: 20px; padding: 25px 20px; padding-bottom: max(60px, env(safe-area-inset-bottom)); color: #333; position: absolute; bottom: 0; left: 0; width: 100%; box-sizing: border-box; }
                .upload-btn { display: flex; align-items: center; justify-content: flex-start; border: 1px solid #eee; border-radius: 8px; padding: 15px; font-weight: 600; color: #333; cursor: pointer; width: 100%; box-sizing: border-box; }
                .upload-icon { width: 24px; height: 24px; margin-right: 15px; object-fit: contain; }
                .loader-overlay { position: fixed; top: 0; left: 0; width: 100%; height: calc(100dvh / var(--app-zoom, 1)); background-color: rgba(0,0,0,0.6); z-index: 3000; display: flex; justify-content: center; align-items: center; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
                .loader-overlay.show { opacity: 1; pointer-events: all; }
                .loader-card { background: white; width: 220px; height: 100px; border-radius: 12px; display: flex; justify-content: center; align-items: center; flex-direction: column; }
                .custom-spinner { width: 40px; height: 40px; border: 4px solid #e0e0e0; border-top: 4px solid #00BFA5; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 10px; }
                .loader-msg { font-size: 14px; font-weight: 600; color: #333; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
