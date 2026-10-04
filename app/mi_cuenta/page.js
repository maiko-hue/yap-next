'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function MiCuenta() {
    const router = useRouter();
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userRef = doc(db, 'clientes', user.email);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        setUserData({ ...userSnap.data(), email: user.email });
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
                setTimeout(() => {
                    setIsLoading(false);
                }, 2000);
            } else {
                router.push('/');
            }
        });
        return () => unsubscribe();
    }, [router]);

    return (
        <div className="main-container">
            <div className="header-hero">
                <div className="back-icon" onClick={() => router.push('/opciones')}>
                    <i className="fa-solid fa-arrow-left"></i>
                </div>
                <img src="/img/secondlogo.png" alt="Logo" className="logo-img-custom" />
            </div>

            <div className="info-card">
                <div className="section-title" style={{ marginTop: 0 }}>INFORMACIÓN DE MI CUENTA</div>
                
                <div className="settings-section">
                    
                    <div className="setting-item-static">
                        <div className="setting-left-static">
                            <div className="st-label">Email</div>
                            {isLoading ? (
                                <div className="skeleton-box"></div>
                            ) : (
                                <div className="st-value">{userData?.email || 'No disponible'}</div>
                            )}
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="setting-item-static">
                        <div className="setting-left-static">
                            <div className="st-label">Sesión Token</div>
                            {isLoading ? (
                                <div className="skeleton-box"></div>
                            ) : (
                                <div className="st-value truncate">{userData?.sesion_token || 'No disponible'}</div>
                            )}
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="setting-item-static">
                        <div className="setting-left-static">
                            <div className="st-label">Fecha de Activación</div>
                            {isLoading ? (
                                <div className="skeleton-box"></div>
                            ) : (
                                <div className="st-value">{userData?.fecha || 'No disponible'}</div>
                            )}
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="setting-item-static">
                        <div className="setting-left-static">
                            <div className="st-label">Estado</div>
                            {isLoading ? (
                                <div className="skeleton-box"></div>
                            ) : (
                                <div className="st-value status-badge" style={{
                                    backgroundColor: userData?.estado === 'activo' ? 'rgba(0,191,165,0.1)' : 'rgba(255,82,82,0.1)',
                                    color: userData?.estado === 'activo' ? '#00BFA5' : '#FF5252'
                                }}>
                                    {userData?.estado ? userData.estado.toUpperCase() : 'NO DISPONIBLE'}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <style jsx>{`
                .main-container { min-height: 100dvh; background-color: #f9f9fb; font-family: 'Nunito', sans-serif; display: flex; flex-direction: column; overflow-y: auto; }
                .header-hero { background: linear-gradient(135deg, #742385 0%, #511973 100%); height: 220px; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; position: relative; display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 15px rgba(81, 25, 115, 0.3); flex-shrink: 0; padding-bottom: 20px; }
                .back-icon { position: absolute; top: 25px; left: 25px; color: white; font-size: 24px; cursor: pointer; background: rgba(255,255,255,0.2); width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; transition: background 0.3s; z-index: 10; }
                .back-icon:active { background: rgba(255,255,255,0.4); }
                .logo-img-custom { width: 150px; height: 150px; object-fit: contain; margin-top: -10px; filter: drop-shadow(0px 10px 10px rgba(0,0,0,0.2)); }
                
                .info-card { background: white; margin: -60px 20px 20px 20px; padding: 30px 20px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); position: relative; z-index: 2; }
                .section-title { font-size: 13px; font-weight: 800; color: #742385; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
                .settings-section { display: flex; flex-direction: column; }
                
                .setting-item-static { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; }
                .setting-left-static { display: flex; flex-direction: column; gap: 8px; width: 100%; }
                .st-label { font-size: 12px; color: #888; font-weight: 700; text-transform: uppercase; }
                .st-value { font-size: 16px; color: #333; font-weight: 700; word-break: break-all; }
                .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; display: block; }
                .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 800; text-align: center; width: fit-content; }
                
                .divider { border: 0; border-top: 1px solid #f0f0f0; margin: 15px 0; }
                
                .skeleton-box { width: 100%; height: 24px; background-color: #e2e5e7; border-radius: 6px; position: relative; overflow: hidden; }
                .skeleton-box::after { content: ""; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); animation: shimmer 1.5s infinite; }
                
                @keyframes shimmer { 100% { left: 100%; } }
            `}</style>
        </div>
    );
}
