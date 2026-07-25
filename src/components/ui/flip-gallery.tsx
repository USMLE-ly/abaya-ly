import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const images = [
  { title: 'عباية السهرة الذهبية', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4b5b3e?w=600&h=1000&fit=crop&q=80' },
  { title: 'عباية الياسمين المطرّزة', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=1000&fit=crop&q=80' },
  { title: 'عباية الفجر الكاجوال', url: 'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=600&h=1000&fit=crop&q=80' },
  { title: 'عباية الملكة الرسمية', url: 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=600&h=1000&fit=crop&q=80' },
  { title: 'عباية نجمة الصحراء', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4b5b3e?w=600&h=1000&fit=crop&q=80' },
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
    defineFirstImg();
  }, []);

  const defineFirstImg = () => {
    uniteRef.current.forEach(setActiveImage);
    setImageTitle();
  };

  const setActiveImage = (el: HTMLElement) => {
    el.style.backgroundImage = `url('${images[currentIndex].url}')`;
  };

  const setImageTitle = () => {
    const gallery = containerRef.current;
    if (!gallery) return;
    gallery.setAttribute('data-title', images[currentIndex].title);
    gallery.style.setProperty('--title-y', '0');
    gallery.style.setProperty('--title-opacity', '1');
  };

  const updateGallery = (nextIndex: number, isReverse = false) => {
    const gallery = containerRef.current;
    if (!gallery) return;

    const topAnim = isReverse ? flipAnimationTopReverse : flipAnimationTop;
    const bottomAnim = isReverse ? flipAnimationBottomReverse : flipAnimationBottom;

    gallery.querySelector('.overlay-top')?.animate(topAnim, flipTiming);
    gallery.querySelector('.overlay-bottom')?.animate(bottomAnim, flipTiming);

    gallery.style.setProperty('--title-y', '-1rem');
    gallery.style.setProperty('--title-opacity', '0');
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
    const isReverse = increment < 0;
    setCurrentIndex(newIndex);
    updateGallery(newIndex, isReverse);
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
            className="relative bg-white/10 border border-white/25 p-2 rounded-2xl"
            style={{ '--gallery-bg-color': 'rgba(255 255 255 / 0.075)' } as React.CSSProperties}
          >
            <div
              id="flip-gallery"
              ref={containerRef}
              className="relative w-[240px] h-[400px] md:w-[300px] md:h-[500px] text-center"
              style={{ perspective: '800px' }}
            >
              <div className="top unite bg-cover bg-no-repeat" />
              <div className="bottom unite bg-cover bg-no-repeat" />
              <div className="overlay-top unite bg-cover bg-no-repeat" />
              <div className="overlay-bottom unite bg-cover bg-no-repeat" />
            </div>

            <div className="absolute top-full right-0 mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => updateIndex(-1)}
                className="text-white opacity-75 hover:opacity-100 hover:scale-125 transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => updateIndex(1)}
                className="text-white opacity-75 hover:opacity-100 hover:scale-125 transition"
              >
                <ChevronRight size={20} />
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
        }
        #flip-gallery::before {
          content: attr(data-title);
          color: rgba(255 255 255 / 0.75);
          font-size: 0.75rem;
          left: -0.5rem;
          position: absolute;
          top: calc(100% + 1rem);
          line-height: 2;
          opacity: var(--title-opacity, 0);
          transform: translateY(var(--title-y, 0));
          transition: opacity 500ms ease-in-out, transform 500ms ease-in-out;
        }
        #flip-gallery > * {
          position: absolute;
          width: 100%;
          height: 50%;
          overflow: hidden;
          background-size: 240px 400px;
        }
        @media (min-width: 600px) {
          #flip-gallery > * {
            background-size: 300px 500px;
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
