
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getDesigns({}, 20 * page);
      const cats = await getAllCategories();
      setDesigns(data);
      setCategories(cats);
      setLoading(false);
    };
    fetchData();
    document.title = "Nail Designs Art | The Best Nail Inspiration Gallery";
  }, [page]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <Layout>
      <section className="bg-white py-8 md:py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-gray-900">
            Find Your Next <span className="text-pink-500">Manicure</span>
          </h1>
          <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
            Browse thousands of trending nail designs, from simple office looks to extravagant bridal art.
          </p>
          
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
        {loading && designs.length === 0 ? (
            <div className="text-center py-20 text-gray-400">Loading Designs...</div>
        ) : (
            <MasonryGrid 
              designs={designs} 
              hasMore={true} 
              loadMore={loadMore} 
            />
        )}
      </section>
    </Layout>
  );
};

export default Home;
