export interface Product {
  id: string;
  name: string;
  fabric: string;
  category: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
  description: string;
  details: string[];
  images: string[];
  rating: number;
  reviewCount: number;
}

const colorBlack = { name: "أسود", hex: "#3d3929" };
const colorOlive = { name: "زيتوني", hex: "#6b7c4e" };
const colorCream = { name: "كريمي", hex: "#f5f0e8" };
const colorWhite = { name: "أبيض", hex: "#ffffff" };
const colorRed = { name: "أحمر", hex: "#8b1a1a" };

export const products: Product[] = [
  {
    id: "al-sahra-gold",
    name: "عباية السهرة الذهبية",
    fabric: "جورجيت إيطالي",
    category: "السهرة",
    price: 380,
    originalPrice: 450,
    badge: "الأكثر مبيعاً",
    colors: [colorBlack],
    sizes: ["S", "M", "L", "XL"],
    description: "عباية السهرة الذهبية — قطعة تجمع بين الفخامة المعاصرة والهوية الليبية الأصيلة.",
    details: ["القماش: جورجيت إيطالي ١٠٠٪", "القصة: واسعة، فضفاضة من الأسفل", "التطريز: يدوي بخيوط ذهبية أصلية", "العناية: غسيل جاف فقط"],
    images: [
      "/images/products/abaya-1.jpg",
    ],
    rating: 4.9,
    reviewCount: 47,
  },
  {
    id: "olive-ruffle",
    name: "عباية رuffle الزيتونية",
    fabric: "ساتان حريري",
    category: "السهرة",
    price: 320,
    originalPrice: 400,
    badge: "جديد",
    colors: [colorOlive],
    sizes: ["S", "M", "L", "XL"],
    description: "عباية رuffle الزيتونية — تصميم أنيق بتفاصيل فرnfze حريرية تمنحها طابعاً عصرياً وراقياً.",
    details: ["القماش: ساتان حريري فاخر", "القصة: متوسطة مع تفاصيل ruffle", "اللون: أخضر زيتوني ناعم", "العناية: غسيل يدوي أو جاف"],
    images: [
      "/outfits/olive-ruffle-abaya.jpg",
    ],
    rating: 4.8,
    reviewCount: 23,
  },
  {
    id: "cream-silk",
    name: "العباية الكريمية الحريرية",
    fabric: "حرير طبيعي",
    category: "الرسمية",
    price: 350,
    originalPrice: 420,
    colors: [colorCream],
    sizes: ["S", "M", "L", "XL"],
    description: "العباية الكريمية الحريرية — أناقة مطلقة بلمسة حريرية ناعمة تناسب المناسبات الرسمية والكاجوال على حدٍ سواء.",
    details: ["القماش: حرير طبيعي ١٠٠٪", "القصة: فضفاضة وأنيقة", "اللون: كريمي دافئ", "العناية: غسيل جاف فقط"],
    images: [
      "/outfits/cream-abaya.jpg",
    ],
    rating: 4.7,
    reviewCount: 19,
  },
  {
    id: "white-beach",
    name: "عباية الشاطئ البيضاء",
    fabric: "شيفون حريري",
    category: "الكاجوال",
    price: 280,
    colors: [colorWhite],
    sizes: ["S", "M", "L", "XL"],
    description: "عباية الشاطئ البيضاء — خفيفة وflows naturally، مثالية للصيف والتنزه على الشاطئ.",
    details: ["القماش: شيفون حريري خفيف", "القصة: مفتوحة وflows naturally", "اللون: أبيض صافي", "العناية: غسيل يدوي بارد"],
    images: [
      "/outfits/white-beach-abaya.jpg",
    ],
    rating: 4.6,
    reviewCount: 31,
  },
  {
    id: "red-velvet",
    name: "عباية المخمل الحمراء",
    fabric: "مخمل فاخر",
    category: "السهرة",
    price: 420,
    originalPrice: 500,
    badge: "حصري",
    colors: [colorRed],
    sizes: ["S", "M", "L", "XL"],
    description: "عباية المخمل الحمراء — قطعة استثنائية بقماش مخمل فاخر وبروش أنيق يعكس الفخامة الليبية.",
    details: ["القماش: مخمل فاخر", "القصة: أنيقة مع بروش مزخرف", "اللون: أحمر غامق فاخر", "العناية: غسيل جاف فقط"],
    images: [
      "/outfits/red-velvet-abaya.jpg",
    ],
    rating: 4.9,
    reviewCount: 15,
  },
];

export const findProduct = (id: string) => products.find((p) => p.id === id);

export const collections = [
  { id: "all", name: "الكل" },
  { id: "السهرة", name: "السهرة" },
  { id: "الكاجوال", name: "الكاجوال" },
  { id: "الرسمية", name: "الرسمية" },
  { id: "المطرّزة", name: "المطرّزة" },
];
