import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const images = [
  { subtitle: 'الهندسية', title: 'عباية النمط الهندسي', url: '/outfits/geometric-gold-abaya-1.jpg' },
  { subtitle: 'الليلية', title: 'عباية المخمل الليلية', url: '/outfits/night-velvet-abaya.jpg' },
  { subtitle: 'الدانتيل', title: 'عباية الدانتيل السوداء', url: '/outfits/black-lace-abaya.jpg' },
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

const GALLERY_W = 393;
const GALLERY_H = 689;

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
    <div className="relative w-full h-full flex flex-col bg-black overflow-hidden">
      {/* Flip gallery */}
      <div
        id="flip-gallery"
        ref={galleryRef}
        className="relative shrink-0"
        style={{ width: GALLERY_W, height: GALLERY_H, perspective: '900px' }}
      >
        <div className="top unite bg-cover bg-no-repeat" />
        <div className="bottom unite bg-cover bg-no-repeat" />
        <div className="overlay-top unite bg-cover bg-no-repeat" />
        <div className="overlay-bottom unite bg-cover bg-no-repeat" />
      </div>

      {/* Bottom bar: text left, buttons right (RTL) */}
      <div className="flex items-center justify-between w-full px-4 py-3 shrink-0">
        <div className="text-left">
          <p className="text-sm text-ring font-semibold leading-tight">{images[currentIndex].subtitle}</p>
          <p className="text-base text-foreground/80 font-bold leading-tight">{images[currentIndex].title}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => updateIndex(-1)}
            className="w-11 h-11 rounded-full border border-white/15 bg-white/70 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-black/[0.08] transition-all"
          >
            <ChevronRight size={18} />
          </button>
          <button
            type="button"
            onClick={() => updateIndex(1)}
            className="w-11 h-11 rounded-full border border-white/15 bg-white/70 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-black/[0.08] transition-all"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>

      <style>{`
        #flip-gallery::after {
          content: '';
          position: absolute;
          background-color: black;
          width: 100%;
          height: 3px;
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
          background-size: cover;
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
