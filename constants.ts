
import { AdsSettings, Category, NailDesign, SiteSettings, AffiliateProduct } from './types';

export const SITE_SETTINGS: SiteSettings = {
  siteName: 'naildesigns.art',
  siteDescription: 'Premium Nail Art Gallery with Pinterest-style masonry layout.',
  logoText: 'ND.art',
  footerText: '© 2025 NailDesigns.art - Premium Inspiration Gallery.',
  socials: {
    pinterest: '#',
    instagram: '#'
  },
  globalSeo: {
    metaTitle: 'Nail Designs Art - Top 2025 Trends',
    metaDescription: 'Discover the best nail art designs, trends, and tutorials.'
  }
};

export const ADS_SETTINGS: AdsSettings = {
  mode: 'LIVE',
  showAds: true,
  publisherId: 'ca-pub-0000000000000000',
  
  gridSlotId: 'grid-slot-default',
  gridCode: '<!-- Grid Ad Code -->',
  gridStartAfter: 4,
  gridInterval: 6,
  gridMaxPerPage: 8,
  gridShowOnMobile: true,
  gridShowOnDesktop: true,

  headerEnabled: true,
  headerSlotId: 'header-slot-default',
  headerCode: '<!-- Header Ad Code -->',
  
  footerEnabled: true,
  footerSlotId: 'footer-slot-default',
  footerCode: '<!-- Footer Ad Code -->',
  
  sidebarEnabled: true,
  sidebarSlotId: 'sidebar-slot-default',
  sidebarCode: '<!-- Sidebar Ad Code -->',

  postAfterTitleEnabled: true,
  postAfterTitleCode: '<!-- Post Title Ad Code -->',

  postAfterFirstImageEnabled: true,
  postAfterFirstImageCode: '<!-- Post After Image Ad Code -->',

  postBetweenImagesEnabled: true,
  postBetweenImagesCode: '<!-- Post Between Images Ad Code -->',
  postBetweenImagesInterval: 1,
  postMaxAds: 3,
  
  postAfterContentEnabled: true,
  postAfterContentCode: '<!-- Post Content Ad Code -->',

  affiliateBoxEnabled: true,
  affiliateTitleText: "Shop the Look",
  affiliateButtonText: "Check Price"
};

export const CATEGORIES: Category[] = [
  { name: 'French Tip', slug: 'french-tip', iconColor: 'bg-pink-100' },
  { name: 'Simple Nails', slug: 'simple', iconColor: 'bg-gray-100' },
  { name: 'Short Nails', slug: 'short', iconColor: 'bg-red-50' },
  { name: 'Nude Nails', slug: 'nude', iconColor: 'bg-orange-50' },
  { name: 'Holiday', slug: 'holiday', iconColor: 'bg-green-100' },
  { name: 'Glitter', slug: 'glitter', iconColor: 'bg-purple-100' },
];

const generateMockDesigns = (count: number): NailDesign[] => {
  return Array.from({ length: count }).map((_, i) => {
    const cat = CATEGORIES[i % CATEGORIES.length];
    const isTall = i % 3 === 0;
    return {
      id: `mock-${i}`,
      title: `${cat.name} Masterpiece #${i + 1}`,
      slug: `${cat.slug}-masterpiece-${i + 1}`,
      status: 'published',
      mainImage: `https://picsum.photos/seed/nail-art-${i}/600/${isTall ? 900 : 800}`,
      width: 600,
      height: isTall ? 900 : 800,
      altText: `${cat.name} design idea`,
      shortDescription: `A stunning ${cat.name} inspiration for your next professional salon visit. Get the latest 2025 look now.`,
      longDescription: `This design represents the absolute latest in ${cat.name} nail art trends. It features precision lines, high-gloss finish, and professional-grade materials. To recreate this at home, you will need a base coat, the specific colors listed, and a high-quality UV top coat. This look is trending heavily on Instagram and Pinterest for the upcoming season. Highly recommended for weddings, office parties, and casual chic outings.`,
      category: cat.slug,
      colors: [],
      length: 'medium',
      shape: 'almond',
      styleType: 'classy',
      affiliateSectionEnabled: true,
      affiliateProducts: [],
      seo: {
          metaTitle: `${cat.name} Nails - Best of 2025`,
          metaDescription: `See the best ${cat.name} nail designs. High quality inspiration.`
      },
      publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
      focusKeywords: `${cat.name}, nail art 2025, trendy nails`
    };
  });
};

export const DESIGNS: NailDesign[] = generateMockDesigns(50);
