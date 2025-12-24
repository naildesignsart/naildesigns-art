
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import MasonryGrid from '../components/MasonryGrid';
import AdUnit from '../components/AdUnit';
import { getCategoryBySlug, getDesigns, getAllCategories } from '../services/cms';
import { NailDesign, Category } from '../types';

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [designs, setDesigns] = useState<NailDesign[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
        setLoading(true);
        setAllCategories(await getAllCategories());
        
        if (slug) {
            const cat = await getCategoryBySlug(slug);
            setCategory(cat);
            const data = await getDesigns({ category: slug });
            setDesigns(data);
            
            if (cat) {
                document.title = `${cat.name} Nail Designs 2025 | NailDesigns.art`;
            }
        }
        setLoading(false);
    };
    init();
  }, [slug]);

  if (!loading && !category) {
    return <Layout><div className="p-20 text-center">Category not found</div></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        <aside className="hidden md:block w-64 flex-shrink-0 space-y-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <h3 className="font-semibold mb-4 text-lg">Categories</h3>
            <div className="flex flex-col space-y-1">
              {allCategories.map(cat => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors block ${
                    slug === cat.slug
                      ? 'bg-black text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-pink-600'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          <AdUnit type="sidebar" className="w-full h-96 rounded-xl" />
        </aside>

        <div className="flex-grow">
          <div className="mb-6">
            <div className="flex flex-col">
               <h1 className="text-3xl font-bold capitalize">{category?.name} Designs</h1>
               <p className="text-gray-500 mt-1">Explore {designs.length} trending ideas.</p>
               
               <div className="md:hidden mt-6 flex overflow-x-auto space-x-2 pb-2 no-scrollbar">
                  {allCategories.map(cat => (
                    <Link
                      key={cat.slug}
                      to={`/category/${cat.slug}`}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                        slug === cat.slug
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
               </div>
            </div>
          </div>

          {loading ? (
              <div className="py-20 text-center text-gray-400">Loading...</div>
          ) : (
              <MasonryGrid designs={designs} hasMore={false} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;
