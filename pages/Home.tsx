import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import MasonryGrid from '../components/MasonryGrid';
import { getDesigns, getAllCategories } from '../services/cms';
import { NailDesign, Category } from '../types';

const Home: React.FC = () => {
  const [designs, setDesigns] = useState<NailDesign[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // ✅ FIX: hasMore ko state mein rakhein, hardcode nahi
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Agar pehle hi pata hai ki designs khatam hain, toh aur load mat karo
      if (!hasMore && page > 1) return;

      setLoading(true);
      
      const limit = 20 * page;
      const data = await getDesigns({}, limit);
      
      // Categories sirf pehli baar load karo
      if (page === 1) {
        const cats = await getAllCategories();
        setCategories(cats);
      }

      // ✅ FIX: Agar designs limit se kam hain, iska matlab database khatam
      if (data.length < limit || data.length === designs.length) {
        setHasMore(false);
      }

      setDesigns(data);
      setLoading(false);
    };

    fetchData();
    document.title = "Nail Designs Art | The Best Nail Inspiration Gallery";
  }, [page]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <Layout>
      <section className="bg-white py-8 md:py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-gray-900">
            Find Your Next <span className="text-pink-500">Manicure</span>
          </h1>
          <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
            Browse trending nail designs, from simple office looks to extravagant bridal art.
          </p>
          
          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {categories.slice(0, 10).map(cat => (
              <Link 
                key={cat.slug} 
                to={`/category/${cat.slug}`}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all transform hover:scale-105 hover:shadow-md ${cat.iconColor || 'bg-gray-100'} text-gray-800`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        
        {/* ✅ EMPTY STATE: Agar designs nahi hain toh message dikhao (Loading nahi) */}
        {!loading && designs.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl">
              <h2 className="text-xl text-gray-900 font-bold mb-2">No designs found yet.</h2>
              <p className="text-gray-500 mb-6">Database is empty. Please upload designs from Admin panel.</p>
              
              <Link to="/admin" className="inline-block px-6 py-3 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors">
                 Go to Admin Dashboard
              </Link>
            </div>
        ) : (
            <>
                <MasonryGrid designs={designs} />

                {/* ✅ Load More Button: Sirf tab dikhega jab aur designs honge */}
                {hasMore && !loading && designs.length > 0 && (
                    <div className="text-center mt-12">
                        <button 
                            onClick={handleLoadMore}
                            className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full font-medium transition-colors"
                        >
                            Load More Designs
                        </button>
                    </div>
                )}
            </>
        )}

        {/* Loading Spinner */}
        {loading && designs.length > 0 && (
           <div className="py-10 text-center">
             <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
           </div>
        )}
      </section>
    </Layout>
  );
};

export default Home;