import { Link } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Badge, Tag, Alert, Card, Button, Input, Textarea, Select, Checkbox, Radio, Switch, Avatar, Divider, Progress, Accordion, Tabs, Tooltip, Chip, Spinner } from "@/components/velar";
import { usePageMeta } from "@/lib/usePageMeta";
import ProgressBarDemo from "@/components/ui/progress-bar-demo";
import { OrderSuccessCard } from "@/components/ui/order-success-card";
import { AuthenticatedProductCard } from "@/components/ui/authenticated-product-card";
import { LuxuryTimeline } from "@/components/ui/luxury-timeline";
import { pieceBarcode } from "@/lib/barcode";
import { Clock, Package, PackageCheck, Truck, MapPin } from "lucide-react";

const RAMPS = ["strawberry","bubblegum","cotton","lavender","lemon","mint","peach","sky"] as const;
const STEPS = [50,100,200,300,400,500,600,700,800,900,950];

export default function DesignSystem() {
  usePageMeta("نظام التصميم");
  return (
    <div className="min-h-screen bg-canvas text-fg pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6 space-y-16">
        <header>
          <p className="text-xs uppercase tracking-wider text-fg-tertiary">VELAR</p>
          <h1 className="font-display text-5xl font-bold mt-2">Design System</h1>
          <p className="mt-3 text-fg-secondary max-w-2xl">Fraunces + Inter, 8 color ramps × 11 steps, Light / Dark / High-Contrast, and a full primitive library — ported from the VELAR Figma library.</p>
          <div className="mt-4"><Link to="/" className="text-brand text-sm underline">← Back home</Link></div>
        </header>

        <section>
          <h2 className="font-display text-2xl font-semibold mb-4">Color</h2>
          <div className="space-y-3">
            {RAMPS.map((r) => (
              <div key={r} className="flex items-center gap-3">
                <div className="w-24 text-xs uppercase tracking-wider text-fg-tertiary">{r}</div>
                <div className="flex-1 grid grid-cols-11 gap-1">
                  {STEPS.map((s) => (
                    <div key={s} className={`h-10 rounded-md bg-${r}-${s} flex items-end justify-center pb-0.5 text-[9px] font-mono text-fg/60`}>{s}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold mb-4">Typography</h2>
          <Card padding="lg" className="space-y-3">
            <div className="font-display text-6xl">Display 6xl</div>
            <div className="font-display text-4xl">Display 4xl</div>
            <div className="text-2xl">Body 2xl</div>
            <div className="text-lg">Body lg</div>
            <div className="text-base">Body base — Fraunces headings, Inter body.</div>
            <div className="text-sm text-fg-secondary">Body sm secondary</div>
            <div className="font-mono text-sm">const font = "JetBrains Mono";</div>
          </Card>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold mb-4">Buttons</h2>
          <Card padding="lg" className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="tertiary">Tertiary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button>With icon</Button>
            </div>
          </Card>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold mb-4">Badges & Tags</h2>
          <Card padding="lg" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(["brand","success","info","warning","danger","neutral"] as const).map((t) => (
                <Badge key={t} tone={t}>{t}</Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(["brand","success","info","warning","danger","neutral"] as const).map((t) => (
                <Badge key={t} tone={t} appearance="subtle">{t}</Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(["brand","success","info","warning","danger","neutral"] as const).map((t) => (
                <Tag key={t} tone={t} onRemove={() => {}}>{t}</Tag>
              ))}
            </div>
          </Card>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold mb-4">Alerts</h2>
          <div className="space-y-3">
            <Alert tone="info" title="Heads up">Your order will ship within 2 business days.</Alert>
            <Alert tone="success" title="Payment received" onDismiss={() => {}}>Thank you for your purchase.</Alert>
            <Alert tone="warning" title="Low stock">Only 2 items remain in this size.</Alert>
            <Alert tone="danger" title="Something went wrong">We couldn't process your request.</Alert>
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold mb-4">Forms</h2>
          <Card padding="lg" className="grid md:grid-cols-2 gap-4">
            <Input label="Full name" placeholder="Amina Okoro" hint="As on your ID" required />
            <Input label="Email" type="email" placeholder="you@velar.co" error="Enter a valid email" />
            <Select label="Country"><option>Libya</option><option>Tunisia</option><option>Egypt</option></Select>
            <Textarea label="Note" placeholder="Anything else?" />
            <div className="flex flex-col gap-2">
              <Checkbox label="I agree to the terms" sublabel="See privacy policy" />
              <Checkbox label="Indeterminate" indeterminate />
              <Radio name="ship" label="Standard shipping" />
              <Radio name="ship" label="Express shipping" defaultChecked />
              <Switch label="Enable notifications" defaultChecked />
            </div>
            <div className="flex flex-col gap-3 justify-center">
              <Progress value={35} />
              <Progress value={70} tone="success" />
              <Progress value={90} tone="warning" />
            </div>
          </Card>

          <Card padding="lg" className="mt-4">
            <p className="text-xs uppercase tracking-wider text-fg-tertiary mb-3">UI · ProgressBar (motion)</p>
            <ProgressBarDemo />
          </Card>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold mb-4">Avatars, Chips, Tooltip, Spinner</h2>
          <Card padding="lg" className="flex flex-wrap items-center gap-4">
            <Avatar size={24} initials="AK" />
            <Avatar size={32} initials="SH" status="online" />
            <Avatar size={40} status="busy" />
            <Avatar size={48} initials="DR" status="away" />
            <Avatar size={56} initials="JR" />
            <Avatar size={64} initials="MW" status="offline" />
            <Divider orientation="vertical" />
            <Chip>Filter</Chip>
            <Chip selected>Active</Chip>
            <Tooltip content="Helpful hint"><Button variant="tertiary" size="sm">Hover me</Button></Tooltip>
            <Spinner size={20} />
          </Card>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold mb-4">Tabs</h2>
          <Tabs items={[
            { id: "a", label: "Overview", content: <Card padding="lg">Overview content</Card> },
            { id: "b", label: "Details",  content: <Card padding="lg">Details content</Card> },
            { id: "c", label: "Reviews",  content: <Card padding="lg">Reviews content</Card> },
          ]} />
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold mb-4">Accordion</h2>
          <Accordion items={[
            { id: "1", title: "What is VELAR?", content: "A complete Figma design system, now ported to the site." },
            { id: "2", title: "Is it themeable?", content: "Yes — Light, Dark, and High-Contrast modes are built in." },
            { id: "3", title: "Which fonts does it use?", content: "Fraunces for display, Inter for body, JetBrains Mono for code." },
          ]} />
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold mb-4">Elevation</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(["flat","subtle","raised","overlay","modal","toast"] as const).map((e) => (
              <Card key={e} elevation={e} padding="lg" className="text-center">
                <div className="text-xs uppercase tracking-wider text-fg-tertiary">elevation</div>
                <div className="font-display text-xl mt-1">{e}</div>
              </Card>
            ))}
          </div>

        <section>
          <h2 className="font-display text-2xl font-semibold mb-4">Luxury Order Experience</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-[#f7f3ea] p-6">
              <p className="text-xs font-bold text-brand mb-4">OrderSuccessCard</p>
              <OrderSuccessCard
                orderId="NAD-W75CFP"
                customerName="نور الهدى"
                date={new Date().toLocaleDateString("ar-LY", { year: "numeric", month: "long", day: "numeric" })}
                pieceCount={2}
                barcodeValue={pieceBarcode({ orderId: "NAD-W75CFP", sku: "LM26-01", pieceIndex: 1 })}
                trackHref="/track-order"
                onContinue={() => {}}
                onCertificate={() => {}}
                certificateAvailable
                cutouts
              />
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-brand mb-3">AuthenticatedProductCard</p>
                <AuthenticatedProductCard
                  piece={{
                    name: "فستان السهرة الذهبية",
                    code: "LM26-01",
                    collection: "Noir Atelier",
                    color: "ذهبي",
                    size: "M",
                    edition: "إصدار 2026",
                    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&q=60",
                  }}
                  pieceNumber={1}
                  barcodeValue={pieceBarcode({ orderId: "NAD-W75CFP", sku: "LM26-01", pieceIndex: 1 })}
                />
              </div>
              <div>
                <p className="text-xs font-bold text-brand mb-3">LuxuryTimeline</p>
                <div className="rounded-3xl border border-[#c9a25e66] bg-white p-5">
                  <LuxuryTimeline
                    stages={[
                      { key: "pending", icon: Clock, label: "تأكيد الطلب", caption: "تم تأكيد الطلب" },
                      { key: "processing", icon: Package, label: "جاري التجهيز" },
                      { key: "waiting_shipping", icon: PackageCheck, label: "في انتظار الشحن" },
                      { key: "shipped", icon: Truck, label: "جاري الشحن" },
                      { key: "delivered", icon: MapPin, label: "تم التوصيل" },
                    ]}
                    currentIndex={1}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        </section>
      </div>
    </div>
  );
}
