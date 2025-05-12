import React, { useState } from "react";

import { Breadcrumb, Layout, Menu, theme } from "antd";
import SiderAdmin from "../../AdminComponents/SiderAdmin";
import HeaderAdmin from "../../AdminComponents/HeaderAdmin";
import BreadcrumbAdmin from "../../AdminComponents/BreadcrumbAdmin";


const { Footer } = Layout;

const AdminLayout: React.FC = () => {
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <SiderAdmin></SiderAdmin>
            <Layout>
                <HeaderAdmin></HeaderAdmin>
                <BreadcrumbAdmin></BreadcrumbAdmin>
                <Footer style={{ textAlign: "center" }}>
                    ©2/2025 Created by Forest Cinema
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
