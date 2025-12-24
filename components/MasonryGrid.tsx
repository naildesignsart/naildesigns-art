
import React, { useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { NailDesign } from '../types';
import { useAds } from './AdsContext';
import AdUnit from './AdUnit';
import LazyImage from './LazyImage';

interface MasonryGridProps {
  designs: NailDesign[];
  loadMore?: () => void;
  hasMore?: boolean;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ designs, loadMore, hasMore }) => {
  const observerTarget = useRef<HTMLDivElement>(null);
  const { settings } = useAds();

  // Advanced Ad Injection Logic
  const itemsWithAds = useMemo(() => {
    // Return original if ads are disabled or settings missing
    if (!settings.showAds) return designs;

    const combined: (NailDesign | { isAd: true; id: string })[] = [];
    let adsInserted = 0;
    
    designs.forEach((design, index) => {
      combined.push(design);
      
      // Card Index (1-based for easier logic)
      const currentCount = index + 1;
      
      // Stop if max ads reached
      if (adsInserted >= settings.gridMaxPerPage) return;

      let shouldInsert = false;

      // 1. Start After Logic
      if (currentCount === settings.gridStartAfter) {
          shouldInsert = true;
      }
      
      // 2. Interval Logic (only if passed startAfter)
      else if (currentCount > settings.gridStartAfter) {
          // Calculate items *since* the start threshold
          const countAfterStart = currentCount - settings.gridStartAfter;
          if (countAfterStart % settings.gridInterval === 0) {
              shouldInsert = true;
          }
      }

      if (shouldInsert) {
        combined.push({ isAd: true, id: `grid-ad-${adsInserted}` });
        adsInserted++;
      }
    });

    return combined;
  }, [designs, settings]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && loadMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' } 
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadMore]);

  return (
    <div className="w-full">
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 p-1">
        {itemsWithAds.map((item, idx) => {
          if ('isAd' in item) {
            return (
              <div key={item.id} className="break-inside-avoid mb-4">
                <AdUnit type="grid" className="w-full h-auto min-h-[280px] rounded-2xl shadow-sm" />
              </div>
            );
          }

          const design = item as NailDesign;
          return (
            <Link 
              key={design.id} 
              to={`/nail-designs/${design.slug}`} 
              className="block break-inside-avoid group relative mb-4 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-gray-100 border border-gray-100"
            >
              <div style={{ aspectRatio: `${design.width || 600}/${design.height || 800}` }}>
                <LazyImage
                  src={design.mainImage}
                  alt={design.altText || design.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                <div>
                   <h3 className="text-white font-bold text-sm leading-tight mb-1">{design.title}</h3>
                   <span className="text-[10px] font-black text-pink-300 uppercase tracking-wider">{design.category}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {hasMore && (
        <div ref={observerTarget} className="mt-8 flex justify-center py-8">
           <div className="flex space-x-2 animate-pulse">
              <div className="w-2.5 h-2.5 bg-pink-400 rounded-full"></div>
              <div className="w-2.5 h-2.5 bg-pink-400 rounded-full"></div>
              <div className="w-2.5 h-2.5 bg-pink-400 rounded-full"></div>
           </div>
        </div>
      )}
      
      {!hasMore && designs.length > 0 && (
        <div className="mt-12 text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] pb-8">
          End of Collection
        </div>
      )}
    </div>
  );
};

export default MasonryGrid;
