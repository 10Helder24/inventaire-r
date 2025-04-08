import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Package, Search, Plus, Save, LogOut, Upload, Trash2, X, FolderOpen, List, FileSpreadsheet, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { Article } from '../types';

interface InventoryManagerProps {
  articles: Article[];
  user: any;
  signOut: () => Promise<void>;
  onArticleUpdate: () => void;
}

export function InventoryManager({ articles, user, signOut, onArticleUpdate }: InventoryManagerProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const imageUrl = watch('image_url');
  const navigate = useNavigate();
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.app_metadata?.role === 'admin';

  const categories = ['all', ...new Set(articles.map(article => article.category))].filter(Boolean);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!user) {
        toast.error('Vous devez être connecté pour télécharger une image');
        return;
      }

      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 2MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Le fichier doit être une image');
        return;
      }

      setUploading(true);
      toast.loading('Téléchargement en cours...');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('articles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('articles')
        .getPublicUrl(filePath);

      setValue('image_url', publicUrl);
      toast.dismiss();
      toast.success('Image téléchargée avec succès');
    } catch (error: any) {
      console.error('Error:', error);
      toast.dismiss();
      toast.error(error.message || 'Erreur lors du téléchargement de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      if (!user) return;

      const article = {
        name: formData.name,
        reference: formData.reference,
        stock: formData.stock,
        unit: formData.unit,
        location: formData.location,
        code: formData.code,
        comments: formData.comments,
        designation2: formData.designation2,
        designation3: formData.designation3,
        image_url: formData.image_url,
        category: formData.category || 'Non catégorisé'
      };

      if (selectedArticle) {
        const { error } = await supabase
          .from('articles')
          .update(article)
          .eq('id', selectedArticle.id);

        if (error) throw error;
        toast.success('Article mis à jour avec succès');
      } else {
        const { error } = await supabase
          .from('articles')
          .insert([article]);

        if (error) throw error;
        toast.success('Article créé avec succès');
      }

      onArticleUpdate();
      reset();
      setSelectedArticle(null);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async () => {
    if (!selectedArticle) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', selectedArticle.id);

      if (error) throw error;

      toast.success('Article supprimé avec succès');
      onArticleUpdate();
      reset();
      setSelectedArticle(null);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const selectArticle = (article: Article) => {
    setSelectedArticle(article);
    Object.entries(article).forEach(([key, value]) => {
      setValue(key, value);
    });
  };

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
      <header className="bg-green-600 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6" />
                <h1 className="text-xl font-bold">Gestion de l'inventaire</h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 ml-auto">
              <button
                onClick={() => navigate('/sheet')}
                className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-md transition-colors"
              >
                <FileSpreadsheet className="h-5 w-5" />
                <span className="hidden sm:inline">Feuille d'inventaire</span>
              </button>
              <button
                onClick={() => navigate('/list')}
                className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-md transition-colors"
              >
                <List className="h-5 w-5" />
                <span className="hidden sm:inline">Vue liste</span>
              </button>
              {isAdmin ? (
                <button
                  onClick={() => navigate('/vacation-admin')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-md transition-colors"
                >
                  <Calendar className="h-5 w-5" />
                  <span className="hidden sm:inline">Gérer les congés</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/vacation-request')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-md transition-colors"
                >
                  <Calendar className="h-5 w-5" />
                  <span className="hidden sm:inline">Demander un congé</span>
                </button>
              )}
              <div className="hidden sm:flex items-center gap-1 text-sm">
                <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                <span>En ligne</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm hidden sm:inline">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="p-2 hover:bg-green-700 rounded-full transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-20 pb-6 flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-80 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md"
              />
            </div>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border rounded-md py-1"
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
          <div className="divide-y divide-gray-100 max-h-[calc(100vh-16rem)] overflow-y-auto">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => selectArticle(article)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedArticle?.id === article.id ? 'bg-gray-50' : ''
                }`}
              >
                {article.image_url && (
                  <img
                    src={article.image_url}
                    alt={article.name}
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                )}
                <div className="font-medium text-gray-900">{article.name}</div>
                <div className="text-sm text-gray-600 mt-1">{article.reference}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Catégorie: {article.category || 'Non catégorisé'}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="flex-1 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedArticle ? 'Modifier l\'article' : 'Nouvel article'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {selectedArticle && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="hidden sm:inline">Supprimer</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setSelectedArticle(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  {selectedArticle ? (
                    <>
                      <X className="h-5 w-5" />
                      <span className="hidden sm:inline">Annuler</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      <span className="hidden sm:inline">Nouveau</span>
                    </>
                  )}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                >
                  <Save className="h-5 w-5" />
                  <span className="hidden sm:inline">
                    {selectedArticle ? 'Mettre à jour' : 'Enregistrer'}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <div className="mt-1 flex items-center gap-4">
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg"
                    />
                  )}
                  <label className="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Upload className="h-5 w-5 mr-2" />
                    {uploading ? 'Téléchargement...' : 'Télécharger une image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                <input
                  type="hidden"
                  {...register('image_url')}
                />
              </div>

              <div className="col-span-full sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <input
                  {...register('category')}
                  placeholder="Ex: Électronique, Outillage..."
                  className="w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="col-span-full sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Référence
                </label>
                <input
                  {...register('reference')}
                  className="w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="col-span-full sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  {...register('name')}
                  className="w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="col-span-full sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  {...register('stock')}
                  className="w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="col-span-full sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unité
                </label>
                <input
                  {...register('unit')}
                  className="w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="col-span-full sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emplacement
                </label>
                <input
                  {...register('location')}
                  className="w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="col-span-full sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code-barres
                </label>
                <input
                  {...register('code')}
                  className="w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaire
                </label>
                <textarea
                  {...register('comments')}
                  rows={3}
                  className="w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="col-span-full sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Désignation 2
                </label>
                <input
                  {...register('designation2')}
                  className="w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="col-span-full sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Désignation 3
                </label>
                <input
                  {...register('designation3')}
                  className="w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
