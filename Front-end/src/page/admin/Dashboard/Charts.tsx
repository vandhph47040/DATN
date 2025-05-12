import { Column, Line } from "@ant-design/plots";
import { Card, Col } from "antd";
import clsx from "clsx";
import styles from "./DashBoard.module.css";
import { useDashboard } from "../../../services/adminServices/dashboardManage.service";

const Charts = () => {
  const { data: dashboardData } = useDashboard(); // hàm lấy api

  // biểu đồ doanh thu theo tháng
  const dataLine = dashboardData?.overview?.monthly_revenue
    ? dashboardData.overview.monthly_revenue.map((item: any) => ({
        month: item.month_year,
        value: item.value,
      }))
    : [];
  const configLine = {
    data: dataLine,
    xField: "month",
    yField: "value",
    height: 280,
    width: 690,
  };

  // biểu đồ top 5 phim
  const dataColumn = dashboardData?.movie_stats
    ? dashboardData.movie_stats
        .filter((item: any) => item.movie_status === "now_showing")
        .map((item: any) => ({
          type: item.movie_title,
          value: item.total_revenue,
        }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 5)
    : [];
  const configColumn = {
    data: dataColumn,
    xField: "type",
    yField: "value",
    height: 280,
    width: 350,
    xAxis: {
      label: {
        rotate: -45, // Xoay văn bản 45 độ
        style: {
          whiteSpace: "nowrap", // Không cho phép xuống dòng
          textOverflow: "ellipsis", // Hiển thị "..." khi tràn
          maxWidth: 20, // Giới hạn độ rộng
        },
      },
    },
  };
  return (
    <>
      <Col span={10}>
        <Card title="Top 5 phim đang chiếu có doanh thu cao nhất ">
          <Column {...configColumn} />
        </Card>
      </Col>
      <Col span={14}>
        <Card title="Thống kê doanh số theo tháng">
          <Line className={clsx(styles.lineChart)} {...configLine} />
        </Card>
      </Col>
    </>
  );
};

export default Charts;
