import React, { useState } from 'react';
import { Package, LogOut, Calendar, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import type { AbsenceType } from '../types';

interface VacationRequestProps {
  user: any;
  signOut: () => Promise<void>;
}

const TYPE_LABELS: Record<AbsenceType, string> = {
  vacation: 'Vacances',
  sick_leave: 'Maladie',
  training: 'Cours / Formation',
  overtime: 'Heures Sup.',
  bereavement: 'Congé décès',
  accident: 'Accident'
};

interface FormData {
  name: string;
  email: string;
  start_date: string;
  end_date: string;
  type: AbsenceType;
  comment: string;
}

export function VacationRequest({ user, signOut }: VacationRequestProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  
  // Watch the start_date field to use in end_date validation
  const startDate = watch('start_date');

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('vacation_requests')
        .insert([{
          user_email: user?.email || data.email,
          name: data.name,
          start_date: data.start_date,
          end_date: data.end_date,
          type: data.type,
          comment: data.comment
        }]);

      if (error) throw error;

      toast.success('Demande envoyée avec succès');
      navigate('/vacation-calendar');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Erreur lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              <h1 className="text-xl font-bold">Demande de congé</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-md transition-colors"
              >
                <Home className="h-5 w-5" />
                <span className="hidden sm:inline">Accueil</span>
              </button>
              <button
                onClick={() => navigate('/vacation-calendar')}
                className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-md transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Retour au calendrier
              </button>
              {user && (
                <>
                  <div className="hidden sm:flex items-center gap-1 text-sm">
                    <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                    <span>En ligne</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm hidden sm:inline">{user.email}</span>
                    <button
                      onClick={handleSignOut}
                      className="p-2 hover:bg-green-700 rounded-full transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom et prénom
              </label>
              <input
                type="text"
                {...register('name', { required: 'Le nom est requis' })}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Jean Dupont"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {!user && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'L\'email est requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Adresse email invalide'
                    }
                  })}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="votre@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'absence
              </label>
              <select
                {...register('type', { required: 'Ce champ est requis' })}
                className="w-full border rounded-md px-3 py-2"
              >
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  {...register('start_date', { 
                    required: 'Ce champ est requis',
                    min: {
                      value: new Date().toISOString().split('T')[0],
                      message: 'La date de début doit être aujourd\'hui ou après'
                    }
                  })}
                  className="w-full border rounded-md px-3 py-2"
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  {...register('end_date', { 
                    required: 'Ce champ est requis',
                    validate: value => 
                      !startDate || value >= startDate || 
                      'La date de fin doit être égale ou postérieure à la date de début'
                  })}
                  className="w-full border rounded-md px-3 py-2"
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commentaire (optionnel)
              </label>
              <textarea
                {...register('comment')}
                rows={3}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Envoi...' : 'Envoyer la demande'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
