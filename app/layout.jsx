import Script from 'next/script';
import './globals.css';

export const metadata = {
  title: 'БАЦ — Заказ такси',
  description: 'Локальный сервис заказа такси и доставки',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="bg-slate-900 text-white font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
