
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { SITE_SETTINGS } from '../constants';
import { getAllCategories } from '../services/cms';
import { Category } from '../types';
import AdUnit from './AdUnit';
import { Search, Menu, X, Instagram, Facebook } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
      const fetchData = async () => {
          const cats = await getAllCategories();
          setCategories(cats);
      };
      fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
      <div className="w-full bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto py-2 px-4">
          <AdUnit type="header" className="w-full h-16 md:h-24 rounded-lg" />
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
                {SITE_SETTINGS.logoText}
              </Link>
            </div>

            <nav className="hidden md:flex space-x-8 overflow-x-auto no-scrollbar max-w-xl">
              {categories.slice(0, 6).map(cat => (
                <Link 
                  key={cat.slug} 
                  to={`/category/${cat.slug}`}
                  className={`text-sm font-medium transition-colors hover:text-pink-500 whitespace-nowrap ${location.pathname.includes(cat.slug) ? 'text-pink-600' : 'text-gray-600'}`}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <form onSubmit={handleSearch} className="hidden md:flex relative">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-3 pr-10 py-1.5 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 w-48 transition-all focus:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-2 top-1.5 text-gray-400 hover:text-pink-500">
                  <Search size={18} />
                </button>
              </form>

              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top-2">
            <div className="px-4 pt-4 pb-6 space-y-4">
              <form onSubmit={handleSearch} className="relative">
                 <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full pl-4 pr-10 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-3 text-gray-500">
                  <Search size={20} />
                </button>
              </form>
              
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</h4>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <Link 
                      key={cat.slug}
                      to={`/category/${cat.slug}`}
                      className="px-4 py-2 text-sm font-medium bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">{SITE_SETTINGS.siteName}</h3>
              <p className="text-gray-400 text-sm max-w-xs">{SITE_SETTINGS.footerText}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-200">Categories</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {categories.slice(0, 6).map(c => (
                  <li key={c.slug}><Link to={`/category/${c.slug}`} className="hover:text-white">{c.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-200">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms & Conditions</Link></li>
                <li className="pt-2"><Link to="/admin" className="text-xs text-gray-600 hover:text-gray-400">Admin Login</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
             <AdUnit type="footer" className="w-full h-24 mb-6 rounded-lg bg-gray-800 border-gray-700" />
             <p className="text-xs text-gray-500">© {new Date().getFullYear()} {SITE_SETTINGS.siteName}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
