import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { isAuthed } from "../lib/api";
import { useOrders } from "../lib/metrics";

export function AdminLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data, refetch, isFetching } = useOrders();
  const orders = data ?? [];

  if (!isAuthed()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  const pending = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="admin-root flex" dir="rtl">
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          onMenu={() => setMenuOpen(true)}
          orders={orders}
          onRefresh={() => refetch()}
          refreshing={isFetching}
        />
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 p-4 sm:p-6 lg:p-8"
        >
          <Outlet />
        </motion.main>
      </div>
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pendingCount={pending}
      />
    </div>
  );
}
