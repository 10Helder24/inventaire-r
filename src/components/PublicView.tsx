import React, { useState } from 'react';
import { Package, LogIn, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Article } from '../types';

interface PublicViewProps {
  articles: Article[];
  loading: boolean;
}

export function PublicView({ articles, loading }: PublicViewProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...new Set(articles.map(article => article.category))].filter(Boolean);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white shadow-lg fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6" />
                <h1 className="text-xl font-bold">Inventaire</h1>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-md transition-colors"
              >
                <LogIn className="h-5 w-5" />
                <span className="hidden sm:inline">Connexion</span>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-green-700 border border-green-500 rounded-md text-white placeholder-green-200"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-green-200 flex-shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-green-700 border border-green-500 rounded-md py-2 px-3 text-white"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-32 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredArticles.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              Aucun article trouvé
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {article.image_url && (
                  <div className="relative pb-[60%]">
                    <img
                      src={article.image_url}
                      alt={article.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="text-xs font-medium text-green-600 mb-1">
                    {article.category || 'Non catégorisé'}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{article.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">Ref: {article.reference || '-'}</p>
                  <div className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-gray-900">
                      Stock: {article.stock || 0} {article.unit || 'unité(s)'}
                    </span>
                    {article.location && (
                      <span className="text-gray-500 truncate">
                        {article.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
