import { MessageCircle } from "lucide-react";

const PHONE = "+218944003708"; // ← ضعي رقم الواتساب هنا
const MESSAGE = "مرحباً! أود الاستفسار عن فستان من متجر نادين ♡";

export function WhatsAppButton() {
  const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
      style={{ backgroundColor: "#25D366" }}
      aria-label="تواصل معنا عبر واتساب"
    >
      <MessageCircle size={28} className="text-white" />
    </a>
  );
}
