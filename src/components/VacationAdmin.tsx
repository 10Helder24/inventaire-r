import React, { useState, useEffect } from 'react';
import { LogOut, Calendar, ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import { getWorkingDays } from '../utils/holidays';

interface VacationAdminProps {
  user: any;
  signOut: () => Promise<void>;
}

interface VacationRequest {
  id: string;
  user_email: string;
  name: string;
  start_date: string;
  end_date: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  created_at: string;
}

interface VacationStats {
  totalDays: number;
  vacationDays: number;
  sickDays: number;
  trainingDays: number;
  overtimeDays: number;
  bereavementDays: number;
  accidentDays: number;
}

export function VacationAdmin({ user, signOut }: VacationAdminProps) {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [stats, setStats] = useState<VacationStats>({
    totalDays: 0,
    vacationDays: 0,
    sickDays: 0,
    trainingDays: 0,
    overtimeDays: 0,
    bereavementDays: 0,
    accidentDays: 0
  });

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('vacation_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Get unique employees from approved requests
  const employees = Array.from(new Set(requests
    .filter(r => r.status === 'approved')
    .map(r => r.name)))
    .sort((a, b) => a.localeCompare(b));

  // Calculate statistics when employee or year changes
  useEffect(() => {
    if (!selectedEmployee) {
      setStats({
        totalDays: 0,
        vacationDays: 0,
        sickDays: 0,
        trainingDays: 0,
        overtimeDays: 0,
        bereavementDays: 0,
        accidentDays: 0
      });
      return;
    }

    const employeeRequests = requests.filter(r => 
      r.name === selectedEmployee && 
      r.status === 'approved' &&
      new Date(r.start_date).getFullYear() === selectedYear
    );

    const newStats = {
      totalDays: 0,
      vacationDays: 0,
      sickDays: 0,
      trainingDays: 0,
      overtimeDays: 0,
      bereavementDays: 0,
      accidentDays: 0
    };

    employeeRequests.forEach(request => {
      // Utiliser getWorkingDays pour exclure les weekends et jours fériés
      const days = getWorkingDays(
        new Date(request.start_date),
        new Date(request.end_date)
      );
      
      switch (request.type) {
        case 'vacation':
          newStats.vacationDays += days;
          break;
        case 'sick_leave':
          newStats.sickDays += days;
          break;
        case 'training':
          newStats.trainingDays += days;
          break;
        case 'overtime':
          newStats.overtimeDays += days;
          break;
        case 'bereavement':
          newStats.bereavementDays += days;
          break;
        case 'accident':
          newStats.accidentDays += days;
          break;
      }
    });

    newStats.totalDays = 
      newStats.vacationDays +
      newStats.sickDays +
      newStats.trainingDays +
      newStats.overtimeDays +
      newStats.bereavementDays +
      newStats.accidentDays;

    setStats(newStats);
  }, [selectedEmployee, selectedYear, requests]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('vacation_requests')
        .update({
          status: newStatus,
          approved_by: user.email,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success(`Demande ${newStatus === 'approved' ? 'approuvée' : 'rejetée'} avec succès`);
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Erreur lors de la mise à jour de la demande');
    }
  };

  const handleDelete = async (requestId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      return;
    }

    try {
      setDeleteLoading(requestId);
      const { error } = await supabase
        .from('vacation_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Demande supprimée avec succès');
      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Erreur lors de la suppression de la demande');
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvée';
      case 'rejected':
        return 'Rejetée';
      default:
        return 'En attente';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              <h1 className="text-xl font-bold">Administration des congés</h1>
            </div>
            <div className="flex items-center gap-4">
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
        {/* Statistics Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Statistiques des congés</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employé
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Sélectionner un employé</option>
                {employees.map(employee => (
                  <option key={employee} value={employee}>
                    {employee}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Année
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full border rounded-md px-3 py-2"
              >
                {Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedEmployee && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600">Vacances</div>
                <div className="text-2xl font-bold text-blue-700">{stats.vacationDays} jours</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600">Maladie</div>
                <div className="text-2xl font-bold text-yellow-700">{stats.sickDays} jours</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600">Formation</div>
                <div className="text-2xl font-bold text-orange-700">{stats.trainingDays} jours</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600">Heures Sup.</div>
                <div className="text-2xl font-bold text-green-700">{stats.overtimeDays} jours</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Congé décès</div>
                <div className="text-2xl font-bold text-gray-700">{stats.bereavementDays} jours</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600">Accident</div>
                <div className="text-2xl font-bold text-purple-700">{stats.accidentDays} jours</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg col-span-2">
                <div className="text-sm text-indigo-600">Total</div>
                <div className="text-2xl font-bold text-indigo-700">{stats.totalDays} jours</div>
              </div>
            </div>
          )}
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">Chargement des demandes...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">Aucune demande de congé à traiter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Demandeur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.user_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(request.id, 'approved')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approuver
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Rejeter
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(request.id)}
                            disabled={deleteLoading === request.id}
                            className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
