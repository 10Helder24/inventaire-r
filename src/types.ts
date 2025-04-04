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
  role: 'admin' | 'viewer';
}