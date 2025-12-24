
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import AdUnit from '../components/AdUnit';
import MasonryGrid from '../components/MasonryGrid';
import { getDesignBySlug, getRelatedDesigns } from '../services/cms';
import { NailDesign } from '../types';
import { useAds } from '../components/AdsContext';
import { ShoppingBag, ArrowRight, ChevronLeft, Calendar, Tag, Layers, Scissors, Sparkles } from 'lucide-react';

const DesignDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [design, setDesign] = useState<NailDesign | undefined>(undefined);
  const [related, setRelated] = useState<NailDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { settings } = useAds();

  useEffect(() => {
    const fetchData = async () => {
        if (slug) {
            setImageLoaded(false); // Reset for new design
            setLoading(true);
            const data = await getDesignBySlug(slug);
            setDesign(data);
            if (data) {
                const rel = await getRelatedDesigns(data.slug, data.category);
                setRelated(rel);
                
                // SEO Updates
                document.title = data.seo?.metaTitle || data.title;
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) metaDesc.setAttribute('content', data.seo?.metaDescription || data.shortDescription);
            }
            setLoading(false);
            window.scrollTo(0, 0);
        }
    };
    fetchData();
  }, [slug]);

  // Updated Loader
  if (loading) return (
      <div className="h-screen w-full bg-pink-50 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-2 border-pink-100 border-t-pink-500 rounded-full animate-spin mb-4"></div>
          <div className="text-[10px] font-black uppercase tracking-widest text-pink-300">Loading Masterpiece</div>
      </div>
  );

  if (!design) return <Layout><div className="flex h-[50vh] items-center justify-center font-bold">Design not found.</div></Layout>;

  return (
    <Layout>
      <article className="min-h-screen bg-pink-50 font-sans">
        
        {/* TOP: Back Nav ONLY (Removed Like/Share) */}
        <div className="fixed top-[80px] left-4 z-40">
           <Link to="/" className="bg-white/80 backdrop-blur-md p-3 rounded-full shadow-sm hover:bg-black hover:text-white transition-colors border border-white flex items-center justify-center">
               <ChevronLeft size={24} />
           </Link>
        </div>

        {/* SECTION 1: THE MASTERPIECE (IMAGE ONLY) */}
        {/* Adjusted Size: Reduced from 95vh to 85vh on desktop, and 85vh to 70vh on mobile */}
        <div className="relative w-full pb-8 pt-4 flex flex-col items-center">
            
            <div className="w-full px-0 md:px-4 relative z-10 flex flex-col items-center">
                
                {/* The Image Container */}
                <div className="relative inline-block shadow-2xl rounded-2xl bg-white p-1 ring-1 ring-white/50">
                    <img 
                        src={design.mainImage} 
                        alt={design.altText} 
                        className={`
                          block
                          w-auto 
                          h-auto 
                          max-h-[70vh] md:max-h-[85vh] 
                          max-w-[95vw] md:max-w-full
                          object-contain 
                          rounded-xl 
                          transition-opacity duration-700 
                          ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                        `}
                        onLoad={() => setImageLoaded(true)}
                        loading="eager"
                        width={design.width}
                        height={design.height}
                    />
                    
                    {!imageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-pink-50 rounded-xl">
                            <div className="w-12 h-12 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* SECTION 2: DETAILS (TITLE BELOW IMAGE) */}
        <div className={`max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 transition-opacity duration-1000 delay-300 ${imageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-8">
                
                {/* TITLE & CATEGORY */}
                <div className="text-center md:text-left space-y-4 pt-4">
                    <Link to={`/category/${design.category}`} className="inline-block px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-pink-600 border border-pink-200 rounded-full bg-white hover:bg-pink-100 transition-colors">
                        {design.category.replace('-', ' ')}
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
                        {design.title}
                    </h1>
                </div>

                {/* Ad Spot */}
                <AdUnit type="post-title" className="w-full rounded-2xl min-h-[100px]" />

                {/* THE DETAILS BOX */}
                <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-white">
                    <h2 className="text-xl font-bold mb-6 text-gray-900">The Design Breakdown</h2>
                    <p className="text-base md:text-lg text-gray-800 leading-relaxed border-l-4 border-pink-400 pl-5 mb-8 italic">
                        {design.shortDescription}
                    </p>
                    <div className="prose prose-sm md:prose-base prose-p:text-gray-600 prose-headings:font-bold prose-a:text-pink-600">
                        {design.longDescription.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                    </div>

                    {/* Tags */}
                    {design.focusKeywords && (
                       <div className="pt-8 mt-8 border-t border-gray-50">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Keywords</h4>
                           <div className="flex flex-wrap gap-2">
                               {design.focusKeywords.split(',').map(tag => (
                                   <span key={tag} className="px-3 py-1 bg-pink-50 text-gray-500 text-[10px] font-bold uppercase tracking-wider rounded-md cursor-default">#{tag.trim()}</span>
                               ))}
                           </div>
                       </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar (Specs -> Affiliate -> Ads) */}
            <aside className="lg:col-span-5 space-y-6">
                
                {/* 1. SEO SPECIFICATIONS LIST */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-white">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Tag size={18} className="text-pink-500" />
                        Design Specifications
                    </h3>
                    <ul className="space-y-4">
                        <li className="flex items-center justify-between border-b border-gray-50 pb-3">
                            <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
                                <Scissors size={16} /> Shape
                            </div>
                            <div className="font-bold text-gray-900 capitalize">{design.shape}</div>
                        </li>
                        <li className="flex items-center justify-between border-b border-gray-50 pb-3">
                            <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
                                <Layers size={16} /> Length
                            </div>
                            <div className="font-bold text-gray-900 capitalize">{design.length}</div>
                        </li>
                        <li className="flex items-center justify-between border-b border-gray-50 pb-3">
                            <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
                                <Sparkles size={16} /> Style
                            </div>
                            <div className="font-bold text-gray-900 capitalize">{design.styleType}</div>
                        </li>
                        <li className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
                                <Calendar size={16} /> Published
                            </div>
                            <div className="font-bold text-gray-900 text-xs">
                                {new Date(design.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </li>
                    </ul>
                </div>

                {/* 2. Shop The Look */}
                {settings.affiliateBoxEnabled && design.affiliateSectionEnabled && (
                    <div className="sticky top-24 bg-white text-gray-900 rounded-2xl p-6 shadow-xl shadow-pink-100/40 relative overflow-hidden ring-1 ring-white group">
                        
                        <div className="relative z-10">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-3">
                                <ShoppingBag size={18} className="text-pink-500"/> Shop Essentials
                            </h3>
                            
                            <div className="space-y-3">
                                {design.affiliateProducts?.length > 0 ? design.affiliateProducts.map(product => (
                                    <a key={product.id} href={product.affiliateUrl} target="_blank" rel="nofollow" className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-pink-50 border border-gray-100 transition-all group/item">
                                        <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center border border-gray-100">
                                            <img src={product.image} className="max-w-full max-h-full object-contain" alt={product.name}/>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-0.5">{product.brand}</div>
                                            <div className="text-xs font-bold truncate text-gray-900 group-hover/item:text-pink-600 transition-colors">{product.name}</div>
                                        </div>
                                        <ArrowRight size={14} className="text-gray-400 group-hover/item:text-pink-500 transition-colors"/>
                                    </a>
                                )) : (
                                    <div className="text-center py-6 text-gray-400 text-xs uppercase tracking-widest">Links Updating Soon</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* 3. Sidebar Ad (Last) */}
                <AdUnit type="sidebar" className="w-full min-h-[300px] rounded-2xl bg-white border border-white" />
            </aside>
        </div>

        {/* Footer: Related */}
        <div className="bg-white text-gray-900 py-20 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Continue Exploring</h2>
                        <p className="text-gray-500 text-sm">More from {design.category}</p>
                    </div>
                    <Link to={`/category/${design.category}`} className="px-6 py-3 bg-pink-50 border border-pink-100 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                        View All
                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {related.map(r => (
                        <Link key={r.id} to={`/nail-designs/${r.slug}`} className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 block">
                            <img src={r.mainImage} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" alt={r.title}/>
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent translate-y-4 group-hover:translate-y-0 transition-transform">
                                <h4 className="text-xs font-bold truncate text-white">{r.title}</h4>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>

      </article>
    </Layout>
  );
};

export default DesignDetail;
