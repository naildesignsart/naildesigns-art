
// @ts-nocheck
import React, { useState, useEffect } from 'react';


import { auth } from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';



import { 
  saveDesign, updateDesign, deleteCustomDesign, getDesigns, getAllCategories, 
  saveCategory, deleteCategory, generateSlug, getAdsSettings, saveAdsSettings,
  getSiteSettings, saveSiteSettings 
} from '../services/cms';
import { NailDesign, Category, AffiliateProduct, AdsSettings, SEOConfig, PostStatus, SiteSettings, NailShape, NailLength, StyleType } from '../types';
import { 
  Trash2, Plus, LogOut, LayoutDashboard, List, FileText, FolderPlus, 
  Settings as SettingsIcon, Image as ImageIcon, Globe, DollarSign, 
  Search, Save, RefreshCw, Map, Copy, CheckCircle, XCircle 
} from 'lucide-react';
import { ADS_SETTINGS as DEFAULT_ADS, SITE_SETTINGS as DEFAULT_SITE } from '../constants';

type Tab = 'dashboard' | 'create' | 'list' | 'categories' | 'ads' | 'settings' | 'sitemaps';

// Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
    <div className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in duration-300 ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
        {type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
        <div>
            <h4 className="font-bold text-sm uppercase tracking-wide">{type === 'success' ? 'Success' : 'Error'}</h4>
            <p className="text-xs opacity-90">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100"><XCircle size={16}/></button>
    </div>
);

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [editId, setEditId] = useState<string | null>(null);
  
  // Notification State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<NailDesign[]>([]);
  const [adsConfig, setAdsConfig] = useState<AdsSettings>(DEFAULT_ADS);
  const [siteConfig, setSiteConfig] = useState<SiteSettings>(DEFAULT_SITE);
  const [loading, setLoading] = useState(false);

  // Sitemaps
  const [sitemapXml, setSitemapXml] = useState('');
  const [imageSitemapXml, setImageSitemapXml] = useState('');

  // FORM STATES
  const [formData, setFormData] = useState<Partial<NailDesign>>({
    status: 'draft',
    affiliateProducts: [],
    seo: {},
    galleryImages: [],
    shape: 'almond',
    length: 'medium',
    styleType: 'classy'
  });

  const [newCategory, setNewCategory] = useState<Partial<Category>>({});
  
  // Affiliate Product Temp State
  const [tempAffiliate, setTempAffiliate] = useState<Partial<AffiliateProduct>>({ type: 'tool', price: '' });



 useEffect(() => {
  const unsub = onAuthStateChanged(auth, (user) => {
    setIsAuthenticated(!!user);
  });
  return () => unsub();
}, []);





  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
      if (toast) {
          const timer = setTimeout(() => setToast(null), 3000);
          return () => clearTimeout(timer);
      }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type });
  };

  const loadData = async () => {
    setLoading(true);
    const [c, p, a, s] = await Promise.all([
        getAllCategories(), 
        getDesigns({}, 1000), // Fetch more for sitemap
        getAdsSettings(),
        getSiteSettings()
    ]);
    setCategories(c);
    setPosts(p);
    setAdsConfig(a);
    setSiteConfig(s);
    setLoading(false);
    
    // Generate Sitemaps on Load
    if (activeTab === 'sitemaps') generateSitemaps(p, c);
  };


const handleAuth = async () => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast("Logged in!", "success");
    setIsAuthenticated(true);
  } catch (e) {
    showToast("Wrong email or password", "error");
  }
};




  // --- AUTOMATION HELPERS ---

  const handleImageInputBlur = (url: string) => {
      if (!url) return;
      const img = new Image();
      img.src = url;
      img.onload = () => {
          setFormData(prev => ({
              ...prev,
              mainImage: url,
              width: img.width,
              height: img.height,
              altText: prev.altText || prev.title || 'Nail Design Inspiration'
          }));
      };
  };

  const parseAmazonLink = () => {
      const url = tempAffiliate.affiliateUrl;
      if (!url) return showToast("Paste an Amazon link first", 'error');

      // Check for amzn.to (Cannot scrape client-side due to CORS)
      if (url.includes('amzn.to')) {
          showToast("Short links (amzn.to) cannot be auto-detected. Please fill details manually.", 'error');
          return;
      }

      // Extract ASIN from full URL
      const asinMatch = url.match(/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
      const asin = asinMatch ? asinMatch[1] : null;

      if (asin) {
          const imageUrl = `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_.jpg`;
          setTempAffiliate(prev => ({
              ...prev,
              image: imageUrl,
              brand: prev.brand || 'Amazon',
              ctaText: prev.ctaText || 'Check Price'
          }));
          showToast("Image fetched! Please enter Title and Price manually.", 'success');
      } else {
          showToast("Could not detect ASIN. Please fill manually.", 'error');
      }
  };

  // 3. Sitemap Generator
  const generateSitemaps = (allPosts: NailDesign[], allCats: Category[]) => {
      const baseUrl = "https://naildesigns.art";
      const date = new Date().toISOString().split('T')[0];

      // Main Sitemap
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      // Home
      xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${date}</lastmod>\n    <priority>1.0</priority>\n  </url>\n`;
      // Categories
      allCats.forEach(c => {
          xml += `  <url>\n    <loc>${baseUrl}/#/category/${c.slug}</loc>\n    <lastmod>${date}</lastmod>\n    <priority>0.8</priority>\n  </url>\n`;
      });
      // Posts
      allPosts.forEach(p => {
          if (p.status === 'published') {
            xml += `  <url>\n    <loc>${baseUrl}/#/nail-designs/${p.slug}</loc>\n    <lastmod>${p.publishedAt.split('T')[0]}</lastmod>\n    <priority>0.6</priority>\n  </url>\n`;
          }
      });
      xml += `</urlset>`;
      setSitemapXml(xml);

      // Image Sitemap
      let imgXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
      allPosts.forEach(p => {
          if (p.status === 'published') {
            imgXml += `  <url>\n`;
            imgXml += `    <loc>${baseUrl}/#/nail-designs/${p.slug}</loc>\n`;
            imgXml += `    <image:image>\n`;
            imgXml += `      <image:loc>${p.mainImage}</image:loc>\n`;
            imgXml += `      <image:title>${p.title.replace(/&/g, '&amp;')}</image:title>\n`;
            imgXml += `    </image:image>\n`;
            imgXml += `  </url>\n`;
          }
      });
      imgXml += `</urlset>`;
      setImageSitemapXml(imgXml);
  };

  // --- STANDARD HANDLERS ---

  const generateSEO = () => {
      const title = formData.title || '';
      const desc = formData.shortDescription || '';
      const slug = formData.slug || generateSlug(title);

      setFormData(prev => ({
          ...prev,
          seo: {
              ...prev.seo,
              metaTitle: title.length > 60 ? title.substring(0, 57) + '...' : title,
              metaDescription: desc.length > 150 ? desc.substring(0, 157) + '...' : desc,
              canonicalUrl: `https://${siteConfig.siteName.toLowerCase()}/nail-designs/${slug}`,
              noIndex: false
          }
      }));
      showToast("SEO Metadata Generated!", 'success');
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.mainImage) return showToast('Title and Main Image URL required', 'error');

    const slug = formData.slug || generateSlug(formData.title);
    
    const seo: SEOConfig = {
       metaTitle: formData.seo?.metaTitle || `${formData.title}`,
       metaDescription: formData.seo?.metaDescription || formData.shortDescription || '',
       canonicalUrl: formData.seo?.canonicalUrl || `https://naildesigns.art/#/nail-designs/${slug}`,
       noIndex: formData.seo?.noIndex || false
    };

    const finalData: NailDesign = {
       id: editId || `post-${Date.now()}`,
       title: formData.title,
       slug: slug,
       status: formData.status as PostStatus || 'draft',
       mainImage: formData.mainImage,
       altText: formData.altText || formData.title || 'Nail Design',
       width: formData.width || 800,
       height: formData.height || 1000,
       galleryImages: formData.galleryImages || [],
       shortDescription: formData.shortDescription || '',
       longDescription: formData.longDescription || '',
       category: formData.category || categories[0]?.slug || 'simple',
       length: formData.length as NailLength || 'medium',
       shape: formData.shape as NailShape || 'almond',
       styleType: formData.styleType as StyleType || 'classy',
       affiliateSectionEnabled: formData.affiliateSectionEnabled ?? true,
       affiliateProducts: formData.affiliateProducts || [],
       seo: seo,
       focusKeywords: formData.focusKeywords || '',
       publishedAt: formData.publishedAt || new Date().toISOString(),
       colors: [] 
    };

    try {
        if (editId) await updateDesign(editId, finalData);
        else await saveDesign(finalData);
        showToast(`Post ${editId ? 'Updated' : 'Created'} Successfully!`, 'success');
        
        if (!editId) {
             setFormData({ 
                 status: 'draft', affiliateProducts: [], seo: {}, galleryImages: [],
                 shape: 'almond', length: 'medium', styleType: 'classy'
             });
             setActiveTab('list');
             loadData();
        } else {
             setEditId(null);
             setActiveTab('list');
             loadData();
        }
    } catch (e) {
        showToast('Error saving post', 'error');
    }
  };

  const editPost = (p: NailDesign) => {
      setEditId(p.id);
      setFormData(p);
      setActiveTab('create');
  };

  const addAffiliateProduct = () => {
      if (!tempAffiliate.name || !tempAffiliate.affiliateUrl) return showToast('Name and URL required', 'error');
      const newProduct = { ...tempAffiliate, id: `prod-${Date.now()}` } as AffiliateProduct;
      setFormData({ ...formData, affiliateProducts: [...(formData.affiliateProducts || []), newProduct] });
      setTempAffiliate({ type: 'tool', price: '' });
      showToast('Product Added', 'success');
  };

  const removeAffiliateProduct = (id: string) => {
      setFormData({ ...formData, affiliateProducts: formData.affiliateProducts?.filter(p => p.id !== id) });
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCategory.name) return;
      const slug = newCategory.slug || generateSlug(newCategory.name);
      try {
          await saveCategory({ ...newCategory, slug } as Category);
          showToast('Category Saved!', 'success');
          setNewCategory({});
          loadData();
      } catch(e) { showToast('Error saving category', 'error'); }
  };

  const handleDeleteCategory = async (slug: string) => {
      if (confirm(`Delete category: ${slug}?`)) {
          await deleteCategory(slug);
          showToast('Category Deleted', 'success');
          loadData();
      }
  };

  const handleAdsSave = async () => {
      try { 
          await saveAdsSettings(adsConfig); 
          showToast('Ads Settings Updated Successfully!', 'success'); 
      } catch (e) { 
          showToast('Failed to update ads', 'error'); 
      }
  };

  const handleSiteSave = async () => {
      try { 
          await saveSiteSettings(siteConfig); 
          showToast('Site Settings Updated!', 'success'); 
      } catch (e) { 
          showToast('Failed to update settings', 'error'); 
      }
  };


if (!isAuthenticated) return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
      <h1 className="text-2xl font-black mb-6 uppercase tracking-widest">
        Admin Access
      </h1>

      {/* Email Input */}
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Admin Email"
        className="w-full p-4 mb-4 border rounded-xl outline-none"
      />

      {/* Password Input */}
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full p-4 mb-6 border rounded-xl outline-none"
      />

      <button
        onClick={handleAuth}
        className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase"
      >
        Login
      </button>
    </div>
  </div>
);





  return (
    <div className="min-h-screen bg-gray-100 flex font-sans relative">
      {/* Toast Notification Container */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r h-screen sticky top-0 flex flex-col p-6 z-10">
         <div className="text-2xl font-black mb-10 tracking-tighter">NAILDESIGNS<span className="text-pink-600">.ART</span></div>
         <nav className="space-y-2 flex-1">
            {[
                { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18}/> },
                { id: 'create', label: 'Create Post', icon: <Plus size={18}/> },
                { id: 'list', label: 'All Posts', icon: <List size={18}/> },
                { id: 'categories', label: 'Categories', icon: <FolderPlus size={18}/> },
                { id: 'ads', label: 'Ads Manager', icon: <DollarSign size={18}/> },
                { id: 'sitemaps', label: 'Sitemaps', icon: <Map size={18}/> },
                { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18}/> },
            ].map(item => (
                <button key={item.id} onClick={() => { setActiveTab(item.id as Tab); if(item.id === 'create') { setEditId(null); setFormData({ status: 'draft', affiliateProducts: [], seo: {}, galleryImages: [], shape: 'almond', length: 'medium', styleType: 'classy' }); } }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${activeTab === item.id ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}`}>
                    {item.icon} {item.label}
                </button>
            ))}
         </nav>
         <button
  onClick={async () => {
    await signOut(auth);        // 🔥 Firebase se logout
    setIsAuthenticated(false); // UI reset
    showToast("Logged out!", "success");
  }}
  className="flex items-center gap-3 px-4 py-3 text-red-500 font-bold text-xs uppercase tracking-wider hover:bg-red-50 rounded-xl"
>
  <LogOut size={20}/> Logout
</button>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto h-screen">
         
         {/* DASHBOARD */}
         {activeTab === 'dashboard' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Total Posts</h3>
                    <div className="text-4xl font-black">{posts.length}</div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Categories</h3>
                    <div className="text-4xl font-black">{categories.length}</div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Ads Active</h3>
                    <div className={`text-4xl font-black text-green-500`}>ON</div>
                </div>
             </div>
         )}

         {/* CREATE / EDIT POST */}
         {activeTab === 'create' && (
             <form onSubmit={handlePostSubmit} className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in">
                <div className="flex items-center justify-between mb-8 sticky top-0 bg-gray-100/95 backdrop-blur z-20 py-4 border-b border-gray-200">
                    <h1 className="text-3xl font-black uppercase tracking-tight">{editId ? 'Edit Post' : 'New Post'}</h1>
                    <div className="flex gap-4">
                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as PostStatus})} className="bg-white border px-4 py-3 rounded-xl font-bold uppercase text-xs">
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                        <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-gray-800 flex items-center gap-2 shadow-lg">
                           <Save size={16}/> Save Post
                        </button>
                    </div>
                </div>

                {/* 1. Basic Info */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-4 mb-4">Content & Categorization</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                           <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Post Title (H1)</label>
                           <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl font-serif text-lg outline-none focus:ring-2 focus:ring-black/5" placeholder="e.g. 10 Trending Almond Shapes" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Category</label>
                           <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl outline-none">
                              {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Focus Keywords (Tags)</label>
                           <input type="text" value={formData.focusKeywords || ''} onChange={e => setFormData({...formData, focusKeywords: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl outline-none" placeholder="Comma separated" />
                        </div>
                        <div className="col-span-2">
                           <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Short Description (Intro)</label>
                           <textarea value={formData.shortDescription || ''} onChange={e => setFormData({...formData, shortDescription: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl outline-none h-24" />
                        </div>
                        <div className="col-span-2">
                           <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Main Content (Markdown supported)</label>
                           <textarea value={formData.longDescription || ''} onChange={e => setFormData({...formData, longDescription: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl outline-none h-48 font-mono text-sm" />
                        </div>
                    </div>
                </section>

                {/* 2. Design Specifications */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-4 mb-4">Design Specifications</h3>
                    <div className="grid grid-cols-3 gap-6">
                         <div>
                             <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Shape</label>
                             <select value={formData.shape} onChange={e => setFormData({...formData, shape: e.target.value as NailShape})} className="w-full p-4 bg-gray-50 rounded-xl outline-none">
                                 <option value="almond">Almond</option>
                                 <option value="coffin">Coffin</option>
                                 <option value="square">Square</option>
                                 <option value="stiletto">Stiletto</option>
                                 <option value="oval">Oval</option>
                             </select>
                         </div>
                         <div>
                             <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Length</label>
                             <select value={formData.length} onChange={e => setFormData({...formData, length: e.target.value as NailLength})} className="w-full p-4 bg-gray-50 rounded-xl outline-none">
                                 <option value="short">Short</option>
                                 <option value="medium">Medium</option>
                                 <option value="long">Long</option>
                             </select>
                         </div>
                         <div>
                             <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Style Type</label>
                             <select value={formData.styleType} onChange={e => setFormData({...formData, styleType: e.target.value as StyleType})} className="w-full p-4 bg-gray-50 rounded-xl outline-none">
                                 <option value="classy">Classy</option>
                                 <option value="bold">Bold</option>
                                 <option value="bridal">Bridal</option>
                                 <option value="office">Office</option>
                                 <option value="casual">Casual</option>
                                 <option value="minimal">Minimal</option>
                             </select>
                         </div>
                    </div>
                </section>

                {/* 3. Image System */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-4 mb-4 flex items-center gap-2"><ImageIcon size={16}/> Image Assets</h3>
                    
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                        <label className="block text-[10px] font-bold uppercase text-black mb-2">Main Image URL (Auto-Detects Size)</label>
                        <div className="flex gap-4 items-start">
                            <div className="flex-1">
                                <input 
                                  type="text" 
                                  value={formData.mainImage || ''} 
                                  onChange={e => setFormData({...formData, mainImage: e.target.value})}
                                  onBlur={(e) => handleImageInputBlur(e.target.value)}
                                  className="w-full p-3 bg-white rounded-xl border outline-none mb-2" 
                                  placeholder="Paste URL here..." 
                                />
                                <div className="grid grid-cols-3 gap-2">
                                    <input type="text" placeholder="Alt Text" value={formData.altText || ''} onChange={e => setFormData({...formData, altText: e.target.value})} className="p-3 bg-white rounded-xl border outline-none text-xs" />
                                    <input type="number" placeholder="Width" value={formData.width || ''} onChange={e => setFormData({...formData, width: parseInt(e.target.value)})} className="p-3 bg-white rounded-xl border outline-none text-xs" />
                                    <input type="number" placeholder="Height" value={formData.height || ''} onChange={e => setFormData({...formData, height: parseInt(e.target.value)})} className="p-3 bg-white rounded-xl border outline-none text-xs" />
                                </div>
                            </div>
                            {formData.mainImage && (
                                <div className="w-32 h-32 bg-white rounded-lg border flex items-center justify-center overflow-hidden">
                                    <img src={formData.mainImage} className="max-w-full max-h-full object-contain" alt="Preview"/>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 4. Affiliate Manager */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                    <div className="flex items-center justify-between border-b pb-4 mb-4">
                         <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><DollarSign size={16}/> Amazon Affiliate</h3>
                         <label className="flex items-center gap-2 text-xs font-bold uppercase cursor-pointer">
                             <input type="checkbox" checked={formData.affiliateSectionEnabled} onChange={e => setFormData({...formData, affiliateSectionEnabled: e.target.checked})} className="accent-black"/>
                             Enable Section
                         </label>
                    </div>
                    
                    {formData.affiliateSectionEnabled && (
                        <div className="space-y-6">
                            <div className="space-y-3">
                                {formData.affiliateProducts?.map((prod, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <img src={prod.image} className="w-10 h-10 object-contain bg-white rounded-lg" alt=""/>
                                        <div className="flex-1">
                                            <div className="text-xs font-bold">{prod.name}</div>
                                            <div className="text-[10px] text-gray-400">{prod.brand} • {prod.price}</div>
                                        </div>
                                        <button type="button" onClick={() => removeAffiliateProduct(prod.id)} className="text-red-500 hover:bg-white p-2 rounded-lg"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300">
                                <h4 className="text-[10px] font-bold uppercase text-gray-500 mb-4">Add Product</h4>
                                
                                {/* Amazon Auto-Detector */}
                                <div className="flex gap-2 mb-4">
                                     <input type="text" placeholder="Paste Full Amazon Link (Auto Detect) or Short Link (Manual)" value={tempAffiliate.affiliateUrl || ''} onChange={e => setTempAffiliate({...tempAffiliate, affiliateUrl: e.target.value})} className="flex-1 p-3 bg-white rounded-xl border outline-none text-xs" />
                                     <button type="button" onClick={parseAmazonLink} className="bg-yellow-400 text-black px-4 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-yellow-500">Auto-Detect</button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <input type="text" placeholder="Product Name (Manual)" value={tempAffiliate.name || ''} onChange={e => setTempAffiliate({...tempAffiliate, name: e.target.value})} className="p-3 bg-white rounded-xl border outline-none text-xs" />
                                    <input type="text" placeholder="Image URL (Manual if Short Link)" value={tempAffiliate.image || ''} onChange={e => setTempAffiliate({...tempAffiliate, image: e.target.value})} className="p-3 bg-white rounded-xl border outline-none text-xs" />
                                    <input type="text" placeholder="Brand" value={tempAffiliate.brand || ''} onChange={e => setTempAffiliate({...tempAffiliate, brand: e.target.value})} className="p-3 bg-white rounded-xl border outline-none text-xs" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="text" placeholder="Price (e.g. $12.99)" value={tempAffiliate.price || ''} onChange={e => setTempAffiliate({...tempAffiliate, price: e.target.value})} className="p-3 bg-white rounded-xl border outline-none text-xs" />
                                        <input type="text" placeholder="CTA (e.g. Buy Now)" value={tempAffiliate.ctaText || ''} onChange={e => setTempAffiliate({...tempAffiliate, ctaText: e.target.value})} className="p-3 bg-white rounded-xl border outline-none text-xs" />
                                    </div>
                                </div>
                                <button type="button" onClick={addAffiliateProduct} className="bg-black text-white px-6 py-2 rounded-lg text-xs font-bold uppercase">Add Product</button>
                            </div>
                        </div>
                    )}
                </section>

                {/* 5. SEO Panel */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                    <div className="flex items-center justify-between border-b pb-4 mb-4">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Globe size={16}/> SEO & Metadata</h3>
                        <button type="button" onClick={generateSEO} className="flex items-center gap-2 text-[10px] font-bold bg-pink-50 text-pink-600 px-3 py-1 rounded-full uppercase tracking-wider hover:bg-pink-100">
                            <RefreshCw size={10}/> Auto Generate
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                           <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Meta Title</label>
                           <input type="text" placeholder="Auto-generated if empty" value={formData.seo?.metaTitle || ''} onChange={e => setFormData({...formData, seo: {...formData.seo, metaTitle: e.target.value}})} className="w-full p-4 bg-gray-50 rounded-xl outline-none text-sm" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Meta Description</label>
                           <textarea placeholder="Auto-generated if empty" value={formData.seo?.metaDescription || ''} onChange={e => setFormData({...formData, seo: {...formData.seo, metaDescription: e.target.value}})} className="w-full p-4 bg-gray-50 rounded-xl outline-none text-sm h-24" />
                        </div>
                        <div className="flex gap-6 items-center pt-4">
                           <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                               <input type="checkbox" checked={formData.seo?.noIndex || false} onChange={e => setFormData({...formData, seo: {...formData.seo, noIndex: e.target.checked}})} className="accent-red-500 w-4 h-4" />
                               No Index (Hide from Google)
                           </label>
                        </div>
                    </div>
                </section>
             </form>
         )}
         
         {/* POST LIST */}
         {activeTab === 'list' && (
             <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                 <table className="w-full text-left">
                     <thead className="bg-gray-50 border-b">
                         <tr>
                             <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Post</th>
                             <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                             <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Actions</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                         {posts.map(p => (
                             <tr key={p.id} className="hover:bg-gray-50/50">
                                 <td className="p-6">
                                     <div className="font-bold text-sm">{p.title}</div>
                                     <div className="text-xs text-gray-400">{p.category}</div>
                                 </td>
                                 <td className="p-6">
                                     <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                         {p.status}
                                     </span>
                                 </td>
                                 <td className="p-6 flex gap-2">
                                     <button onClick={() => editPost(p)} className="p-2 bg-gray-100 rounded-lg hover:bg-black hover:text-white transition-colors"><FileText size={14}/></button>
                                     <button onClick={() => { if(confirm('Delete?')) deleteCustomDesign(p.id).then(loadData); }} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={14}/></button>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
         )}

         {/* CATEGORIES MANAGER */}
         {activeTab === 'categories' && (
             <div className="max-w-4xl mx-auto">
                 <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
                     <h2 className="text-xl font-black mb-6">Add Category</h2>
                     <form onSubmit={handleCategorySubmit} className="flex gap-4">
                         <input type="text" placeholder="Category Name (e.g. Gel Nails)" value={newCategory.name || ''} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="flex-1 p-4 bg-gray-50 rounded-xl outline-none" />
                         <input type="text" placeholder="Slug (optional)" value={newCategory.slug || ''} onChange={e => setNewCategory({...newCategory, slug: e.target.value})} className="flex-1 p-4 bg-gray-50 rounded-xl outline-none" />
                         <button type="submit" className="bg-black text-white px-8 rounded-xl font-bold uppercase text-xs">Add</button>
                     </form>
                 </div>
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                     <table className="w-full text-left">
                         <thead className="bg-gray-50 border-b">
                             <tr>
                                 <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Name</th>
                                 <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Slug</th>
                                 <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Actions</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                             {categories.map(c => (
                                 <tr key={c.slug} className="hover:bg-gray-50">
                                     <td className="p-6 font-bold">{c.name}</td>
                                     <td className="p-6 text-gray-400 text-xs font-mono">{c.slug}</td>
                                     <td className="p-6">
                                         <button onClick={() => handleDeleteCategory(c.slug)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={16}/></button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </div>
         )}

         {/* ADS MANAGER */}
         {activeTab === 'ads' && (
             <div className="max-w-4xl mx-auto space-y-6 pb-20">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black uppercase">Ads Configuration</h1>
                    <button onClick={handleAdsSave} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold uppercase text-xs hover:bg-green-700">Save Config</button>
                </div>
                
                {/* Global Settings */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="font-bold mb-4">Global Settings</h3>
                    <div className="grid grid-cols-1 gap-6">
                        <input type="text" placeholder="Publisher ID (ca-pub-...)" value={adsConfig.publisherId} onChange={e => setAdsConfig({...adsConfig, publisherId: e.target.value})} className="p-4 bg-gray-50 rounded-xl outline-none" />
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Mode is forced to LIVE for script injection.</p>
                    </div>
                </div>

                {/* Slots */}
                {[
                    { title: 'Header Ad', key: 'header' },
                    { title: 'Footer Ad', key: 'footer' },
                    { title: 'Sidebar Ad', key: 'sidebar' },
                    { title: 'Grid/Feed Ad', key: 'grid' },
                    { title: 'Post: After Title', key: 'postAfterTitle' },
                    { title: 'Post: After Image', key: 'postAfterFirstImage' },
                ].map((slot) => (
                    <div key={slot.key} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold">{slot.title}</h3>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={(adsConfig as any)[`${slot.key}Enabled`]} 
                                    onChange={e => setAdsConfig({...adsConfig, [`${slot.key}Enabled`]: e.target.checked})} 
                                    className="accent-black w-5 h-5"
                                />
                                <span className="text-xs font-bold uppercase">Enable</span>
                            </label>
                        </div>
                        {(adsConfig as any)[`${slot.key}Enabled`] && (
                            <div className="grid grid-cols-1 gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Ad Slot ID (1234567890)" 
                                    value={(adsConfig as any)[`${slot.key}SlotId`] || ''} 
                                    onChange={e => setAdsConfig({...adsConfig, [`${slot.key}SlotId`]: e.target.value})} 
                                    className="w-full p-4 bg-gray-50 rounded-xl outline-none font-mono text-xs" 
                                />
                                <textarea 
                                    placeholder="Raw HTML/Script (Optional override)" 
                                    value={(adsConfig as any)[`${slot.key}Code`] || ''} 
                                    onChange={e => setAdsConfig({...adsConfig, [`${slot.key}Code`]: e.target.value})} 
                                    className="w-full p-4 bg-gray-50 rounded-xl outline-none font-mono text-xs h-24" 
                                />
                            </div>
                        )}
                    </div>
                ))}
             </div>
         )}
         
         {/* SITEMAPS */}
         {activeTab === 'sitemaps' && (
             <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black uppercase">Sitemaps</h1>
                    <button onClick={() => generateSitemaps(posts, categories)} className="bg-black text-white px-8 py-3 rounded-xl font-bold uppercase text-xs">Regenerate</button>
                </div>
                
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg">Main Sitemap (sitemap.xml)</h3>
                        <button onClick={() => navigator.clipboard.writeText(sitemapXml)} className="flex items-center gap-2 text-xs font-bold bg-gray-100 px-3 py-2 rounded-lg hover:bg-black hover:text-white"><Copy size={14}/> Copy XML</button>
                    </div>
                    <textarea readOnly value={sitemapXml} className="w-full h-64 p-4 bg-gray-50 rounded-xl font-mono text-xs text-gray-600 outline-none border border-gray-200" />
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg">Image Sitemap (image-sitemap.xml)</h3>
                        <button onClick={() => navigator.clipboard.writeText(imageSitemapXml)} className="flex items-center gap-2 text-xs font-bold bg-gray-100 px-3 py-2 rounded-lg hover:bg-black hover:text-white"><Copy size={14}/> Copy XML</button>
                    </div>
                    <textarea readOnly value={imageSitemapXml} className="w-full h-64 p-4 bg-gray-50 rounded-xl font-mono text-xs text-gray-600 outline-none border border-gray-200" />
                </div>
             </div>
         )}

         {/* SETTINGS (SITE) */}
         {activeTab === 'settings' && (
             <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black uppercase">Global Site Settings</h1>
                    <button onClick={handleSiteSave} className="bg-black text-white px-8 py-3 rounded-xl font-bold uppercase text-xs hover:bg-gray-800">Save Settings</button>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Site Name</label>
                        <input type="text" value={siteConfig.siteName} onChange={e => setSiteConfig({...siteConfig, siteName: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl outline-none" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Logo Text</label>
                        <input type="text" value={siteConfig.logoText} onChange={e => setSiteConfig({...siteConfig, logoText: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl outline-none" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Footer Copyright</label>
                        <input type="text" value={siteConfig.footerText} onChange={e => setSiteConfig({...siteConfig, footerText: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl outline-none" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Global Description</label>
                        <textarea value={siteConfig.siteDescription} onChange={e => setSiteConfig({...siteConfig, siteDescription: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl outline-none h-24" />
                    </div>
                </div>
             </div>
         )}
      </main>
    </div>
  );
};

export default Admin;
