'use client'

import SideBar from "@/components/SideBar";
import WithAuth from "@/components/WithAuth";
import SwitchBackPanel from "./staff/components/SwitchBackPanel";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  return (
    <WithAuth>
      <div className="flex h-screen overflow-y-hidden overscroll-none">
        <SideBar />
        <div className="flex-1 flex justify-between">
          {children}
          <SwitchBackPanel />
        </div>
      </div>
    </WithAuth>
  );
}
