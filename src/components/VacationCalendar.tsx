import React, { useState, useEffect } from 'react';
import { Package, LogOut, Calendar, ChevronLeft, ChevronRight, Home, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import type { VacationRequest, AbsenceType } from '../types';

interface VacationCalendarProps {
  user: any;
  signOut: () => Promise<void>;
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const TYPE_COLORS: Record<AbsenceType, string> = {
  vacation: 'bg-blue-200',
  sick_leave: 'bg-yellow-200',
  training: 'bg-orange-200',
  overtime: 'bg-green-200',
  bereavement: 'bg-gray-200',
  accident: 'bg-purple-200'
};

const TYPE_LABELS: Record<AbsenceType, string> = {
  vacation: 'Vacances',
  sick_leave: 'Maladie',
  training: 'Cours / Formation',
  overtime: 'Heures Sup.',
  bereavement: 'Congé décès',
  accident: 'Accident'
};

// Fonction pour normaliser les noms
function normalizeName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    // Si le nom contient au moins deux parties, on considère la dernière comme le nom de famille
    const lastName = parts.pop() || '';
    const firstName = parts.join(' ');
    return { firstName, lastName };
  }
  return { firstName: '', lastName: name };
}

// Fonction de comparaison pour le tri
function compareNames(a: string, b: string): number {
  const nameA = normalizeName(a);
  const nameB = normalizeName(b);
  
  // D'abord comparer les noms de famille
  const lastNameCompare = nameA.lastName.localeCompare(nameB.lastName, 'fr');
  if (lastNameCompare !== 0) return lastNameCompare;
  
  // Si les noms de famille sont identiques, comparer les prénoms
  return nameA.firstName.localeCompare(nameB.firstName, 'fr');
}

export function VacationCalendar({ user, signOut }: VacationCalendarProps) {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.app_metadata?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get all approved requests
        const { data: requests, error } = await supabase
          .from('vacation_requests')
          .select('*')
          .eq('status', 'approved');

        if (error) throw error;

        // Filter requests that overlap with the selected month
        const filteredRequests = (requests || []).filter(request => {
          const requestStart = new Date(request.start_date);
          const requestEnd = new Date(request.end_date);
          const monthStart = new Date(selectedYear, selectedMonth, 1);
          const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);

          // Set times to ensure proper comparison
          monthStart.setHours(0, 0, 0, 0);
          monthEnd.setHours(23, 59, 59, 999);
          requestStart.setHours(0, 0, 0, 0);
          requestEnd.setHours(23, 59, 59, 999);

          return (
            (requestStart <= monthEnd && requestEnd >= monthStart) ||
            (requestEnd >= monthStart && requestStart <= monthEnd)
          );
        });

        setVacationRequests(filteredRequests);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const getAbsenceForDay = (name: string, day: number): { type: AbsenceType; status: string } | null => {
    const currentDate = new Date(selectedYear, selectedMonth, day);
    currentDate.setHours(0, 0, 0, 0);
    
    const request = vacationRequests.find(r => {
      if (r.name !== name) return false;
      
      const startDate = new Date(r.start_date);
      const endDate = new Date(r.end_date);
      
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      return currentDate >= startDate && currentDate <= endDate;
    });

    return request ? { type: request.type, status: request.status } : null;
  };

  // Get unique employees who have vacations in the current month and sort them properly
  const employeesForMonth = Array.from(
    new Set(vacationRequests.map(r => r.name))
  ).sort(compareNames);

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              <h1 className="text-xl font-bold">Suivi des absences</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 hover:bg-green-700 rounded-md"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className={`${showMobileMenu ? 'absolute top-full left-0 right-0 bg-green-600 shadow-lg p-4' : 'hidden'} md:flex md:static md:bg-transparent md:shadow-none md:p-0 flex-col md:flex-row items-start md:items-center gap-2`}>
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-green-700 rounded-md w-full md:w-auto"
                >
                  <Home className="h-5 w-5" />
                  <span>Accueil</span>
                </button>
                {user ? (
                  <>
                    <button
                      onClick={() => navigate('/vacation-request')}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-green-700 rounded-md w-full md:w-auto"
                    >
                      <Calendar className="h-5 w-5" />
                      <span>Demander un congé</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => navigate('/vacation-admin')}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-green-700 rounded-md w-full md:w-auto"
                      >
                        <Calendar className="h-5 w-5" />
                        <span>Gérer les demandes</span>
                      </button>
                    )}
                    <div className="hidden md:flex items-center gap-1 text-sm">
                      <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                      <span>{user.email}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-green-700 rounded-md w-full md:w-auto"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Déconnexion</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-green-700 rounded-md w-full md:w-auto"
                  >
                    <span>Se connecter</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="border rounded-md px-3 py-1"
                >
                  {MONTHS.map((month, index) => (
                    <option key={month} value={index}>{month}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="border rounded-md px-3 py-1"
                >
                  {Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:flex flex-wrap gap-2 md:gap-4">
              {Object.entries(TYPE_LABELS).map(([type, label]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${TYPE_COLORS[type as AbsenceType]}`}></div>
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Chargement...</div>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="sticky left-0 z-10 bg-gray-50 border px-2 py-1 text-left">Nom</th>
                      {daysArray.map(day => (
                        <th key={day} className="border px-2 py-1 text-center w-7">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {employeesForMonth.map(name => (
                      <tr key={name}>
                        <td className="sticky left-0 z-10 bg-white border px-2 py-1 font-medium">
                          {name}
                        </td>
                        {daysArray.map(day => {
                          const absence = getAbsenceForDay(name, day);
                          return (
                            <td
                              key={day}
                              className={`border px-2 py-1 text-center ${absence ? TYPE_COLORS[absence.type] : ''}`}
                              title={absence ? `${TYPE_LABELS[absence.type]}` : ''}
                            >
                              {absence && '•'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
