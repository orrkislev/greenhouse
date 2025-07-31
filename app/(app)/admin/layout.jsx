import WithAuth from "@/components/WithAuth";

export default function AdminLayout({ children }) {
  return (
    <WithAuth role="admin">
      {children}
    </WithAuth>
  );
}
