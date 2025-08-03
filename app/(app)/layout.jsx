import SideBar from "@/components/SideBar";
import WithAuth from "@/components/WithAuth";
import SwitchBackPanel from "./staff/components/SwitchBackPanel";

export default function RootLayout({ children }) {
  return (
    <WithAuth>
      <div className="flex h-screen overflow-y-auto">
        <SideBar />
        <div className="flex-1 z-10">
          {children}
          <SwitchBackPanel />
        </div>
      </div>
    </WithAuth>
  );
}
