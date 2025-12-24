
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import MasonryGrid from '../components/MasonryGrid';
import { getDesigns } from '../services/cms';
import { NailDesign } from '../types';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<NailDesign[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
        if (query) {
            setLoading(true);
            const data = await getDesigns({ searchQuery: query });
            setResults(data);
            setLoading(false);
            document.title = `Search: ${query} | NailDesigns.art`;
        }
    };
    fetchResults();
  }, [query]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Search Results</h1>
        <p className="text-gray-500 mb-8">
          Showing results for <span className="font-semibold text-black">"{query}"</span>
        </p>

        {loading ? (
             <div className="text-center py-20 text-gray-400">Searching...</div>
        ) : results.length > 0 ? (
          <MasonryGrid designs={results} hasMore={false} />
        ) : (
          <div className="py-20 text-center bg-gray-50 rounded-xl">
            <h2 className="text-xl font-medium text-gray-900 mb-2">No designs found</h2>
            <p className="text-gray-500">Try searching for "French Tip", "Red", or "Glitter".</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
