import { Avatar, Dropdown, Menu, message } from "antd";
import React from "react";
import { DownOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth.service";

const HeaderAdmin: React.FC = () => {
    const navigate = useNavigate();

    // Lấy tên người dùng từ localStorage hoặc mặc định nếu không có
    const userName = localStorage.getItem("user_name") || "User"; // Giả sử tên được lưu trong localStorage
    const firstLetter = userName.charAt(0).toUpperCase(); // Lấy chữ cái đầu tiên

    // Hàm xử lý đăng xuất
    const handleLogout = async () => {
        try {
            const response = await authService.logout();
            message.success(response.message || "Đăng xuất thành công!");
            navigate("/auth/login"); // Chuyển hướng về trang đăng nhập sau khi đăng xuất
        } catch (error: any) {
            console.error("[HeaderAdmin] Logout Error:", error);
            message.error(error.message || "Đăng xuất thất bại.");
        }
    };

    // Hàm xử lý chuyển hướng đến profile
    const handleProfile = () => {
        navigate("/admin/profile"); // Giả sử có route /admin/profile
    };

    // Menu cho dropdown
    const items = [
        {
            key: "profile",
            label: "Profile",
            icon: <UserOutlined />,
            onClick: handleProfile,
        },
        {
            key: "logout",
            label: "Đăng xuất",
            icon: <LogoutOutlined />,
            onClick: handleLogout,
        },
    ];

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                padding: "0 15px",
                background: "var(--border-color)",
                height: "50px",
                width: "100%",
            }}
        >
            <Dropdown menu={{ items }} trigger={["click"]}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        gap: "8px", // Khoảng cách giữa Avatar và mũi tên
                    }}
                >
                    <Avatar
                        style={{
                            backgroundColor: "var(--primary-color)",
                            color: "var(--backgroud-product)",
                        }}
                    >
                        {firstLetter}
                    </Avatar>
                    <DownOutlined style={{ color: "#fff" }} />
                </div>
            </Dropdown>
        </div>
    );
};

export default HeaderAdmin;
