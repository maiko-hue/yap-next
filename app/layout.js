import "./globals.css";

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
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
