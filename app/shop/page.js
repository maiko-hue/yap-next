"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const STORIES = [
  { id: 1, src: '/img/publicidad_1.jpg' },
  { id: 2, src: '/img/publicidad_2.jpg' },
  { id: 3, src: '/img/publicidad_3.jpg' },
  { id: 4, src: '/img/publicidad_4.jpg' },
  { id: 5, src: '/img/publicidad_5.jpg' },
  { id: 6, src: '/img/publicidad_6.jpg' },
];

const STORY_DURATION = 5000; // 5 segundos por imagen

export default function Shop() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Asegurar fondo negro/oscuro en html y body para eliminar bordes blancos bajo cualquier zoom
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#0b141a';
    document.documentElement.style.backgroundColor = '#0b141a';

    const zl = localStorage.getItem('yape_zoom_level');
    if (zl) {
      document.documentElement.style.setProperty('--app-zoom', zl);
    }

    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, []);

  // Pre-cargar imágenes para evitar parpadeos
  useEffect(() => {
    STORIES.forEach((story) => {
      const img = new Image();
      img.src = story.src;
    });
  }, []);

  // Temporizador y barra de progreso fluida (animación estilo WhatsApp)
  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 40;
    const step = (intervalTime / STORY_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          setCurrentIndex((curr) => (curr + 1) % STORIES.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPaused, currentIndex]);

  const handleNext = useCallback(() => {
    setProgress(0);
    setCurrentIndex((curr) => (curr + 1) % STORIES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setProgress(0);
    setCurrentIndex((curr) => (curr === 0 ? STORIES.length - 1 : curr - 1));
  }, []);

  // Toques táctiles y mantener presionado para pausar
  const touchStartTimeRef = useRef(0);
  const touchStartXRef = useRef(0);

  const handleTouchStart = (e) => {
    touchStartTimeRef.current = Date.now();
    touchStartXRef.current = e.touches ? e.touches[0].clientX : e.clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e) => {
    setIsPaused(false);
    const elapsed = Date.now() - touchStartTimeRef.current;
    const endX = e.changedTouches ? e.changedTouches[0].clientX : (e.clientX || touchStartXRef.current);

    // Si fue un toque corto (menos de 250ms), pasar de historia
    if (elapsed < 250) {
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 400;
      if (endX < screenWidth * 0.35) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  };

  return (
    <div className="status-container">
      {/* FONDO DIFUMINADO AMBIENTAL */}
      <div 
        className="ambient-bg" 
        style={{ backgroundImage: `url(${STORIES[currentIndex].src})` }}
      />

      {/* BARRAS DE PROGRESO SUPERIORES (ESTILO ESTADOS DE WHATSAPP) */}
      <div className="status-progress-bars">
        {STORIES.map((story, i) => {
          let barWidth = '0%';
          if (i < currentIndex) {
            barWidth = '100%';
          } else if (i === currentIndex) {
            barWidth = `${progress}%`;
          }

          return (
            <div key={story.id} className="progress-track">
              <div 
                className="progress-fill" 
                style={{ 
                  width: barWidth,
                  transition: i === currentIndex && progress > 0 ? 'width 0.04s linear' : 'none'
                }} 
              />
            </div>
          );
        })}
      </div>

      {/* CABECERA CON PERFIL Y BOTÓN CERRAR */}
      <div className="status-header">
        <div className="status-user">
          <div className="status-avatar">
            <i className="fa-solid fa-bag-shopping"></i>
          </div>
          <div className="status-info">
            <span className="status-title">Maikols Shop</span>
            <span className="status-subtitle">Estado • Publicidad</span>
          </div>
        </div>

        <button 
          className="status-close-btn" 
          onClick={() => router.push('/opciones')}
          aria-label="Cerrar"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {/* ZONA TÁCTIL INTERACTIVA */}
      <div 
        className="status-touch-area"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
      >
        {/* IMAGEN DE LA HISTORIA */}
        <div className="status-image-wrapper">
          <img 
            key={STORIES[currentIndex].id}
            src={STORIES[currentIndex].src} 
            alt={`Publicidad ${currentIndex + 1}`}
            className="status-image"
          />
        </div>
      </div>

      {/* PIE DE PÁGINA INFORMATIVO Y BOTÓN TELEGRAM */}
      <div className="status-footer">
        <p className="status-footer-text">
          Descubre la variedad de productos que tengo a la venta, contactame para mas info:
        </p>
        <a 
          href={STORIES[currentIndex].src.includes('publicidad_6.jpg') ? "https://t.me/addlist/2LeWY70DlMExNTg5" : "https://t.me/MaikolEsleiter"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="telegram-action-btn"
        >
          <i className="fa-brands fa-telegram"></i>
          <span>{STORIES[currentIndex].src.includes('publicidad_6.jpg') ? "Unirme en Telegram" : "Contactar en Telegram"}</span>
        </a>
      </div>

      <style jsx global>{`
        html, body {
          background-color: #0b141a !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
      `}</style>

      <style jsx>{`
        .status-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          width: calc(100vw / var(--app-zoom, 1));
          height: calc(100dvh / var(--app-zoom, 1));
          min-height: calc(100dvh / var(--app-zoom, 1));
          background-color: #0b141a;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          user-select: none;
          -webkit-user-select: none;
          z-index: 9999;
        }

        .ambient-bg {
          position: absolute;
          top: -25%;
          left: -25%;
          width: 150%;
          height: 150%;
          background-position: center;
          background-size: cover;
          filter: blur(35px) brightness(0.4);
          opacity: 0.6;
          transition: background-image 0.3s ease;
          pointer-events: none;
          z-index: 1;
        }

        .status-progress-bars {
          position: relative;
          z-index: 30;
          display: flex;
          gap: 5px;
          padding: max(12px, env(safe-area-inset-top)) 12px 6px;
        }

        .progress-track {
          flex: 1;
          height: 3px;
          background-color: rgba(255, 255, 255, 0.35);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background-color: #ffffff;
          border-radius: 2px;
        }

        .status-header {
          position: relative;
          z-index: 30;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 14px 10px;
        }

        .status-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .status-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00BFA5 0%, #742385 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-size: 16px;
          border: 2px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .status-info {
          display: flex;
          flex-direction: column;
        }

        .status-title {
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
        }

        .status-subtitle {
          color: rgba(255, 255, 255, 0.75);
          font-size: 11.5px;
          font-weight: 500;
        }

        .status-close-btn {
          background: rgba(0, 0, 0, 0.4);
          border: none;
          color: #ffffff;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          cursor: pointer;
          backdrop-filter: blur(5px);
          transition: background 0.2s;
        }

        .status-close-btn:active {
          background: rgba(255, 255, 255, 0.2);
        }

        .status-touch-area {
          position: relative;
          z-index: 10;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 16px 140px;
          cursor: pointer;
        }

        .status-image-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 14px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          animation: statusFade 0.25s ease-out;
        }

        @keyframes statusFade {
          from {
            opacity: 0.8;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .status-footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 30;
          padding: 18px 20px max(20px, env(safe-area-inset-bottom));
          background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.6) 65%, transparent 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          pointer-events: auto;
        }

        .status-footer-text {
          color: #ffffff;
          font-size: 13.5px;
          font-weight: 600;
          text-align: center;
          line-height: 1.35;
          margin: 0;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
          max-width: 340px;
        }

        .telegram-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          max-width: 320px;
          background: linear-gradient(135deg, #0088cc 0%, #229ED9 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 13px 20px;
          border-radius: 25px;
          font-weight: 700;
          font-size: 15px;
          box-shadow: 0 4px 15px rgba(0, 136, 204, 0.45);
          transition: transform 0.15s, box-shadow 0.15s;
        }

        .telegram-action-btn:active {
          transform: scale(0.97);
        }

        .telegram-action-btn i {
          font-size: 20px;
        }
      `}</style>
    </div>
  );
}
