import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import DesignDetail from './pages/DesignDetail';
import SearchPage from './pages/SearchPage';
import StaticPage from './pages/StaticPage';
import Admin from './pages/Admin';
import { AdsProvider } from './components/AdsContext';

const App: React.FC = () => {
  return (
    <AdsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/nail-designs/:slug" element={<DesignDetail />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/admin" element={<Admin />} />

          {/* Static Pages */}
          <Route
            path="/about"
            element={
              <StaticPage
                title="About Us"
                content={
                  <>
                    <p>
                      Welcome to NailDesigns.art! We are dedicated to curating the most stunning nail art inspiration
                      from around the world.
                    </p>
                    <p>
                      Whether you're looking for simple elegance or bold statements, our gallery helps you find the
                      perfect look for your next manicure.
                    </p>
                  </>
                }
              />
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <StaticPage
                title="Privacy Policy"
                content={<p>Your privacy is important to us. This is a placeholder for the full privacy policy text.</p>}
              />
            }
          />
          <Route
            path="/terms"
            element={
              <StaticPage
                title="Terms & Conditions"
                content={<p>By using this website, you agree to the following terms. This is a placeholder.</p>}
              />
            }
          />
          <Route
            path="/affiliate-disclosure"
            element={
              <StaticPage
                title="Affiliate Disclosure"
                content={
                  <>
                    <p>NailDesigns.art is a participant in various affiliate programs.</p>
                    <p>
                      When you click on links to various merchants on this site and make a purchase, this can result in
                      this site earning a commission. Affiliate programs and affiliations include, but are not limited
                      to, the Amazon Services LLC Associates Program.
                    </p>
                  </>
                }
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </AdsProvider>
  );
};

export default App;
