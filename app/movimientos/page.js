"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../movimientos.css';

export default function MovimientosPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [movimientos, setMovimientos] = useState({});
    const [hasMovements, setHasMovements] = useState(false);

    const monthMap = {
        "ene": "Enero", "feb": "Febrero", "mar": "Marzo", "abr": "Abril",
        "may": "Mayo", "jun": "Junio", "jul": "Julio", "ago": "Agosto",
        "sep": "Setiembre", "sept": "Setiembre", "oct": "Octubre", 
        "nov": "Noviembre", "dic": "Diciembre"
    };

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('yape_movements')) || [];
        
        if (stored.length === 0) {
            setHasMovements(false);
            setTimeout(() => setLoading(false), 2000);
            return;
        }

        setHasMovements(true);

        const grupos = {};
        
        stored.forEach(mov => {
            let fechaArr = mov.fechaSolo ? mov.fechaSolo.split(' ') : [];
            let groupKey = "Historial";
            
            if(fechaArr.length === 3) {
                let mesCorto = fechaArr[1].toLowerCase().replace(/\./g, '');
                let mesLargo = monthMap[mesCorto] || fechaArr[1];
                mesLargo = mesLargo.charAt(0).toUpperCase() + mesLargo.slice(1);
                groupKey = `${mesLargo} ${fechaArr[2]}`; 
            }
            
            if(!grupos[groupKey]) {
                grupos[groupKey] = [];
            }
            grupos[groupKey].push(mov);
        });

        setMovimientos(grupos);
        
        setTimeout(() => setLoading(false), 2000);
    }, []);

    const handleMovementClick = (mov) => {
        let rawNum = mov.numero || "999";
        let isQr = isNaN(rawNum.replace(/\s/g, '')); 
        let mostrarCelular = mov.mostrar_celular || "asteriscos"; 
        
        const url = `/exito?monto=${mov.monto}&nombre=${encodeURIComponent(mov.nombre)}&fecha=${encodeURIComponent(mov.fechaSolo || '')}&hora=${encodeURIComponent(mov.horaSolo || '')}&numero=${encodeURIComponent(rawNum)}&operacion=${mov.operacion || '00000000'}&codigo=${mov.codigo || '000'}&mensaje=${encodeURIComponent(mov.mensaje || '')}&destino=${encodeURIComponent(mov.destino || 'Yape')}&tipo=${mov.tipo || 'gasto'}&es_qr=${isQr}&mostrar_celular=${mostrarCelular}`;
        
        router.push(url);
    };

    return (
        <div style={{ backgroundColor: '#FFFFFF', minHeight: '100dvh', paddingBottom: '30px' }}>
            <div className="movimientos-header">
                <i className="fa-solid fa-arrow-left movimientos-header-icon" onClick={() => router.push('/')}></i>
                <div className="movimientos-header-title">Movimientos</div>
                <div className="movimientos-header-right-icons">
                    <i className="fa-regular fa-envelope movimientos-header-icon" style={{ fontSize: '18px' }}></i>
                    <i className="fa-solid fa-sliders movimientos-header-icon" style={{ fontSize: '17px' }}></i>
                </div>
            </div>

            <div className="movimientos-content">
                <img src="/img/metropolitano.webp" className="movimientos-banner" alt="Promo Metropolitano" />

                {loading ? (
                    <div id="skeletonLoader" className="skeleton-wrapper">
                        <div className="skeleton sk-month"></div>
                        
                        <div className="sk-item">
                            <div className="mov-left">
                                <div className="skeleton sk-name"></div>
                                <div className="skeleton sk-time"></div>
                            </div>
                            <div className="skeleton sk-amount"></div>
                        </div>
                        
                        <div className="sk-item">
                            <div className="mov-left">
                                <div className="skeleton sk-name" style={{ width: '150px' }}></div>
                                <div className="skeleton sk-time" style={{ width: '95px' }}></div>
                            </div>
                            <div className="skeleton sk-amount"></div>
                        </div>

                        <div className="skeleton sk-month" style={{ marginTop: '25px' }}></div>
                        
                        <div className="sk-item" style={{ borderBottom: 'none' }}>
                            <div className="mov-left">
                                <div className="skeleton sk-name" style={{ width: '110px' }}></div>
                                <div className="skeleton sk-time"></div>
                            </div>
                            <div className="skeleton sk-amount"></div>
                        </div>
                    </div>
                ) : (
                    <div id="movementsData">
                        {!hasMovements ? (
                            <div className="empty-state">No tienes movimientos recientes.</div>
                        ) : (
                            Object.entries(movimientos).map(([mesAno, lista]) => (
                                <div key={mesAno} className="month-group">
                                    <div className="month-title">{mesAno}</div>
                                    {lista.map((mov, index) => {
                                        let nombreMostrado = mov.nombre;
                                        const partes = mov.nombre.split(" ");
                                        if (partes.length > 1) {
                                            nombreMostrado = `${partes[0]} ${partes[1].substring(0, 3)}*`;
                                        }
                                        if (mov.destino && mov.destino !== "Yape") {
                                            nombreMostrado = `${mov.destino} - ${nombreMostrado}`;
                                        }

                                        let timeDisplay = "";
                                        let horaLimpia = (mov.horaSolo || '').toLowerCase();
                                        
                                        const now = new Date();
                                        const mesesCortos = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."];
                                        const hoyString = `${now.getDate()} ${mesesCortos[now.getMonth()]} ${now.getFullYear()}`;

                                        if(mov.fechaSolo === hoyString) {
                                            timeDisplay = `Hoy ${horaLimpia}`;
                                        } else {
                                            let fechaCorta = mov.fechaSolo ? mov.fechaSolo.split(' ').slice(0,2).join(' ') : "";
                                            timeDisplay = `${fechaCorta} ${horaLimpia}`;
                                        }

                                        let amountClass = 'amount-red'; 
                                        let sign = '-S/ ';
                                        if (mov.tipo === 'ingreso') {
                                            amountClass = 'amount-black';
                                            sign = ' S/ ';
                                        }
                                        let montoFormateado = parseFloat(mov.monto).toFixed(2);

                                        return (
                                            <div key={index} className="movement-item" onClick={() => handleMovementClick(mov)}>
                                                <div className="mov-left">
                                                    <span className="mov-name">{nombreMostrado}</span>
                                                    <span className="mov-time">{timeDisplay}</span>
                                                </div>
                                                <span className={`mov-amount ${amountClass}`}>{sign}{montoFormateado}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
