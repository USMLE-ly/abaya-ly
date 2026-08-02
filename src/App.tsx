import { lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { initAnalytics, trackPageView, startScrollDepthTracking } from "@/lib/analytics";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Home } from "@/pages/Home";
import { Product } from "@/pages/Product";
import { NotFound } from "@/pages/NotFound";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CartDrawer } from "@/components/CartDrawer";
import { CookieConsent } from "@/components/CookieConsent";
import { ADMIN_PATH } from "@/admin/lib/config";

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

// Admin dashboard lives at a non-obvious path; the login page protects it.
// /admin and /admin/* redirect here (server-side too) so the panel is reachable.

// Redirect any /admin alias to the real dashboard path.
function AdminAliasRedirect() {
  const loc = useLocation();
  const rest = loc.pathname.replace(/^\/admin/, "");
  return <Navigate to={`/${ADMIN_PATH}${rest}${loc.search}`} replace />;
}

const queryClient = new QueryClient();

/** Fires internal page_view on every SPA route change + scroll-depth tracking. */
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
    return startScrollDepthTracking();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname, location.search]);

  return null;
}

export default function App() {
  const isAdmin = typeof window !== "undefined" && window.location.pathname.includes(ADMIN_PATH);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
      <AnalyticsTracker />
      <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {!isAdmin && <AnnouncementBar />}
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

            {/* /admin aliases redirect to the real dashboard path */}
            <Route path="/admin" element={<AdminAliasRedirect />} />
            <Route path="/admin/*" element={<AdminAliasRedirect />} />

            {/* Secret admin dashboard route (path set via VITE_ADMIN_PATH env var) */}
            <Route path={`/${ADMIN_PATH}/login`} element={<AdminLogin />} />
            <Route path={`/${ADMIN_PATH}`} element={<AdminDashboard />} />
            <Route path={`/${ADMIN_PATH}/orders`} element={<AdminLayout />}>
              <Route index element={<AdminOrders />} />
              <Route path=":id" element={<AdminOrderDetail />} />
            </Route>
            <Route path={`/${ADMIN_PATH}/products`} element={<AdminLayout />}>
              <Route index element={<AdminProducts />} />
            </Route>
            <Route path={`/${ADMIN_PATH}/reviews`} element={<AdminLayout />}>
              <Route index element={<AdminReviews />} />
            </Route>
            <Route path={`/${ADMIN_PATH}/analytics`} element={<AdminLayout />}>
              <Route index element={<AdminAnalytics />} />
            </Route>
            <Route path={`/${ADMIN_PATH}/settings`} element={<AdminLayout />}>
              <Route index element={<AdminSettings />} />
            </Route>
            <Route path={`/${ADMIN_PATH}/calendar`} element={<AdminLayout />}>
              <Route index element={<AdminCalendar />} />
            </Route>

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
            <WhatsAppButton />
            <ScrollToTop />
            <CartDrawer />
            <CookieConsent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
