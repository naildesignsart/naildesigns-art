
export type NailLength = 'short' | 'medium' | 'long';
export type NailShape = 'coffin' | 'almond' | 'square' | 'stiletto' | 'oval';
export type StyleType = 'classy' | 'bold' | 'bridal' | 'office' | 'casual' | 'minimal';
export type PostStatus = 'draft' | 'published';

export interface Category {
  name: string;
  slug: string;
  description?: string;
  iconColor?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface AffiliateProduct {
  id: string;
  name: string;
  image: string; // URL
  type: 'polish' | 'tool' | 'press-on' | 'top-coat';
  brand: string;
  price?: string;
  affiliateUrl: string;
  ctaText?: string; // e.g., "Buy Now"
}

export interface SEOConfig {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  ogImage?: string;
}

export interface NailDesign {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  
  // Image System (URL Based)
  mainImage: string; // URL
  altText: string;
  width: number;
  height: number;
  galleryImages?: string[]; // Additional Image URLs
  
  // Content
  shortDescription: string;
  longDescription: string;
  category: string;
  length: NailLength;
  shape: NailShape;
  styleType: StyleType;
  
  // Affiliate
  affiliateSectionEnabled: boolean;
  affiliateProducts: AffiliateProduct[];
  
  // SEO
  seo: SEOConfig;
  focusKeywords?: string;
  
  publishedAt: string;
  
  // Legacy support (to be deprecated)
  colors: string[];
}

export interface AdsSettings {
  // Global
  mode: 'MOCK' | 'LIVE';
  showAds: boolean;
  publisherId: string;
  scriptUrl?: string; // For raw script injection
  
  // Feed/Grid
  gridSlotId: string;
  gridCode: string;
  gridStartAfter: number;
  gridInterval: number;
  gridMaxPerPage: number;
  gridShowOnMobile: boolean;
  gridShowOnDesktop: boolean;

  // Static Placements
  headerEnabled: boolean;
  headerSlotId: string;
  headerCode: string;
  
  footerEnabled: boolean;
  footerSlotId: string;
  footerCode: string;
  
  sidebarEnabled: boolean;
  sidebarSlotId: string;
  sidebarCode: string;

  // Single Post Ads
  postAfterTitleEnabled: boolean;
  postAfterTitleCode: string;
  
  postAfterFirstImageEnabled: boolean;
  postAfterFirstImageCode: string;

  postBetweenImagesEnabled: boolean;
  postBetweenImagesCode: string;
  postBetweenImagesInterval: number;
  postMaxAds: number;
  
  postAfterContentEnabled: boolean;
  postAfterContentCode: string;

  // Affiliate Global
  affiliateBoxEnabled: boolean;
  affiliateTitleText: string;
  affiliateButtonText: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logoText: string;
  logoUrl?: string;
  faviconUrl?: string;
  footerText: string;
  socials: {
    pinterest: string;
    instagram: string;
  };
  globalSeo: SEOConfig;
}
