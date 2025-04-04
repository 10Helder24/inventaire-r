import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithOtp: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Erreur récupération session:', error);
          return;
        }

        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Erreur vérification session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setUser(data.user);
      toast.success('Connexion réussie');
    } catch (error: any) {
      console.error('Erreur de connexion:', error.message);
      toast.error('Erreur de connexion: ' + error.message);
      throw error;
    }
  };

  const signInWithOtp = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });

      if (error) throw error;

      toast.success('Lien magique envoyé à: ' + email);
    } catch (error: any) {
      console.error('Erreur OTP:', error.message);
      toast.error('Erreur OTP: ' + error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.warn('Aucune session active trouvée');
        setUser(null);
        return;
      }

      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      toast.success('Déconnexion réussie');
    } catch (error: any) {
      console.error('Erreur de déconnexion:', error.message);
      toast.error('Erreur de déconnexion: ' + error.message);
      
      // Force reset user state even if logout fails
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}