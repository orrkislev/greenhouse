import SideBar from "@/components/SideBar";
import WithAuth from "@/components/WithAuth";
import SwitchBackPanel from "./staff/components/SwitchBackPanel";

export default function RootLayout({ children }) {
  return (
    <WithAuth>
      <div className="flex h-screen overflow-hidden">
        <SideBar />
        <div className="flex-1 overflow-y-auto">
          {children}
          <SwitchBackPanel />
        </div>
      </div>
    </WithAuth>
  );
}
