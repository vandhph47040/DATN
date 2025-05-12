import { Card, Col, Statistic } from "antd";
import clsx from "clsx";
import styles from "./DashBoard.module.css";
import {
    DollarOutlined,
    FileProtectOutlined,
    ScheduleOutlined,
    UserAddOutlined,
} from "@ant-design/icons";

const CardsTitle = ({
    dailyRevenueDate,
    dailyRevenueValue,
    monthlyRevenueDate,
    monthlyRevenueValue,
    newCustomers,
    totalTicketSold,
    totalShowtimes,
}: any) => {
    return (
        <div className={clsx(styles.cardsTitle)}>
            <Card
                className={clsx(styles.statisticsInfo, styles.statisticsInfo1)}
            >
                <Statistic
                    title={`Danh thu trong ngày (${dailyRevenueDate})`}
                    value={dailyRevenueValue}
                    prefix={<FileProtectOutlined />}
                    suffix="VND"
                />
            </Card>

            <Card
                className={clsx(styles.statisticsInfo, styles.statisticsInfo2)}
            >
                <Statistic
                    title="Khách hàng mới"
                    value={newCustomers}
                    prefix={<UserAddOutlined />}
                />
            </Card>

            <Card
                className={clsx(styles.statisticsInfo, styles.statisticsInfo3)}
            >
                <Statistic
                    title="Tổng số vé bán ra"
                    value={totalTicketSold}
                    prefix={<ScheduleOutlined />}
                />
            </Card>

            <Card
                className={clsx(styles.statisticsInfo, styles.statisticsInfo4)}
            >
                <Statistic
                    title="Tổng suất chiếu đang chiếu"
                    value={totalShowtimes}
                    prefix={<ScheduleOutlined />}
                />
            </Card>

            <Card
                className={clsx(styles.statisticsInfo, styles.statisticsInfo5)}
            >
                <Statistic
                    title={`Doanh thu tháng (${monthlyRevenueDate})`}
                    value={monthlyRevenueValue}
                    prefix={<DollarOutlined />}
                    suffix="VND"
                />
            </Card>
        </div>
    );
};

export default CardsTitle;
