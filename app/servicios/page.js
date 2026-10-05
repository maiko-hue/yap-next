'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Servicios() {
    const router = useRouter();
    const [empresa, setEmpresa] = useState('');
    const [monto, setMonto] = useState('');
    const [servicio, setServicio] = useState('');
    const [codigo, setCodigo] = useState('');
    const [titular, setTitular] = useState('');

    const handleYapear = () => {
        let url = `/exito_servicios?empresa=${encodeURIComponent(empresa)}&monto=${monto}&servicio=${encodeURIComponent(servicio)}&codigo=${codigo}&titular=${encodeURIComponent(titular)}&tipo=servicios`;
        router.push(url);
    };

    return (
        <>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            <div className="container">
                <div className="header-hero">
                    <i className="fa-solid fa-arrow-left back-icon" onClick={() => router.push('/inicio')}></i>
                    <img src="/img/secondlogo.png" alt="Logo" className="logo-img-custom" />
                </div>

                <div className="info-card">
                    <div className="section-title">Datos</div>

                    <div className="form-group">
                        <label className="label">Empresa</label>
                        <div className="input-card">
                            <i className="fa-solid fa-building input-icon"></i>
                            <input type="text" className="input-field" placeholder="Ej. PagoEfectivo" value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Monto a Pagar</label>
                        <div className="input-card">
                            <i className="fa-solid fa-sack-dollar input-icon"></i>
                            <input type="number" className="input-field" placeholder="0.00" value={monto} onChange={(e) => setMonto(e.target.value)} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Nombre del Servicio</label>
                        <div className="input-card">
                            <i className="fa-solid fa-bolt input-icon"></i>
                            <input type="text" className="input-field" placeholder="Ej. Luz del Sur" value={servicio} onChange={(e) => setServicio(e.target.value)} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Código de Cliente</label>
                        <div className="input-card">
                            <i className="fa-solid fa-barcode input-icon"></i>
                            <input type="number" className="input-field" placeholder="Ej. 12345678" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Titular</label>
                        <div className="input-card">
                            <i className="fa-solid fa-user input-icon"></i>
                            <input type="text" className="input-field" placeholder="Nombre completo" value={titular} onChange={(e) => setTitular(e.target.value)} />
                        </div>
                    </div>

                    <button className="btn-save" onClick={handleYapear}>Yapear Servicio</button>
                </div>
            </div>

            <style jsx global>{`
                :root {
                    --brand-purple: #742385;
                    --brand-dark-purple: #511973;
                    --brand-teal: #00BFA5;
                    --bg-gray: #f2f4f6;
                    --text-dark: #333;
                    --text-muted: #888;
                    --border-color: #e0e0e0;
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
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .section-title {
                    font-size: 14px;
                    font-weight: 800;
                    color: var(--text-muted);
                    margin: 0 0 20px 5px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .form-group { margin-bottom: 20px; }
                .label { 
                    font-size: 13px; color: var(--brand-purple); text-transform: uppercase; 
                    font-weight: 700; margin-bottom: 8px; display: block; letter-spacing: 0.5px; margin-left: 5px;
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
            `}</style>
        </>
    );
}


