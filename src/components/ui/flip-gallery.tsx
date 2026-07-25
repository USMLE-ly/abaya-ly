import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const images = [
  { subtitle: 'مجموعة السهرة', title: 'عباية السهرة الذهبية', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4b5b3e?w=700&h=1100&fit=crop&q=80' },
  { subtitle: 'المطرّزة', title: 'عباية الياسمين المطرّزة', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&h=1100&fit=crop&q=80' },
  { subtitle: 'الكاجوال', title: 'عباية الفجر الكاجوال', url: 'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=700&h=1100&fit=crop&q=80' },
  { subtitle: 'الرسمية', title: 'عباية الملكة الرسمية', url: 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=700&h=1100&fit=crop&q=80' },
  { subtitle: 'نجمة الصحراء', title: 'عباية نجمة الصحراء', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4b5b3e?w=700&h=1100&fit=crop&q=80' },
];

const FLIP_SPEED = 750;
const flipTiming = { duration: FLIP_SPEED, iterations: 1 };

const flipAnimationTop = [
  { transform: 'rotateX(0)' },
  { transform: 'rotateX(-90deg)' },
  { transform: 'rotateX(-90deg)' }
];
const flipAnimationBottom = [
  { transform: 'rotateX(90deg)' },
  { transform: 'rotateX(90deg)' },
  { transform: 'rotateX(0)' }
];
const flipAnimationTopReverse = [
  { transform: 'rotateX(-90deg)' },
  { transform: 'rotateX(-90deg)' },
  { transform: 'rotateX(0)' }
];
const flipAnimationBottomReverse = [
  { transform: 'rotateX(0)' },
  { transform: 'rotateX(90deg)' },
  { transform: 'rotateX(90deg)' }
];

export default function FlipGallery() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const uniteRef = useRef<HTMLElement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!galleryRef.current) return;
    uniteRef.current = Array.from(galleryRef.current.querySelectorAll('.unite'));
    setAllImages(0);
  }, []);

  const setAllImages = (idx: number) => {
    uniteRef.current.forEach((el) => {
      el.style.backgroundImage = `url('${images[idx].url}')`;
    });
  };

  const showTitle = (idx: number) => {
    const g = galleryRef.current;
    if (!g) return;
    g.setAttribute('data-subtitle', images[idx].subtitle);
    g.setAttribute('data-title', images[idx].title);
    g.style.setProperty('--title-y', '0');
    g.style.setProperty('--title-opacity', '1');
  };

  const hideTitle = () => {
    const g = galleryRef.current;
    if (!g) return;
    g.style.setProperty('--title-y', '-1rem');
    g.style.setProperty('--title-opacity', '0');
    g.setAttribute('data-subtitle', '');
    g.setAttribute('data-title', '');
  };

  const updateGallery = (newIdx: number, isReverse: boolean) => {
    const g = galleryRef.current;
    if (!g) return;

    const topAnim = isReverse ? flipAnimationTopReverse : flipAnimationTop;
    const bottomAnim = isReverse ? flipAnimationBottomReverse : flipAnimationBottom;

    g.querySelector('.overlay-top')?.animate(topAnim, flipTiming);
    g.querySelector('.overlay-bottom')?.animate(bottomAnim, flipTiming);

    hideTitle();

    uniteRef.current.forEach((el, i) => {
      const delay =
        (isReverse && (i !== 1 && i !== 2)) ||
        (!isReverse && (i === 1 || i === 2))
          ? FLIP_SPEED - 200
          : 0;
      setTimeout(() => {
        el.style.backgroundImage = `url('${images[newIdx].url}')`;
      }, delay);
    });

    setTimeout(() => showTitle(newIdx), FLIP_SPEED * 0.5);
  };

  const updateIndex = (increment: number) => {
    const newIdx = (indexRef.current + increment + images.length) % images.length;
    indexRef.current = newIdx;
    setCurrentIndex(newIdx);
    updateGallery(newIdx, increment < 0);
  };

  return (
    <div className="relative w-full py-16 md:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            تشكيلتنا <span className="text-brand">المميزة</span>
          </h2>
          <p className="text-sm text-white/50 max-w-lg mx-auto">
            اكتشفي أحدث تصميماتنا من العبايات الفاخرة
          </p>
        </div>

        <div className="flex justify-center">
          {/* Glass frame */}
          <div className="relative rounded-3xl border border-white/15 bg-white/[0.04] backdrop-blur-xl p-4 md:p-6 pb-16 md:pb-20">
            {/* Flip gallery */}
            <div
              id="flip-gallery"
              ref={galleryRef}
              className="relative w-[280px] h-[450px] md:w-[360px] md:h-[580px]"
              style={{ perspective: '900px' }}
            >
              <div className="top unite bg-cover bg-no-repeat" />
              <div className="bottom unite bg-cover bg-no-repeat" />
              <div className="overlay-top unite bg-cover bg-no-repeat" />
              <div className="overlay-bottom unite bg-cover bg-no-repeat" />
            </div>

            {/* Title below gallery, inside frame */}
            <div
              id="flip-title"
              className="absolute left-4 md:left-6 text-left"
              style={{
                bottom: '1rem',
                opacity: 1,
                transition: 'opacity 500ms ease-in-out, transform 500ms ease-in-out',
              }}
            >
              <p
                className="text-[11px] text-brand font-medium mb-0.5"
                style={{
                  opacity: galleryRef.current ? Number(getComputedStyle(galleryRef.current).getPropertyValue('--title-opacity')) || 0 : 0,
                }}
              >
                {images[currentIndex].subtitle}
              </p>
              <p className="text-xs text-white/70 font-medium">
                {images[currentIndex].title}
              </p>
            </div>

            {/* Nav buttons — inside frame, bottom-right */}
            <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 flex gap-2">
              <button
                type="button"
                onClick={() => updateIndex(-1)}
                className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.06] backdrop-blur-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.1] transition-all"
              >
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => updateIndex(1)}
                className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.06] backdrop-blur-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.1] transition-all"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        #flip-gallery::after {
          content: '';
          position: absolute;
          background-color: black;
          width: 100%;
          height: 4px;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          z-index: 10;
        }
        #flip-gallery > * {
          position: absolute;
          width: 100%;
          height: 50%;
          overflow: hidden;
          background-size: 100% 200%;
        }
        .top, .overlay-top {
          top: 0;
          transform-origin: bottom;
          background-position: top;
        }
        .bottom, .overlay-bottom {
          bottom: 0;
          transform-origin: top;
          background-position: bottom;
        }
      `}</style>
    </div>
  );
}
