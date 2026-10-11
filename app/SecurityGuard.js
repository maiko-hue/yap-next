'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const DIEZ_MINUTOS = 10 * 60 * 1000;

export default function SecurityGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [overlay, setOverlay] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  const esIndex = pathname === '/';

  // VALIDACIÓN SÍNCRONA: Si ya está activo, ocultamos el index al instante
  const isVip = typeof window !== 'undefined' ? localStorage.getItem("pase_vip_activo") === "true" : false;

  const expulsarUsuario = async () => {
    localStorage.removeItem("pase_vip_activo");
    localStorage.removeItem("sesion_iniciada");
    localStorage.removeItem("sesion_token_yape");
    localStorage.removeItem("ultimo_check_seguridad");
    try {
      await signOut(auth);
    } catch(e) { console.error("Error cerrando sesion:", e); }
    router.push('/');
    setOverlay(null);
  };

  // REPARACIÓN: Asegurar que el diseño de iOS y el Zoom persistan en el cliente después de la hidratación
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('yape_ios_spinner') === 'true') {
        document.documentElement.classList.add('ios-mode');
      } else {
        document.documentElement.classList.remove('ios-mode');
      }

      const savedZoom = localStorage.getItem('yape_zoom_level');
      if (savedZoom) {
        document.documentElement.style.setProperty('--app-zoom', savedZoom);
        document.documentElement.style.zoom = savedZoom;
      }
    }
  }, []);

  // Redirección reactiva en el index sin consultar a Firestore
  useEffect(() => {
    if (esIndex && localStorage.getItem("pase_vip_activo") === "true") {
      router.push('/login_pin');
    }
  }, [pathname]);

  // Función de verificación con Caché Inteligente de 10 minutos (Evita gastar cuota)
  const verificarEstadoUsuario = async (user, forzar = false) => {
    if (!user) return;
    const ahora = Date.now();
    const ultimoCheck = parseInt(localStorage.getItem('ultimo_check_seguridad') || '0', 10);
    const paseVipActivo = localStorage.getItem("pase_vip_activo") === "true";

    // Si ya fue verificado hace menos de 10 minutos y tiene pase VIP, NO consultamos Firestore
    if (!forzar && paseVipActivo && (ahora - ultimoCheck < DIEZ_MINUTOS)) {
      setIsChecking(false);
      return;
    }

    try {
      const miTicket = localStorage.getItem("sesion_token_yape");
      const userRef = doc(db, "clientes", user.email);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        expulsarUsuario();
        return;
      }

      const userData = userSnap.data();

      // Validación Anti-Clon
      if (userData.sesion_token && userData.sesion_token !== miTicket) {
        setOverlay(
          <div className="seguridad-overlay">
            <div className="seguridad-card">
              <i className="fa-solid fa-right-from-bracket seguridad-icon" style={{color: '#ef4444'}}></i>
              <div className="seguridad-title">Sesión Cerrada</div>
              <div className="seguridad-text">Tu sesión se ha cerrado por actividad en otro dispositivo.</div>
              <button className="btn-soporte" style={{backgroundColor: '#ef4444'}} onClick={expulsarUsuario}>Entendido</button>
            </div>
          </div>
        );
        setIsChecking(false);
        return;
      }

      if (userData.estado === "activo") {
        localStorage.setItem("pase_vip_activo", "true");
        localStorage.setItem("ultimo_check_seguridad", ahora.toString());
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
    } catch (err) {
      console.warn("Aviso de verificación en segundo plano:", err);
      // Si la cuota está agotada o hay fallo de red temporal, si ya tiene pase VIP no lo bloqueamos abruptamente
      setIsChecking(false);
    }
  };

  useEffect(() => {
    let currentUserRef = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      currentUserRef = user;
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
        return;
      }

      await verificarEstadoUsuario(user);
    });

    // Escuchar cuando el usuario minimiza y vuelve a abrir la app en el celular
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && currentUserRef && !esIndex) {
        verificarEstadoUsuario(currentUserRef);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Temporizador suave cada 5 minutos para evaluar si ya pasaron los 10 minutos
    const intervalTimer = setInterval(() => {
      if (currentUserRef && !esIndex) {
        verificarEstadoUsuario(currentUserRef);
      }
    }, 5 * 60 * 1000);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearInterval(intervalTimer);
    };
  }, []); // Sin dependencia de [pathname] para no re-consultar al navegar entre páginas

  if (!esIndex && isChecking) {
    return <div style={{opacity: 0, width: '100%', height: '100dvh', backgroundColor: 'white'}}></div>;
  }

  // Si estamos en el index y el usuario es VIP, mostramos una pantalla blanca (o nula) 
  // para ocultar el destello de la página de inicio mientras se redirige a login_pin.
  if (esIndex && isVip) {
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
