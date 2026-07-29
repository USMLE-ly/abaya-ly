# لوحة تحكم Nadine الإدارية

## ما استخرجته فعليًا من الفيجما

الملفان `.fig` ثنائيان ولا يمكن فتحهما، لكن مرافقيهما `.design.json` يحتويان على المواصفات الحقيقية:

**MasterPOS** — هيكل الصفحات (Light + Dark)، بثلاث نسخ لكل صفحة:
- Desktop 1905px · Tablet 800px · Mobile 390px
- الصفحات: Dashboard، Products، Add New Product، Categories، Add New Category (+30 إطارًا إضافيًا في القائمة المقطوعة)
- Sidebar: 345px عرض، نسختان Light/Dark
- اللون المميز الأخضر `#CDFF65` والثانوي `#4F56D3` — سيُستبدلان بالوردي `#c42855`
- الرمادي: `#FBFBFB` خلفية، `#515161`/`#878787`/`#B2B3B9` نصوص، `#ECECEB` حدود
- الخط الأساسي في التصميم هو **Cairo** فعلًا (ExtraBold 25، Bold 16/20/24، Regular 14) — سنستبدله بـ Tajawal بنفس المقاييس

**Elstar** — مكتبة المكوّنات: Alert, Avatar, Button, Badge, Calendar, Card, Checkbox, DatePicker, Dialog, Drawer, DropdownMenu, Heading, Input, InputGroup, MenuItem, Pagination, Progress + 5 تخطيطات (Classic / Modern / Stacked Side / Decked / Simple). سلم الرمادي: `#F9FAFB #F3F4F6 #E5E7EB #9CA3AF #6B7280 #4B5563 #374151 #1F2937 #111827 #0F172A`. المقاييس: 14/100%، 14/24، 12/16، 18/28، 16/24.

**الحدّ الوارد:** بدون رندر بصري لا يمكنني ضمان "pixel-perfect" حرفيًا. سأبني على القيم المستخرجة (المقاسات، السلم اللوني، سلم الخط، بنية الصفحات، Sidebar 345px، breakpoints 390/800/1905) — وهي دقيقة. أي تفصيل بصري دقيق يمكن ضبطه بعدها بلقطة شاشة من الفيجما.

## القرارات المعمارية

**المكان:** داخل نفس المشروع تحت `/admin/*`. سبب: الـ APIs موجودة هنا (`api/*.mjs` على Vercel)، فلا CORS ولا نشر ثانٍ. لاحقًا يمكن توجيه `admin.nadine.luxor.ly` لنفس النشر.

**فجوة في الـ API:** لا يوجد endpoint يسرد كل الطلبات — `track-order` يعيد طلبًا واحدًا فقط بعد التحقق من الهاتف. لوحة التحكم مستحيلة بدونه. سأضيف `GET /api/admin/orders` فقط (قراءة من نفس Edge Config، محمي بهيدر كلمة المرور). لن أمسّ `POST /api/order` ولا `POST /api/update-status` ولا `GET /api/track-order` إطلاقًا.

## نظام التصميم

طبقة `admin` منفصلة داخل `src/index.css` لا تكسر تصميم المتجر:

```
--admin-brand:        #c42855   (بديل الأخضر #CDFF65)
--admin-brand-hover:  #a81f47
--admin-brand-subtle: #fdf2f5
--admin-bg:           #FBFBFB
--admin-surface:      #FFFFFF
--admin-border:       #ECECEB
--admin-text:         #202020
--admin-text-2:       #515161
--admin-text-3:       #878787
```
الحالات: pending `#F5A524` · processing `#4892FE` · waiting_shipping `#8F8F8F` · shipped `#4F56D3` · delivered `#89D233`
الخط: Tajawal · `dir="rtl"` على غلاف اللوحة · سلم Elster للنوع.

## الصفحات

```
/admin/login        كلمة مرور واحدة، sessionStorage، تحمي كل ما تحت /admin
/admin              نظرة عامة تنفيذية
/admin/orders       جدول الطلبات
/admin/orders/:id   تفاصيل الطلب
/admin/products     كتالوج من src/data/products.ts (قراءة فقط)
/admin/analytics    تحليلات
/admin/settings     إعدادات
```

**النظرة العامة:** بطاقات إحصائية (إجمالي / قيد الانتظار / تجهيز / انتظار شحن / تم التوصيل / اليوم / الأسبوع / الشهر)، مخطط اتجاه، توزيع الحالات (دائري)، أحدث الطلبات، خط زمني للنشاط، بحث وإجراءات سريعة.

**جدول الطلبات:** رقم الطلب · العميل · الهاتف · المدينة · كود المنتج · الاسم · اللون · المقاس · الحالة · التاريخ · آخر تحديث · إجراءات. بحث، فرز، فلترة بالحالة/المدينة/التاريخ، ترقيم، تحديد جماعي، تصدير CSV، وعلى الجوال تتحول لبطاقات (كما في إطار 390px).

**تفاصيل الطلب:** كل الحقول + خط زمني للحالة + تحديث الحالة (يستدعي `POST /api/update-status` بنفس الحمولة) + نسخ رقم الطلب + طباعة.

**التحليلات:** طلبات يومية/أسبوعية/شهرية، أفضل المنتجات، المدن، متوسط زمن المعالجة، نسبة التسليم، نسبة الانتظار.

**التنبيهات:** طلبات معلّقة أكثر من 24 ساعة، طلبات جديدة، تغيّرات الحالة، أخطاء.

## التفاصيل التقنية

- حزم جديدة: `@tanstack/react-query`، `recharts`
- `src/admin/` مستقل: `layout/` (Sidebar 345px قابل للطي + Topbar + بحث + تنبيهات)، `components/` (StatCard, DataTable, StatusBadge, Chart wrappers, Pagination, Drawer, Dialog — مطابقة لمكوّنات Elstar)، `pages/`، `lib/api.ts`، `lib/status.ts`
- مسارات `/admin/*` كلها `React.lazy` فلا تزيد حجم حزمة المتجر
- كل الأنواع من `Order` المذكور في الطلب، بدون `any`
- Framer Motion لانتقالات الصفحات والبطاقات
- breakpoints مطابقة للفيجما: `<640` جوال، `640–1024` تابلت، `>1024` سطح مكتب

## ما لن أفعله

لن أنشئ باكند جديدًا، ولن أغيّر حمولات أو ردود الـ APIs الثلاثة القائمة، ولن ألمس صفحات المتجر الحالية أو مكوّنات VELAR.
