import { useState } from "react";
import { Button, Form, Input, Select, message } from "antd";
import { Link } from "react-router-dom";
import styles from "./UserAdd.module.css";

// Định nghĩa type cho dữ liệu người dùng
type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
};

const UserAdd = () => {
  const [form] = Form.useForm();

  // Xử lý tạo user mới
  const handleCreateUser = async () => {
    try {
      const values = await form.validateFields();
      const newUser: User = {
        id: `USER${String(Math.floor(Math.random() * 1000) + 6).padStart(
          3,
          "0"
        )}`, // ID ngẫu nhiên
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password, // Trong thực tế, cần mã hóa mật khẩu
        role: values.role,
      };
      // Lưu dữ liệu giả (trong thực tế, gửi đến API)
      console.log("New User:", newUser);
      message.success("Tạo người dùng thành công!");
      form.resetFields();
    } catch (error: any) {
      console.error("Error creating user:", error);
      message.error(
        error.message || "Tạo người dùng thất bại. Vui lòng thử lại."
      );
    }
  };

  return (
    <div className={styles.userAddContainer}>
      <div className={styles.containerInner}>
        <h2 className={styles.title}>Thêm người dùng mới</h2>
        <p className={styles.subtitle}>Nhập thông tin để tạo người dùng</p>

        <Form
          form={form}
          layout="vertical"
          name="addUserForm"
          onFinish={handleCreateUser}
        >
          <Form.Item
            name="fullName"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              {
                pattern: /^[0-9]{10}$/,
                message: "Số điện thoại phải gồm 10 chữ số!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="role"
            label="Quyền"
            rules={[{ required: true, message: "Vui lòng chọn quyền!" }]}
          >
            <Select>
              <Select.Option value="Admin">Admin</Select.Option>
              <Select.Option value="Quản lý">Quản lý</Select.Option>
              <Select.Option value="Người dùng">Người dùng</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tạo người dùng
            </Button>
            <Button style={{ marginLeft: 8 }}>
              <Link to="/admin/users" className={styles.homeLink}>
                Quay lại
              </Link>
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default UserAdd;
