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
  const containerRef = useRef<HTMLDivElement>(null);
  const uniteRef = useRef<HTMLElement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    uniteRef.current = Array.from(containerRef.current.querySelectorAll('.unite'));
    uniteRef.current.forEach(setActiveImage);
    setImageTitle();
  }, []);

  const setActiveImage = (el: HTMLElement) => {
    el.style.backgroundImage = `url('${images[currentIndex].url}')`;
  };

  const setImageTitle = () => {
    const gallery = containerRef.current;
    if (!gallery) return;
    gallery.setAttribute('data-subtitle', images[currentIndex].subtitle);
    gallery.setAttribute('data-title', images[currentIndex].title);
    gallery.style.setProperty('--title-y', '0');
    gallery.style.setProperty('--title-opacity', '1');
  };

  const updateGallery = (isReverse = false) => {
    const gallery = containerRef.current;
    if (!gallery) return;

    const topAnim = isReverse ? flipAnimationTopReverse : flipAnimationTop;
    const bottomAnim = isReverse ? flipAnimationBottomReverse : flipAnimationBottom;

    gallery.querySelector('.overlay-top')?.animate(topAnim, flipTiming);
    gallery.querySelector('.overlay-bottom')?.animate(bottomAnim, flipTiming);

    gallery.style.setProperty('--title-y', '-1rem');
    gallery.style.setProperty('--title-opacity', '0');
    gallery.setAttribute('data-subtitle', '');
    gallery.setAttribute('data-title', '');

    uniteRef.current.forEach((el, idx) => {
      const delay =
        (isReverse && (idx !== 1 && idx !== 2)) ||
        (!isReverse && (idx === 1 || idx === 2))
          ? FLIP_SPEED - 200
          : 0;
      setTimeout(() => setActiveImage(el), delay);
    });

    setTimeout(setImageTitle, FLIP_SPEED * 0.5);
  };

  const updateIndex = (increment: number) => {
    const newIndex = (currentIndex + increment + images.length) % images.length;
    setCurrentIndex(newIndex);
    updateGallery(increment < 0);
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
          <div
            className="relative rounded-3xl border border-white/15 bg-white/[0.04] backdrop-blur-xl p-4 md:p-6"
          >
            <div
              id="flip-gallery"
              ref={containerRef}
              className="relative w-[280px] h-[450px] md:w-[360px] md:h-[580px] text-center"
              style={{ perspective: '900px' }}
            >
              <div className="top unite bg-cover bg-no-repeat" />
              <div className="bottom unite bg-cover bg-no-repeat" />
              <div className="overlay-top unite bg-cover bg-no-repeat" />
              <div className="overlay-bottom unite bg-cover bg-no-repeat" />
            </div>

            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
              <button
                type="button"
                onClick={() => updateIndex(-1)}
                className="w-10 h-10 rounded-full border border-white/15 bg-white/[0.06] backdrop-blur-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.1] transition-all"
              >
                <ChevronRight size={18} />
              </button>
              <button
                type="button"
                onClick={() => updateIndex(1)}
                className="w-10 h-10 rounded-full border border-white/15 bg-white/[0.06] backdrop-blur-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.1] transition-all"
              >
                <ChevronLeft size={18} />
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
        #flip-gallery::before {
          content: attr(data-subtitle) "\A" attr(data-title);
          white-space: pre;
          color: rgba(255 255 255 / 0.75);
          font-size: 0.7rem;
          left: -0.5rem;
          position: absolute;
          top: calc(100% + 2.5rem);
          line-height: 1.8;
          opacity: var(--title-opacity, 0);
          transform: translateY(var(--title-y, 0));
          transition: opacity 500ms ease-in-out, transform 500ms ease-in-out;
          text-align: left;
        }
        #flip-gallery > * {
          position: absolute;
          width: 100%;
          height: 50%;
          overflow: hidden;
          background-size: 280px 450px;
        }
        @media (min-width: 600px) {
          #flip-gallery > * {
            background-size: 360px 580px;
          }
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
