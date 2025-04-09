import React, { useState, useEffect } from 'react';
import { Package, LogOut, Calendar, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import type { VacationRequest, AbsenceType } from '../types';

interface VacationCalendarProps {
  user: any;
  signOut: () => Promise<void>;
}

const DAYS_IN_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);
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

interface EmployeeInfo {
  email: string;
  name: string;
}

export function VacationCalendar({ user, signOut }: VacationCalendarProps) {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([]);
  const [employees, setEmployees] = useState<EmployeeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.app_metadata?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Create date range for the selected month
        const startDate = new Date(Date.UTC(selectedYear, selectedMonth, 1));
        const endDate = new Date(Date.UTC(selectedYear, selectedMonth + 1, 0));

        const { data: requests, error: requestsError } = await supabase
          .from('vacation_requests')
          .select('*')
          .or(`start_date.lte.${endDate.toISOString()},end_date.gte.${startDate.toISOString()}`);

        if (requestsError) throw requestsError;

        const uniqueEmployees = [...new Set(requests?.map(r => ({ email: r.user_email, name: r.name })) || [])];
        setEmployees(uniqueEmployees.sort((a, b) => a.name.localeCompare(b.name)));
        setVacationRequests(requests || []);
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

  const getAbsenceForDay = (email: string, day: number): { type: AbsenceType; status: string } | null => {
    const currentDate = new Date(Date.UTC(selectedYear, selectedMonth, day));
    
    const request = vacationRequests.find(r => {
      const startDate = new Date(r.start_date);
      const endDate = new Date(r.end_date);
      
      // Convert dates to UTC to avoid timezone issues
      const startUTC = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endUTC = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      const currentUTC = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      
      return r.user_email === email && currentUTC >= startUTC && currentUTC <= endUTC;
    });

    return request ? { type: request.type, status: request.status } : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              <h1 className="text-xl font-bold">Suivi des absences mensuel</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-md transition-colors"
              >
                <Home className="h-5 w-5" />
                <span className="hidden sm:inline">Accueil</span>
              </button>
              {user ? (
                <>
                  <button
                    onClick={() => navigate('/vacation-request')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-md transition-colors"
                  >
                    <span>Demander un congé</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => navigate('/vacation-admin')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-md transition-colors"
                    >
                      <span>Gérer les demandes</span>
                    </button>
                  )}
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
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-md transition-colors"
                >
                  <span>Se connecter</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
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

            <div className="flex flex-wrap gap-4">
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="border px-2 py-1 bg-gray-50 text-left">Nom</th>
                    {DAYS_IN_MONTH.map(day => (
                      <th key={day} className="border px-2 py-1 bg-gray-50 text-center w-7">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map(employee => (
                    <tr key={employee.email}>
                      <td className="border px-2 py-1">{employee.name || employee.email.split('@')[0]}</td>
                      {DAYS_IN_MONTH.map(day => {
                        const absence = getAbsenceForDay(employee.email, day);
                        const cellClass = absence
                          ? absence.status === 'rejected'
                            ? 'bg-red-100'
                            : absence.status === 'approved'
                            ? TYPE_COLORS[absence.type]
                            : 'bg-gray-100'
                          : '';
                        return (
                          <td
                            key={day}
                            className={`border px-2 py-1 text-center ${cellClass}`}
                            title={absence ? `${TYPE_LABELS[absence.type]} (${absence.status})` : ''}
                          >
                            {absence ? '•' : ''}
                          </td>
                        );
                      })}
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
