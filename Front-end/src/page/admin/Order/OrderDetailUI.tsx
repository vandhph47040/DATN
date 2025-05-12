import clsx from "clsx";
import styles from "./Order.module.css";
import { message, Select, Tag } from "antd";
import {
    useChangeStatusCheckin,
    useDetailOrder,
} from "../../../services/adminServices/orderManage.service";
import { useEffect, useState } from "react";
import OrderDetailTable from "./OrderDetailTable";

const OrderDetailUI = ({
    id,
    showDataUser,
}: {
    id: number;
    showDataUser: boolean;
}) => {
    // State lưu giá trị đã chọn
    const [selectedCheckIn, setSelectedCheckIn] = useState<string | undefined>(
        undefined
    );
    const [messageApi, contextHolder] = message.useMessage();

    const { data: detailOrder, isLoading } = useDetailOrder(id); // lấy chi tiết đơn hàng từ api

    // Cập nhật state khi `detailOrder?.check_in` thay đổi
    useEffect(() => {
        if (detailOrder?.check_in) {
            setSelectedCheckIn(detailOrder.check_in);
        }
    }, [detailOrder?.check_in]);

    // Xử lý khi thay đổi giá trị trong Select
    const handleChange = (value: string) => {
        setSelectedCheckIn(value);
        console.log("Giá trị được chọn:", value); // Kiểm tra giá trị đã chọn
    };

    // gọi và xử lý khi thay đổi trạng thái sử dụng
    const { mutate: changeStatusCheckin } = useChangeStatusCheckin(messageApi);
    const onChangeStatus = () => {
        changeStatusCheckin({
            bookingId: detailOrder?.booking_id,
            check_in: selectedCheckIn,
        });
    };

    return (
        <div className={clsx(styles.container)}>
            {contextHolder}
            <div className={clsx(styles.orderInfo)}>
                {showDataUser && (
                    <div className={clsx(styles.section)}>
                        <h3 className={clsx(styles.title)}>
                            Thông tin khách hàng
                        </h3>
                        <div className={clsx(styles.infoGroup)}>
                            <div className={clsx(styles.infoItem)}>
                                <h4 className={clsx(styles.label)}>
                                    Khách hàng:
                                </h4>
                                <span
                                    className={clsx(
                                        styles.value,
                                        styles.customerInfo
                                    )}
                                >
                                    {detailOrder?.customer_name}
                                </span>
                            </div>
                            <div className={clsx(styles.infoItem)}>
                                <h4 className={clsx(styles.label)}>
                                    Điện thoại:
                                </h4>
                                <span className={clsx(styles.value)}>
                                    {detailOrder?.phone === "N/A"
                                        ? "chưa cập nhật"
                                        : detailOrder?.phone}
                                </span>
                            </div>
                            <div className={clsx(styles.infoItem)}>
                                <h4 className={clsx(styles.label)}>Email:</h4>
                                <span className={clsx(styles.value)}>
                                    {detailOrder?.email}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                <div className={clsx(styles.section)}>
                    <h3 className={clsx(styles.title)}>Thông tin đơn hàng</h3>

                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>Mã đơn hàng:</h4>
                        <span className={clsx(styles.value)}>
                            {detailOrder?.id}
                        </span>
                    </div>
                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>Phim:</h4>
                        <span className={clsx(styles.value, styles.titleFilm)}>
                            {detailOrder?.movie_title}
                        </span>
                    </div>
                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>Giờ chiếu:</h4>
                        <span className={clsx(styles.value)}>
                            <Tag
                                className={clsx(styles.tagElement)}
                                color="volcano"
                            >
                                {detailOrder?.showtime}
                            </Tag>
                        </span>
                    </div>
                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>Ngày chiếu:</h4>
                        <span className={clsx(styles.value)}>
                            {detailOrder?.show_date}
                        </span>
                    </div>
                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>Phòng chiếu:</h4>
                        <span className={clsx(styles.value)}>
                            {detailOrder?.room_name}
                        </span>
                    </div>
                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>Ngày đặt:</h4>
                        <span className={clsx(styles.value)}>
                            {detailOrder?.created_at}
                        </span>
                    </div>
                    <hr />
                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>Thành tiền:</h4>
                        <span className={clsx(styles.value)}>
                            {" "}
                            <Tag
                                className={clsx(styles.tagElement)}
                                color="blue"
                            >
                                {(
                                    detailOrder?.total_combo_price +
                                    detailOrder?.total_ticket_price
                                ).toLocaleString("vi-VN")}{" "}
                                VNĐ
                            </Tag>
                        </span>
                    </div>
                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>Giảm giá:</h4>
                        <span className={clsx(styles.value)}>
                            {" "}
                            <Tag
                                className={clsx(styles.tagElement)}
                                color="blue"
                            >
                                {detailOrder?.discount.toLocaleString("vi-VN")}{" "}
                                VNĐ
                            </Tag>
                        </span>
                    </div>
                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>Tổng tiền:</h4>
                        <span className={clsx(styles.value)}>
                            {" "}
                            <Tag
                                className={clsx(
                                    styles.tagElement,
                                    styles.finalTotal
                                )}
                                color="blue"
                            >
                                {detailOrder?.total_price.toLocaleString(
                                    "vi-VN"
                                )}{" "}
                                VNĐ
                            </Tag>
                        </span>
                    </div>
                    <hr />

                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>
                            Trạng thái thanh toán:
                        </h4>
                        <span className={clsx(styles.value)}>
                            {detailOrder?.status === "confirmed" ? (
                                <Tag color="green">Đã thanh toán</Tag>
                            ) : (
                                <Tag color="red">Đang đợi xử lý</Tag>
                            )}
                        </span>
                    </div>
                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>
                            Trạng thái sử dụng:
                        </h4>
                        <span>
                            <Select
                                className={clsx(styles.valueSelect)}
                                value={selectedCheckIn}
                                onChange={handleChange}
                            >
                                {detailOrder?.check_in_options.map(
                                    (item: any, index: number) => {
                                        return (
                                            <Select.Option
                                                key={index}
                                                value={item}
                                            >
                                                {item === "waiting"
                                                    ? "Đang đợi"
                                                    : item === "checked_in"
                                                    ? "Đã đến"
                                                    : "Vắng mặt"}
                                            </Select.Option>
                                        );
                                    }
                                )}
                            </Select>
                        </span>
                        <span
                            className={clsx(styles.changeStatus)}
                            onClick={onChangeStatus}
                        >
                            Cập nhật
                        </span>
                    </div>
                </div>
            </div>
            <div className={clsx(styles.serviceSection)}>
                <h3 className={clsx(styles.title)}>Ghế & Combo</h3>
                <OrderDetailTable
                    detailOrder={detailOrder}
                    isLoading={isLoading}
                ></OrderDetailTable>
            </div>
        </div>
    );
};

export default OrderDetailUI;
