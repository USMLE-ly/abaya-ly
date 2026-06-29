import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gold">٤٠٤</h1>
        <h2 className="mt-4 text-xl font-semibold text-cream">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-warm">
          الصفحة التي تبحثين عنها لم تعد متوفرة أو تم نقلها.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:brightness-110"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-cream">حدث خطأ غير متوقع</h1>
        <p className="mt-2 text-sm text-warm">حاولي مرة أخرى أو عودي للرئيسية.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink hover:brightness-110"
          >
            إعادة المحاولة
          </button>
          <a
            href="/"
            className="rounded-full border border-gold/40 px-6 py-3 text-sm font-semibold text-gold hover:bg-gold hover:text-ink transition"
          >
            الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "الملكة | بيت العباءات الفاخرة في ليبيا" },
      { name: "description", content: "عبايات فاخرة، تطريز يدوي، وتفصيل حسب الطلب — صُنعت لكل امرأة ليبية تستحق الأفضل." },
      { name: "author", content: "الملكة" },
      { property: "og:title", content: "الملكة | بيت العباءات الفاخرة في ليبيا" },
      { property: "og:description", content: "عبايات فاخرة، تطريز يدوي، وتفصيل حسب الطلب — صُنعت لكل امرأة ليبية تستحق الأفضل." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "الملكة | بيت العباءات الفاخرة في ليبيا" },
      { name: "twitter:description", content: "عبايات فاخرة، تطريز يدوي، وتفصيل حسب الطلب — صُنعت لكل امرأة ليبية تستحق الأفضل." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/6cfadGHZlYg2VSOE8uWb5asWHS03/social-images/social-1782768791598-1000053260.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/6cfadGHZlYg2VSOE8uWb5asWHS03/social-images/social-1782768791598-1000053260.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body className="bg-ink text-cream font-sans antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
