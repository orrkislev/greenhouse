import WithAuth from "@/components/WithAuth";

export default function StaffLayout({ children }) {
  return (
    <WithAuth role="staff">
      {children}
    </WithAuth>
  );
}
