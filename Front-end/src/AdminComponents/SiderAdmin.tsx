import React, { useEffect, useState } from "react";
import {
    DashboardOutlined,
    BarChartOutlined,
    CalendarOutlined,
    DesktopOutlined,
    SnippetsOutlined,
    TeamOutlined,
    VideoCameraAddOutlined,
    ShoppingOutlined,
    AppstoreOutlined,
    FileTextOutlined,
    BarcodeOutlined, // Thêm icon cho đơn hàng
} from "@ant-design/icons";
import { Menu, type MenuProps } from "antd";
import Sider from "antd/es/layout/Sider";
import { Link } from "react-router-dom";
import { useAdminContext } from "./UseContextAdmin/adminContext";
import authService from "../services/auth.service";
import styles from "../ClientComponents/Header/header.module.css";
import clsx from "clsx";

type MenuItem = Required<MenuProps>["items"][number];
function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[]
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}

const SiderAdmin = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { setSiderWidth } = useAdminContext();
    const userRole = authService.getRole();

    // Tạo danh sách menu dựa trên vai trò người dùng
    const getMenuItems = () => {
        let menuItems: MenuItem[] = [];

        // Chỉ hiển thị mục thống kê cho admin
        if (userRole === "admin") {
            menuItems.push(
                getItem("Thống kê", "sub1", <DashboardOutlined />, [
                    getItem(
                        <Link to="/admin/dashboard">Tổng quát</Link>,
                        "sub1-1"
                    ),
                    getItem(
                        <Link to="/admin/dashboardFilm">
                            Thống kê chi tiết
                        </Link>,
                        "sub1-2"
                    ),
                ])
            );
        }

        if (userRole === "staff") {
            menuItems.push(
                getItem("Quản lý người dùng", "sub9", <TeamOutlined />, [
                    getItem(
                        <Link to="/admin/directors">Danh sách đạo diễn</Link>,
                        "sub10-1"
                    ),
                    getItem(
                        <Link to="/admin/actors">Danh sách diễn viên</Link>,
                        "sub10-2"
                    ),
                ])
            );
        }

        if (userRole === "admin") {
            menuItems.push(
                getItem("Quản lý người dùng", "sub9", <TeamOutlined />, [
                    getItem(
                        <Link to="/admin/users">Danh sách người dùng</Link>,
                        "sub9-1"
                    ),
                    getItem(
                        <Link to="/admin/directors">Danh sách đạo diễn</Link>,
                        "sub10-1"
                    ),
                    getItem(
                        <Link to="/admin/actors">Danh sách diễn viên</Link>,
                        "sub10-2"
                    ),
                ])
            );
        }

        // Các mục menu khác hiển thị cho cả admin và staff
        menuItems = [
            ...menuItems,
            getItem("check-in-out", "sub999", <CalendarOutlined />, [
                getItem(
                    <Link to="checkin">Quản lý trạng thái</Link>,
                    "sub999-1"
                ),
            ]),
            getItem("Quản lý phim", "sub2", <VideoCameraAddOutlined />, [
                getItem(<Link to="film">Danh sách phim</Link>, "sub2-1"),
                getItem(<Link to="addFilm">Thêm phim</Link>, "sub2-2"),
                getItem(
                    <Link to="calendarShow">Danh sách lịch chiếu</Link>,
                    "sub2-3"
                ),
                getItem(
                    <Link to="showtimes">Danh sách suất chiếu</Link>,
                    "sub2-4"
                ),
                getItem(<Link to="genre">Thể loại phim</Link>, "sub2-5"),

                getItem(
                    <Link to="stoppedMovie">Phim ngừng chiếu</Link>,
                    "sub2-6"
                ),
            ]),
            getItem("Phòng chiếu & Giá vé", "sub5", <DesktopOutlined />, [
                getItem(
                    <Link to="rooms">Danh sách phòng chiếu</Link>,
                    "sub5-1"
                ),
                getItem(
                    <Link to="restoreRooms">Phòng chiếu bảo trì</Link>,
                    "sub5-3"
                ),
                getItem(
                    <Link to="ticketsPrice">Danh sách giá vé</Link>,
                    "sub5-2"
                ),
            ]),
            getItem("Quản lý combo", "sub7", <ShoppingOutlined />, [
                getItem(<Link to="combo">Danh sách combo</Link>, "sub7-1"),
            ]),
            getItem("Quản lý đơn hàng", "sub8", <ShoppingOutlined />, [
                getItem(<Link to="orders">Danh sách đơn hàng</Link>, "sub8-1"),
            ]),

            getItem("Quản lý bài viết ", "sub13", <FileTextOutlined />, [
                getItem(
                    <Link to="articlelist">Danh sách bài viết</Link>,
                    "sub13-1"
                ),
            ]),
            getItem("Quản lý Khuyến Mãi", "sub14", <BarcodeOutlined />, [
                getItem(<Link to="discount-code">Khuyến mãi</Link>, "sub14-1"),
            ]),
            getItem("Quản lý Slider", "sub15", <AppstoreOutlined />, [
                getItem(<Link to="sliders">Danh sách slider</Link>, "sub15-1"),
            ]),
        ];

        return menuItems;
    };

    // Xác định chiều rộng dựa vào trạng thái của Sider
    useEffect(() => {
        setSiderWidth(collapsed ? 80 : 210);
    }, [setSiderWidth, collapsed]);

    return (
        <div>
            <Sider
                style={{ height: "100%" }}
                width={210}
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
            >
                <Link to="/admin">
                    <img
                        className={clsx(styles.logo)}
                        src="../../public/imageFE/logoAdmin.png"
                        alt=""
                    />
                </Link>

                <Menu
                    theme="dark"
                    defaultSelectedKeys={["1"]}
                    mode="inline"
                    items={getMenuItems()}
                />
            </Sider>
        </div>
    );
};

export default SiderAdmin;
