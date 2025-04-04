import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useAuth } from './auth/AuthContext';
import { LoginForm } from './components/LoginForm';
import { PublicView } from './components/PublicView';
import { InventoryManager } from './components/InventoryManager';
import { InventoryList } from './components/InventoryList';
import { InventorySheet } from './components/InventorySheet';
import type { Article } from './types';

function App() {
  const { user, signOut } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
  
      if (error) {
        console.error('Erreur lors de la récupération des articles:', error);
        return;
      }
  
      setArticles(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PublicView
              articles={articles}
              loading={loading}
            />
          }
        />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/manage" replace />
            ) : (
              <LoginForm />
            )
          }
        />
        <Route
          path="/manage"
          element={
            user ? (
              <InventoryManager
                articles={articles}
                user={user}
                signOut={signOut}
                onArticleUpdate={fetchArticles}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/list"
          element={
            user ? (
              <InventoryList
                articles={articles}
                user={user}
                signOut={signOut}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/sheet"
          element={
            user ? (
              <InventorySheet
                articles={articles}
                user={user}
                signOut={signOut}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;