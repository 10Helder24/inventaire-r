export interface Article {
  id: string;
  code: string;
  name: string;
  reference: string;
  stock: number;
  unit: string;
  location: string;
  status: 'new' | 'synchronized';
  comments: string;
  designation2?: string;
  designation3?: string;
  image_url?: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface InventorySheet {
  id: string;
  date: string;
  data: {
    halle: {
      bb: number;
      palette: number;
    }[];
    plastiqueBB: {
      matiere: string;
      bb: number;
      palette: number;
    }[];
    plastiqueBalle: {
      matiere: string;
      balle: number;
      palette: number;
    }[];
    cdt: {
      matiere: string;
      m3: number;
      tonne: number;
    }[];
    papierBalle: {
      numero: string;
      matiere: string;
      balle: number;
    }[];
    autres: {
      diesel: { litres: number; piece: number };
      adBlue: { litres: number; piece: number };
      filFer: { litres: number; piece: number };
    };
    eau: {
      morgevon11: { m3: number; compteur: number };
      morgevon13: { m3: number; compteur: number };
      halleBois: { m3: number; compteur: number };
    };
    machines: {
      numero: string;
      machine: string;
      balle: number;
      heure: number;
    }[];
  };
  created_by: string;
  verified_by?: string;
  created_at: string;
  updated_at: string;
}

export type AbsenceType = 'vacation' | 'sick_leave' | 'training' | 'overtime' | 'bereavement' | 'accident';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface VacationRequest {
  id: string;
  user_email: string;
  start_date: string;
  end_date: string;
  type: AbsenceType;
  status: RequestStatus;
  comment?: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
}

export type Database = {
  public: {
    Tables: {
      articles: {
        Row: Article;
        Insert: Omit<Article, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Article, 'id' | 'created_at' | 'updated_at'>>;
      };
      inventory_sheets: {
        Row: InventorySheet;
        Insert: Omit<InventorySheet, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<InventorySheet, 'id' | 'created_at' | 'updated_at'>>;
      };
      vacation_requests: {
        Row: VacationRequest;
        Insert: Omit<VacationRequest, 'id' | 'created_at' | 'updated_at' | 'status' | 'approved_by' | 'approved_at'>;
        Update: Partial<Omit<VacationRequest, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
};
