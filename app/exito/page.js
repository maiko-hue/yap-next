"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import '../exito.css';
import html2canvas from 'html2canvas';

function ExitoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loadingAds, setLoadingAds] = useState(true);
  const [adImage, setAdImage] = useState("");
  const [showBurst, setShowBurst] = useState(false);
  const [burstFrame, setBurstFrame] = useState(0);
  const burstFrames = useRef([]);

  const [isPhotoReady, setIsPhotoReady] = useState(false);

  const monto = searchParams.get('monto') || "0";
  const montoFormateado = parseFloat(monto) % 1 === 0 ? parseInt(monto) : parseFloat(monto).toFixed(2);
  const nombreRaw = decodeURIComponent(searchParams.get('nombre') || "Maikol Esleiter");
  const numeroParam = searchParams.get('numero') || "999999999"; 
  const destinoParam = decodeURIComponent(searchParams.get('destino') || "Yape");
  const esQrParam = searchParams.get('es_qr') === "true"; 
  const mostrarCelularParam = searchParams.get('mostrar_celular'); 
  const recienYapeado = searchParams.get('recien_yapeado') === "true";

  const mensaje = decodeURIComponent(searchParams.get('mensaje') || "");
  const operacionParam = searchParams.get('operacion');
  const codigoParam = searchParams.get('codigo'); 
  const fechaParam = searchParams.get('fecha');
  const horaParam = searchParams.get('hora');
  const tipoParam = searchParams.get('tipo');
  const animacionParam = searchParams.get('animacion') !== 'false';

  const valorNumericoMonto = parseFloat(monto);
  let topBannerSrc = "/img/10.jpg";
  if (valorNumericoMonto >= 0.10 && valorNumericoMonto <= 19.99) topBannerSrc = "/img/10.jpg";
  else if (valorNumericoMonto >= 20.00 && valorNumericoMonto <= 49.99) topBannerSrc = "/img/20.jpg";
  else if (valorNumericoMonto >= 50.00 && valorNumericoMonto <= 99.99) topBannerSrc = "/img/50.jpg";
  else if (valorNumericoMonto >= 100.00 && valorNumericoMonto <= 199.99) topBannerSrc = "/img/50.jpg";
  else if (valorNumericoMonto >= 200.00 && valorNumericoMonto <= 500.00) topBannerSrc = "/img/200.jpg";

  const showNumberRow = !(esQrParam || mostrarCelularParam === "false");
  const showSecuritySection = (destinoParam === "Yape");
  const mainTitle = tipoParam === 'ingreso' ? "¡Te yapearon!" : "¡Yapeaste!";
  const destinoLabel = tipoParam === 'ingreso' ? "Origen" : "Destino";

  const finalOpNum = operacionParam || Math.floor(1000000 + Math.random() * 90000000).toString();
  const securityDigits = (codigoParam || finalOpNum.slice(-3)).split('');

  let dateText = fechaParam;
  let timeText = horaParam;
  if (!dateText || !timeText) {
    const now = new Date();
    dateText = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    timeText = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase().replace('pm', 'p. m.').replace('am', 'a. m.');
    if (!dateText.endsWith('.') && dateText.includes(' ')) { 
      const parts = dateText.split(' '); 
      if(parts.length >= 2 && !parts[1].includes('.')) parts[1] += '.'; 
      dateText = parts.join(' '); 
    }
  }

  const [nombreMostrado, setNombreMostrado] = useState(nombreRaw);

  useEffect(() => {
    let isCensoredBaucher = localStorage.getItem('yape_censurar_baucher') === 'true';
    let isCensoredQr = localStorage.getItem('yape_censurar_nombres_qr') === 'true';
    
    let shouldCensor = esQrParam ? isCensoredQr : isCensoredBaucher;

    if (shouldCensor) {
      const partesNombre = nombreRaw.trim().split(/\s+/);
      if (partesNombre.length === 2) {
        setNombreMostrado(`${partesNombre[0]} ${partesNombre[1].substring(0, 3)}*`);
      } else if (partesNombre.length >= 3) {
        setNombreMostrado(`${partesNombre[0]} ${partesNombre[2].substring(0, 3)}*`);
      }
    } else {
      setNombreMostrado(nombreRaw);
    }
  }, [nombreRaw, esQrParam]);

  useEffect(() => {
    // Carga de Ads
    const ads = [
      'u3d0lfltdyebjxhsma8s.webp', 'ugv4arfcb4mmsk8t600y.webp', 'xyj9w83jmmimoiqipld7.webp',
      'lntvtu6siosxnkxwyazk.webp', 'dfxexhqz0ljgixgrc71s.webp', 'hgdybgbebofngmi3q8dr.webp',
      'cnjvw02u0kiizr7cmdze.webp', 'z9xriezpfzkwylyqfpdt.webp', 'zhx1nztq3y8bocojgtol.webp',
      'hbi3k6wkz09e5sggstxp.webp', 'oy0kuhvapnkwtazyyozh.webp', 'nrewunfzaog5j43g4ned.webp',
      'n2htnzpfyn7wlwixuchk.webp', 'ygfgjoyhfhxkdbqtrsvk.jpg'
    ];
    setAdImage('/img/' + ads[Math.floor(Math.random() * ads.length)]);
    setTimeout(() => setLoadingAds(false), 2000);

    // Animación Confeti
      if (animacionParam) {
        const frameNames = [
          'download.png', 'download1.png', 'download2.png', 'download3.png', 'download4.png',
          'download5.png', 'download6.png', 'download7.png', 'download8.png', 'download9.png',
          'download10.png', 'download11.png', 'download13.png', 'download14.png' 
        ];
        let loaded = 0;
        const frames = [];
        frameNames.forEach((name, i) => {
          const img = new Image();
          img.onload = () => {
            loaded++;
            if (loaded === frameNames.length) playSeq(frames);
          };
          img.onerror = () => {
            loaded++;
            if (loaded === frameNames.length) playSeq(frames);
          };
          img.src = '/img/' + name;
          frames[i] = img.src;
        });

        const playSeq = (loadedFrames) => {
          burstFrames.current = loadedFrames;
          setShowBurst(true);
          let curr = 0;
          const interval = setInterval(() => {
            if (curr >= loadedFrames.length) {
              clearInterval(interval);
              setShowBurst(false);
              return;
            }
            setBurstFrame(curr);
            curr++;
          }, 80);
        };
      }
    }, []);

  const handleCompartir = () => {
    setIsPhotoReady(true);
    
    // Almacenamos el zoom original y lo quitamos temporalmente para la captura
    const htmlEl = document.documentElement;
    const originalZoom = htmlEl.style.zoom;
    htmlEl.style.zoom = '1';

    setTimeout(() => {
      const container = document.querySelector('.exito-container') || document.body;
      html2canvas(container, { 
        backgroundColor: '#742284', 
        scale: 2,
        windowWidth: container.scrollWidth,
        windowHeight: container.scrollHeight
      }).then(canvas => {
        // Restaurar el zoom original
        if (originalZoom) htmlEl.style.zoom = originalZoom;

        canvas.toBlob(blob => {
          let nameFile = nombreMostrado.replace(/[^a-zA-Z0-9]/g, "_");
          const file = new File([blob], `Yape_${nameFile}.png`, { type: 'image/png' });
          
          if (navigator.share) {
            navigator.share({
              title: `Yapeo Exitoso a ${nameFile}`,
              files: [file]
            }).then(() => setIsPhotoReady(false)).catch(() => setIsPhotoReady(false));
          } else {
            const link = document.createElement('a');
            link.download = `Yape_${nameFile}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            setIsPhotoReady(false);
          }
        });
      }).catch(() => {
        // Restaurar en caso de error
        if (originalZoom) htmlEl.style.zoom = originalZoom;
        setIsPhotoReady(false);
      });
    }, 150);
  };

  const handleNuevoYapeo = (e) => {
    e.preventDefault();
    const url = `/monto?numero=${numeroParam}&nombre=${encodeURIComponent(nombreRaw)}&destino=${encodeURIComponent(destinoParam)}&es_qr=${esQrParam}&mostrar_celular=${mostrarCelularParam}`;
    router.push(url);
  };

  return (
    <div className="exito-body">
      <div className="exito-container">
        <div className="exito-banner-wrapper">
          <img src={topBannerSrc} alt="Banner Temático" className="exito-top-bg-banner" />

          <div className="exito-header">
            {!isPhotoReady ? (
                animacionParam ? (
                  <img src="/img/animationyape.gif" alt="Yape" className="exito-logo-header-img" />
                ) : (
                  <img src="/img/logo_yape_header.png" alt="Yape" className="exito-logo-header-img exito-logo-history" />
                )
              ) : (
              <img src="/img/LogoYape.svg" alt="Yape" className="exito-logo-header-img" />
            )}
            
            <a onClick={() => router.push('/inicio')} className="exito-close-btn" style={{ visibility: isPhotoReady ? 'hidden' : 'visible' }}>
              <i className="fa-solid fa-xmark"></i>
            </a>
          </div>
        </div>
        {showBurst && (
          <div className="exito-burst-container">
            <img src={burstFrames.current[burstFrame]} alt="Confeti" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div className="exito-success-card">
          <div className="exito-card-header">
            <div className="exito-yapeaste-title">{mainTitle}</div>
            <button className="exito-share-btn" onClick={handleCompartir} style={{ visibility: isPhotoReady ? 'hidden' : 'visible' }}>
              <img src="/img/compartiricon.png" alt="Share" className="exito-icon-share" /> 
              Compartir
            </button>
          </div>

          <div className="exito-amount-section">
            <span className="exito-currency">S/</span>
            <span className="exito-amount-value">{montoFormateado}</span>
          </div>

          <div className="exito-recipient-name">{nombreMostrado}</div>
          
          <div className="exito-date-time">
            <img src="/img/fecha-icon.svg" alt="Fecha" className="exito-icon-datetime" />
            <span>{dateText}</span>
            <span className="exito-separator">|</span>
            <img src="/img/hora-icon.svg" alt="Hora" className="exito-icon-datetime" />
            <span>{timeText}</span>
          </div>

          {mensaje && mensaje.trim() !== "" && mensaje !== "undefined" && mensaje !== "null" && mensaje !== "Auto" && (
            <div className="exito-message-bubble">
              <img src="/img/mensaje-icon1.png" alt="Mensaje" className="exito-msg-icon-img" />
              <span className="exito-msg-text">{mensaje}</span>
            </div>
          )}

          {showSecuritySection && (
            <div>
              <div className="exito-full-divider"></div>
              <div className="exito-code-row">
                <div className="exito-code-title">
                  CÓDIGO DE SEGURIDAD 
                  <img src="/img/codigo-seguridad-icon.svg" alt="Info" className="exito-icon-info" />
                </div>
                <div className="exito-code-boxes">
                  {securityDigits.map((d, i) => <div key={i} className="exito-code-box">{d}</div>)}
                </div>
              </div>
            </div>
          )}

          <div className="exito-full-divider"></div>

          <div className="exito-code-title-section">DATOS DE LA TRANSACCIÓN</div>
          <div className="exito-details-grid">
            {showNumberRow && (
              <>
                <span className="exito-label">Nro. de celular</span>
                <span className="exito-value">*** *** {numeroParam.slice(-3)}</span>
              </>
            )}
            
            <span className="exito-label">{destinoLabel}</span>
            <span className="exito-value">{destinoParam}</span>
            
            <span className="exito-label">Nro. de operación</span>
            <span className="exito-value">{finalOpNum}</span>
          </div>
        </div>

        {!recienYapeado && !isPhotoReady && (
          <div className="exito-action-buttons">
            <a href="#" onClick={handleNuevoYapeo} className="exito-btn-new-yape">
              <i className="fa-regular fa-paper-plane"></i> Nuevo Yapeo
            </a>
            <div className="exito-help-link">
              <i className="fa-solid fa-headset"></i> Necesito ayuda
            </div>
          </div>
        )}

        {!isPhotoReady && (
          <div className="exito-bottom-section">
            <div className="exito-banner-container">
              <div className="exito-banner-header">
                <span className="exito-banner-title">Más en Yape</span>
                <span className="exito-banner-badge">Nuevo</span>
              </div>
              {loadingAds ? (
                <div className="exito-skeleton-loader"></div>
              ) : (
                <img src={adImage} alt="Promo" style={{width: '100%', height: 'auto', display: 'block', borderRadius: '10px'}} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExitoPage() {
  return (
    <Suspense fallback={<div style={{height:'calc(100dvh / var(--app-zoom, 1))', background:'#742284'}}></div>}>
      <ExitoContent />
    </Suspense>
  );
}
