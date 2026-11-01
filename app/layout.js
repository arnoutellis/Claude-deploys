import './globals.css';

export const metadata = {
  title: 'Ruthie Quotes',
  description: 'Quote builder for Travels with Ruthie',
  robots: { index: false, follow: false },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#e4eef8',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
