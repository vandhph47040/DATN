import { Button, message, Space, Spin, Table, Tag } from "antd";
import { RoomSHowtimesType } from "../../../types/interface";
import DeleteShowtimes from "./DeleteShowtimes";
import EditShowtimes from "./EditShowtimes";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import clsx from "clsx";
import styles from "../globalAdmin.module.css";

const ShowtimesAllRooms = ({
    setShowtimesData,
    selectedDate,
    showtimesData,
    seatTypes,
}: any) => {
    const [processedData, setProcessedData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        if (showtimesData.length > 0) {
            setLoading(true);
            // điều chỉnh thứ tự đúng thơi gian suất chiếu
            const sortedData = [...showtimesData].sort((a, b) =>
                dayjs(a.start_time, "HH:mm").isBefore(
                    dayjs(b.start_time, "HH:mm")
                )
                    ? -1
                    : 1
            );

            setProcessedData(sortedData);
            setLoading(false);
        }
    }, [showtimesData]);

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100px",
                }}
            >
                <Spin tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    const columns = [
        {
            title: "Phim chiếu",
            dataIndex: "calendar_show",
            key: "calendar_show",
            render: (_: any, recordTitle: any) => {
                const title =
                    recordTitle?.calendar_show?.movie?.title || "Không có";

                return (
                    <span
                        style={{
                            color: "var(--border-color)",
                            fontWeight: 500,
                        }}
                    >
                        {title}
                    </span>
                );
            },
        },

        {
            title: "Phòng chiếu",
            dataIndex: "room_name",
            key: "room_name",
            render: (_: any, recordRoom: any) => {
                console.log(recordRoom);
                return <Tag color="purple">{recordRoom?.room?.name}</Tag>;
            },
        },
        {
            title: "Hình thức chiếu",
            dataIndex: "room_type",
            key: "room_type",
            render: (_: any, recordRoom: any) => {
                const findSeatType = seatTypes.find(
                    (item: any) => recordRoom.room.room_type_id === item.id
                );
                return (
                    <Tag color="volcano">
                        {findSeatType
                            ? findSeatType.name
                            : recordRoom?.room?.room_type?.name}
                    </Tag>
                );
            },
        },
        {
            title: "Thời gian chiếu",
            dataIndex: "start_time",
            key: "start_time",
            render: (_: any, record: any) => {
                return (
                    <>
                        <Tag color="magenta">
                            {dayjs(record.start_time, "HH:mm").format("HH:mm")}
                        </Tag>
                        <Tag color="geekblue">
                            {dayjs(record.end_time, "HH:mm").format("HH:mm")}
                        </Tag>
                    </>
                );
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                let color = "";
                let text = "";

                switch (status) {
                    case "coming_soon":
                        color = "blue";
                        text = "Sắp chiếu";
                        break;
                    case "now_showing":
                        color = "orange";
                        text = "Đang chiếu";
                        break;
                    case "referenced":
                        color = "purple";
                        text = "Đã chiếu";
                        break;
                    default:
                        color = "gray";
                        text = "Không xác định";
                }

                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: "Action",
            key: "action",
            render: (_: any, record: RoomSHowtimesType) => {
                return (
                    <Space size="middle">
                        <DeleteShowtimes
                            id={record.id}
                            selectedDate={selectedDate}
                            setShowtimesData={setShowtimesData}
                            messageApi={messageApi}
                        ></DeleteShowtimes>
                        <EditShowtimes
                            id={record.id}
                            selectedDate={selectedDate}
                            setShowtimesData={setShowtimesData}
                        ></EditShowtimes>
                    </Space>
                );
            },
        },
    ];
    return (
        <div className={clsx(styles.roomBox)}>
            {contextHolder}
            <h1 className={clsx(styles.roomName)}>
                {processedData[0].room.name}
            </h1>
            <Table columns={columns} dataSource={processedData} rowKey="id" />
        </div>
    );
};
export default ShowtimesAllRooms;
