import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Package, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../supabaseClient';

export function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // État pour basculer entre inscription et connexion

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let data, error;

      if (isSignUp) {
        // Inscription
        ({ data, error } = await supabase.auth.signUp({ email, password }));
        if (data?.user) {
          toast.success('Compte créé avec succès ! Vérifie ton email.');
        }
      } else {
        // Connexion
        ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
        if (data?.user) {
          toast.success('Connexion réussie !');
        }
      }

      if (error) {
        console.error('Erreur d\'authentification:', error);
        toast.error(error.message || 'Une erreur est survenue');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Package className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isSignUp ? 'Créer un compte' : 'Connexion'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {loading ? 'Chargement...' : isSignUp ? 'Créer un compte' : 'Se connecter'}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-green-600 hover:text-green-700 text-sm"
            >
              {isSignUp ? 'Déjà un compte ? Connecte-toi' : "Pas encore de compte ? Inscris-toi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}