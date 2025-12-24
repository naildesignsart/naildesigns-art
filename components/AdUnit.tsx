
import React, { useEffect, useRef } from 'react';
import { useAds } from './AdsContext';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdUnitProps {
  type: 'header' | 'footer' | 'in-feed' | 'sidebar' | 'grid' | 'post-title' | 'post-image' | 'post-content';
  className?: string;
}

const AdUnit: React.FC<AdUnitProps> = ({ type, className = '' }) => {
  const { settings } = useAds();
  const adRef = useRef<HTMLDivElement>(null);

  if (!settings.showAds) return null;

  // Check specific enablement
  if (type === 'header' && !settings.headerEnabled) return null;
  if (type === 'footer' && !settings.footerEnabled) return null;
  if (type === 'sidebar' && !settings.sidebarEnabled) return null;
  if (type === 'post-title' && !settings.postAfterTitleEnabled) return null;
  if (type === 'post-image' && !settings.postAfterFirstImageEnabled) return null;
  if (type === 'post-content' && !settings.postAfterContentEnabled) return null;
  
  const isMobile = window.innerWidth < 768;

  // Responsive logic for Grid/Feed ads
  if (type === 'grid' || type === 'in-feed') {
      if (isMobile && !settings.gridShowOnMobile) return null;
      if (!isMobile && !settings.gridShowOnDesktop) return null;
  }

  // Get raw code if available
  const getRawCode = () => {
    switch(type) {
        case 'header': return settings.headerCode;
        case 'footer': return settings.footerCode;
        case 'sidebar': return settings.sidebarCode;
        case 'in-feed':
        case 'grid': return settings.gridCode;
        case 'post-title': return settings.postAfterTitleCode;
        case 'post-image': return settings.postAfterFirstImageCode;
        case 'post-content': return settings.postAfterContentCode;
        default: return '';
    }
  };

  const getSlotId = () => {
    switch(type) {
        case 'header': return settings.headerSlotId;
        case 'footer': return settings.footerSlotId;
        case 'sidebar': return settings.sidebarSlotId;
        case 'in-feed':
        case 'grid': return settings.gridSlotId;
        default: return '';
    }
  };

  const rawCode = getRawCode();
  const slotId = getSlotId();
  const publisherId = settings.publisherId || 'ca-pub-0000000000000000';

  // Always attempt to inject if we have code or ID
  useEffect(() => {
    if (adRef.current) {
      if (rawCode && rawCode.length > 10) {
          // Inject raw code (e.g. script + ins)
          try {
            const range = document.createRange();
            range.selectNode(adRef.current);
            const documentFragment = range.createContextualFragment(rawCode);
            adRef.current.innerHTML = '';
            adRef.current.appendChild(documentFragment);
          } catch(e) {
            console.error("Ad injection error", e);
          }
      } else if (slotId) {
          // Standard AdSense injection
          try {
             (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch (e) { console.error('AdSense push error', e); }
      }
    }
  }, [rawCode, slotId]);

  if (rawCode && rawCode.length > 10) {
      return <div ref={adRef} className={`ad-unit-raw ${className}`}></div>;
  }
  
  // Standard AdSense Container
  return (
    <div className={`ad-container overflow-hidden bg-transparent flex justify-center ${className}`}>
         <ins className="adsbygoogle"
             style={{ display: 'block', width: '100%' }}
             data-ad-client={publisherId}
             data-ad-slot={slotId}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
    </div>
  );
};

export default AdUnit;
