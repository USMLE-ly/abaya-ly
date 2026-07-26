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

export default function App() {
  return (
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
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

