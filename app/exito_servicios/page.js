'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import html2canvas from 'html2canvas';

function ExitoServiciosContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isPhotoReady, setIsPhotoReady] = useState(false);
    const [showBurst, setShowBurst] = useState(false);
    const [burstFrame, setBurstFrame] = useState(0);

    const empresa = decodeURIComponent(searchParams.get('empresa') || 'Empresa');
    const monto = searchParams.get('monto') || '0.00';
    const servicio = decodeURIComponent(searchParams.get('servicio') || 'Servicio');
    const codigo = searchParams.get('codigo') || '000000';
    const titular = decodeURIComponent(searchParams.get('titular') || 'TITULAR');

    const [fechaActual, setFechaActual] = useState('');
    const [horaActual, setHoraActual] = useState('');
    const [opNumber, setOpNumber] = useState('');

    const frameNames = [
        'download.png', 'download1.png', 'download2.png', 'download3.png', 'download4.png',
        'download5.png', 'download6.png', 'download7.png', 'download8.png', 'download9.png',
        'download10.png', 'download11.png', 'download13.png', 'download14.png' 
    ];

    useEffect(() => {
        const now = new Date();
        const optionsDate = { day: 'numeric', month: 'short', year: 'numeric' };
        setFechaActual(now.toLocaleDateString('es-ES', optionsDate));
        
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
        hours = hours % 12; hours = hours ? hours : 12;
        setHoraActual(`${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`);

        setOpNumber(Math.floor(10000000 + Math.random() * 90000000).toString().padStart(8, '0'));

        // Sequence
        setShowBurst(true);
        let frame = 0;
        const interval = setInterval(() => {
            if (frame >= frameNames.length) {
                clearInterval(interval);
                setShowBurst(false);
                return;
            }
            setBurstFrame(frame);
            frame++;
        }, 70);

        return () => clearInterval(interval);
    }, []);

    const compartirVoucher = () => {
        setIsPhotoReady(true);
        setTimeout(() => {
            html2canvas(document.body, { 
                backgroundColor: '#742284', 
                scale: 2 
            }).then(canvas => {
                canvas.toBlob(blob => {
                    let nombreParaArchivo = empresa.replace(/[^a-zA-Z0-9]/g, "_");
                    const file = new File([blob], `Yape_Servicio_${nombreParaArchivo}.png`, { type: 'image/png' });
                    
                    if (navigator.share) {
                        navigator.share({
                            title: `Pago de Servicio a ${nombreParaArchivo}`,
                            files: [file]
                        }).then(() => {
                            setIsPhotoReady(false);
                        }).catch(err => {
                            console.log('Error al compartir:', err);
                            setIsPhotoReady(false);
                        });
                    } else {
                        const link = document.createElement('a');
                        link.download = `Yape_Servicio_${nombreParaArchivo}.png`;
                        link.href = URL.createObjectURL(blob);
                        link.click();
                        setIsPhotoReady(false);
                    }
                });
            });
        }, 150);
    };

    return (
        <>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            <div className="exito-servicios-body">
<div className="container">
                <div className="exito-servicios-header">
                    {!isPhotoReady ? (
                        <img src="/img/animationyape.gif" alt="Yape" className="logo-header-img" />
                    ) : (
                        <img src="/img/LogoYape.svg" alt="Yape" className="logo-header-img" />
                    )}

                    {!isPhotoReady && (
                        <div className="close-btn" onClick={() => router.push('/inicio')}>
                            <i className="fa-solid fa-xmark"></i>
                        </div>
                    )}
                </div>

                {showBurst && (
                    <div id="burst-container">
                        <img src={`/img/${frameNames[burstFrame]}`} id="burst-image" alt="Confeti" style={{display: 'block'}} />
                    </div>
                )}

                <div className="success-card">
                    <div className="card-header-row">
                        <div className="title">¡Yapeaste el servicio!</div>
                        {!isPhotoReady && (
                            <button className="share-btn" onClick={compartirVoucher}>
                                <img src="/img/compartiricon.png" alt="Share" className="icon-share" /> 
                                Compartir
                            </button>
                        )}
                    </div>
                    
                    <div className="amount">
                        <span>S/</span> <div>{parseFloat(monto).toFixed(2)}</div>
                    </div>

                    <div className="company-name">{empresa}</div>

                    <div className="date-time-container">
                        <img src="/img/fecha-icon.svg" alt="Fecha" className="icon-datetime" />
                        <span>{fechaActual}</span>
                        
                        <span className="dt-separator">|</span>
                        
                        <img src="/img/hora-icon.svg" alt="Hora" className="icon-datetime" />
                        <span>{horaActual}</span>
                    </div>

                    <div className="details-label">DATOS DE LA TRANSACCIÓN</div>
                    
                    <div className="detail-row">
                        <span className="detail-title">Servicio:</span>
                        <span className="detail-value">{servicio}</span>
                    </div>
                    
                    <div className="detail-row">
                        <span className="detail-title">Código de cliente:</span>
                        <span className="detail-value">{codigo}</span>
                    </div>
                    
                    <div className="detail-row">
                        <span className="detail-title">Titular:</span>
                        <span className="detail-value">{titular}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-title">Nº de operación:</span>
                        <span className="detail-value">{opNumber}</span>
                    </div>
                </div>

                {!isPhotoReady && (
                    <div className="btn-new-service" onClick={() => router.push('/servicios')}>
                        <img src="/img/iconservv.svg" alt="Servicio" style={{ marginRight: '10px', width: '22px', height: '22px', filter: 'brightness(0) invert(1)' }} /> Yapear otro servicio 
                    </div>
                )}

            </div>
</div>

            <style jsx global>{`
                :root {
                    --brand-purple: #742284;
                    --brand-teal: #00BFA5;
                }
                .exito-servicios-body {
                    background: linear-gradient(180deg, #581c78 0%, #742284 100%) !important;
                    background-attachment: fixed !important;
                    color: #333;
                    min-height: calc(100dvh / var(--app-zoom, 1));
                    width: 100%;
                    overflow-x: hidden;
                    position: relative;
                    margin: 0;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }
                .container {
                    width: 100%;
                    min-height: calc(100dvh / var(--app-zoom, 1));
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    padding: 15px;
                    z-index: 10;
                }
                .exito-servicios-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 5px 20px 5px;
                }
                .logo-header-img {
                    height: 80px;
                    object-fit: contain;
                    display: block;
                }
                .close-btn {
                    width: 36px;
                    height: 36px;
                    background-color: rgba(255, 255, 255, 0.25);
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: white;
                    font-size: 20px;
                    text-decoration: none;
                    cursor: pointer;
                }
                .success-card {
                    background-color: white;
                    border-radius: 20px;
                    padding: 20px 20px 30px 20px; 
                    width: 100%;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    position: relative;
                    z-index: 20;
                    margin-bottom: 0; 
                }
                .card-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 5px;
                    gap: 10px;
                }
                .title {
                    font-size: 20px;
                    font-weight: 600;
                    color: var(--brand-purple);
                    line-height: 1.1;
                    flex: 1; 
                }
                .share-btn {
                    color: var(--brand-teal);
                    font-weight: 700;
                    font-size: 15px;
                    display: flex;
                    align-items: center;
                    text-decoration: none;
                    background: none;
                    border: none;
                    cursor: pointer;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                .icon-share {
                    width: 18px;
                    height: 18px;
                    margin-right: 5px;
                    object-fit: contain;
                }
                .amount {
                    font-size: 50px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 5px;
                    display: flex;
                    align-items: flex-start;
                    line-height: 1;
                    letter-spacing: -1px;
                    margin-top: 10px;
                }
                .amount span {
                    font-size: 25px;
                    font-weight: 600;
                    margin-right: 4px;
                    margin-top: 8px;
                    color: #555;
                }
                .company-name {
                    font-size: 22px;
                    font-weight: 600;
                    color: #222;
                    margin-bottom: 10px;
                }
                .date-time-container {
                    display: flex;
                    align-items: center;
                    font-size: 15px;
                    color: #666;
                    margin-bottom: 25px;
                    font-weight: 500;
                }
                .icon-datetime {
                    width: 16px;
                    height: 16px;
                    margin-right: 6px;
                    object-fit: contain;
                    opacity: 0.6;
                }
                .dt-separator { margin: 0 10px; color: #ccc; }
                .details-label {
                    font-size: 13px;
                    font-weight: 700;
                    color: #888;
                    text-transform: uppercase;
                    margin-bottom: 15px;
                    letter-spacing: 0.5px;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline; 
                    margin-bottom: 14px;
                    font-size: 16px;
                }
                .detail-title {
                    color: #666;
                    font-weight: 500;
                    flex: 1;
                }
                .detail-value {
                    color: #222;
                    font-weight: 600;
                    text-align: right;
                    flex: 1;
                    word-break: break-word; 
                }
                .btn-new-service {
                    background-color: var(--brand-teal);
                    color: white;
                    border: none;
                    padding: 16px;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 17px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    width: 100%;
                    margin-top: 20px; 
                    box-shadow: 0 4px 12px rgba(0, 191, 165, 0.4);
                    text-decoration: none;
                }
                #burst-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 100;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                }
                #burst-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            `}</style>
        </>
    );
}

export default function ExitoServicios() {
    return (
        <Suspense fallback={<div style={{height:'calc(100dvh / var(--app-zoom, 1))', background:'#742284'}}></div>}>
            <ExitoServiciosContent />
        </Suspense>
    );
}
