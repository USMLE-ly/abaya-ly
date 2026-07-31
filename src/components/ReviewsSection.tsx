import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, Loader2, CheckCircle2, User } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  name: string;
  comment: string;
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

export function ReviewsSection({ productId, baseRating, baseCount }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
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
        body: JSON.stringify({ productId, rating, name: name.trim() || "عميلة نادين", comment: comment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الإرسال");
      setReviews((prev) => [data.review, ...prev]);
      setComment("");
      setName("");
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
          <div className="flex items-center gap-1 mr-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} className={i < Math.round(avgRating) ? "fill-warning text-warning" : "text-fg-quaternary"} />
            ))}
            <span className="text-xs text-fg-tertiary mr-1">({totalCount})</span>
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
                      <p className="text-xs font-bold text-fg">{review.name}</p>
                      <p className="text-[10px] text-fg-tertiary">{fmtDate(review.createdAt)}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} size={11} className={s < review.rating ? "fill-warning text-warning" : "text-fg-quaternary"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-fg-secondary leading-relaxed">{review.comment}</p>
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
