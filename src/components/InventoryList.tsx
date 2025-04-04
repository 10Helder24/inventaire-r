import React, { useState } from 'react';
import { Package, LogOut, Search, FolderOpen, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Article } from '../types';

interface InventoryListProps {
  articles: Article[];
  user: any;
  signOut: () => Promise<void>;
}

export function InventoryList({ articles, user, signOut }: InventoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const navigate = useNavigate();

  // Extract unique categories from articles
  const categories = ['all', ...new Set(articles.map(article => article.category))].filter(Boolean);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <h1 className="text-xl font-bold">Liste d'inventaire</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/manage')}
              className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-md transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Retour
            </button>
            <div className="flex items-center gap-1 text-sm">
              <div className="w-2 h-2 bg-green-300 rounded-full"></div>
              <span>Vous travaillez en ligne</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-green-700 rounded-full transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md"
              />
            </div>
            <div className="w-64 flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border rounded-md py-2 px-3"
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

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Code</th>
                  <th className="px-4 py-2 text-left">Référence</th>
                  <th className="px-4 py-2 text-left">Nom</th>
                  <th className="px-4 py-2 text-left">Catégorie</th>
                  <th className="px-4 py-2 text-right">Stock</th>
                  <th className="px-4 py-2 text-left">Unité</th>
                  <th className="px-4 py-2 text-left">Emplacement</th>
                  <th className="px-4 py-2 text-left">Commentaires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{article.code || '-'}</td>
                    <td className="px-4 py-2">{article.reference || '-'}</td>
                    <td className="px-4 py-2 font-medium">{article.name}</td>
                    <td className="px-4 py-2">{article.category || 'Non catégorisé'}</td>
                    <td className="px-4 py-2 text-right">{article.stock || 0}</td>
                    <td className="px-4 py-2">{article.unit || '-'}</td>
                    <td className="px-4 py-2">{article.location || '-'}</td>
                    <td className="px-4 py-2">
                      {article.comments ? (
                        <div className="max-w-xs truncate" title={article.comments}>
                          {article.comments}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}