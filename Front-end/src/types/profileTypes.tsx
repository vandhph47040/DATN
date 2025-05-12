export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_verified: boolean;
  role: string;
  total_spent: number;
  rank: string;
  points: number;
  email_verified_at?: string;
}

export interface PointsHistory {
  id: string;
  user_id: string;
  points: number;
  description?: string;
  created_at: string;
}

export interface RankHistory {
  id: string;
  user_id: string;
  rank: string;
  assigned_at: string;
}