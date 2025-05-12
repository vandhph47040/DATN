import { message, Space, Table, Tag } from "antd";
import dayjs from "dayjs";
import { RoomSHowtimesType } from "../../../types/interface";
import DeleteShowtimes from "./DeleteShowtimes";
import EditShowtimes from "./EditShowtimes";
import { useEffect, useState } from "react";

const ShowtimesByFilmId = ({ dataByFilmId, setDataByFilmId }: any) => {
    const [processedData, setProcessedData] = useState<any[]>([]);

    const [messageApi, contextHolder] = message.useMessage();

    //Sắp xếp data theo ngày chiếu từ thấp đến cao
    useEffect(() => {
        if (dataByFilmId.length > 0) {
            const sortedData = [...dataByFilmId]
                .filter((item: any) => item.show_date !== null)
                .sort((a, b) =>
                    dayjs(a.show_date).isAfter(dayjs(b.show_date)) ? 1 : -1
                );

            setProcessedData(sortedData);
        }
    }, [dataByFilmId]);

    const columns = [
        {
            title: "Phòng chiếu",
            dataIndex: "room_name",
            key: "room_name",
            render: (value: any, record: any) => {
                return <span>{record?.room?.name}</span>;
            },
        },
        {
            title: "Hình thức chiếu",
            dataIndex: "room_type",
            key: "room_type",
            render: (value: any, record: any) => {
                return <span>{record?.room?.room_type?.name}</span>;
            },
        },

        {
            title: "Ngày chiếu",
            dataIndex: "show_date",
            key: "show_date",
        },
        {
            title: "Thời gian",
            dataIndex: "start_time",
            key: "start_time",
            render: (value: any, record: any) => {
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
                            selectedDate={record.show_date}
                            setDataByFilmId={setDataByFilmId}
                            messageApi={messageApi}
                        ></DeleteShowtimes>
                        <EditShowtimes
                            id={record.id}
                            selectedDate={record.show_date}
                            setDataByFilmId={setDataByFilmId}
                        ></EditShowtimes>
                    </Space>
                );
            },
        },
    ];

    return (
        <div style={{ marginTop: "60px" }}>
            {contextHolder}
            <Table
                columns={columns}
                dataSource={processedData}
                rowKey="id"
            ></Table>
        </div>
    );
};

export default ShowtimesByFilmId;
