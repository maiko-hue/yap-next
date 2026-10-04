'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

export default function SecurityGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [overlay, setOverlay] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  const esIndex = pathname === '/';

  const expulsarUsuario = async () => {
    localStorage.removeItem("pase_vip_activo");
    localStorage.removeItem("sesion_iniciada");
    localStorage.removeItem("sesion_token_yape");
    try {
      await signOut(auth);
    } catch(e) { console.error("Error cerrando sesin:", e); }
    router.push('/');
    setOverlay(null);
  };

  useEffect(() => {
    let vigilanteActivo = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (!esIndex) {
          expulsarUsuario();
        } else {
          setIsChecking(false);
        }
        return;
      }

      if (esIndex && localStorage.getItem("pase_vip_activo") === "true") {
        router.push('/login_pin');
        return;
      }
      
      if (esIndex) {
        setIsChecking(false);
        return; // El index maneja su propio botn de Google.
      }

      const miTicket = localStorage.getItem("sesion_token_yape");
      const userRef = doc(db, "clientes", user.email);

      vigilanteActivo = onSnapshot(userRef, (userSnap) => {
        if (!userSnap.exists()) {
          expulsarUsuario();
          return;
        }

        const userData = userSnap.data();

        if (userData.sesion_token && userData.sesion_token !== miTicket) {
          setOverlay(
            <div className="seguridad-overlay">
              <div className="seguridad-card">
                <i className="fa-solid fa-right-from-bracket seguridad-icon" style={{color: '#ef4444'}}></i>
                <div className="seguridad-title">Sesin Cerrada</div>
                <div className="seguridad-text">Tu sesin se ha cerrado por actividad en otro dispositivo.</div>
                <button className="btn-soporte" style={{backgroundColor: '#ef4444'}} onClick={expulsarUsuario}>Entendido</button>
              </div>
            </div>
          );
          setIsChecking(false);
          return;
        }

        if (userData.estado === "activo") {
          localStorage.setItem("pase_vip_activo", "true");
          setOverlay(null);
          setIsChecking(false);
        } else {
          setOverlay(
            <div className="seguridad-overlay">
              <div className="seguridad-card">
                <i className="fa-solid fa-circle-user seguridad-icon"></i>
                <div className="seguridad-title">Cuenta no activada!</div>
                <div className="seguridad-text">Hola <strong>{user.displayName || 'Usuario'}</strong>, tu acceso se encuentra <strong>inactivo</strong>. Contacta a soporte.</div>
                <a href="https://t.me/MaikolEsleiter" className="btn-soporte">Contactar Soporte</a>
                <button className="btn-salir" onClick={expulsarUsuario}>Volver al inicio</button>
              </div>
            </div>
          );
          localStorage.removeItem("pase_vip_activo");
          setIsChecking(false);
        }
      });
    });

    return () => {
      unsubscribe();
      if (vigilanteActivo) vigilanteActivo();
    };
  }, [pathname]);

  if (!esIndex && isChecking) {
    return <div style={{opacity: 0, width: '100%', height: '100dvh', backgroundColor: 'white'}}></div>;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .seguridad-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px); }
        .seguridad-card { background: white; width: 85%; max-width: 320px; border-radius: 20px; padding: 30px 20px; text-align: center; box-shadow: 0 15px 35px rgba(0,0,0,0.4); animation: slideUp 0.4s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .seguridad-icon { font-size: 55px; color: #742284; margin-bottom: 20px; }
        .seguridad-title { font-size: 20px; font-weight: 700; color: #333; margin-bottom: 12px; }
        .seguridad-text { font-size: 14px; color: #666; margin-bottom: 25px; line-height: 1.6; }
        .btn-soporte { background-color: #742284; color: white; border: none; width: 100%; padding: 15px; border-radius: 15px; font-size: 16px; font-weight: 700; cursor: pointer; display: block; text-decoration: none; margin-bottom: 12px; }
        .btn-salir { background: none; border: none; color: #888; font-size: 14px; font-weight: 600; cursor: pointer; }
      `}} />
      {overlay}
      {children}
    </>
  );
}
