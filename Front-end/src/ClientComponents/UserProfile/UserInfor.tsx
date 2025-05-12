import { useState } from "react";
import axios from "axios";
import { Button, Input, Form, DatePicker, Space, message, Modal } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "./UserInfor.module.css";
import { UPDATE_USER_CLIENT, CHANGE_PASSWORD } from "../../config/ApiConfig";

// Define User type
interface User {
  name: string;
  email: string;
  phone: string | null;
  date_of_birth: Date | null; // Đồng bộ với UserProfile
  totalSpent: number;
  role: string;
  points: number;
  avatarUrl?: string;
}

interface UserInfoProps {
  user: User | null;
  fetchUserData: () => void;
  isChangePassword?: boolean;
}

const UserInfo: React.FC<UserInfoProps> = ({
  user,
  fetchUserData,
  isChangePassword = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(user);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    password: "",
    password_confirmation: "",
  });
  const [isModalVisible, setIsModalVisible] = useState(false);

  const getAuthToken = (): string | null => localStorage.getItem("auth_token");

  const handleEditClick = () => setIsEditing(true);

  const handleSaveClick = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        message.error("Bạn cần đăng nhập để cập nhật thông tin!");
        window.location.href = "/login";
        return;
      }

      if (!editedUser) {
        message.error("Không có dữ liệu để cập nhật!");
        return;
      }

      // Chuyển đổi date_of_birth thành chuỗi YYYY-MM-DD trước khi gửi API
      const updatedUser = {
        ...editedUser,
        date_of_birth: editedUser.date_of_birth
          ? dayjs(editedUser.date_of_birth).format("YYYY-MM-DD")
          : null,
      };

      await axios.put(UPDATE_USER_CLIENT, updatedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsEditing(false);
      await fetchUserData();
      message.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật thông tin:", error);
      if (error.response && error.response.status === 401) {
        message.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
      } else {
        message.error("Lỗi cập nhật thông tin!");
      }
    }
  };

  const handleChangePassword = async () => {
    if (
      !passwordData.oldPassword ||
      !passwordData.password ||
      !passwordData.password_confirmation
    ) {
      message.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (passwordData.password !== passwordData.password_confirmation) {
      message.error("Mật khẩu mới không khớp!");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      message.error("Bạn cần đăng nhập để đổi mật khẩu!");
      window.location.href = "/login";
      return;
    }

    try {
      await axios.post(
        CHANGE_PASSWORD,
        {
          oldPassword: passwordData.oldPassword,
          password: passwordData.password,
          password_confirmation: passwordData.password_confirmation,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success("Đổi mật khẩu thành công!");
      setPasswordData({
        oldPassword: "",
        password: "",
        password_confirmation: "",
      });
      setIsModalVisible(false);
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      if (error.response && error.response.status === 401) {
        message.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
      } else {
        message.error("Có lỗi xảy ra khi đổi mật khẩu!");
      }
    }
  };

  const handleUserChange = (field: keyof User, value: any) => {
    setEditedUser((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const showChangePasswordModal = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setPasswordData({
      oldPassword: "",
      password: "",
      password_confirmation: "",
    });
  };

  return (
    <>
      <Form layout="vertical" className={styles.profileForm}>
        <Form.Item label="Họ và tên">
          <Input
            prefix={<UserOutlined />}
            value={editedUser?.name || ""}
            disabled={!isEditing}
            className={styles.customInput}
            onChange={(e) => handleUserChange("name", e.target.value)}
          />
        </Form.Item>
        <Form.Item label="Email">
          <Input
            prefix={<MailOutlined />}
            value={editedUser?.email || ""}
            disabled
            className={styles.customInput}
          />
        </Form.Item>
        <Form.Item label="Ngày sinh">
          <DatePicker
            value={
              editedUser?.date_of_birth ? dayjs(editedUser.date_of_birth) : null
            }
            disabled={!isEditing}
            format="DD/MM/YYYY"
            style={{ width: "100%" }}
            className={styles.customInput}
            onChange={(date, dateString) => {
              const formattedDate = date
                ? dayjs(date).format("YYYY-MM-DD")
                : null;
              handleUserChange(
                "date_of_birth",
                formattedDate ? new Date(formattedDate) : null
              );
            }}
          />
        </Form.Item>
        <Form.Item label="Số điện thoại">
          <Input
            prefix={<PhoneOutlined />}
            value={editedUser?.phone || ""}
            disabled={!isEditing}
            className={styles.customInput}
            onChange={(e) => handleUserChange("phone", e.target.value)}
          />
        </Form.Item>
        <div className={styles.profileButtons}>
          {isEditing ? (
            <Space>
              <Button
                type="primary"
                onClick={handleSaveClick}
                className={styles.customButton}
              >
                Cập nhật
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                className={styles.customButton}
              >
                Hủy
              </Button>
            </Space>
          ) : (
            <Space>
              <Button
                type="primary"
                onClick={handleEditClick}
                className={styles.customButton}
              >
                Chỉnh sửa
              </Button>
              <Button
                type="default"
                onClick={showChangePasswordModal}
                className={styles.customButton}
              >
                Đổi mật khẩu
              </Button>
            </Space>
          )}
        </div>
      </Form>

      {/* Modal for Change Password */}
      <Modal
        title="Đổi Mật Khẩu"
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        className={styles.changePasswordModal}
      >
        <Form layout="vertical" className={styles.changePasswordForm}>
          <Form.Item label="Mật khẩu cũ">
            <Input.Password
              prefix={<LockOutlined />}
              value={passwordData.oldPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  oldPassword: e.target.value,
                }))
              }
              className={styles.customInput}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>
          <Form.Item label="Mật khẩu mới">
            <Input.Password
              prefix={<LockOutlined />}
              value={passwordData.password}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              className={styles.customInput}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>
          <Form.Item label="Xác nhận mật khẩu mới">
            <Input.Password
              prefix={<LockOutlined />}
              value={passwordData.password_confirmation}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  password_confirmation: e.target.value,
                }))
              }
              className={styles.customInput}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>
          <div className={styles.modalButtons}>
            <button
              onClick={handleChangePassword}
              className={styles.customButton}
            >
              Đổi mật khẩu
            </button>
            <button onClick={handleModalCancel} className={styles.customButton}>
              Hủy
            </button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default UserInfo;
