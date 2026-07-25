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
];

export const findProduct = (id: string) => products.find((p) => p.id === id);

export const collections = [
  { id: "all", name: "الكل" },
  { id: "السهرة", name: "السهرة" },
  { id: "الكاجوال", name: "الكاجوال" },
  { id: "الرسمية", name: "الرسمية" },
  { id: "المطرّزة", name: "المطرّزة" },
];
