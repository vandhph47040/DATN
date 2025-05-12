import axios from 'axios';
import { UserProfile } from '../types/profileTypes';

const API_URL = 'http://localhost:8000/api/user-management';

// Interface cho dữ liệu thô từ API
interface RawUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_verified: boolean;
  role: string;
  total_spent?: number;
  rank?: string;
  points?: number;
  email_verified_at?: string;
}

// Interface cho phản hồi profile đơn lẻ
interface ProfileResponse {
  data?: RawUser; // Backend có thể trả về trực tiếp RawUser hoặc gói trong 'data'
}

// Hàm lấy thông tin profile của người dùng hiện tại
export const getProfile = async (): Promise<UserProfile> => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.');
    }

    const response = await axios.get<ProfileResponse>(`${API_URL}/profile/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });

    const rawUser = response.data.data || response.data; // Hỗ trợ cả 2 kiểu trả về
    if (!rawUser) {
      throw new Error('Không nhận được dữ liệu người dùng từ server');
    }

    return {
      id: String(rawUser.id),
      name: rawUser.name,
      email: rawUser.email,
      phone: rawUser.phone,
      is_verified: rawUser.is_verified,
      role: rawUser.role,
      total_spent: rawUser.total_spent ?? 0,
      rank: rawUser.rank ?? 'Chưa có hạng',
      points: rawUser.points ?? 0,
      email_verified_at: rawUser.email_verified_at,
    };
  } catch (error: any) {
    console.error('Lỗi khi lấy thông tin profile:', error.message);
    throw new Error('Không thể lấy thông tin profile từ server');
  }
};

// Hàm cập nhật thông tin profile
export const updateProfile = async (user: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.');
    }

    const response = await axios.put<ProfileResponse>(`${API_URL}/${userId}`, user, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });

    const rawUser = response.data.data || response.data;
    if (!rawUser) {
      throw new Error('Không nhận được dữ liệu người dùng từ server');
    }

    return {
      id: String(rawUser.id),
      name: rawUser.name,
      email: rawUser.email,
      phone: rawUser.phone,
      is_verified: rawUser.is_verified,
      role: rawUser.role,
      total_spent: rawUser.total_spent ?? 0,
      rank: rawUser.rank ?? 'Chưa có hạng',
      points: rawUser.points ?? 0,
      email_verified_at: rawUser.email_verified_at,
    };
  } catch (error: any) {
    console.error('Lỗi khi cập nhật profile:', error.message);
    throw new Error('Không thể cập nhật profile');
  }
};

// Hàm lấy profile theo ID
export const getProfileById = async (id: string): Promise<UserProfile> => {
  try {
    const response = await axios.get<ProfileResponse>(`${API_URL}/profile/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });

    const rawUser = response.data.data || response.data;
    if (!rawUser) {
      throw new Error('Không nhận được dữ liệu người dùng từ server');
    }

    return {
      id: String(rawUser.id),
      name: rawUser.name,
      email: rawUser.email,
      phone: rawUser.phone,
      is_verified: rawUser.is_verified,
      role: rawUser.role,
      total_spent: rawUser.total_spent ?? 0,
      rank: rawUser.rank ?? 'Chưa có hạng',
      points: rawUser.points ?? 0,
      email_verified_at: rawUser.email_verified_at,
    };
  } catch (error: any) {
    console.error('Lỗi khi lấy thông tin profile theo ID:', error.message);
    throw new Error('Không thể lấy thông tin profile theo ID');
  }
};