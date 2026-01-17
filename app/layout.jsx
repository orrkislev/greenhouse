import { Libertinus_Serif, Noto_Sans_Hebrew } from "next/font/google";
import "./globals.css";

const notoSansHebrew = Noto_Sans_Hebrew({
  subsets: ["hebrew"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-sans-hebrew",
});
const libertinusSerif = Libertinus_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libertinus-serif",
});

export const metadata = {
  title: "תיכון החממה - האפליקציה",
  description: "חברה מקיימת מרחב התפתחותי!"
};

export default function RootLayout({ children }) {

  return (
    <html lang="he" className={`${notoSansHebrew.variable} ${libertinusSerif.variable}`}>
      <body className={`${notoSansHebrew.className} ${libertinusSerif.variable} antialiased rtl min-h-screen bg-stone-50 w-screen h-screen overflow-hidden relative`} >
        {children}
      </body>
    </html>
  );
}
