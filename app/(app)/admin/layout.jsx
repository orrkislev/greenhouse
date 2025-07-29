import TopBar from "@/components/TopBar";
import WithAuth from "@/components/WithAuth";
import SwitchBackPanel from "../staff/components/SwitchBackPanel";

export default function AdminLayout({ children }) {
  return (
    <WithAuth role="admin">
      <TopBar />
      {children}
      <SwitchBackPanel />
    </WithAuth>
  );
}
