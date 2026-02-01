import { Noto_Sans_Hebrew } from "next/font/google";
import "./globals.css";

const notoSansHebrew = Noto_Sans_Hebrew({
  subsets: ["hebrew"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-sans-hebrew",
});

export const metadata = {
  title: "תיכון החממה - האפליקציה",
  description: "חברה מקיימת מרחב התפתחותי!"
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" className={notoSansHebrew.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=David+Libre:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${notoSansHebrew.className} antialiased rtl min-h-screen bg-stone-50 w-screen h-screen overflow-hidden relative`}>
        {children}
      </body>
    </html>
  );
}
