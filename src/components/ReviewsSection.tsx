import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, Loader2, CheckCircle2, User, ImagePlus, X, BadgeCheck, Upload } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  name: string;
  comment: string;
  image?: string;
  verified?: boolean;
  createdAt: string;
}

interface Props {
  productId: string;
  baseRating: number;
  baseCount: number;
}

const fmtDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("ar-LY", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
};

// Client-side image compression: downscale + JPEG encode → data URL (~≤800px, cap ~400KB)
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const maxDim = 800;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error("تعذّرت معالجة الصورة")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("تعذّرت قراءة الصورة")); };
    img.src = url;
  });
}

export function ReviewsSection({ productId, baseRating, baseCount }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [photo, setPhoto] = useState("");
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`)
      .then((r) => r.json())
      .then((data) => { if (mounted) setReviews(data.reviews || []); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.trim().length < 3) {
      setError("يرجى كتابة تعليق (3 أحرف على الأقل)");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          name: name.trim() || "عميلة نادين",
          comment: comment.trim(),
          image: photo || imageUrl.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الإرسال");
      setReviews((prev) => [data.review, ...prev]);
      setComment("");
      setName("");
      setImageUrl("");
      setPhoto("");
      setRating(5);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err: any) {
      setError(err.message || "حدث خطأ، يرجى المحاولة لاحقاً");
    } finally {
      setSubmitting(false);
    }
  };

  // Combined rating display
  const totalCount = baseCount + reviews.length;
  const avgRating = reviews.length > 0
    ? ((baseRating * baseCount) + reviews.reduce((s, r) => s + r.rating, 0)) / totalCount
    : baseRating;

  return (
    <section className="py-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare size={18} className="text-accent-brand" />
          <h2 className="text-lg md:text-xl font-bold text-fg">تقييمات العملاء</h2>
          <div className="flex items-center gap-1 ms-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} className={i < Math.round(avgRating) ? "fill-warning text-warning" : "text-fg-quaternary"} />
            ))}
            <span className="text-xs text-fg-tertiary ms-1">({totalCount})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reviews list */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-fg-tertiary py-8">
                <Loader2 size={16} className="animate-spin" /> جاري تحميل التقييمات...
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-10 rounded-2xl glass-subtle">
                <MessageSquare size={28} className="mx-auto text-fg-quaternary mb-3" />
                <p className="text-sm text-fg-tertiary">لا توجد تقييمات بعد — كوني أول من يقيّم هذا الفستان!</p>
              </div>
            ) : (
              reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(196,40,85,0.1)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(196,40,85,0.1)" }}>
                      <User size={14} className="text-accent-brand" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-fg">{review.name}</p>
                        {review.verified && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-status-success">
                            <BadgeCheck size={11} /> شراء موثّق
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-fg-tertiary">{fmtDate(review.createdAt)}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} size={11} className={s < review.rating ? "fill-warning text-warning" : "text-fg-quaternary"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-fg-secondary leading-relaxed">{review.comment}</p>
                  {review.image && (
                    <a
                      href={review.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-3 group"
                    >
                      <img
                        src={review.image}
                        alt={`صورة من ${review.name}`}
                        loading="lazy"
                        className="w-full max-h-64 object-cover rounded-xl transition-all duration-300 group-hover:scale-[1.01] group-hover:shadow-md"
                        style={{ border: "1px solid rgba(196,40,85,0.12)" }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    </a>
                  )}
                </motion.div>
              ))
            )}
          </div>

          {/* Review form */}
          <div className="p-5 rounded-2xl h-fit"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(196,40,85,0.12)" }}
          >
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle2 size={36} className="mx-auto text-status-success mb-3" />
                <p className="text-sm font-bold text-fg mb-1">شكراً لتقييمك! 🎉</p>
                <p className="text-xs text-fg-tertiary">تم نشر تقييمك بنجاح</p>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-bold text-fg mb-4">أضيفي تقييمك</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Star rating */}
                  <div>
                    <p className="text-[11px] font-semibold text-fg-tertiary mb-2">تقييمك</p>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const idx = i + 1;
                        const active = idx <= (hoverRating || rating);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setRating(idx)}
                            onMouseEnter={() => setHoverRating(idx)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star size={22} className={active ? "fill-warning text-warning" : "text-fg-quaternary"} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <p className="text-[11px] font-semibold text-fg-tertiary mb-1">الاسم (اختياري)</p>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="اسمك (اختياري)"
                      className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-colors glass-input"
                      style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(196,40,85,0.12)" }}
                    />
                  </div>

                  {/* Comment */}
                  <div>
                    <p className="text-[11px] font-semibold text-fg-tertiary mb-1">تعليقك <span className="text-status-danger">*</span></p>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      placeholder="ما رأيك في هذا الفستان؟"
                      className="w-full px-4 py-2.5 text-sm rounded-xl outline-none resize-none transition-colors glass-input"
                      style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(196,40,85,0.12)" }}
                    />
                  </div>

                  {/* Photo: upload from device (compressed) or URL */}
                  <div>
                    <p className="text-[11px] font-semibold text-fg-tertiary mb-2">صورة الفستان عندك (اختياري)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        if (!file.type.startsWith("image/")) {
                          setPhotoError("يرجى اختيار ملف صورة (JPG أو PNG)");
                          return;
                        }
                        if (file.size > 10 * 1024 * 1024) {
                          setPhotoError("الصورة كبيرة جداً — الحد الأقصى 10MB");
                          return;
                        }
                        setPhotoError("");
                        try {
                          setPhoto(await compressImage(file));
                          setImageUrl("");
                        } catch (err: any) {
                          setPhotoError(err.message || "تعذّر رفع الصورة");
                        }
                      }}
                    />
                    {!photo && !imageUrl.trim() ? (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.01]"
                        style={{ background: "rgba(196,40,85,0.06)", border: "1px dashed rgba(196,40,85,0.3)", color: "#c42855" }}
                      >
                        <Upload size={14} />
                        ارفعي صورة من جهازك
                      </button>
                    ) : (
                      <div className="relative w-fit">
                        <img
                          src={photo || imageUrl.trim()}
                          alt="معاينة الصورة"
                          className="w-24 h-24 object-cover rounded-xl"
                          style={{ border: "1px solid rgba(196,40,85,0.12)" }}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.25"; }}
                        />
                        <button
                          type="button"
                          onClick={() => { setPhoto(""); setImageUrl(""); }}
                          className="absolute -top-2 -end-2 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                          style={{ border: "1px solid rgba(196,40,85,0.2)" }}
                          aria-label="إزالة الصورة"
                        >
                          <X size={12} className="text-status-danger" />
                        </button>
                      </div>
                    )}
                    {photoError && <p className="text-[10px] text-status-danger mt-1.5">{photoError}</p>}
                    <div className="relative mt-3">
                      <ImagePlus size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-fg-quaternary" />
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => { setImageUrl(e.target.value); if (e.target.value) setPhoto(""); }}
                        placeholder="أو ألصقي رابط صورة https://…"
                        dir="ltr"
                        className="w-full ps-9 pe-4 py-2.5 text-sm rounded-xl outline-none transition-colors glass-input"
                        style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(196,40,85,0.12)" }}
                      />
                    </div>
                  </div>

                  {error && <p className="text-xs text-status-danger">{error}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)" }}
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : "نشر التقييم"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
