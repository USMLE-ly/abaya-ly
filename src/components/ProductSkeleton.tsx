import { motion } from "framer-motion";

function ShimmerBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-sunken ${className}`}
      style={{ background: "linear-gradient(90deg, #f5f1ec 25%, #e9e2d9 50%, #f5f1ec 75%)", backgroundSize: "200% 100%" }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
          backgroundSize: "200% 100%",
        }}
      />
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="min-h-screen">
      <section className="pt-24 pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Breadcrumb */}
          <ShimmerBar className="h-4 w-48 mb-6" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image skeleton */}
            <div className="aspect-[3/4] rounded-3xl overflow-hidden">
              <ShimmerBar className="w-full h-full" />
            </div>

            {/* Info skeleton */}
            <div className="space-y-6">
              <ShimmerBar className="h-4 w-24" />
              <ShimmerBar className="h-8 w-3/4" />
              <ShimmerBar className="h-4 w-1/2" />
              <ShimmerBar className="h-6 w-32" />
              <div className="flex gap-3">
                <ShimmerBar className="h-10 w-10 rounded-full" />
                <ShimmerBar className="h-10 w-10 rounded-full" />
                <ShimmerBar className="h-10 w-10 rounded-full" />
              </div>
              <ShimmerBar className="h-6 w-full" />
              <ShimmerBar className="h-6 w-full" />
              <ShimmerBar className="h-6 w-3/4" />
              <ShimmerBar className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
