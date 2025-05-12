import axios from 'axios';
import { UserProfile } from '../types/profileTypes';
import { User } from '../types/user.type';

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

interface UserResponse {
  users: RawUser[];
  trashedUsers: RawUser[];
}

interface ProfileResponse {
  data: RawUser;
}

// Hàm lấy thông tin profile của người dùng hiện tại
export const getProfile = async (): Promise<UserProfile> => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.');
    }

    const response = await axios.get<ProfileResponse>(`${API_URL}/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });

    const rawUser = response.data.data || response.data;
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
    const response = await axios.get<ProfileResponse>(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });

    const rawUser = response.data.data || response.data;
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

// Hàm lấy danh sách người dùng
export const getUsers = async (): Promise<{ users: User[]; trashedUsers: User[] }> => {
  try {
    const response = await axios.get<UserResponse>(API_URL);
    const userData = response.data.users || [];
    const trashedUserData = response.data.trashedUsers || [];
    return {
      users: userData.map((rawUser: RawUser) => ({
        id: rawUser.id,
        name: rawUser.name,
        email: rawUser.email,
        phone: rawUser.phone,
        is_verified: rawUser.is_verified,
        role: rawUser.role,
        is_deleted: trashedUserData.some((t) => t.id === rawUser.id),
      })),
      trashedUsers: trashedUserData.map((rawUser: RawUser) => ({
        id: rawUser.id,
        name: rawUser.name,
        email: rawUser.email,
        phone: rawUser.phone,
        is_verified: rawUser.is_verified,
        role: rawUser.role,
        is_deleted: true,
      })),
    };
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    throw error;
  }
};

// Hàm tìm kiếm người dùng
export const searchUsers = async (field: 'name' | 'email', keyword: string): Promise<User[]> => {
  try {
    const response = await axios.get<UserResponse>(API_URL);
    const userData = response.data.users || [];
    const filteredUsers = userData.filter((user: RawUser) =>
      user[field].toLowerCase().includes(keyword.toLowerCase())
    );
    return filteredUsers.map((rawUser: RawUser) => ({
      id: rawUser.id,
      name: rawUser.name,
      email: rawUser.email,
      phone: rawUser.phone,
      is_verified: rawUser.is_verified,
      role: rawUser.role,
      is_deleted: response.data.trashedUsers.some((t) => t.id === rawUser.id),
    }));
  } catch (error: any) {
    console.error('Lỗi khi tìm kiếm người dùng:', error);
    throw error;
  }
};

// Hàm khóa người dùng
export const deleteUser = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error: any) {
    console.error('Lỗi khi khóa người dùng:', error);
    throw error;
  }
};

// Hàm khôi phục người dùng
export const restoreUser = async (id: number): Promise<void> => {
  try {
    await axios.put(`${API_URL}/restore/${id}`);
  } catch (error: any) {
    console.error('Lỗi khi khôi phục người dùng:', error);
    throw error;
  }
};

// Hàm cập nhật thông tin người dùng
export const updateUser = async (id: number, user: Partial<User>): Promise<User> => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, user);
    return { ...response.data.data, is_deleted: false };
  } catch (error: any) {
    console.error('Lỗi khi cập nhật người dùng:', error);
    throw error;
  }
};