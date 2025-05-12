import React from "react";
import { Layout, Row, Col, Typography, Space, Divider, Image } from "antd";
import {
    FacebookOutlined,
    InstagramOutlined,
    YoutubeOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
} from "@ant-design/icons";

const { Footer } = Layout;
const { Text, Title, Link } = Typography;

const AppFooter: React.FC = () => {
    return (
        <Footer
            style={{
                background: "#3674B5",
                color: "#fff", // Base color for text in Footer
                padding: "40px 20px",
                marginTop: "180px",
            }}
        >
            <Row justify="space-between" gutter={[32, 32]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Image
                        src="../../../public/imageFE/logo2.png" // Replace with your logo path
                        preview={false}
                        width={150}
                        alt="Logo Cinema"
                    />
                    <Text
                        style={{
                            color: "#fff", // Override to white
                            display: "block",
                            marginTop: 10,
                        }}
                    >
                        Trải nghiệm rạp phim chất lượng cao với những bộ phim
                        hấp dẫn nhất.
                    </Text>
                </Col>

                {/* Column 2 - Contact */}
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Title level={4} style={{ color: "#fff" }}>
                        Liên Hệ
                    </Title>
                    <Space direction="vertical" style={{ color: "#fff" }}>
                        <Text style={{ color: "#fff" }}>
                            <MailOutlined /> movie.forest.host@gmail.com
                        </Text>
                        <Text style={{ color: "#fff" }}>
                            <PhoneOutlined /> 0989721167
                        </Text>
                        <Text style={{ color: "#fff" }}>
                            <EnvironmentOutlined /> Tòa nhà FPT Polytechnic.,
                            Cổng số 2, 13 P. Trịnh Văn Bô, Xuân Phương, Nam Từ
                            Liêm, Hà Nội
                        </Text>
                    </Space>
                </Col>

                {/* Column 3 - Support */}
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Title level={4} style={{ color: "#fff" }}>
                        Hỗ Trợ
                    </Title>
                    <Space direction="vertical">
                        <Link href="/faq" style={{ color: "#fff" }}>
                            Câu hỏi thường gặp
                        </Link>
                        <Link href="/terms" style={{ color: "#fff" }}>
                            Điều khoản sử dụng
                        </Link>
                        <Link href="/privacy" style={{ color: "#fff" }}>
                            Chính sách bảo mật
                        </Link>
                    </Space>
                </Col>

                {/* Column 4 - Social Media */}
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Title level={4} style={{ color: "#fff" }}>
                        Kết Nối Với Chúng Tôi
                    </Title>
                    <Space size="middle">
                        <Link
                            href="https://facebook.com"
                            target="_blank"
                            style={{ fontSize: 24, color: "#fff" }} // Change to white
                        >
                            <FacebookOutlined />
                        </Link>
                        <Link
                            href="https://instagram.com"
                            target="_blank"
                            style={{ fontSize: 24, color: "#fff" }} // Change to white
                        >
                            <InstagramOutlined />
                        </Link>
                        <Link
                            href="https://youtube.com"
                            target="_blank"
                            style={{ fontSize: 24, color: "#fff" }} // Change to white
                        >
                            <YoutubeOutlined />
                        </Link>
                    </Space>
                </Col>
            </Row>
            <Divider style={{ borderColor: "#fff" }} />{" "}
            {/* Optional: Change divider to white for consistency */}
            {/* Copyright */}
            <Row justify="center">
                <Text style={{ color: "#fff" }}>
                    © {new Date().getFullYear()} Cinema. All rights reserved.
                </Text>
            </Row>
        </Footer>
    );
};

export default AppFooter;
