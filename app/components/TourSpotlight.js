"use client";

import React, { useEffect, useState, useRef } from 'react';

export function getAppZoom() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 1;
  const inlineZoom = parseFloat(document.documentElement.style.zoom);
  if (!isNaN(inlineZoom) && inlineZoom > 0) return inlineZoom;

  try {
    const computedZoom = parseFloat(getComputedStyle(document.documentElement).zoom);
    if (!isNaN(computedZoom) && computedZoom > 0) return computedZoom;
  } catch(e) {}

  try {
    const cssVar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-zoom'));
    if (!isNaN(cssVar) && cssVar > 0) return cssVar;
  } catch(e) {}

  try {
    const local = parseFloat(localStorage.getItem('yape_zoom_level') || '1');
    if (!isNaN(local) && local > 0) return local;
  } catch(e) {}

  return 1;
}

export function typeWriter(text, onUpdate, onDone, speed = 95) {
  let i = 0;
  onUpdate('');
  const interval = setInterval(() => {
    i++;
    onUpdate(text.slice(0, i));
    if (i >= text.length) {
      clearInterval(interval);
      if (onDone) onDone();
    }
  }, speed);
  return () => clearInterval(interval);
}

export default function TourSpotlight({
  targetId,
  title,
  description,
  stepText,
  isFinal = false,
  onNext,
  onSkip
}) {
  const [rect, setRect] = useState(null);
  const [placement, setPlacement] = useState('bottom');
  const [zoom, setZoom] = useState(1);
  const [cardHeight, setCardHeight] = useState(195);
  const [caretLeft, setCaretLeft] = useState('50%');
  const cardRef = useRef(null);

  const updateCardMetrics = () => {
    if (cardRef.current) {
      const h = cardRef.current.offsetHeight;
      if (h > 50 && h !== cardHeight) {
        setCardHeight(h);
      }
      if (rect) {
        const z = getAppZoom();
        const targetCenterX = rect.left + rect.width / 2;
        const cardW = cardRef.current.offsetWidth || 320;
        const cardLeftScreen = cardRef.current.getBoundingClientRect().left;
        const relativeScreenX = targetCenterX - cardLeftScreen;
        const relativeCardCssX = relativeScreenX / z;
        const clampedCaret = Math.max(20, Math.min(cardW - 20, relativeCardCssX));
        setCaretLeft(`${clampedCaret}px`);
      }
    }
  };

  useEffect(() => {
    updateCardMetrics();
  }, [title, description, stepText, placement, rect]);

  useEffect(() => {
    let frameId;
    let cancelled = false;

    if (!targetId) {
      setRect(null);
      setPlacement('center');
      return;
    }

    const el = document.getElementById(targetId);
    if (!el) {
      setRect(null);
      setPlacement('center');
      return;
    }

    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    } catch(e) {}

    const measure = () => {
      if (cancelled) return false;
      const currentEl = document.getElementById(targetId);
      if (!currentEl) return false;
      const r = currentEl.getBoundingClientRect();

      if (r.width === 0 || r.height === 0) {
        return false;
      }

      const z = getAppZoom();
      setZoom(z);
      setRect(r);

      const cardH = cardRef.current?.offsetHeight || cardHeight || 195;
      const spaceAbove = (r.top - 6) / z;
      const spaceBelow = (window.innerHeight - (r.bottom + 6)) / z;

      if (spaceAbove >= cardH + 20) {
        setPlacement('top');
      } else if (spaceBelow >= cardH + 20) {
        setPlacement('bottom');
      } else if (spaceAbove > spaceBelow) {
        setPlacement('top');
      } else {
        setPlacement('bottom');
      }

      // Posición horizontal de la flechita apuntando al centro del elemento
      const targetCenterX = r.left + r.width / 2;
      const cardEl = cardRef.current;
      const cardW = cardEl ? cardEl.offsetWidth : 320;
      const cardLeftScreen = cardEl ? cardEl.getBoundingClientRect().left : ((window.innerWidth - (cardW * z)) / 2);
      const relativeScreenX = targetCenterX - cardLeftScreen;
      const relativeCardCssX = relativeScreenX / z;
      const clampedCaret = Math.max(20, Math.min(cardW - 20, relativeCardCssX));
      setCaretLeft(`${clampedCaret}px`);
      return true;
    };

    // Tracking suave continuo por 750ms para acompañar animaciones y modales deslizantes
    const startTime = performance.now();
    const trackAnimation = () => {
      measure();
      if (performance.now() - startTime < 750 && !cancelled) {
        frameId = requestAnimationFrame(trackAnimation);
      }
    };
    frameId = requestAnimationFrame(trackAnimation);

    const handleResize = () => measure();
    const handleScroll = () => measure();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      cancelled = true;
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [targetId]);

  const pad = 6;
  const z = zoom > 0 ? zoom : 1;
  const boxStyle = rect ? {
    top: `${Math.max(0, (rect.top - pad) / z)}px`,
    left: `${Math.max(0, (rect.left - pad) / z)}px`,
    width: `${(rect.width + pad * 2) / z}px`,
    height: `${(rect.height + pad * 2) / z}px`,
    borderRadius: '14px'
  } : null;

  let cardStyle = {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 36px)',
    maxWidth: '330px',
    zIndex: 999999,
  };

  const viewportHeight = typeof window !== 'undefined' ? (window.innerHeight / z) : 700;
  const actualCardH = cardRef.current?.offsetHeight || cardHeight || 195;

  if (placement === 'center' || !rect) {
    cardStyle.top = '50%';
    cardStyle.transform = 'translate(-50%, -50%)';
  } else if (placement === 'top') {
    const boxTop = (rect.top - pad) / z;
    const computedTop = boxTop - actualCardH - 14;
    cardStyle.top = `${Math.max(12, computedTop)}px`;
  } else {
    const boxBottom = (rect.bottom + pad) / z;
    const computedTop = boxBottom + 14;
    cardStyle.top = `${Math.min(viewportHeight - actualCardH - 14, computedTop)}px`;
  }

  return (
    <>
      {/* Overlay que captura clics fuera del foco */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: rect ? 'transparent' : 'rgba(0, 0, 0, 0.72)',
          zIndex: 999990,
          pointerEvents: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Recorte iluminado Spotlight con box-shadow masivo y corrección de zoom */}
      {rect && (
        <div
          style={{
            position: 'fixed',
            ...boxStyle,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.72)',
            zIndex: 999995,
            pointerEvents: 'none',
            transition: 'all 0.15s ease-out',
            border: '2px solid rgba(255, 255, 255, 0.45)'
          }}
        />
      )}

      {/* Zona cliqueable transparente exactamente sobre el elemento iluminado */}
      {rect && targetId && (
        <div
          style={{
            position: 'fixed',
            ...boxStyle,
            zIndex: 999996,
            cursor: 'pointer',
            backgroundColor: 'transparent',
            pointerEvents: 'auto'
          }}
          onClick={(e) => {
            e.stopPropagation();
            const el = document.getElementById(targetId);
            if (el) el.click();
          }}
        />
      )}

      {/* Tarjeta Flotante Tooltip con flechita */}
      <div
        ref={cardRef}
        style={{
          ...cardStyle,
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '22px 20px 18px 20px',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
          boxSizing: 'border-box',
          animation: 'tourCardPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Caret / Flechita apuntando arriba */}
        {placement === 'bottom' && rect && (
          <div
            style={{
              position: 'absolute',
              top: '-10px',
              left: caretLeft,
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderBottom: '10px solid #ffffff',
              transition: 'left 0.15s ease-out'
            }}
          />
        )}
        {/* Caret / Flechita apuntando abajo */}
        {placement === 'top' && rect && (
          <div
            style={{
              position: 'absolute',
              bottom: '-10px',
              left: caretLeft,
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '10px solid #ffffff',
              transition: 'left 0.15s ease-out'
            }}
          />
        )}

        <div style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a1a', marginBottom: '8px' }}>
          {title}
        </div>

        <div style={{ fontSize: '13.5px', color: '#444444', lineHeight: '1.45', marginBottom: '20px', fontWeight: '500' }}>
          {description}
        </div>

        <div style={{ display: 'flex', justifyContent: isFinal ? 'center' : 'space-between', alignItems: 'center', width: '100%' }}>
          {!isFinal && (
            <button
              onClick={onSkip}
              style={{
                background: 'none',
                border: 'none',
                color: '#742385',
                fontSize: '14.5px',
                fontWeight: '700',
                cursor: 'pointer',
                padding: '6px 4px'
              }}
            >
              Omitir
            </button>
          )}

          <button
            onClick={onNext}
            style={{
              backgroundColor: '#742385',
              color: '#ffffff',
              border: 'none',
              borderRadius: '24px',
              padding: isFinal ? '12px 32px' : '9px 20px',
              fontSize: isFinal ? '15px' : '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(116, 35, 133, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {stepText}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes tourCardPop {
          0% { opacity: 0; transform: translate(-50%, -5px) scale(0.96); }
          100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
      `}</style>
    </>
  );
}
