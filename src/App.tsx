import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Home } from "@/pages/Home";
import { Product } from "@/pages/Product";
const Collections = lazy(() => import("@/pages/Collections").then(m => ({ default: m.Collections })));
const Cart = lazy(() => import("@/pages/Cart").then(m => ({ default: m.Cart })));
const FAQ = lazy(() => import("@/pages/FAQ").then(m => ({ default: m.FAQ })));
const Contact = lazy(() => import("@/pages/Contact").then(m => ({ default: m.Contact })));
const TrackOrder = lazy(() => import("@/pages/TrackOrder").then(m => ({ default: m.TrackOrder })));
const About = lazy(() => import("@/pages/About").then(m => ({ default: m.About })));
const ShippingPolicy = lazy(() => import("@/pages/ShippingPolicy"));
const RefundPolicy = lazy(() => import("@/pages/RefundPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const DesignSystem = lazy(() => import("@/pages/DesignSystem"));
const Wishlist = lazy(() => import("@/pages/Wishlist").then(m => ({ default: m.Wishlist })));
import { NotFound } from "@/pages/NotFound";
import { lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const AdminLogin = lazy(() => import("@/admin/pages/Login"));
const AdminLayout = lazy(() => import("@/admin/layout/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("@/admin/pages/Dashboard"));
const AdminOrders = lazy(() => import("@/admin/pages/Orders"));
const AdminOrderDetail = lazy(() => import("@/admin/pages/OrderDetail"));
const AdminProducts = lazy(() => import("@/admin/pages/Products"));
const AdminReviews = lazy(() => import("@/admin/pages/Reviews"));
const AdminAnalytics = lazy(() => import("@/admin/pages/Analytics"));
const AdminSettings = lazy(() => import("@/admin/pages/Settings"));
const AdminCalendar = lazy(() => import("@/admin/pages/Calendar"));
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CookieConsent } from "@/components/CookieConsent";

// Admin dashboard is hidden behind a secret path for security.
// The public /admin route returns 404 to prevent discovery.
// Change this value and redeploy to move the dashboard.
import { ADMIN_PATH } from "@/admin/lib/config";

// Decoy admin page that looks like a 404
function AdminDecoy() {
  return <NotFound />;
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
      <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: "1 1 auto", width: "100%" }}>
          <Routes>
            {/* Public routes */}
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
            <Route path="/wishlist" element={<Wishlist />} />

            {/* Decoy: /admin returns 404 to hide dashboard location */}
            <Route path="/admin" element={<AdminDecoy />} />
            <Route path="/admin/*" element={<AdminDecoy />} />

            {/* Secret admin dashboard route (path set via VITE_ADMIN_PATH env var) */}
            <Route path={`/${ADMIN_PATH}/login`} element={<AdminLogin />} />
            <Route path={`/${ADMIN_PATH}`} element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="calendar" element={<AdminCalendar />} />
            </Route>

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
            <WhatsAppButton />
            <CookieConsent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
