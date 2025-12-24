import React from 'react';
import Layout from '../components/Layout';

interface StaticPageProps {
  title: string;
  content: React.ReactNode;
}

const StaticPage: React.FC<StaticPageProps> = ({ title, content }) => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 pb-4 border-b border-gray-100">{title}</h1>
        <div className="prose prose-pink max-w-none text-gray-600">
          {content}
        </div>
      </div>
    </Layout>
  );
};

export default StaticPage;