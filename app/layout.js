import "./globals.css";
import SecurityGuard from './SecurityGuard';
import Script from 'next/script';

export const metadata = {
  title: "Yapton",
  description: "Billetera digital",
  manifest: "/manifest.json",
  icons: {
    icon: "/img/favicon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js" strategy="beforeInteractive" />
        
        <Script id="ios-mode-script" strategy="beforeInteractive" dangerouslySetInnerHTML={{
          __html: `
            if (localStorage.getItem('yape_ios_spinner') === 'true') {
              document.documentElement.classList.add('ios-mode');
            }
            const zl = localStorage.getItem('yape_zoom_level');
            if (zl) {
              document.documentElement.style.setProperty('--app-zoom', zl);
              document.documentElement.style.zoom = zl;
            }
            const aw = localStorage.getItem('yape_amount_weight');
            if (aw) {
              document.documentElement.style.setProperty('--amount-weight', aw);
            }
          `
        }} />
        <Script id="zoom-block" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('touchstart', function(event) {
              if (event.touches.length > 1) {
                event.preventDefault();
              }
            }, { passive: false });
            let lastTouchEnd = 0;
            document.addEventListener('touchend', function(event) {
              const now = (new Date()).getTime();
              if (now - lastTouchEnd <= 300) {
                event.preventDefault();
              }
              lastTouchEnd = now;
            }, { passive: false });
            document.addEventListener('keydown', function(event) {
              if (event.ctrlKey && (event.key === '=' || event.key === '-' || event.key === '0')) {
                event.preventDefault();
              }
            }, { passive: false });
            document.addEventListener('wheel', function(event) {
              if (event.ctrlKey) {
                event.preventDefault();
              }
            }, { passive: false });
            document.addEventListener('touchmove', function(event) {
              if (event.touches && event.touches.length > 1) {
                event.preventDefault();
              }
            }, { passive: false });
          `
        }} />
        <Script id="sw-register" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function(err) {
                  console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
          `
        }} />
      </head>
      <body suppressHydrationWarning>
        <SecurityGuard>
          {children}
        </SecurityGuard>
      </body>
    </html>
  );
}
