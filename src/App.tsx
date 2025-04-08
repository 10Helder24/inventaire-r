import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { fetchArticles } from './supabaseClient';
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

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await fetchArticles();
      setArticles(data);
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicView articles={articles} loading={loading} />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/manage" replace /> : <LoginForm />}
        />
        <Route
          path="/manage"
          element={
            user ? (
              <InventoryManager
                articles={articles}
                user={user}
                signOut={signOut}
                onArticleUpdate={loadArticles}
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

export default App
