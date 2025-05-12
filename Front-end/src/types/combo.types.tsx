export interface Combo {
  id: number;
  name: string;
  description: string;
  quantity: number;
  price: number;
  image: string;
  deleted_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ComboCreateRequest {
  name: string;
  description: string;
  quantity: number;
  price: number;
  image: string;
}

export interface ComboUpdateRequest {
  name?: string;
  description?: string;
  quantity?: number;
  price?: number;
  image?: string;
}

export interface ComboCreateResponse {
  message: string;
  combo: Combo;
}

export interface ComboUpdateResponse {
  message: string;
  combo: Combo;
}

export interface ComboListResponse {
  message: string;
  combo: Combo[];
}

export interface ApiError {
  error: string;
  message: string;
  details?: any;
  status: number;
}
