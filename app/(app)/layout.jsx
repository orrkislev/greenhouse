import TopBar from "@/components/TopBar";
import WithAuth from "@/components/WithAuth";
import SwitchBackPanel from "./staff/components/SwitchBackPanel";

export default function RootLayout({ children }) {
  return (
    <WithAuth>
      <TopBar />
      {children}
      <SwitchBackPanel />
    </WithAuth>
  );
}
