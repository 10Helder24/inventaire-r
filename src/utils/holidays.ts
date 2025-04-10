// Liste des jours fériés fixes du canton de Vaud
const FIXED_HOLIDAYS = [
    { day: 1, month: 1 },   // Nouvel An
    { day: 2, month: 1 },   // Saint-Berchtold
    { day: 1, month: 5 },   // Fête du travail
    { day: 1, month: 8 },   // Fête nationale
    { day: 25, month: 12 }, // Noël
  ];
  
  // Calcule la date de Pâques pour une année donnée (Algorithme de Meeus/Jones/Butcher)
  function getEasterDate(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }
  
  // Ajoute un nombre de jours à une date
  function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  
  // Obtient tous les jours fériés pour une année donnée
  export function getHolidays(year: number): Date[] {
    // Calcul de Pâques et des jours fériés mobiles
    const easter = getEasterDate(year);
    const goodFriday = addDays(easter, -2);
    const easterMonday = addDays(easter, 1);
    const ascension = addDays(easter, 39);
    const whitMonday = addDays(easter, 50);
    const corpusChristi = addDays(easter, 60);
    const federalFastMonday = new Date(year, 8, 15 + (1 - new Date(year, 8, 15).getDay()) % 7);
  
    // Jours fériés fixes
    const fixedDates = FIXED_HOLIDAYS.map(({ day, month }) => new Date(year, month - 1, day));
  
    // Combine tous les jours fériés
    return [
      ...fixedDates,
      goodFriday,        // Vendredi Saint
      easterMonday,      // Lundi de Pâques
      ascension,         // Ascension
      whitMonday,        // Lundi de Pentecôte
      corpusChristi,     // Fête-Dieu
      federalFastMonday, // Lundi du Jeûne fédéral
    ];
  }
  
  // Vérifie si une date est un jour férié
  export function isHoliday(date: Date, holidays: Date[]): boolean {
    return holidays.some(holiday => 
      holiday.getDate() === date.getDate() &&
      holiday.getMonth() === date.getMonth() &&
      holiday.getFullYear() === date.getFullYear()
    );
  }
  
  // Compte le nombre de jours ouvrables entre deux dates (excluant weekends et jours fériés)
  export function getWorkingDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Normaliser les dates pour éviter les problèmes d'heures
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
  
    // Obtenir les jours fériés pour l'année ou les années concernées
    const years = new Set([start.getFullYear(), end.getFullYear()]);
    const holidays = Array.from(years).flatMap(year => getHolidays(year));
  
    let workingDays = 0;
    const current = new Date(start);
  
    while (current <= end) {
      // Vérifier si ce n'est pas un weekend (0 = dimanche, 6 = samedi)
      if (current.getDay() !== 0 && current.getDay() !== 6) {
        // Vérifier si ce n'est pas un jour férié
        if (!isHoliday(current, holidays)) {
          workingDays++;
        }
      }
      current.setDate(current.getDate() + 1);
    }
  
    return workingDays;
  }