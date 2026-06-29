export type Product = {
  id: string;
  name: string;
  fabric: string;
  category: "السهرة" | "الكاجوال" | "الرسمية" | "المطرّزة";
  price: number;
  originalPrice?: number;
  badge?: "جديد" | "الأكثر مبيعاً" | "حصري";
  colors: { name: string; hex: string }[];
  description: string;
  details: string[];
  images: string[];
  rating: number;
  reviewCount: number;
};

const colorBlack = { name: "أسود", hex: "#0a0a0a" };
const colorGold = { name: "ذهبي", hex: "#c9a84c" };
const colorIvory = { name: "عاجي", hex: "#f1e9d2" };
const colorBurgundy = { name: "عنابي", hex: "#5b1a1a" };
const colorNavy = { name: "كحلي", hex: "#1a2540" };
const colorBrown = { name: "بني", hex: "#5a3b22" };

export const products: Product[] = [
  {
    id: "al-sahra-gold",
    name: "عباية السهرة الذهبية",
    fabric: "جورجيت إيطالي",
    category: "السهرة",
    price: 380,
    originalPrice: 450,
    badge: "الأكثر مبيعاً",
    colors: [colorBlack, colorGold, colorBurgundy],
    description:
      "عباية السهرة الذهبية — قطعة تجمع بين الفخامة المعاصرة والهوية الليبية الأصيلة. مصنوعة من الجورجيت الإيطالي الفاخر مع تطريز يدوي بخيوط ذهبية على الأكمام والياقة، لتمنحك إطلالة ملكية تليق بكل مناسبة.",
    details: [
      "القماش: جورجيت إيطالي ١٠٠٪",
      "القصة: واسعة، فضفاضة من الأسفل",
      "التطريز: يدوي بخيوط ذهبية أصلية",
      "العناية: غسيل جاف فقط",
    ],
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4b5b3e?w=1200&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=80",
      "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=1200&q=80",
      "https://images.unsplash.com/photo-1551803091-e20673f15770?w=1200&q=80",
    ],
    rating: 4.9,
    reviewCount: 47,
  },
  {
    id: "yasmin-embroidered",
    name: "عباية الياسمين المطرّزة",
    fabric: "حرير طبيعي",
    category: "المطرّزة",
    price: 450,
    badge: "جديد",
    colors: [colorBlack, colorIvory, colorNavy],
    description:
      "كل تطريزة في عباية الياسمين تحكي حكاية — حرير طبيعي ناعم كنسمة الفجر، وزخارف مستوحاة من تراث ليبيا العريق. خياطة دقيقة بأيدي حرفيات ليبيات.",
    details: [
      "القماش: حرير طبيعي ١٠٠٪",
      "القصة: ربع بشت مع أكمام واسعة",
      "التطريز: زخارف ليبية تقليدية",
      "العناية: غسيل جاف فقط",
    ],
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=80",
      "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=1200&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4b5b3e?w=1200&q=80",
      "https://images.unsplash.com/photo-1551803091-e20673f15770?w=1200&q=80",
    ],
    rating: 5.0,
    reviewCount: 32,
  },
  {
    id: "fajr-casual",
    name: "عباية الفجر الكاجوال",
    fabric: "كريب مزدوج",
    category: "الكاجوال",
    price: 220,
    colors: [colorBlack, colorBrown, colorNavy],
    description:
      "للأيام التي تحبين فيها الراحة دون أن تتنازلي عن أناقتك — عباية الفجر بقماش الكريب المزدوج الخفيف، قصة عملية وأنيقة في آن واحد.",
    details: [
      "القماش: كريب مزدوج",
      "القصة: كلوش بسيطة",
      "العناية: غسيل عادي بماء بارد",
    ],
    images: [
      "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=1200&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4b5b3e?w=1200&q=80",
      "https://images.unsplash.com/photo-1551803091-e20673f15770?w=1200&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=80",
    ],
    rating: 4.8,
    reviewCount: 89,
  },
  {
    id: "malika-formal",
    name: "عباية الملكة الرسمية",
    fabric: "قماش ملكي",
    category: "الرسمية",
    price: 550,
    badge: "حصري",
    colors: [colorBlack, colorBurgundy, colorNavy],
    description:
      "للمناسبات التي تستحق إطلالة استثنائية — عباية الملكة بقماش ملكي ثقيل وتفاصيل مدروسة، صُنعت لتكوني محط الأنظار في كل مكان تذهبين إليه.",
    details: [
      "القماش: قماش ملكي ثقيل",
      "القصة: ربع بشت رسمية",
      "التطريز: تفاصيل ذهبية على الأطراف",
    ],
    images: [
      "https://images.unsplash.com/photo-1551803091-e20673f15770?w=1200&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4b5b3e?w=1200&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=80",
      "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=1200&q=80",
    ],
    rating: 5.0,
    reviewCount: 21,
  },
  {
    id: "najmat-sahra",
    name: "عباية نجمة الصحراء",
    fabric: "شيفون فاخر",
    category: "السهرة",
    price: 320,
    colors: [colorBlack, colorGold, colorIvory],
    description:
      "خفيفة كالنسيم، فخمة كالليالي العربية — شيفون فاخر متعدد الطبقات يمنحك حركة انسيابية مع كل خطوة.",
    details: [
      "القماش: شيفون فاخر متعدد الطبقات",
      "القصة: واسعة مع أكمام منفوشة",
    ],
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4b5b3e?w=1200&q=80",
      "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=1200&q=80",
      "https://images.unsplash.com/photo-1551803091-e20673f15770?w=1200&q=80",
    ],
    rating: 4.7,
    reviewCount: 54,
  },
  {
    id: "badr-classic",
    name: "عباية البدر الكلاسيكية",
    fabric: "ستان فاخر",
    category: "الكاجوال",
    price: 290,
    colors: [colorBlack, colorNavy, colorBurgundy],
    description:
      "للذوق الذي لا يتأثر بالموضة — تصميم كلاسيكي خالد بقماش الستان الفاخر اللامع بهدوء.",
    details: [
      "القماش: ستان فاخر",
      "القصة: مستقيمة كلاسيكية",
    ],
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4b5b3e?w=1200&q=80",
      "https://images.unsplash.com/photo-1551803091-e20673f15770?w=1200&q=80",
      "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=1200&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=80",
    ],
    rating: 4.9,
    reviewCount: 67,
  },
];

export const findProduct = (id: string) => products.find((p) => p.id === id);
