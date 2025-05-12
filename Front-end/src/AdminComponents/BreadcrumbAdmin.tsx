import { Content } from "antd/es/layout/layout";
import { Breadcrumb, theme } from "antd";
import { Outlet, useLocation } from "react-router-dom";

const BreadcrumbAdmin = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const location = useLocation();
    const pathSnippets = location.pathname.split("/").filter((i) => i);
    const breadcrumbItems = pathSnippets.map((value, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
        return {
            title: value.charAt(0).toUpperCase() + value.slice(1), // Viết hoa chữ đầu
        };
    });

    return (
        <>
            <Content style={{ margin: "0 16px" }}>
                <Breadcrumb
                    items={[{ title: "Home", href: "/" }, ...breadcrumbItems]}
                />
                <div
                    style={{
                        padding: 24,
                        minHeight: 360,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet></Outlet>
                </div>
            </Content>
        </>
    );
};

export default BreadcrumbAdmin;
