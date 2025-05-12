import { Column, Line, Pie } from "@ant-design/plots";
import { Progress, Skeleton } from "antd";
import clsx from "clsx";
import styles from "./DashBoard.module.css";
import { useEffect, useState } from "react";
import { useOrdersList } from "../../../services/adminServices/orderManage.service";

const ChartsFilm = ({ dashboardData, isLoading }: any) => {
    const [comedPrecent, setComedPrecent] = useState<number>(0);

    const { data: OrdersList } = useOrdersList();
    useEffect(() => {
        if (!OrdersList) return;
        const absentCount = OrdersList?.filter(
            (item: any) => item.check_in === "absent"
        ).length;

        const percentage = ((absentCount / OrdersList.length) * 100).toFixed(2);
        setComedPrecent(Number(percentage));
    }, [OrdersList]);

    // biểu đồ 7 ngày
    const dataLine = dashboardData?.revenue_last_7_days?.map((item: any) => ({
        date: item.date,
        totalPriceSold: item.total_revenue,
    }));
    const configLine = {
        data: dataLine,
        xField: "date",
        yField: "totalPriceSold",
        height: 280,
        width: 600,
    };

    //biểu đồ tròn

    const dataCircle = dashboardData?.additional_stats?.peak_showtimes?.map(
        (item: any) => ({
            type: item.showtime,
            total: item.total_seats_booked,
        })
    );
    const configCircle = {
        data: dataCircle,
        xField: "type",
        yField: "total",
        height: 280,
        width: 600,
    };

    // biểu đồ films
    const dataFilms = dashboardData?.movie_stats?.map((item: any) => {
        if (item.movie_status === "now_showing") {
            return {
                film: item.movie_title,
                total: item.total_tickets,
            };
        }
    });
    const configFilms = {
        data: dataFilms,
        xField: "film",
        yField: "total",
        height: 280,
        width: 350,
        xAxis: {
            label: {
                rotate: 45, // Xoay nhãn 45 độ
                autoRotate: false, // Tắt tự động xoay (nếu cần)
            },
        },
    };

    // biểu đồ vé
    const dataTicket = dashboardData?.movie_stats?.map((item: any) => {
        if (item.movie_status === "now_showing") {
            return {
                film: item.movie_title,
                total: item.total_revenue,
            };
        }
    });
    const configTicket = {
        data: dataTicket,
        xField: "film",
        yField: "total",
        height: 280,
        width: 650,
        color: (item: any) => (item.total > 3000000 ? "#73d13d" : "#ff4d4f"),
    };
    return (
        <>
            <Skeleton loading={isLoading} active>
                <div className={clsx(styles.columnChart)}>
                    <div className={clsx(styles.secoudRowChart)}>
                        <h3 className={clsx(styles.tileChart)}>
                            Doanh thu 7 ngày gần nhất
                        </h3>
                        <Line {...configLine} />
                    </div>
                    <div>
                        <h3 className={clsx(styles.tileChart)}>
                            Top các khung giờ có lượt đạt ghế nhiều nhất
                        </h3>
                        <Column {...configCircle} />
                    </div>
                </div>
                <div className={clsx(styles.columnChart)}>
                    <div className={clsx(styles.chartFilm)}>
                        <h3 className={clsx(styles.tileChart)}>
                            Doanh thu phim đang chiếu
                        </h3>
                        <Column {...configTicket} />
                    </div>
                    <div className={clsx(styles.progress)}>
                        <div className={clsx(styles.box)}>
                            <div className={clsx(styles.tileChart)}>
                                Tỷ lệ người dùng đến rạp với vé đã đặt
                            </div>
                            <Progress type="dashboard" percent={comedPrecent} />
                        </div>
                    </div>
                </div>
            </Skeleton>
        </>
    );
};

export default ChartsFilm;
