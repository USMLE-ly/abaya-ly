import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Home } from "@/pages/Home";
import { Product } from "@/pages/Product";
import { Collections } from "@/pages/Collections";
import { Cart } from "@/pages/Cart";
import { FAQ } from "@/pages/FAQ";
import { Contact } from "@/pages/Contact";
import { TrackOrder } from "@/pages/TrackOrder";
import { About } from "@/pages/About";
import ShippingPolicy from "@/pages/ShippingPolicy";
import RefundPolicy from "@/pages/RefundPolicy";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import DesignSystem from "@/pages/DesignSystem";
import { NotFound } from "@/pages/NotFound";
import { lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const AdminLogin = lazy(() => import("@/admin/pages/Login"));
const AdminLayout = lazy(() => import("@/admin/layout/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("@/admin/pages/Dashboard"));
const AdminOrders = lazy(() => import("@/admin/pages/Orders"));
const AdminOrderDetail = lazy(() => import("@/admin/pages/OrderDetail"));
import { WhatsAppButton } from "@/components/WhatsAppButton";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
      <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: "1 1 auto", width: "100%" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/about" element={<About />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/design-system" element={<DesignSystem />} />
                      <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
            </Route>
          <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
            <WhatsAppButton />
      </BrowserRouter>
    </QueryClientProvider>
  );
}





