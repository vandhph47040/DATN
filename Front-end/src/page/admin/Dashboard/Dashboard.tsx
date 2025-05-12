import React, { useEffect, useState } from "react";
import { Row, Skeleton, Table, Tag } from "antd";
import clsx from "clsx";
import styles from "./DashBoard.module.css";
import Charts from "./Charts";
import CardsTitle from "./CardsTitle";
import { useDashboard } from "../../../services/adminServices/dashboardManage.service";

const Dashboard: React.FC = () => {
    const [dailyRevenueDate, setDailyRevenueDate] = useState<string>(""); // ngày của doanh thu theo ngày
    const [dailyRevenueValue, setDailyRevenueValue] = useState<number>(0); // tổng tiền doanh thu theo ngày
    const [monthlyRevenueDate, setMonthlyRevenueDate] = useState<string>(""); // tháng của doanh thu theo tháng
    const [monthlyRevenueValue, setMonthlyRevenueValue] = useState<number>(0); // tổng tiền của doanh thu theo tháng
    const [newCustomers, setNewCustomers] = useState<number>(0); // số lượng khách hàng mới
    const [totalTicketSold, setTotalTicketSold] = useState<number>(0); // số lượng vé sold
    const [totalShowtimes, setTotalShowtimes] = useState<number>(0); // số lượng suất chiếu

    const { data: dashboardData, isLoading } = useDashboard();
    useEffect(() => {
        setDailyRevenueDate(
            dashboardData?.overview?.daily_revenue[
                dashboardData.overview.daily_revenue.length - 1
            ].date
        );
        setDailyRevenueValue(
            dashboardData?.overview?.daily_revenue[
                dashboardData.overview.daily_revenue.length - 1
            ].value
        );
        setMonthlyRevenueDate(
            dashboardData?.overview?.monthly_revenue[
                dashboardData.overview.monthly_revenue.length - 1
            ].month_year
        );
        setMonthlyRevenueValue(
            dashboardData?.overview?.monthly_revenue[
                dashboardData.overview.monthly_revenue.length - 1
            ].value
        );
        setNewCustomers(dashboardData?.overview?.new_customers);
        setTotalTicketSold(dashboardData?.overview?.total_tickets_sold);
        setTotalShowtimes(dashboardData?.additional_stats?.showtimes_today);
    }, [dashboardData]);
    return (
        <div style={{ minHeight: "100vh" }}>
            <Row gutter={[16, 16]}>
                <CardsTitle
                    dailyRevenueDate={dailyRevenueDate}
                    dailyRevenueValue={dailyRevenueValue}
                    monthlyRevenueDate={monthlyRevenueDate}
                    monthlyRevenueValue={monthlyRevenueValue}
                    newCustomers={newCustomers}
                    totalTicketSold={totalTicketSold}
                    totalShowtimes={totalShowtimes}
                ></CardsTitle>
                <Charts></Charts>
            </Row>
        </div>
    );
};

export default Dashboard;
