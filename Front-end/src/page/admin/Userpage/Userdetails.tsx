import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Avatar, Button, Input, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import styles from "./UserDetail.module.css";

// Định nghĩa type cho dữ liệu người dùng
type User = {
  id: string;
  avatar: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
};

const Userdetails = () => {
  const { id } = useParams<{ id: string }>(); // Lấy id từ URL
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [newAvatar, setNewAvatar] = useState<string>("");

  // Dữ liệu giả từ mockUsers
  const mockUsers: User[] = [
    {
      id: "USER001",
      avatar: "https://example.com/avatars/user1.jpg",
      fullName: "Nguyễn Văn An",
      email: "nguyenvanan@example.com",
      phone: "0987654321",
      role: "Admin",
      status: "Hoạt động",
      createdAt: "2025-01-15",
    },
    {
      id: "USER002",
      avatar: "https://example.com/avatars/user2.jpg",
      fullName: "Trần Thị Bình",
      email: "tranthibinh@example.com",
      phone: "0912345678",
      role: "Người dùng",
      status: "Hoạt động",
      createdAt: "2025-02-20",
    },
    {
      id: "USER003",
      avatar: "https://example.com/avatars/user3.jpg",
      fullName: "Lê Minh Châu",
      email: "leminhchau@example.com",
      phone: "0934567890",
      role: "Quản lý",
      status: "Khóa",
      createdAt: "2025-03-01",
    },
    {
      id: "USER004",
      avatar: "https://example.com/avatars/user4.jpg",
      fullName: "Phạm Quốc Đạt",
      email: "phamquocdat@example.com",
      phone: "0971234567",
      role: "Người dùng",
      status: "Hoạt động",
      createdAt: "2025-03-10",
    },
    {
      id: "USER005",
      avatar: "https://example.com/avatars/user5.jpg",
      fullName: "Hoàng Thị E",
      email: "hoangthie@example.com",
      phone: "0945678901",
      role: "Người dùng",
      status: "Khóa",
      createdAt: "2025-03-12",
    },
  ];

  // Tải thông tin người dùng khi component mount
  useEffect(() => {
    setLoading(true);
    const foundUser = mockUsers.find((u) => u.id === id);
    if (foundUser) {
      setUser(foundUser);
    } else {
      message.error("Không tìm thấy người dùng!");
    }
    setLoading(false);
  }, [id]);

  // Xử lý thay đổi avatar
  const handleAvatarChange = () => {
    if (!newAvatar) {
      message.error("Vui lòng nhập URL ảnh mới!");
      return;
    }
    if (user) {
      setUser({ ...user, avatar: newAvatar });
      message.success("Thay đổi avatar thành công!");
      setNewAvatar("");
    }
  };

  if (loading || !user) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  return (
    <div className={styles.userDetailContainer}>
      <h2 className={styles.title}>Chi tiết người dùng</h2>
      <div className={styles.userInfo}>
        <div className={styles.avatarSection}>
          <Avatar src={user.avatar} size={120} className={styles.avatar} />
          <Input
            placeholder="Nhập URL avatar mới"
            value={newAvatar}
            onChange={(e) => setNewAvatar(e.target.value)}
            className={styles.avatarInput}
          />
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={handleAvatarChange}
            className={styles.uploadButton}
          >
            Thay đổi avatar
          </Button>
        </div>
        <div className={styles.infoSection}>
          <p>
            <strong>Họ tên:</strong> {user.fullName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Số điện thoại:</strong> {user.phone}
          </p>
          <p>
            <strong>Quyền:</strong> {user.role}
          </p>
          <p>
            <strong>Trạng thái:</strong> {user.status}
          </p>
          <p>
            <strong>Ngày tạo:</strong> {user.createdAt}
          </p>
        </div>
      </div>
      <p className={styles.backLink}>
        Quay lại{" "}
        <Link to="/admin/userpage" className={styles.homeLink}>
          Danh sách người dùng
        </Link>
      </p>
    </div>
  );
};

export default Userdetails;
