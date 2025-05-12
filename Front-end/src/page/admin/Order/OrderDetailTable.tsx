import { Button, Skeleton, Table, Tag } from "antd";
import clsx from "clsx";
import styles from "./Order.module.css";

const OrderDetailTable = ({
    detailOrder,
    isLoading,
}: {
    detailOrder: any;
    isLoading: boolean;
}) => {
    const columnsSeats = [
        {
            title: "Thông tin ghế",
            dataIndex: "seat_name",
            key: "seat_name",
        },
        {
            title: "Loại ghế",
            dataIndex: "seat_type",
            key: "seat_type",
            render: (value: any, record: any) => (
                <span>Ghế {record.seat_type}</span>
            ),
        },
        {
            title: "Giá ghế",
            dataIndex: "price",
            key: "price",
            render: (value: any, record: any) => (
                <span>
                    {parseInt(record.price).toLocaleString("vi-VN")} VNĐ
                </span>
            ),
        },
    ];

    const columnsCombos = [
        {
            title: "Tên dịch vụ",
            dataIndex: "combo_name",
            key: "combo_name",
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
        },
        {
            title: "Thành tiền",
            dataIndex: "price",
            key: "price",
            render: (value: any, record: any) => (
                <span>
                    {(parseInt(record.price) * record.quantity).toLocaleString(
                        "vi-VN"
                    )}{" "}
                    VNĐ
                </span>
            ),
        },
    ];

    return (
        <div>
            <Skeleton
                className={clsx(styles.skeletonSeats)}
                loading={isLoading}
                active
            >
                {" "}
                <Table
                    className={clsx(styles.tableSeats)}
                    columns={columnsSeats}
                    dataSource={detailOrder?.tickets?.map((item: any) => ({
                        ...item,
                        key: item.booking_detail_id,
                    }))}
                    pagination={false}
                />
                <hr />
                <div className={clsx(styles.totalSub)}>
                    Tổng cộng:{" "}
                    <Tag color="blue">
                        {" "}
                        {detailOrder?.total_ticket_price.toLocaleString(
                            "vi-VN"
                        )}{" "}
                        VNĐ
                    </Tag>
                </div>
            </Skeleton>
            <Skeleton loading={isLoading} active>
                {" "}
                <Table
                    columns={columnsCombos}
                    dataSource={detailOrder?.combos?.map(
                        (item: any, index: number) => ({
                            ...item,
                            key: item.id || index,
                        })
                    )}
                    pagination={false}
                />
                <hr />
                <div className={clsx(styles.totalSub)}>
                    Tổng cộng:{" "}
                    <Tag color="blue">
                        {detailOrder?.total_combo_price.toLocaleString("vi-VN")}{" "}
                        VNĐ
                    </Tag>
                </div>
            </Skeleton>
        </div>
    );
};

export default OrderDetailTable;
