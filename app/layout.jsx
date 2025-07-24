import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/TopBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Weekly Schedule Manager",
  description: "Organize your week, achieve your goals",
};

export default function RootLayout({ children }) {
  

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased 
          rtl bg-linear-to-br from-white via-stone-100/50 to-stone-300/50 min-h-screen
      `} >
        <TopBar />
            {children}
      </body>
    </html>
  );
}
