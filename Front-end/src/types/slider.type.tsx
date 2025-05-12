export interface Slider {
  id: number;
  title: string;
  image_path: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SliderFormData {
  title: string;
  image: File | null;
  is_active: boolean;
}

export interface SliderResponse {
  success: boolean;
  data: Slider[];
  message?: string;
}

export interface SliderDetailResponse {
  success: boolean;
  data: Slider;
  message?: string;
}
