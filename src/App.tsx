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
import { VacationCalendar } from './components/VacationCalendar';
import { VacationRequest } from './components/VacationRequest';
import { VacationAdmin } from './components/VacationAdmin';
import type { Article } from './types';

function App() {
  const { user, signOut } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.app_metadata?.role === 'admin';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicView articles={articles} loading={loading} />} />
        <Route path="/login" element={user ? <Navigate to="/manage" replace /> : <LoginForm />} />
        <Route path="/vacation-calendar" element={<VacationCalendar user={user} signOut={signOut} />} />
        <Route path="/vacation-request" element={<VacationRequest user={user} signOut={signOut} />} />
        <Route
          path="/vacation-admin"
          element={
            user ? (
              isAdmin ? (
                <VacationAdmin user={user} signOut={signOut} />
              ) : (
                <Navigate to="/vacation-calendar" replace />
              )
            ) : (
              <Navigate to="/login" replace />
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

export default App;
