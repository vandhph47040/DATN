import clsx from "clsx";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import { useGetTotalUsedMoneyUser } from "../../../services/Wheel.service";
import styles from "./GetTotalusedMoney.module.css";
import { Link } from "react-router-dom";

dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const GetTotalusedMoney = ({
    setTotalUsedMoneyOfUser,
    countPlayGame,
}: {
    setTotalUsedMoneyOfUser: (value: number) => void;
    countPlayGame: number;
}) => {
    const { data, isLoading, isError, error } = useGetTotalUsedMoneyUser();

    if (isError && error) {
        console.log("Error from server:", error);

        return (
            <div className={clsx(styles.container)}>
                <div className={clsx(styles.errorText)}>
                    {error?.status === 401
                        ? "Bạn phải Đăng nhập trước."
                        : "Đã có lỗi xảy ra. Vui lòng tải lại trang."}
                </div>
            </div>
        );
    }

    // tính tích lũy theo tuần
    const today = dayjs();
    const startOfWeek = today.startOf("isoWeek");
    const endOfWeek = today.endOf("isoWeek");

    const filteredItems = data?.filter((item: any) => {
        const createdDate = dayjs(item.created_at, "DD-MM-YYYY HH:mm:ss");
        return (
            createdDate.isSameOrAfter(startOfWeek) &&
            createdDate.isSameOrBefore(endOfWeek)
        );
    });

    const totalUsedMoney =
        filteredItems?.reduce(
            (sum: number, item: any) => sum + item.total_price,
            0
        ) || 0;
    setTotalUsedMoneyOfUser(totalUsedMoney);

    return (
        <div className={clsx(styles.container)}>
            <div className={clsx(styles.btnPlay)}>
                Tích lũy của tuần này{" "}
                {isLoading ? (
                    <span className={clsx(styles.valueofWeek)}>...</span>
                ) : (
                    <span className={clsx(styles.valueofWeek)}>
                        {totalUsedMoney.toLocaleString()} đ
                    </span>
                )}
            </div>
            {countPlayGame <= 0 && !isLoading && (
                <span className={clsx(styles.suggestText)}>
                    <Link to="/playingfilm">Đặt vé ngay</Link>, chơi vòng quay
                    liền tay
                </span>
            )}
        </div>
    );
};

export default GetTotalusedMoney;
