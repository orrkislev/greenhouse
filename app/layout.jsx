import { Noto_Sans_Hebrew } from "next/font/google";
import "./globals.css";

const notoSansHebrew = Noto_Sans_Hebrew({
  subsets: ["hebrew"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-sans-hebrew",
});

export const metadata = {
  title: "Weekly Schedule Manager",
  description: "Organize your week, achieve your goals",
};

export default function RootLayout({ children }) {

  return (
    <html lang="he" className={notoSansHebrew.variable}>
      <body className={`${notoSansHebrew.className} antialiased rtl min-h-screen pb-32 overflow-hidden`} 
      style={{
        backgroundImage: "radial-gradient(circle at bottom left, #eee 0%, white 70%)",
      }}
      >
        {children}
      </body>
    </html>
  );
}
