'use client'

// import WithAuth from "@/components/WithAuth";

export default function RootLayout({ children }) {
  return (
    <div className="flex h-screen overflow-y-hidden overscroll-none">
      {children}
    </div>
  );
}
