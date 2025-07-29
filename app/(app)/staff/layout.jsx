import TopBar from "@/components/TopBar";
import WithAuth from "@/components/WithAuth";
import SwitchBackPanel from "./components/SwitchBackPanel";

export default function StaffLayout({ children }) {
  return (
    <WithAuth role="staff">
      <TopBar />
      {children}
      <SwitchBackPanel />
    </WithAuth>
  );
}
