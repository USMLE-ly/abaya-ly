import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { isAuthed } from "../lib/api";
import { useOrders } from "../lib/metrics";
import "@/admin/styles/tokens.css";
import { ADMIN_PATH } from "../lib/config";

export function AdminLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data, refetch, isFetching } = useOrders();
  const orders = data ?? [];

  if (!isAuthed()) {
    return <Navigate to="/dashboard-nadine-admin/login" replace state={{ from: location.pathname }} />;
  }

  const pending = orders.filter((o) => o.status === "pending").length;

  return (
    <div
      className="admin-root flex min-h-screen"
      dir="rtl"
      style={{
        background: "var(--nd-bg)",
        fontFamily: "var(--nd-font)",
      }}
    >
      {/* Sidebar on the right */}
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pendingCount={pending}
      />

      {/* Main content on the left */}
      <div className="flex-1 flex flex-col min-w-0 nd-content">
        <Topbar
          onMenu={() => setMenuOpen(true)}
          onRefresh={() => refetch()}
          refreshing={isFetching}
        />

        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto"
          style={{
            background: "var(--nd-bg)",
          }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}

export default AdminLayout;
