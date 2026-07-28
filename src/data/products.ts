// ══════════════════════════════════════════════════════════════════
// Product catalog — luxury naming architecture
// (Louis Vuitton / Hermès / Dior style: Collection • Model • Descriptor • Edition)
// ══════════════════════════════════════════════════════════════════

export interface Product {
  id: string;
  name: string;                 // full hierarchy: «Collection • Model • Arabic descriptor • Edition»
  collection: string;           // e.g. "Noir Atelier"
  model: string;                // e.g. "Aurelia"
  edition: string;              // e.g. "إصدار 2026"
  subtitle: string;             // refined luxury one-liner
  seoName: string;              // clean searchable Arabic title
  slug: string;                 // Arabic URL slug
  tags: string[];               // 15–25 tags
  fabric: string;
  category: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  colors: { name: string; hex: string; linkTo?: string }[];
  sizes: string[];
  description: string;          // 80–150 word editorial copy
  details: string[];
  images: string[];
  highlights: string[];         // visible-only characteristics
  rating: number;
  reviewCount: number;
}

const EDITION = "إصدار 2026";

// ── Collections (color-anchored, brand-language driven) ────────────
export const brandCollections = [
  { id: "noir-atelier",  name: "Noir Atelier",  arabic: "أتيليه نوار", palette: "أسود • فحمي • فضي", mood: "بساطة معمارية ومساء عصري" },
  { id: "lumiere",       name: "Lumière",       arabic: "لومير",       palette: "عاجي • لؤلؤي • شمبانيا", mood: "أنوثة ناعمة وهدوء ضوئي" },
  { id: "rouge-heritage",name: "Rouge Héritage",arabic: "روج إيريتاج", palette: "نبيذي • ياقوتي • عنابي", mood: "بريق مسائي كلاسيكي" },
  { id: "azure",         name: "Azure",         arabic: "أزور",        palette: "سماوي • كحلي • فضي أزرق", mood: "أناقة متوسطية" },
  { id: "botanique",     name: "Botanique",     arabic: "بوتانيك",     palette: "وردي • برعمي • زيتي فاتح", mood: "رقة نباتية معاصرة" },
  { id: "maison-dor",    name: "Maison d'Or",   arabic: "ميزون دور",   palette: "ذهبي • برونزي • كاكاو", mood: "دفء ذهبي حِرفي" },
];

// ── Compact base data (unchanged: ids, prices, images, colors, sizes, ratings) ──
type BaseFields = Pick<Product,
  "id" | "fabric" | "category" | "price" | "originalPrice" | "badge" |
  "colors" | "sizes" | "images" | "rating" | "reviewCount"
>;

const base: BaseFields[] = [
  { id: "al-sahra-gold", fabric: "ساتان فاخر", category: "السهرة", price: 380, originalPrice: 450, badge: "الأكثر مبيعاً",
    colors: [{name:"أبيض",hex:"#FFFFFF"},{name:"أسود",hex:"#111827",linkTo:"mesh-geometric"}],
    sizes: ["S","M","L","XL"], images: ["/images/products/abaya-1.jpg","/images/products/abaya-1-thumb.jpg"], rating: 4.9, reviewCount: 47 },
  { id: "olive-ruffle", fabric: "ساتان فاخر", category: "السهرة", price: 320, originalPrice: 400, badge: "جديد",
    colors: [{name:"أسود",hex:"#000000"},{name:"ذهبي",hex:"#FFD700",linkTo:"cream-silk"},{name:"أزرق سماوي",hex:"#a9d1e7",linkTo:"red-velvet"},{name:"وردي",hex:"#FFC0CB",linkTo:"white-lace"},{name:"كريمي",hex:"#f5f0e8",linkTo:"floral-sleeve"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/olive-ruffle-abaya.jpg","/outfits/olive-ruffle-abaya-thumb.jpg"], rating: 4.8, reviewCount: 23 },
  { id: "cream-silk", fabric: "حرير طبيعي", category: "الرسمية", price: 350, originalPrice: 420,
    colors: [{name:"ذهبي",hex:"#FFD700"},{name:"أسود",hex:"#000000",linkTo:"olive-ruffle"},{name:"أزرق سماوي",hex:"#a9d1e7",linkTo:"red-velvet"},{name:"وردي",hex:"#FFC0CB",linkTo:"white-lace"},{name:"كريمي",hex:"#f5f0e8",linkTo:"floral-sleeve"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/cream-abaya.jpg","/outfits/cream-abaya-thumb.jpg"], rating: 4.7, reviewCount: 19 },
  { id: "white-beach", fabric: "شيفون فاخر", category: "الكاجوال", price: 280,
    colors: [{name:"نبيذي",hex:"#682849"},{name:"كحلي غامق",hex:"#121f3b",linkTo:"black-lace"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/white-beach-abaya.jpg","/outfits/white-beach-abaya-thumb.jpg"], rating: 4.6, reviewCount: 31 },
  { id: "red-velvet", fabric: "ساتان فاخر", category: "السهرة", price: 420, originalPrice: 500, badge: "حصري",
    colors: [{name:"أزرق سماوي",hex:"#a9d1e7"},{name:"أسود",hex:"#000000",linkTo:"olive-ruffle"},{name:"ذهبي",hex:"#FFD700",linkTo:"cream-silk"},{name:"وردي",hex:"#FFC0CB",linkTo:"white-lace"},{name:"كريمي",hex:"#f5f0e8",linkTo:"floral-sleeve"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/red-velvet-abaya.jpg","/outfits/red-velvet-abaya-thumb.jpg"], rating: 4.9, reviewCount: 56 },
  { id: "black-lace", fabric: "ساتان مطرّز", category: "السهرة", price: 390, originalPrice: 470,
    colors: [{name:"كحلي غامق",hex:"#121f3b"},{name:"نبيذي",hex:"#682849",linkTo:"white-beach"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/black-lace-abaya.jpg","/outfits/black-lace-abaya-thumb.jpg"], rating: 4.8, reviewCount: 34 },
  { id: "night-velvet", fabric: "ساتان فاخر", category: "السهرة", price: 360, originalPrice: 430, badge: "مميز",
    colors: [{name:"أبيض",hex:"#FFFFFF"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/night-velvet-abaya.jpg","/outfits/night-velvet-abaya-thumb.jpg"], rating: 4.8, reviewCount: 42 },
  { id: "white-lace", fabric: "ساتان مطري", category: "الرسمية", price: 310, originalPrice: 380,
    colors: [{name:"وردي",hex:"#FFC0CB"},{name:"أسود",hex:"#000000",linkTo:"olive-ruffle"},{name:"ذهبي",hex:"#FFD700",linkTo:"cream-silk"},{name:"أزرق سماوي",hex:"#a9d1e7",linkTo:"red-velvet"},{name:"كريمي",hex:"#f5f0e8",linkTo:"floral-sleeve"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/white-lace-abaya.jpg","/outfits/white-lace-abaya-thumb.jpg"], rating: 4.7, reviewCount: 28 },
  { id: "floral-sleeve", fabric: "ساتان كلاسيكي", category: "الرسمية", price: 330, originalPrice: 400,
    colors: [{name:"كريمي",hex:"#f5f0e8"},{name:"أسود",hex:"#000000",linkTo:"olive-ruffle"},{name:"ذهبي",hex:"#FFD700",linkTo:"cream-silk"},{name:"أزرق سماوي",hex:"#a9d1e7",linkTo:"red-velvet"},{name:"وردي",hex:"#FFC0CB",linkTo:"white-lace"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/floral-sleeve-abaya.jpg","/outfits/floral-sleeve-abaya-thumb.jpg"], rating: 4.8, reviewCount: 35 },
  { id: "gold-embroidered-1", fabric: "ساتان مع تطريز يدوي", category: "المطرّزة", price: 520, originalPrice: 620, badge: "حصري",
    colors: [{name:"ذهبي عتيق",hex:"#8B7355"},{name:"أزرق فضي",hex:"#7E96B1",linkTo:"geo-gold-1"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/gold-embroidered-abaya-1.jpg","/outfits/gold-embroidered-abaya-1-thumb.jpg"], rating: 4.9, reviewCount: 62 },
  { id: "gold-embroidered-3", fabric: "ساتان فاخر", category: "المطرّزة", price: 520, originalPrice: 620,
    colors: [{name:"نبيذي غامق",hex:"#4A0020"},{name:"شوكولاتي داكن",hex:"#4A3C31",linkTo:"gold-embroidered-4"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/gold-embroidered-abaya-2.jpg","/outfits/gold-embroidered-abaya-2-thumb.jpg"], rating: 4.9, reviewCount: 62 },
  { id: "gold-embroidered-4", fabric: "ساتان فاخر", category: "المطرّزة", price: 520, originalPrice: 620,
    colors: [{name:"شوكولاتي داكن",hex:"#4A3C31"},{name:"نبيذي غامق",hex:"#4A0020",linkTo:"gold-embroidered-3"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/gold-embroidered-abaya-3.jpg","/outfits/gold-embroidered-abaya-3-thumb.jpg"], rating: 4.9, reviewCount: 62 },
  { id: "gold-embroidered-2", fabric: "ساتان فاخر", category: "المطرّزة", price: 520, originalPrice: 620,
    colors: [{name:"أبيض عاجي",hex:"#FFFFF0"},{name:"أسود داكن",hex:"#111316",linkTo:"gold-embroidered-5"},{name:"نبيذي غامق",hex:"#6B2737",linkTo:"gold-embroidered-6"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/gold-embroidered-abaya-4.jpg","/outfits/gold-embroidered-abaya-4-thumb.jpg"], rating: 4.9, reviewCount: 58 },
  { id: "gold-embroidered-5", fabric: "ساتان فاخر", category: "المطرّزة", price: 520, originalPrice: 620,
    colors: [{name:"أسود داكن",hex:"#111316"},{name:"أبيض عاجي",hex:"#FFFFF0",linkTo:"gold-embroidered-2"},{name:"نبيذي غامق",hex:"#6B2737",linkTo:"gold-embroidered-6"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/gold-embroidered-abaya-5.jpg","/outfits/gold-embroidered-abaya-5-thumb.jpg"], rating: 4.9, reviewCount: 58 },
  { id: "gold-embroidered-6", fabric: "ساتان فاخر", category: "المطرّزة", price: 520, originalPrice: 620,
    colors: [{name:"نبيذي غامق",hex:"#6B2737"},{name:"أبيض عاجي",hex:"#FFFFF0",linkTo:"gold-embroidered-2"},{name:"أسود داكن",hex:"#111316",linkTo:"gold-embroidered-5"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/gold-embroidered-abaya-6.jpg","/outfits/gold-embroidered-abaya-6-thumb.jpg"], rating: 4.9, reviewCount: 58 },
  { id: "geo-gold-1", fabric: "ساتان لامع", category: "السهرة", price: 480, originalPrice: 560, badge: "الأكثر طلباً",
    colors: [{name:"أزرق فضي",hex:"#7E96B1"},{name:"ذهبي عتيق",hex:"#8B7355",linkTo:"gold-embroidered-1"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/geometric-gold-abaya-1.jpg","/outfits/geometric-gold-abaya-1-thumb.jpg"], rating: 4.9, reviewCount: 45 },
  { id: "geo-gold-2", fabric: "ساتان مخملي", category: "الكاجوال", price: 340, originalPrice: 410,
    colors: [{name:"كريمي",hex:"#F5F5DC"},{name:"أسود",hex:"#000000",linkTo:"geo-gold-3"},{name:"أخضر فاتح",hex:"#E6F78D",linkTo:"geo-gold-6"},{name:"وردي فاتح",hex:"#f4c4d4",linkTo:"geo-gold-7"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/geometric-gold-abaya-2.jpg","/outfits/geometric-gold-abaya-2-thumb.jpg"], rating: 4.7, reviewCount: 31 },
  { id: "geo-gold-3", fabric: "قطن فاخر", category: "الكاجوال", price: 300, originalPrice: 370,
    colors: [{name:"أسود",hex:"#000000"},{name:"كريمي",hex:"#F5F5DC",linkTo:"geo-gold-2"},{name:"أخضر فاتح",hex:"#E6F78D",linkTo:"geo-gold-6"},{name:"وردي فاتح",hex:"#f4c4d4",linkTo:"geo-gold-7"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/geometric-gold-abaya-3.jpg","/outfits/geometric-gold-abaya-3-thumb.jpg"], rating: 4.6, reviewCount: 22 },
  { id: "geo-gold-6", fabric: "ساتان ناعم", category: "الكاجوال", price: 320, originalPrice: 390,
    colors: [{name:"أخضر فاتح",hex:"#E6F78D"},{name:"كريمي",hex:"#F5F5DC",linkTo:"geo-gold-2"},{name:"أسود",hex:"#000000",linkTo:"geo-gold-3"},{name:"وردي فاتح",hex:"#f4c4d4",linkTo:"geo-gold-7"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/geometric-gold-abaya-6.jpg","/outfits/geometric-gold-abaya-6-thumb.jpg"], rating: 4.7, reviewCount: 26 },
  { id: "geo-gold-7", fabric: "ساتان مخملي", category: "الكاجوال", price: 340, originalPrice: 410,
    colors: [{name:"وردي فاتح",hex:"#f4c4d4"},{name:"كريمي",hex:"#F5F5DC",linkTo:"geo-gold-2"},{name:"أسود",hex:"#000000",linkTo:"geo-gold-3"},{name:"أخضر فاتح",hex:"#E6F78D",linkTo:"geo-gold-6"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/geometric-gold-abaya-7.jpg","/outfits/geometric-gold-abaya-7-thumb.jpg"], rating: 4.8, reviewCount: 33 },
  { id: "mesh-geometric", fabric: "ساتان مطري", category: "المطرّزة", price: 350, originalPrice: 420,
    colors: [{name:"أسود",hex:"#111827"},{name:"أبيض",hex:"#FFFFFF",linkTo:"al-sahra-gold"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/mesh-geometric-abaya.jpg","/outfits/mesh-geometric-abaya-thumb.jpg"], rating: 4.8, reviewCount: 39 },
  { id: "navy-tie-neck", fabric: "شيفون فاخر", category: "الكاجوال", price: 310, originalPrice: 380, badge: "جديد",
    colors: [{name:"أبيض",hex:"#FFFFFF"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/navy-tie-neck-abaya.jpg","/outfits/navy-tie-neck-abaya-thumb.jpg"], rating: 4.7, reviewCount: 12 },
  { id: "white-polka-dot", fabric: "شيفون فاخر", category: "الكاجوال", price: 290, originalPrice: 360, badge: "جديد",
    colors: [{name:"عنابي",hex:"#722F37"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/white-polka-dot-abaya.jpg","/outfits/white-polka-dot-abaya-thumb.jpg"], rating: 4.8, reviewCount: 15 },
  { id: "olive-elegant", fabric: "شيفون فاخر", category: "الكاجوال", price: 300, originalPrice: 370, badge: "جديد",
    colors: [{name:"أخضر زيتوني",hex:"#556B2F"},{name:"أسود",hex:"#000000",linkTo:"olive-ruffle"},{name:"كريمي",hex:"#f5f0e8",linkTo:"floral-sleeve"}],
    sizes: ["S","M","L","XL"], images: ["/outfits/olive-elegant-abaya.jpg"], rating: 4.7, reviewCount: 18 },
  { id: "midnight-rose", fabric: "ساتان مخملي", category: "السهرة", price: 420, originalPrice: 500, badge: "جديد",
    colors: [{name:"عنابي",hex:"#722F37"}], sizes: ["S","M","L","XL"], images: ["/outfits/midnight-rose-abaya.jpg"], rating: 4.9, reviewCount: 0 },
  { id: "pearl-dream", fabric: "شيفون حريري", category: "الرسمية", price: 370, originalPrice: 440,
    colors: [{name:"كريمي",hex:"#f5f0e8"}], sizes: ["S","M","L","XL"], images: ["/outfits/pearl-dream-abaya.jpg"], rating: 4.8, reviewCount: 0 },
  { id: "desert-gold", fabric: "كريب فاخر", category: "المطرّزة", price: 550, originalPrice: 650, badge: "حصري",
    colors: [{name:"ذهبي عتيق",hex:"#8B7355"}], sizes: ["S","M","L","XL"], images: ["/outfits/desert-gold-abaya.jpg"], rating: 4.9, reviewCount: 0 },
  { id: "moonlight-silver", fabric: "شيفون ساتان", category: "الكاجوال", price: 280,
    colors: [{name:"فضي",hex:"#C0C0C0"}], sizes: ["S","M","L","XL"], images: ["/outfits/moonlight-silver-abaya.jpg"], rating: 4.7, reviewCount: 0 },
  { id: "silk-cloud", fabric: "حرير طبيعي 100%", category: "السهرة", price: 480, originalPrice: 560, badge: "جديد",
    colors: [{name:"أزرق سماوي",hex:"#87CEEB"}], sizes: ["S","M","L","XL"], images: ["/outfits/silk-cloud-abaya.jpg"], rating: 4.8, reviewCount: 0 },
  { id: "velvet-burgundy", fabric: "مخمل فاخر", category: "السهرة", price: 460, originalPrice: 540, badge: "جديد",
    colors: [{name:"عنابي غامق",hex:"#4A0020"}], sizes: ["S","M","L","XL"], images: ["/outfits/velvet-burgundy-abaya.jpg"], rating: 4.9, reviewCount: 0 },
  { id: "ocean-breeze", fabric: "شيفون خفيف", category: "الكاجوال", price: 260,
    colors: [{name:"أزرق محيطي",hex:"#1E90FF"}], sizes: ["S","M","L","XL"], images: ["/outfits/ocean-breeze-abaya.jpg"], rating: 4.6, reviewCount: 0 },
  { id: "ivory-grace", fabric: "ساتان كريب", category: "الرسمية", price: 390, originalPrice: 460,
    colors: [{name:"عاجي",hex:"#FFFFF0"}], sizes: ["S","M","L","XL"], images: ["/outfits/ivory-grace-abaya.jpg"], rating: 4.8, reviewCount: 0 },
  { id: "cherry-blossom", fabric: "شيفون مزدوج", category: "المطرّزة", price: 510, originalPrice: 600, badge: "حصري",
    colors: [{name:"وردي فاتح",hex:"#FFB7C5"}], sizes: ["S","M","L","XL"], images: ["/outfits/cherry-blossom-abaya.jpg"], rating: 4.9, reviewCount: 0 },
  { id: "obsidian-mist", fabric: "كريب مطري", category: "الكاجوال", price: 310, originalPrice: 380,
    colors: [{name:"أسود فحمي",hex:"#1C1C1C"}], sizes: ["S","M","L","XL"], images: ["/outfits/obsidian-mist-abaya.jpg"], rating: 4.7, reviewCount: 0 },
];

// ── Luxury metadata (per product, image-anchored) ──────────────────
type Meta = {
  collection: string; model: string;
  descriptor: string;   // Arabic descriptor: type + silhouette + color
  subtitle: string;
  description: string;
  highlights: string[];
  details: string[];
  seoName: string;
  slug: string;
  tags: string[];
};

const meta: Record<string, Meta> = {
  "al-sahra-gold": {
    collection: "Lumière", model: "Céleste",
    descriptor: "فستان سهرة أبيض بنقاط سوداء كلاسيكية بطول ميدي",
    subtitle: "أناقة كلاسيكية بخطوط نظيفة ولمسة أنثوية معاصرة.",
    description: "قطعة كلاسيكية من مجموعة Lumière تجسّد الأناقة الخالدة بأسلوب معاصر. قصّة ميدي محدّدة الخصر ترسم القوام بلطف، وأكمام قصيرة نظيفة الحواف تمنح إطلالة أنثوية متوازنة. تنساب نقشة النقاط السوداء على خلفية بيضاء بإيقاع دقيق يضفي على الفستان حضوراً هادئاً وثقة تليق بالمناسبات الراقية. تنفيذ من ساتان فاخر يمنح ملمساً ناعماً وحركة رشيقة. تصميم متعدّد الاستخدامات ينتقل بسهولة من ظهيرة أنيقة إلى مساء رسمي، ويظل خياراً مضموناً كلما رغبتِ في إطلالة أنيقة بلا مبالغة.",
    highlights: [
      "قصّة ميدي محدّدة الخصر تبرز القوام بأناقة.",
      "أكمام قصيرة نظيفة الحواف ترسم خطاً نسائياً معاصراً.",
      "نقشة النقاط السوداء الكلاسيكية على خلفية بيضاء لإطلالة خالدة.",
    ],
    details: ["الطول: ميدي","القصة: محدّدة الخصر بأكمام قصيرة","النقشة: نقاط سوداء على خلفية بيضاء","الخامة: ساتان فاخر","العناية: غسيل جاف فقط"],
    seoName: "فستان سهرة أبيض بنقاط سوداء — مجموعة Lumière",
    slug: "lumiere-celeste-فستان-أبيض-منقط",
    tags: ["سهرة","أبيض","نقاط-سوداء","ميدي","أكمام-قصيرة","محدد-الخصر","كلاسيكي","نسائي","مناسبات","ربيع-صيف","Lumière","Céleste","ساتان","إطلالة-خالدة","أنيق","راقي","حفلات","خروجات-راقية","نهاري","مسائي"],
  },
  "olive-ruffle": {
    collection: "Noir Atelier", model: "Aurelia",
    descriptor: "فستان سهرة أسود منقّط بحزام مزخرف بطول ميدي",
    subtitle: "خطوط سوداء نقيّة وحضور مسائي واثق.",
    description: "من مجموعة Noir Atelier، يجسّد Aurelia بساطة معمارية بلمسة ليلية. الفستان بلون أسود صافٍ يعلوه إيقاع منقّط بلون فاتح يمنح النسيج عمقاً بصرياً هادئاً. حزام مزخرف يشدّ الخصر بلطف ويرسم صورة أنثوية متناسقة، بينما تنساب أكمام قصيرة نظيفة تكمل خط الكتف. الطول ميدي مريح للحركة وأنيق للحضور. ساتان فاخر يعكس الضوء بذكاء ويمنح ملمساً ناعماً. قطعة تُبنى عليها إطلالة كاملة، وتنتقل بسهولة من عشاء رسمي إلى مساء اجتماعي راقٍ.",
    highlights: [
      "خلفية سوداء صافية مع إيقاع منقّط أنيق.",
      "حزام مزخرف يحدّد الخصر بلطف ويوازن القوام.",
      "قصّة ميدي بأكمام قصيرة نظيفة الحواف.",
    ],
    details: ["الطول: ميدي","القصة: محدّدة الخصر بحزام مزخرف","النقشة: نقاط على خلفية سوداء","الخامة: ساتان فاخر","العناية: غسيل جاف أو يدوي"],
    seoName: "فستان سهرة أسود منقّط بحزام — مجموعة Noir Atelier",
    slug: "noir-atelier-aurelia-فستان-أسود-منقط",
    tags: ["سهرة","أسود","منقّط","ميدي","حزام","محدد-الخصر","كلاسيكي","نسائي","مناسبات","Noir-Atelier","Aurelia","ساتان","حفلات","مساء","راقي","أنيق","إطلالة-ليلية","خروجات","خالد","نهاري"],
  },
  "cream-silk": {
    collection: "Maison d'Or", model: "Odile",
    descriptor: "فستان رسمي ذهبي منقّط بأكمام ناعمة بطول ميدي",
    subtitle: "ذهب دافئ ينساب بأنوثة عصرية.",
    description: "قطعة من مجموعة Maison d'Or، حيث الذهب حالة لونية لا زخرفة. Odile فستان رسمي بلون ذهبي دافئ يتخلّله إيقاع منقّط بلون فاتح يمنحه حركة بصرية لطيفة. أكمام ناعمة تنساب مع كل حركة، وقصة محدّدة الخصر ترسم قواماً أنثوياً متوازناً. الطول ميدي مريح وأنيق. حرير طبيعي يمنح ملمساً فاخراً ولمعاناً هادئاً يعكس الضوء بذكاء. خيار مثالي للمناسبات الرسمية والاحتفاليات النهارية التي تتطلّب أناقة مضيئة دون صخب.",
    highlights: [
      "لون ذهبي دافئ يعكس الضوء بلطف.",
      "أكمام ناعمة تنساب مع الحركة.",
      "قصّة ميدي محدّدة الخصر تمنح توازناً أنثوياً.",
    ],
    details: ["الطول: ميدي","القصة: انسيابية بأكمام ناعمة","النقشة: نقاط فاتحة على خلفية ذهبية","الخامة: حرير طبيعي","العناية: غسيل جاف فقط"],
    seoName: "فستان رسمي ذهبي منقّط — مجموعة Maison d'Or",
    slug: "maison-dor-odile-فستان-ذهبي-منقط",
    tags: ["رسمي","ذهبي","منقّط","ميدي","حرير","أكمام-ناعمة","محدد-الخصر","نسائي","مناسبات","Maison-dOr","Odile","نهاري","احتفالي","أنيق","راقي","خالد","دافئ","إطلالة-مضيئة","ربيع","صيف"],
  },
  "white-beach": {
    collection: "Rouge Héritage", model: "Ophélie",
    descriptor: "فستان كاجوال نبيذي بياقة V وأكمام منسابة بطول ميدي",
    subtitle: "نبيذ عميق بلمسة أنوثة نهاريّة.",
    description: "من مجموعة Rouge Héritage، Ophélie فستان نهاري بلون نبيذي عميق يجمع بين الدفء والرقيّ. ياقة V تفتح خطاً أنثوياً متوازناً، وأكمام منسابة تمنح إحساساً بالراحة والحركة. القصة محتشمة بطول ميدي تلائم أوقاتاً متعدّدة، من غداء أنيق إلى لقاء عائلي راقٍ. شيفون فاخر خفيف يتماوج مع الحركة ويمنح إطلالة رشيقة. لون واحد قوي يكفي وحده لبناء حضور واثق دون الحاجة إلى تفاصيل زائدة.",
    highlights: [
      "لون نبيذي عميق موحّد بلا نقشات.",
      "ياقة V تفتح خطاً أنثوياً هادئاً.",
      "أكمام منسابة تمنح راحة وحركة رشيقة.",
    ],
    details: ["الطول: ميدي","القصة: محتشمة بياقة V وأكمام منسابة","اللون: نبيذي عميق","الخامة: شيفون فاخر","العناية: غسيل يدوي بارد"],
    seoName: "فستان كاجوال نبيذي بياقة V — مجموعة Rouge Héritage",
    slug: "rouge-heritage-ophelie-فستان-نبيذي-ميدي",
    tags: ["كاجوال","نبيذي","ميدي","ياقة-V","أكمام-منسابة","شيفون","محتشم","نسائي","نهاري","Rouge-Héritage","Ophélie","أنيق","راقي","خالد","دافئ","لون-موحّد","خروجات","لقاءات","ربيع","خريف"],
  },
  "red-velvet": {
    collection: "Azure", model: "Sérène",
    descriptor: "فستان سهرة أزرق سماوي بحزام مزخرف بطول ميدي",
    subtitle: "أزرق سماوي هادئ بأناقة متوسطية.",
    description: "من مجموعة Azure، يستدعي Sérène صفاء البحر المتوسط بلون أزرق سماوي ناعم. القصة محدّدة الخصر بحزام مزخرف يرسم قواماً متوازناً، وأكمام ناعمة تُكمل الصورة بلطف. الطول ميدي مثالي للاطلالات المسائية الأنيقة. ساتان فاخر يمنح لمعاناً هادئاً يعكس الضوء دون مبالغة. قطعة تجمع بين الطراوة اللونية والقصة الكلاسيكية، وتناسب المناسبات الراقية التي تتطلّب حضوراً منعشاً بعيداً عن الألوان التقليدية.",
    highlights: [
      "لون أزرق سماوي صافٍ بلا نقشات.",
      "حزام مزخرف يحدّد الخصر ويوازن القوام.",
      "أكمام ناعمة وقصّة ميدي أنيقة.",
    ],
    details: ["الطول: ميدي","القصة: محدّدة الخصر بحزام مزخرف","اللون: أزرق سماوي","الخامة: ساتان فاخر","العناية: غسيل جاف فقط"],
    seoName: "فستان سهرة أزرق سماوي بحزام — مجموعة Azure",
    slug: "azure-serene-فستان-أزرق-سماوي",
    tags: ["سهرة","أزرق-سماوي","ميدي","حزام","محدد-الخصر","أكمام-ناعمة","ساتان","نسائي","مناسبات","Azure","Sérène","أنيق","راقي","متوسطي","منعش","حفلات","مساء","خالد","ربيع","صيف"],
  },
  "black-lace": {
    collection: "Azure", model: "Colette",
    descriptor: "فستان سهرة كحلي غامق بأكمام بوف وياقة V بطول ميدي",
    subtitle: "كحلي عميق بحضور مسائي واثق.",
    description: "قطعة من مجموعة Azure بلون كحلي غامق يقترب من صفاء الليل. Colette فستان سهرة بأكمام بوف تمنح الكتف حضوراً أنثوياً، وياقة V تفتح خطاً متوازناً. أزرار أمامية تضيف بُعداً كلاسيكياً هادئاً، والقصة بطول ميدي تلائم المناسبات المسائية الرسمية. ساتان بلمسة تركيبية دقيقة يمنح النسيج ثقلاً فاخراً وحركة رشيقة. اختيار مضمون لمن تفضّل الألوان العميقة على الأسود التقليدي، مع الحفاظ على نفس الحضور الليلي القوي.",
    highlights: [
      "أكمام بوف تمنح الكتف حضوراً أنثوياً.",
      "ياقة V وأزرار أمامية بلمسة كلاسيكية.",
      "لون كحلي غامق يستبدل الأسود بلمسة عصرية.",
    ],
    details: ["الطول: ميدي","القصة: كلاسيكية بأكمام بوف وياقة V","اللون: كحلي غامق","الخامة: ساتان بلمسة تركيبية","العناية: غسيل جاف فقط"],
    seoName: "فستان سهرة كحلي بأكمام بوف — مجموعة Azure",
    slug: "azure-colette-فستان-كحلي-بوف",
    tags: ["سهرة","كحلي","ميدي","أكمام-بوف","ياقة-V","أزرار-أمامية","ساتان","نسائي","مناسبات","Azure","Colette","أنيق","راقي","مساء","حفلات","كلاسيكي","خالد","خريف","شتاء","إطلالة-ليلية"],
  },
  "night-velvet": {
    collection: "Lumière", model: "Amélie",
    descriptor: "فستان سهرة أبيض منقّط بكتف مكشوف وحزام بطول ميدي",
    subtitle: "أبيض نقي بحضور مسائي عصري.",
    description: "من مجموعة Lumière، يجسّد Amélie الأنوثة الضوئية بلون أبيض نقي تعلوه نقشة منقّطة داكنة تمنح النسيج إيقاعاً بصرياً هادئاً. قصّة الكتف المكشوف تفتح خطاً أنثوياً واثقاً، وحزام يحدّد الخصر ويوازن القوام. الطول ميدي مريح وأنيق. ساتان فاخر يعكس الضوء بذكاء ويمنح ملمساً ناعماً. قطعة تجمع بين الكلاسيكية المطلقة للأبيض المنقّط والحداثة في خط الكتف، وتناسب المناسبات المسائية التي تحتاج إطلالة مضيئة بلا مبالغة.",
    highlights: [
      "خط كتف مكشوف يفتح الرقبة بأناقة.",
      "نقشة منقّطة داكنة على خلفية بيضاء.",
      "حزام يحدّد الخصر ويوازن القوام.",
    ],
    details: ["الطول: ميدي","القصة: كتف مكشوف مع حزام","النقشة: نقاط داكنة على خلفية بيضاء","الخامة: ساتان فاخر","العناية: غسيل جاف فقط"],
    seoName: "فستان سهرة أبيض منقّط بكتف مكشوف — مجموعة Lumière",
    slug: "lumiere-amelie-فستان-أبيض-كتف-مكشوف",
    tags: ["سهرة","أبيض","منقّط","ميدي","كتف-مكشوف","حزام","ساتان","نسائي","مناسبات","Lumière","Amélie","أنيق","راقي","مساء","حفلات","خالد","عصري","إطلالة-مضيئة","ربيع","صيف"],
  },
  "white-lace": {
    collection: "Botanique", model: "Margaux",
    descriptor: "فستان رسمي وردي محتشم بطول ماكسي",
    subtitle: "وردي هادئ بلمسة أنوثة رقيقة.",
    description: "من مجموعة Botanique، Margaux فستان رسمي بلون وردي هادئ ينتمي إلى عالم من الأنوثة النباتية الرقيقة. القصة محتشمة بطول ماكسي تمنح إطلالة رصينة وأنيقة، وتفاصيل ناعمة عند الأكمام تُكمل الصورة بلطف. ساتان بلمسة مطرية يمنح ملمساً حريرياً ولمعاناً هادئاً. قطعة تلائم المناسبات النهارية الرسمية والتجمّعات العائلية الراقية، وتُقدّم الوردي بلغة جديدة بعيدة عن المبالغة. لون واحد قوي يكفي وحده لبناء حضور واثق ورقيق في آنٍ.",
    highlights: [
      "لون وردي هادئ موحّد.",
      "قصّة ماكسي محتشمة بأكمام ناعمة.",
      "لمسة ساتان مطرية بلمعان هادئ.",
    ],
    details: ["الطول: ماكسي","القصة: محتشمة بتفاصيل رقيقة","اللون: وردي هادئ","الخامة: ساتان مطري","العناية: غسيل جاف فقط"],
    seoName: "فستان رسمي وردي ماكسي — مجموعة Botanique",
    slug: "botanique-margaux-فستان-وردي-ماكسي",
    tags: ["رسمي","وردي","ماكسي","محتشم","أكمام-ناعمة","ساتان","نسائي","مناسبات","Botanique","Margaux","أنيق","راقي","نهاري","احتفالي","رقيق","لون-موحّد","خالد","ربيع","صيف","تجمّعات"],
  },
  "floral-sleeve": {
    collection: "Lumière", model: "Elodie",
    descriptor: "فستان رسمي كريمي محتشم بأكمام ناعمة بطول ميدي",
    subtitle: "كريمي هادئ بأنوثة محتشمة.",
    description: "من مجموعة Lumière، Elodie فستان رسمي بلون كريمي دافئ يجسّد الأنوثة الهادئة والاحترافية. القصة محتشمة بأكمام ناعمة تمنح راحة تامة، ونقشة النقاط الكلاسيكية تضفي إيقاعاً بصرياً لطيفاً. الطول ميدي مثالي لأوقات نهارية رسمية أو تجمّعات راقية. ساتان كلاسيكي بملمس ناعم يمنح ثباتاً وسقوطاً أنيقاً. قطعة متعدّدة الاستخدامات تنسجم مع إكسسوارات ذهبية أو محايدة، وتُبنى عليها إطلالة كاملة بأقل قدر من التفاصيل الإضافية.",
    highlights: [
      "لون كريمي دافئ محايد.",
      "قصّة محتشمة بأكمام ناعمة مريحة.",
      "نقشة نقاط كلاسيكية بإيقاع لطيف.",
    ],
    details: ["الطول: ميدي","القصة: محتشمة بأكمام ناعمة","النقشة: نقاط كلاسيكية","الخامة: ساتان كلاسيكي","العناية: غسيل جاف فقط"],
    seoName: "فستان رسمي كريمي منقّط — مجموعة Lumière",
    slug: "lumiere-elodie-فستان-كريمي-محتشم",
    tags: ["رسمي","كريمي","ميدي","محتشم","أكمام-ناعمة","ساتان","منقّط","نسائي","مناسبات","Lumière","Elodie","أنيق","راقي","نهاري","محايد","خالد","احترافي","ربيع","صيف","تجمّعات"],
  },
  "gold-embroidered-1": {
    collection: "Maison d'Or", model: "Solène",
    descriptor: "فستان مطرّز بلون ذهبي عتيق بتصميم لامع",
    subtitle: "ذهب عتيق بلمعان حِرفي دافئ.",
    description: "من مجموعة Maison d'Or، Solène قطعة توقيعية بلون ذهبي عتيق دافئ يحمل توقيع مصنع دقيق. النسيج اللامع يعكس الضوء بأناقة ويمنح حضوراً ملكياً هادئاً. القصة تبرز خط الكتف والصدر بلمسة راقية، مع تفاصيل معالجة يدوياً تضفي عمقاً بصرياً. ساتان بلمسة معدنية يمنح ملمساً فاخراً وسقوطاً منظّماً. قطعة استثنائية للمناسبات المميّزة والاحتفاليات الكبرى التي تستدعي حضوراً ذهبياً لا يُنسى، بعيداً عن اللمعان المبالغ فيه.",
    highlights: [
      "لون ذهبي عتيق دافئ.",
      "نسيج لامع يعكس الضوء بأناقة.",
      "تفاصيل معالجة يدوياً تضفي عمقاً.",
    ],
    details: ["القصة: أنيقة بتفاصيل لامعة","اللون: ذهبي عتيق","الخامة: ساتان بلمسة معدنية","التطريز: يدوي","العناية: غسيل جاف فقط"],
    seoName: "فستان مطرّز ذهبي عتيق — مجموعة Maison d'Or",
    slug: "maison-dor-solene-فستان-ذهبي-عتيق",
    tags: ["مطرّز","ذهبي-عتيق","سهرة","لامع","توقيعي","ساتان","حِرفي","نسائي","مناسبات","Maison-dOr","Solène","فاخر","راقي","احتفالي","ملكي","خالد","دافئ","تطريز-يدوي","مساء","حفلات"],
  },
  "gold-embroidered-3": {
    collection: "Rouge Héritage", model: "Inès",
    descriptor: "فستان مطرّز نبيذي غامق بأكمام طويلة وكتف منسدل",
    subtitle: "نبيذ عميق بحضور ملكي هادئ.",
    description: "من مجموعة Rouge Héritage، Inès فستان بلون نبيذي غامق يستدعي عمق العنابي التقليدي بلمسة معاصرة. قصّة فضفاضة بأكمام طويلة تنساب مع الحركة، وخط كتف منسدل يمنح إطلالة أنثوية واثقة. تطريز يدوي بخيوط ذهبية يضيف بُعداً حِرفياً دون أن يطغى على اللون. ساتان فاخر بملمس ناعم وسقوط منظّم. قطعة تليق بالمناسبات المسائية الرسمية التي تتطلّب حضوراً عميقاً ودافئاً في آنٍ واحد.",
    highlights: [
      "لون نبيذي غامق عميق.",
      "أكمام طويلة تنساب مع الحركة.",
      "خط كتف منسدل بلمسة أنثوية.",
    ],
    details: ["القصة: فضفاضة بأكمام طويلة وكتف منسدل","اللون: نبيذي غامق","الخامة: ساتان فاخر","التطريز: يدوي بخيوط ذهبية","العناية: غسيل جاف فقط"],
    seoName: "فستان مطرّز نبيذي بكتف منسدل — مجموعة Rouge Héritage",
    slug: "rouge-heritage-ines-فستان-نبيذي-مطرّز",
    tags: ["مطرّز","نبيذي","سهرة","أكمام-طويلة","كتف-منسدل","ساتان","تطريز-ذهبي","نسائي","مناسبات","Rouge-Héritage","Inès","فاخر","راقي","مساء","حفلات","ملكي","دافئ","خالد","خريف","شتاء"],
  },
  "gold-embroidered-4": {
    collection: "Maison d'Or", model: "Livia",
    descriptor: "فستان مطرّز شوكولاتي داكن بقصّة ميرميد بكتف واحد",
    subtitle: "كاكاو داكن بحضور نحيف مبهر.",
    description: "من مجموعة Maison d'Or، Livia قطعة درامية بلون شوكولاتي داكن ينتمي إلى دفء الكاكاو والخشب. قصّة ميرميد ترسم القوام بأناقة، وخط كتف واحد يمنح إطلالة عصرية جريئة. أكمام طويلة تُكمل الصورة بتوازن. تطريز يدوي بخيوط ذهبية على الأكمام يضيف بُعداً حِرفياً هادئاً. ساتان فاخر بملمس ناعم يعكس الضوء بذكاء. قطعة استثنائية للمناسبات المسائية الكبرى والاحتفاليات التي تستدعي حضوراً غير تقليدي.",
    highlights: [
      "قصّة ميرميد تبرز القوام.",
      "خط كتف واحد بجرأة عصرية.",
      "لون شوكولاتي داكن دافئ.",
    ],
    details: ["القصة: ميرميد بكتف واحد وأكمام طويلة","اللون: شوكولاتي داكن","الخامة: ساتان فاخر","التطريز: يدوي بخيوط ذهبية","العناية: غسيل جاف فقط"],
    seoName: "فستان مطرّز شوكولاتي ميرميد — مجموعة Maison d'Or",
    slug: "maison-dor-livia-فستان-شوكولاتي-ميرميد",
    tags: ["مطرّز","شوكولاتي","سهرة","ميرميد","كتف-واحد","أكمام-طويلة","ساتان","تطريز-ذهبي","نسائي","مناسبات","Maison-dOr","Livia","فاخر","راقي","احتفالي","دافئ","عصري","خالد","خريف","شتاء"],
  },
  "gold-embroidered-2": {
    collection: "Lumière", model: "Noor",
    descriptor: "فستان مطرّز عاجي بقصّة ميرميد بكتف واحد بطول أرضي",
    subtitle: "عاج دافئ بحضور ضوئي.",
    description: "من مجموعة Lumière، Noor فستان توقيعي بلون عاجي دافئ يمنح النور جسداً. قصّة ميرميد بطول أرضي ترسم قواماً أنثوياً متوازناً، وخط كتف واحد يفتح الرقبة بأناقة عصرية. تطريز يدوي بخيوط ذهبية يزيّن الأكمام والصدر بلمسات دقيقة تحتفي بالحرفة اليدوية. ساتان فاخر بسقوط منظّم يعكس الضوء بلطف. قطعة تليق بالمناسبات الاستثنائية والاحتفاليات الكبرى، وتُقدّم العاجي بلغة عصرية بعيدة عن الكلاسيكية التقليدية.",
    highlights: [
      "قصّة ميرميد بطول أرضي.",
      "خط كتف واحد بلمسة عصرية.",
      "تطريز يدوي بخيوط ذهبية.",
    ],
    details: ["القصة: ميرميد بكتف واحد بطول أرضي","اللون: عاجي دافئ","الخامة: ساتان فاخر","التطريز: يدوي بخيوط ذهبية","العناية: غسيل جاف فقط"],
    seoName: "فستان مطرّز عاجي ميرميد — مجموعة Lumière",
    slug: "lumiere-noor-فستان-عاجي-ميرميد",
    tags: ["مطرّز","عاجي","سهرة","ميرميد","كتف-واحد","طول-أرضي","ساتان","تطريز-ذهبي","نسائي","مناسبات","Lumière","Noor","فاخر","راقي","احتفالي","ضوئي","دافئ","خالد","استثنائي","ربيع"],
  },
  "gold-embroidered-5": {
    collection: "Noir Atelier", model: "Yasmina",
    descriptor: "فستان مطرّز أسود داكن بقصّة ميرميد بكتف واحد",
    subtitle: "أسود عميق بحضور مسائي جريء.",
    description: "من مجموعة Noir Atelier، Yasmina قطعة درامية بلون أسود داكن يبني حضوراً مسائياً واثقاً. قصّة ميرميد ترسم القوام بأناقة، وخط كتف واحد يمنح جرأة أنثوية عصرية. أكمام طويلة تُكمل الصورة بتوازن كلاسيكي. تطريز يدوي بخيوط ذهبية يضيف بريقاً هادئاً يكسر حدّة الأسود. ساتان فاخر بسقوط منظّم يعكس الضوء بذكاء. قطعة تليق بالمناسبات الكبرى والاحتفاليات المسائية التي تستدعي حضوراً ليلياً لا يُنسى.",
    highlights: [
      "قصّة ميرميد بكتف واحد وأكمام طويلة.",
      "لون أسود داكن عميق.",
      "تطريز ذهبي يكسر حدّة الأسود بلطف.",
    ],
    details: ["القصة: ميرميد بكتف واحد وأكمام طويلة","اللون: أسود داكن","الخامة: ساتان فاخر","التطريز: يدوي بخيوط ذهبية","العناية: غسيل جاف فقط"],
    seoName: "فستان مطرّز أسود ميرميد — مجموعة Noir Atelier",
    slug: "noir-atelier-yasmina-فستان-أسود-ميرميد",
    tags: ["مطرّز","أسود","سهرة","ميرميد","كتف-واحد","أكمام-طويلة","ساتان","تطريز-ذهبي","نسائي","مناسبات","Noir-Atelier","Yasmina","فاخر","راقي","احتفالي","ملكي","خالد","مساء","حفلات","إطلالة-ليلية"],
  },
  "gold-embroidered-6": {
    collection: "Rouge Héritage", model: "Salma",
    descriptor: "فستان مطرّز نبيذي غامق بقصّة ميرميد بكتف واحد",
    subtitle: "نبيذ غامق بلمسة أنوثة هادئة.",
    description: "من مجموعة Rouge Héritage، Salma قطعة توقيعية بلون نبيذي غامق يستدعي عمق الياقوت. قصّة ميرميد بكتف واحد وأكمام طويلة ترسم قواماً أنثوياً واثقاً وتفتح الرقبة بأناقة. تطريز يدوي بخيوط ذهبية يضيف بريقاً هادئاً على النسيج ويحتفي بالحرفة اليدوية. ساتان فاخر بسقوط منظّم يمنح إطلالة رشيقة. قطعة تجمع بين الأنوثة والقوة الهادئة، وتليق بالمناسبات المسائية الكبرى التي تتطلّب حضوراً عميقاً ودافئاً.",
    highlights: [
      "قصّة ميرميد بكتف واحد وأكمام طويلة.",
      "لون نبيذي غامق عميق.",
      "تطريز ذهبي يضيف بريقاً هادئاً.",
    ],
    details: ["القصة: ميرميد بكتف واحد وأكمام طويلة","اللون: نبيذي غامق","الخامة: ساتان فاخر","التطريز: يدوي بخيوط ذهبية","العناية: غسيل جاف فقط"],
    seoName: "فستان مطرّز نبيذي ميرميد — مجموعة Rouge Héritage",
    slug: "rouge-heritage-salma-فستان-نبيذي-ميرميد",
    tags: ["مطرّز","نبيذي","سهرة","ميرميد","كتف-واحد","أكمام-طويلة","ساتان","تطريز-ذهبي","نسائي","مناسبات","Rouge-Héritage","Salma","فاخر","راقي","احتفالي","دافئ","خالد","خريف","شتاء","إطلالة-ليلية"],
  },
  "geo-gold-1": {
    collection: "Azure", model: "Léa",
    descriptor: "فستان سهرة أزرق فضي بقصّة ميرميد لامعة",
    subtitle: "فضي أزرق بلمعان مسائي هادئ.",
    description: "من مجموعة Azure، Léa قطعة توقيعية بلون أزرق فضي متوهّج يجمع بين برودة الأزرق ودفء الفضي. قصّة ميرميد تبرز انحناءات القوام بأناقة، والنسيج اللامع يعكس الضوء ويمنح حضوراً مسائياً مميّزاً. ساتان لامع بسقوط منظّم يمنح إطلالة رشيقة وحركة رصينة. قطعة تليق بحفلات المساء الكبرى والاحتفاليات التي تتطلّب حضوراً معدنياً غير تقليدي، بعيداً عن الذهبي أو الفضي المحض.",
    highlights: [
      "قصّة ميرميد تبرز القوام.",
      "لون أزرق فضي بلمعان معدني.",
      "نسيج ساتان لامع يعكس الضوء.",
    ],
    details: ["القصة: ميرميد بتفصيل لامع","اللون: أزرق فضي متوهّج","الخامة: ساتان لامع","العناية: غسيل جاف فقط"],
    seoName: "فستان سهرة أزرق فضي ميرميد — مجموعة Azure",
    slug: "azure-lea-فستان-أزرق-فضي-ميرميد",
    tags: ["سهرة","أزرق-فضي","ميرميد","لامع","معدني","ساتان","نسائي","مناسبات","Azure","Léa","فاخر","راقي","احتفالي","مساء","حفلات","خالد","عصري","إطلالة-ليلية","ربيع","صيف"],
  },
  "geo-gold-2": {
    collection: "Lumière", model: "Anaïs",
    descriptor: "طقم كاجوال كريمي من قطعتين بقمّة قصيرة وبنطلون واسع",
    subtitle: "كريمي هادئ بلغة نهارية عصرية.",
    description: "من مجموعة Lumière، Anaïs طقم كاجوال من قطعتين بلون كريمي دافئ يجسّد الأنوثة النهارية العصرية. قمّة قصيرة تُبرز الخصر بلطف وبنطلون واسع ينساب مع الحركة بحرية. ساتان مخملي بملمس ناعم يمنح ملمساً فاخراً وسقوطاً منظّماً. طقم متعدّد الاستخدامات ينتقل بسهولة من فطور أنيق إلى لقاء نهاري راقٍ، ويمكن ارتداء قطعتيه بشكل منفصل. لون واحد قوي يكفي وحده لبناء إطلالة كاملة دون الحاجة إلى تفاصيل إضافية.",
    highlights: [
      "طقم من قطعتين بلون كريمي موحّد.",
      "قمّة قصيرة تُبرز الخصر بلطف.",
      "بنطلون واسع ينساب بحرية.",
    ],
    details: ["القصة: قطعتان بقمّة قصيرة وبنطلون واسع","اللون: كريمي ناعم","الخامة: ساتان مخملي","العناية: غسيل يدوي بارد"],
    seoName: "طقم كاجوال كريمي من قطعتين — مجموعة Lumière",
    slug: "lumiere-anais-طقم-كريمي-قطعتين",
    tags: ["كاجوال","كريمي","طقم","قطعتين","بنطلون-واسع","قمّة-قصيرة","ساتان","نسائي","نهاري","Lumière","Anaïs","أنيق","راقي","محايد","عصري","خالد","لون-موحّد","ربيع","صيف","خروجات"],
  },
  "geo-gold-3": {
    collection: "Noir Atelier", model: "Camille",
    descriptor: "طقم كاجوال أسود من قطعتين بقمّة قصيرة وبنطلون واسع",
    subtitle: "أسود صافٍ بلغة نهارية معمارية.",
    description: "من مجموعة Noir Atelier، Camille طقم كاجوال بلون أسود صلب يجسّد البساطة المعمارية في أنقى صورها. قمّة قصيرة تُبرز الخصر وبنطلون واسع ينساب بأناقة. قطن فاخر بملمس مريح يمنح ثباتاً وحرية حركة تامة. طقم متعدّد الاستخدامات ينتقل بسهولة من نهار عملي إلى مساء غير رسمي، ويمكن ارتداء قطعتيه بشكل منفصل. تصميم نظيف بلا زخارف يعتمد على قوة اللون والقصّة وحدهما لبناء حضور عصري واثق.",
    highlights: [
      "طقم أسود صلب بلا زخارف.",
      "قمّة قصيرة وبنطلون واسع.",
      "قطن فاخر بملمس مريح.",
    ],
    details: ["القصة: قطعتان بقمّة قصيرة وبنطلون واسع","اللون: أسود صلب","الخامة: قطن فاخر","العناية: غسيل آلي بارد"],
    seoName: "طقم كاجوال أسود من قطعتين — مجموعة Noir Atelier",
    slug: "noir-atelier-camille-طقم-أسود-قطعتين",
    tags: ["كاجوال","أسود","طقم","قطعتين","بنطلون-واسع","قمّة-قصيرة","قطن","نسائي","نهاري","Noir-Atelier","Camille","أنيق","راقي","معماري","عصري","خالد","لون-موحّد","خروجات","عملي","بسيط"],
  },
  "geo-gold-6": {
    collection: "Botanique", model: "Juliette",
    descriptor: "طقم كاجوال أخضر فاتح من قطعتين بتفاصيل حديثة",
    subtitle: "أخضر منعش بحيوية نباتية.",
    description: "من مجموعة Botanique، Juliette طقم كاجوال بلون أخضر فاتح منعش يستدعي حيوية النباتات الربيعية. قصّة من قطعتين بتفاصيل حديثة تمنح حرية حركة كاملة، ولمسة مطوية على النسيج تضيف بُعداً بصرياً لطيفاً. ساتان ناعم بملمس منساب يعكس الضوء بلطف. طقم مثالي لأوقات نهارية منعشة وتجمّعات غير رسمية، ويُقدّم الأخضر بلغة عصرية بعيدة عن التقليدية. لون واحد قوي يكفي لبناء حضور مبهج دون الحاجة إلى إكسسوارات كثيرة.",
    highlights: [
      "لون أخضر فاتح منعش موحّد.",
      "قصّة من قطعتين بتفاصيل حديثة.",
      "لمسة مطوية على النسيج.",
    ],
    details: ["القصة: قطعتان بتفاصيل حديثة","اللون: أخضر فاتح منعش","النقشة: طيّات دقيقة","الخامة: ساتان ناعم","العناية: غسيل يدوي بارد"],
    seoName: "طقم كاجوال أخضر فاتح — مجموعة Botanique",
    slug: "botanique-juliette-طقم-أخضر-فاتح",
    tags: ["كاجوال","أخضر-فاتح","طقم","قطعتين","طيّات","ساتان","نسائي","نهاري","Botanique","Juliette","أنيق","راقي","منعش","عصري","نباتي","لون-موحّد","ربيع","صيف","خروجات","مبهج"],
  },
  "geo-gold-7": {
    collection: "Botanique", model: "Zara",
    descriptor: "طقم كاجوال وردي فاتح من قطعتين بتفاصيل ديكورية",
    subtitle: "وردي هادئ بحضور نهاري رقيق.",
    description: "من مجموعة Botanique، Zara طقم كاجوال بلون وردي فاتح هادئ يجسّد الأنوثة النباتية الرقيقة. قصّة من قطعتين منسابتين مع تفاصيل ديكورية دقيقة تمنح حركة رشيقة وأناقة عصرية. ساتان مخملي بملمس ناعم يعكس الضوء بلطف. طقم مثالي لأوقات نهارية أنيقة وتجمّعات غير رسمية، ويُقدّم الوردي بلغة معاصرة بعيدة عن المبالغة. لون واحد قوي يكفي وحده لبناء إطلالة كاملة تحتفي بالأنوثة الهادئة والرقيقة.",
    highlights: [
      "لون وردي فاتح هادئ.",
      "قطعتان منسابتان بتفاصيل ديكورية.",
      "ساتان مخملي بملمس ناعم.",
    ],
    details: ["القصة: قطعتان منسابتان","اللون: وردي فاتح هادئ","التفاصيل: ديكورية دقيقة","الخامة: ساتان مخملي","العناية: غسيل يدوي بارد"],
    seoName: "طقم كاجوال وردي فاتح — مجموعة Botanique",
    slug: "botanique-zara-طقم-وردي-فاتح",
    tags: ["كاجوال","وردي","طقم","قطعتين","ساتان","نسائي","نهاري","Botanique","Zara","أنيق","راقي","رقيق","عصري","نباتي","لون-موحّد","ربيع","صيف","خروجات","مبهج","محتشم"],
  },
  "mesh-geometric": {
    collection: "Noir Atelier", model: "Rania",
    descriptor: "فستان مطرّز أسود بنقاط بيضاء محتشم",
    subtitle: "أسود منقّط بحضور عصري راقٍ.",
    description: "من مجموعة Noir Atelier، Rania فستان محتشم بلون أسود تعلوه نقشة نقاط بيضاء بإيقاع دقيق يمنح النسيج عمقاً بصرياً. القصة محتشمة تلائم مناسبات متعدّدة، وطول ميدي يوازن بين الأناقة والراحة. ساتان بلمسة مطرية يعكس الضوء بلطف. قطعة تجمع بين الطراز الكلاسيكي للنقاط والحداثة في التصميم، وتناسب المناسبات النهارية الرسمية والتجمّعات المسائية الراقية على حدٍ سواء. أسلوب متوازن يجعل النقشة نجمة الإطلالة دون مبالغة.",
    highlights: [
      "خلفية سوداء صافية مع نقاط بيضاء.",
      "قصّة محتشمة متوازنة.",
      "ساتان بلمسة مطرية بلمعان هادئ.",
    ],
    details: ["القصة: محتشمة بأناقة","النقشة: نقاط بيضاء على أسود","الخامة: ساتان مطري","العناية: غسيل جاف فقط"],
    seoName: "فستان أسود منقّط محتشم — مجموعة Noir Atelier",
    slug: "noir-atelier-rania-فستان-أسود-منقط",
    tags: ["مطرّزة","أسود","منقّط","ميدي","محتشم","ساتان","نسائي","مناسبات","Noir-Atelier","Rania","أنيق","راقي","نهاري","مساء","كلاسيكي","خالد","عصري","تجمّعات","ربيع","خريف"],
  },
  "navy-tie-neck": {
    collection: "Lumière", model: "Layla",
    descriptor: "فستان كاجوال أبيض بأربطة رقبة وأكمام منسابة بطول ميدي",
    subtitle: "أبيض نقي بتفاصيل ياقة عصرية.",
    description: "من مجموعة Lumière، Layla فستان كاجوال بلون أبيض نقي يجسّد الأنوثة الضوئية النهارية. أربطة مزخرفة عند الرقبة تضيف بُعداً بصرياً عصرياً، وأكمام طويلة منسابة تُكمل الصورة بلطف. حزام يحدّد الخصر ويوازن القوام. شيفون فاخر خفيف يتماوج مع الحركة ويمنح إطلالة رشيقة. قطعة تلائم الأوقات النهارية والتجمّعات غير الرسمية، وتُقدّم الأبيض بلغة عصرية بعيدة عن الكلاسيكية التقليدية. لون واحد قوي يكفي وحده لبناء حضور منعش وأنيق.",
    highlights: [
      "أربطة مزخرفة عند الرقبة.",
      "أكمام طويلة منسابة.",
      "حزام يحدّد الخصر ويوازن القوام.",
    ],
    details: ["الطول: ميدي","القصة: أنيقة بأكمام طويلة منسابة","التفاصيل: أربطة رقبة وحزام خصر","الخامة: شيفون فاخر","العناية: غسيل يدوي بارد"],
    seoName: "فستان كاجوال أبيض بأربطة رقبة — مجموعة Lumière",
    slug: "lumiere-layla-فستان-أبيض-أربطة",
    tags: ["كاجوال","أبيض","ميدي","أربطة-رقبة","أكمام-طويلة","حزام","شيفون","نسائي","نهاري","Lumière","Layla","أنيق","راقي","عصري","منعش","لون-موحّد","ربيع","صيف","تجمّعات","خروجات"],
  },
  "white-polka-dot": {
    collection: "Rouge Héritage", model: "Hana",
    descriptor: "فستان كاجوال عنابي بأكمام منسابة بطول ميدي",
    subtitle: "عنابي دافئ بأنوثة نهارية.",
    description: "من مجموعة Rouge Héritage، Hana فستان كاجوال بلون عنابي دافئ يستدعي عمق النبيذ الكلاسيكي. قصّة أنيقة بأكمام طويلة منسابة تمنح حرية حركة وأناقة عصرية. الطول ميدي يوازن بين المحتشم والعصري. شيفون فاخر خفيف يتماوج مع الحركة ويعكس الضوء بلطف. قطعة تلائم الأوقات النهارية الرسمية والتجمّعات العائلية، وتُقدّم العنابي بلغة نهارية بعيدة عن الطابع المسائي التقليدي. لون واحد قوي يكفي وحده لبناء إطلالة راقية دون الحاجة إلى نقشات إضافية.",
    highlights: [
      "لون عنابي دافئ موحّد.",
      "أكمام طويلة منسابة.",
      "قصّة ميدي محتشمة بأناقة.",
    ],
    details: ["الطول: ميدي","القصة: أنيقة بأكمام طويلة منسابة","اللون: عنابي دافئ","الخامة: شيفون فاخر","العناية: غسيل يدوي بارد"],
    seoName: "فستان كاجوال عنابي ميدي — مجموعة Rouge Héritage",
    slug: "rouge-heritage-hana-فستان-عنابي-ميدي",
    tags: ["كاجوال","عنابي","ميدي","أكمام-طويلة","شيفون","محتشم","نسائي","نهاري","Rouge-Héritage","Hana","أنيق","راقي","دافئ","لون-موحّد","خالد","خريف","شتاء","تجمّعات","خروجات","احترافي"],
  },
  "olive-elegant": {
    collection: "Botanique", model: "Malak",
    descriptor: "فستان كاجوال أخضر زيتي بأكمام ثلاثة أرباع بطول ميدي",
    subtitle: "زيتي دافئ بأنوثة طبيعية.",
    description: "من مجموعة Botanique، Malak فستان كاجوال بلون أخضر زيتي دافئ يستدعي طبيعة البحر المتوسط. قصّة محتشمة بأكمام ثلاثة أرباع تمنح حرية حركة وأناقة راقية. الطول ميدي مثالي لأوقات نهارية متعدّدة. شيفون فاخر خفيف يتماوج مع الحركة ويعكس الضوء بلطف. قطعة تجمع بين الراحة والأناقة في تصميم واحد، وتُقدّم الأخضر بلغة نباتية معاصرة. لون واحد دافئ يكفي وحده لبناء حضور طبيعي هادئ يعكس ذوقاً رفيعاً بعيداً عن الألوان الصاخبة.",
    highlights: [
      "لون أخضر زيتي دافئ.",
      "أكمام ثلاثة أرباع مريحة.",
      "قصّة ميدي محتشمة.",
    ],
    details: ["الطول: ميدي","القصة: محتشمة بأكمام ثلاثة أرباع","اللون: أخضر زيتي","الخامة: شيفون فاخر","العناية: غسيل يدوي بارد"],
    seoName: "فستان كاجوال أخضر زيتي — مجموعة Botanique",
    slug: "botanique-malak-فستان-زيتي-ميدي",
    tags: ["كاجوال","أخضر-زيتي","ميدي","أكمام-ثلاثة-أرباع","شيفون","محتشم","نسائي","نهاري","Botanique","Malak","أنيق","راقي","طبيعي","دافئ","لون-موحّد","خالد","خريف","تجمّعات","خروجات","نباتي"],
  },
  "midnight-rose": {
    collection: "Rouge Héritage", model: "Farah",
    descriptor: "فستان سهرة عنابي مخملي بطول ميدي",
    subtitle: "مخمل عنابي بحضور مسائي ملكي.",
    description: "من مجموعة Rouge Héritage، Farah فستان سهرة بلون عنابي عميق وقماش مخملي فاخر يمنح ملمساً غنياً وحضوراً ملكياً. قصّة أنيقة بتفاصيل مخملية تعكس الضوء بلطف، وطول ميدي يوازن بين الأناقة والحداثة. المخمل يمنح النسيج ثقلاً فاخراً وسقوطاً منظّماً. قطعة تليق بالمناسبات المسائية الرسمية والاحتفاليات الشتوية التي تستدعي حضوراً دافئاً وعميقاً. لون واحد قوي وقماش مميّز يكفيان وحدهما لبناء إطلالة استثنائية دون الحاجة إلى نقشات أو تطريز إضافي.",
    highlights: [
      "قماش مخملي فاخر بملمس غني.",
      "لون عنابي عميق موحّد.",
      "قصّة ميدي أنيقة بتفاصيل مخملية.",
    ],
    details: ["الطول: ميدي","القصة: أنيقة بتفاصيل مخملية","اللون: عنابي عميق","الخامة: ساتان مخملي","العناية: غسيل جاف فقط"],
    seoName: "فستان سهرة عنابي مخملي — مجموعة Rouge Héritage",
    slug: "rouge-heritage-farah-فستان-عنابي-مخملي",
    tags: ["سهرة","عنابي","مخمل","ميدي","محتشم","نسائي","مناسبات","Rouge-Héritage","Farah","فاخر","راقي","احتفالي","ملكي","دافئ","لون-موحّد","خالد","خريف","شتاء","مساء","حفلات"],
  },
  "pearl-dream": {
    collection: "Lumière", model: "Dania",
    descriptor: "فستان رسمي كريمي شيفون بأكمام طويلة بطول ماكسي",
    subtitle: "كريمي ضوئي بأنوثة محتشمة.",
    description: "من مجموعة Lumière، Dania فستان رسمي بلون كريمي ناعم يجسّد الأنوثة الضوئية الهادئة. قصّة محتشمة بأكمام طويلة تمنح راحة تامة وأناقة راقية، وطول ماكسي يليق بالمناسبات الرسمية والاحتفاليات النهارية. شيفون حريري رقيق ينساب مع كل خطوة بلطف ويعكس الضوء بذكاء. قطعة تجمع بين الفخامة والراحة في تصميم واحد، وتُقدّم الكريمي بلغة عصرية بعيدة عن الكلاسيكية التقليدية. لون واحد دافئ يكفي وحده لبناء حضور مضيء ورقيق في المناسبات الرسمية.",
    highlights: [
      "لون كريمي ناعم دافئ.",
      "قصّة ماكسي محتشمة بأكمام طويلة.",
      "شيفون حريري رقيق ينساب بلطف.",
    ],
    details: ["الطول: ماكسي","القصة: محتشمة بأكمام طويلة","اللون: كريمي ناعم","الخامة: شيفون حريري","العناية: غسيل يدوي بارد"],
    seoName: "فستان رسمي كريمي ماكسي — مجموعة Lumière",
    slug: "lumiere-dania-فستان-كريمي-ماكسي",
    tags: ["رسمي","كريمي","ماكسي","أكمام-طويلة","شيفون","محتشم","نسائي","مناسبات","Lumière","Dania","أنيق","راقي","نهاري","احتفالي","رقيق","لون-موحّد","خالد","ربيع","صيف","تجمّعات"],
  },
  "desert-gold": {
    collection: "Maison d'Or", model: "Lina",
    descriptor: "فستان مطرّز بلون ذهبي عتيق بتطريز يدوي",
    subtitle: "ذهب عتيق بحرفة يدوية استثنائية.",
    description: "من مجموعة Maison d'Or، Lina قطعة توقيعية بلون ذهبي عتيق دافئ يجمع بين الحرفة اليدوية والفخامة العصرية. تطريز يدوي بخيوط ذهبية يزيّن الفستان بتفاصيل دقيقة تحتفي بالصنعة اليدوية، وقماش كريب فاخر يمنح ثباتاً وسقوطاً منظّماً. القصة فاخرة تناسب المناسبات الاستثنائية والاحتفاليات الكبرى. قطعة تليق بالحفلات الرسمية والأمسيات المميّزة التي تستدعي حضوراً ذهبياً غير تقليدي. تحفة تجسّد قيمة الحرفة والصبر في كل تفصيل، وتناسب من تبحث عن قطعة استثنائية طويلة الأمد.",
    highlights: [
      "لون ذهبي عتيق دافئ.",
      "تطريز يدوي بخيوط ذهبية.",
      "قماش كريب فاخر بسقوط منظّم.",
    ],
    details: ["القصة: فخمة بتطريز يدوي","اللون: ذهبي عتيق","الخامة: كريب فاخر","التطريز: يدوي بخيوط ذهبية","العناية: غسيل جاف فقط"],
    seoName: "فستان مطرّز ذهبي عتيق يدوي — مجموعة Maison d'Or",
    slug: "maison-dor-lina-فستان-ذهبي-تطريز-يدوي",
    tags: ["مطرّز","ذهبي-عتيق","سهرة","تطريز-يدوي","كريب","حِرفي","نسائي","مناسبات","Maison-dOr","Lina","فاخر","راقي","احتفالي","ملكي","خالد","دافئ","استثنائي","مساء","حفلات","توقيعي"],
  },
  "moonlight-silver": {
    collection: "Azure", model: "Rima",
    descriptor: "فستان كاجوال فضي بأكمام واسعة بطول ميدي",
    subtitle: "فضي لامع بحضور نهاري عصري.",
    description: "من مجموعة Azure، Rima فستان كاجوال بلون فضي لامع يستدعي ضوء القمر. أكمام واسعة تمنح حرية حركة وأناقة عصرية، وقصّة أنيقة بطول ميدي توازن بين المحتشم والحديث. شيفون ساتان خفيف وانسيابي يعكس الضوء بلطف ويتحرك مع الجسم بسلاسة. قطعة تلائم الأوقات النهارية الأنيقة والتجمّعات غير الرسمية، وتُقدّم الفضي بلغة نهارية عصرية بعيدة عن الطابع المسائي التقليدي. لون واحد قوي يكفي لبناء إطلالة مميّزة دون الحاجة إلى نقشات إضافية.",
    highlights: [
      "لون فضي لامع موحّد.",
      "أكمام واسعة عصرية.",
      "شيفون ساتان خفيف انسيابي.",
    ],
    details: ["الطول: ميدي","القصة: أنيقة بأكمام واسعة","اللون: فضي لامع","الخامة: شيفون ساتان","العناية: غسيل يدوي بارد"],
    seoName: "فستان كاجوال فضي ميدي — مجموعة Azure",
    slug: "azure-rima-فستان-فضي-ميدي",
    tags: ["كاجوال","فضي","ميدي","أكمام-واسعة","شيفون","نسائي","نهاري","Azure","Rima","أنيق","راقي","عصري","لامع","لون-موحّد","خالد","ربيع","صيف","تجمّعات","خروجات","معدني"],
  },
  "silk-cloud": {
    collection: "Azure", model: "Nada",
    descriptor: "فستان سهرة أزرق سماوي حريري بطول ميدي",
    subtitle: "أزرق سماوي حريري بأناقة صافية.",
    description: "من مجموعة Azure، Nada فستان سهرة بلون أزرق سماوي صافٍ ينتمي إلى برودة السماء الربيعية. حرير طبيعي 100% يمنح ملمساً استثنائياً وسقوطاً منظّماً، وقصّة انسيابية بتفاصيل رقيقة تُبرز الأنوثة بلطف. الطول ميدي يوازن بين الأناقة والحداثة. قطعة تجمع بين الفخامة والبساطة في تصميم واحد، وتليق بالمناسبات المسائية الأنيقة والتجمّعات الراقية. لون واحد قوي وخامة حريرية استثنائية يكفيان وحدهما لبناء إطلالة راقية بعيدة عن التكلّف، وتناسب من تبحث عن أناقة صافية دون مبالغة.",
    highlights: [
      "حرير طبيعي 100% بملمس استثنائي.",
      "لون أزرق سماوي صافٍ.",
      "قصّة انسيابية بتفاصيل رقيقة.",
    ],
    details: ["الطول: ميدي","القصة: انسيابية بتفاصيل رقيقة","اللون: أزرق سماوي","الخامة: حرير طبيعي 100%","العناية: غسيل جاف فقط"],
    seoName: "فستان سهرة أزرق سماوي حريري — مجموعة Azure",
    slug: "azure-nada-فستان-سماوي-حرير",
    tags: ["سهرة","أزرق-سماوي","ميدي","حرير","انسيابي","نسائي","مناسبات","Azure","Nada","فاخر","راقي","مساء","حفلات","خالد","صافٍ","لون-موحّد","ربيع","صيف","تجمّعات","استثنائي"],
  },
  "velvet-burgundy": {
    collection: "Rouge Héritage", model: "Sara",
    descriptor: "فستان سهرة عنابي غامق مخملي بطول ميدي",
    subtitle: "مخمل عنابي عميق بحضور استثنائي.",
    description: "من مجموعة Rouge Héritage، Sara فستان سهرة بلون عنابي غامق وقماش مخمل فاخر يمنح ملمساً غنياً وحضوراً ملكياً استثنائياً. قصّة فاخرة بتفاصيل مخملية دقيقة، وطول ميدي يوازن بين الأناقة والحداثة. المخمل يعكس الضوء بذكاء ويمنح النسيج ثقلاً فاخراً وسقوطاً منظّماً. قطعة تليق بالمناسبات المسائية الكبرى والاحتفاليات الشتوية التي تستدعي حضوراً دافئاً ومميّزاً. لون واحد قوي وقماش استثنائي يكفيان وحدهما لبناء إطلالة ملكية دون الحاجة إلى تطريز أو نقشات إضافية.",
    highlights: [
      "قماش مخمل فاخر بملمس غني.",
      "لون عنابي غامق عميق.",
      "قصّة ميدي فاخرة بتفاصيل مخملية.",
    ],
    details: ["الطول: ميدي","القصة: فاخرة بتفاصيل مخملية","اللون: عنابي غامق","الخامة: مخمل فاخر","العناية: غسيل جاف فقط"],
    seoName: "فستان سهرة عنابي غامق مخملي — مجموعة Rouge Héritage",
    slug: "rouge-heritage-sara-فستان-عنابي-مخملي",
    tags: ["سهرة","عنابي","مخمل","ميدي","نسائي","مناسبات","Rouge-Héritage","Sara","فاخر","راقي","احتفالي","ملكي","دافئ","لون-موحّد","خالد","خريف","شتاء","مساء","حفلات","استثنائي"],
  },
  "ocean-breeze": {
    collection: "Azure", model: "Reem",
    descriptor: "فستان كاجوال أزرق محيطي واسع بطول ماكسي",
    subtitle: "أزرق محيطي بحرية نهاريّة.",
    description: "من مجموعة Azure، Reem فستان كاجوال بلون أزرق محيطي منعش يستدعي حرية البحر المفتوح. قصّة واسعة ومريحة تمنح حرية حركة تامة، وطول ماكسي يليق بالأوقات النهارية والتجمّعات غير الرسمية. شيفون خفيف كنسيم البحر يتحرك معكِ بسلاسة ويعكس الضوء بلطف. قطعة تجمع بين الراحة والأناقة العصرية في تصميم واحد، وتُقدّم الأزرق بلغة نهارية بعيدة عن الطابع المسائي. لون واحد قوي وخامة خفيفة يكفيان لبناء إطلالة منعشة تلائم أيام الصيف والربيع.",
    highlights: [
      "لون أزرق محيطي منعش.",
      "قصّة واسعة ومريحة.",
      "شيفون خفيف انسيابي.",
    ],
    details: ["الطول: ماكسي","القصة: واسعة ومريحة","اللون: أزرق محيطي","الخامة: شيفون خفيف","العناية: غسيل يدوي بارد"],
    seoName: "فستان كاجوال أزرق محيطي ماكسي — مجموعة Azure",
    slug: "azure-reem-فستان-أزرق-محيطي",
    tags: ["كاجوال","أزرق-محيطي","ماكسي","واسع","شيفون","نسائي","نهاري","Azure","Reem","أنيق","راقي","منعش","عصري","لون-موحّد","خالد","ربيع","صيف","تجمّعات","خروجات","بحري"],
  },
  "ivory-grace": {
    collection: "Lumière", model: "Talia",
    descriptor: "فستان رسمي عاجي بأكمام طويلة بطول ميدي",
    subtitle: "عاجي كلاسيكي بحضور رسمي راقٍ.",
    description: "من مجموعة Lumière، Talia فستان رسمي بلون عاجي كلاسيكي يجسّد الأناقة الخالدة. قصّة رسمية بأكمام طويلة تليق بالمناسبات الاحترافية والاحتفاليات النهارية، وطول ميدي يوازن بين الرسمية والحداثة. ساتان كريب فاخر يمنح ثباتاً وسقوطاً منظّماً وملمساً ناعماً. قطعة تجمع بين الأناقة والاحترام في تصميم واحد، وتُقدّم العاجي بلغة راقية بعيدة عن المبالغة. لون واحد كلاسيكي يكفي وحده لبناء حضور رسمي واثق يليق بكل المناسبات المهمّة دون الحاجة إلى إكسسوارات صاخبة.",
    highlights: [
      "لون عاجي كلاسيكي دافئ.",
      "أكمام طويلة رسمية.",
      "ساتان كريب بملمس ناعم.",
    ],
    details: ["الطول: ميدي","القصة: رسمية بأكمام طويلة","اللون: عاجي كلاسيكي","الخامة: ساتان كريب","العناية: غسيل جاف فقط"],
    seoName: "فستان رسمي عاجي بأكمام طويلة — مجموعة Lumière",
    slug: "lumiere-talia-فستان-عاجي-رسمي",
    tags: ["رسمي","عاجي","ميدي","أكمام-طويلة","ساتان","محتشم","نسائي","مناسبات","Lumière","Talia","أنيق","راقي","نهاري","احتفالي","كلاسيكي","خالد","احترافي","لون-موحّد","ربيع","تجمّعات"],
  },
  "cherry-blossom": {
    collection: "Botanique", model: "Maya",
    descriptor: "فستان مطرّز وردي فاتح بتطريز أزهار يدوي",
    subtitle: "وردي بلمسة أزهار حِرفية.",
    description: "من مجموعة Botanique، Maya قطعة توقيعية بلون وردي فاتح تعلوها تطريزات يدوية على شكل أزهار الكرز تحتفي بالحرفة اليدوية. شيفون مزدوج يمنح ثباتاً وأناقة مزدوجة في قطعة فنية واحدة، ولون وردي فاتح يعكس الأنوثة الرقيقة في أبهى صورها. القصة تلائم المناسبات النهارية الأنيقة والتجمّعات الراقية. قطعة تجمع بين الحرفة اليدوية والأناقة العصرية، وتُقدّم الوردي بلغة نباتية استثنائية. تحفة فنية تناسب من تبحث عن قطعة مميّزة تحتفي بالتفاصيل اليدوية الدقيقة.",
    highlights: [
      "تطريز يدوي بأزهار كرز رقيقة.",
      "شيفون مزدوج بثبات وأناقة.",
      "لون وردي فاتح رقيق.",
    ],
    details: ["القصة: مزدوجة بتطريز يدوي","اللون: وردي فاتح","التطريز: أزهار كرز يدوية","الخامة: شيفون مزدوج","العناية: غسيل يدوي بارد"],
    seoName: "فستان مطرّز وردي بأزهار يدوية — مجموعة Botanique",
    slug: "botanique-maya-فستان-وردي-أزهار-يدوية",
    tags: ["مطرّز","وردي","سهرة","تطريز-يدوي","أزهار","شيفون","حِرفي","نسائي","مناسبات","Botanique","Maya","فاخر","راقي","نهاري","احتفالي","رقيق","نباتي","لون-موحّد","خالد","توقيعي"],
  },
  "obsidian-mist": {
    collection: "Noir Atelier", model: "Zeina",
    descriptor: "فستان كاجوال أسود فحمي بأكمام ثلاثة أرباع بطول ميدي",
    subtitle: "أسود فحمي بحضور نهاري هادئ.",
    description: "من مجموعة Noir Atelier، Zeina فستان كاجوال بلون أسود فحمي داكن يجسّد البساطة المعمارية في أنقى صورها. قصّة أنيقة بأكمام ثلاثة أرباع تمنح حرية حركة وأناقة راقية، وطول ميدي يوازن بين المحتشم والعصري. كريب مطري فاخر يمنح ثباتاً ممتازاً وسقوطاً منظّماً. قطعة تلائم الأوقات النهارية الأنيقة والتجمّعات المسائية غير الرسمية، وتُقدّم الأسود بلغة نهارية بعيدة عن الطابع المسائي التقليدي. لون واحد قوي وخامة راقية يكفيان لبناء إطلالة عصرية واثقة دون الحاجة إلى نقشات أو تطريز.",
    highlights: [
      "لون أسود فحمي داكن موحّد.",
      "أكمام ثلاثة أرباع مريحة.",
      "كريب مطري بثبات ممتاز.",
    ],
    details: ["الطول: ميدي","القصة: أنيقة بأكمام ثلاثة أرباع","اللون: أسود فحمي","الخامة: كريب مطري","العناية: غسيل جاف فقط"],
    seoName: "فستان كاجوال أسود فحمي — مجموعة Noir Atelier",
    slug: "noir-atelier-zeina-فستان-أسود-فحمي",
    tags: ["كاجوال","أسود","ميدي","أكمام-ثلاثة-أرباع","كريب","محتشم","نسائي","نهاري","Noir-Atelier","Zeina","أنيق","راقي","معماري","عصري","لون-موحّد","خالد","خريف","شتاء","تجمّعات","خروجات"],
  },
};

// ── Merge base + metadata into the exported catalog ────────────────
export const products: Product[] = base.map((b): Product => {
  const m = meta[b.id];
  if (!m) throw new Error(`Missing luxury metadata for product: ${b.id}`);
  return {
    ...b,
    collection: m.collection,
    model: m.model,
    edition: EDITION,
    subtitle: m.subtitle,
    seoName: m.seoName,
    slug: m.slug,
    tags: m.tags,
    name: `${m.collection} • ${m.model} • ${m.descriptor} • ${EDITION}`,
    description: m.description,
    highlights: m.highlights,
    details: m.details,
  };
});

export const findProduct = (id: string) => products.find((p) => p.id === id);

export const collections = [
  { id: "all", name: "الكل" },
  { id: "السهرة", name: "السهرة" },
  { id: "الكاجوال", name: "الكاجوال" },
  { id: "الرسمية", name: "الرسمية" },
  { id: "المطرّزة", name: "المطرّزة" },
];
