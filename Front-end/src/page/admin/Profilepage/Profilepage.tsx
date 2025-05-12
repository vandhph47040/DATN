import { useState, useEffect } from 'react';
import { Button, Form, Input, message } from 'antd';
import { useAuthContext } from '../../../ClientComponents/UseContext/TokenContext';
import axios from 'axios';
import styles from './Profile.module.css';

interface UserProfile {
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

const API_URL = 'http://localhost:8000/api';

const Profilepage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const { tokenUserId } = useAuthContext();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${tokenUserId}`,
        },
      });
      const userProfile = response.data;
      setProfile(userProfile);
      form.setFieldsValue(userProfile);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi tải thông tin profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenUserId) {
      fetchProfile();
    } else {
      setError('Vui lòng đăng nhập để xem thông tin profile');
    }
  }, [tokenUserId]);

  const handleUpdateProfile = async (values: Partial<UserProfile>) => {
    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}/update-profile`, values, {
        headers: {
          Authorization: `Bearer ${tokenUserId}`,
        },
      });
      const updatedProfile = response.data;
      setProfile(updatedProfile); // Cập nhật state với dữ liệu mới
      form.setFieldsValue(updatedProfile); // Đồng bộ form với dữ liệu mới
      setEditMode(false);
      message.success('Cập nhật thông tin profile thành công!');
    } catch (err: any) {
      message.error(err.message || 'Cập nhật profile thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  if (error) {
    return <div className={styles.error}>Lỗi: {error}</div>;
  }

  if (!profile) {
    return <div className={styles.error}>Không tìm thấy thông tin profile</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Thông tin cá nhân</h1>
      {editMode ? (
        <Form
          form={form}
          onFinish={handleUpdateProfile}
          layout="vertical"
          className={styles.profileCard}
        >
          <Form.Item
            name="name"
            label="Tên"
            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
          >
            <Input className={styles.input} />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
          >
            <Input className={styles.input} />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input className={styles.input} />
          </Form.Item>
          <Form.Item>
            <Button
              className={styles.buttonPrimary}
              htmlType="submit"
              loading={loading}
            >
              Lưu
            </Button>
            <Button
              className={styles.buttonDefault}
              style={{ marginLeft: '10px' }}
              onClick={() => setEditMode(false)}
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <div className={styles.profileCard}>
          <div className={styles.profileItem}>
            <span className={styles.label}>ID:</span>
            <span className={styles.profileValue}>{profile.id}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>Tên:</span>
            <span className={styles.profileValue}>{profile.name}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>Email:</span>
            <span className={styles.profileValue}>{profile.email}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>Số điện thoại:</span>
            <span className={styles.profileValue}>{profile.phone}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>Xác minh:</span>
            <span className={styles.profileValue}>
              {profile.is_verified ? 'Đã xác minh' : 'Chưa xác minh'}
            </span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>Vai trò:</span>
            <span className={styles.profileValue}>{profile.role}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>Tổng chi tiêu:</span>
            <span className={styles.profileValue}>{profile.total_spent}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>Hạng:</span>
            <span className={styles.profileValue}>{profile.rank}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>Điểm:</span>
            <span className={styles.profileValue}>{profile.points}</span>
          </div>
          {profile.email_verified_at && (
            <div className={styles.profileItem}>
              <span className={styles.label}>Thời gian xác minh email:</span>
              <span className={styles.profileValue}>{profile.email_verified_at}</span>
            </div>
          )}
          {/* Nút "Chỉnh sửa" đã được bỏ */}
        </div>
      )}
    </div>
  );
};

export default Profilepage;