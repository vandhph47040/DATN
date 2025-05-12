import { DeleteOutlined } from "@ant-design/icons";
import {
    Button,
    message,
    Popconfirm,
    Skeleton,
    Space,
    Table,
    TableColumnsType,
    Tag,
} from "antd";

import clsx from "clsx";
import styles from "./TicketsPrice.module.css";
import EditTicketPrice from "./EditTicketPrice";
import AddTicketPrice from "./AddTicketPrice";
import {
    useDeleteTicketPrice,
    useTicketsPrice,
} from "../../../services/adminServices/ticketPrice.service";
import { useState } from "react";

interface TicketsPrice {
    key: React.Key;
    seat_type_name: string;
    room_type_name: string;
    room_name: string;
    day_type: string;
    price: string;
    id: number;
}

const TicketsPrice = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [selectedTicket, setSelectedTicket] = useState<TicketsPrice | null>(
        null
    );

    // lấy data
    const { data: ticketsData, isLoading, error } = useTicketsPrice();
    const deleteTicket = useDeleteTicketPrice(messageApi);
    <Skeleton loading={isLoading} active></Skeleton>;

    // danh sách màu
    const availableColors = [
        "geekblue",
        "green",
        "orange",
        "magenta",
        "red",
        "volcano",
        "gold",
        "lime",
        "cyan",
        "blue",
        "purple",
    ];
    // Hàm lấy màu ngẫu nhiên
    const getRandomColor = () => {
        return availableColors[
            Math.floor(Math.random() * availableColors.length)
        ];
    };

    //tạo map để ánh xạ màu
    const dayTypeColorMap = new Map();
    // Hàm lấy màu theo giá trị day_type
    const getColorByDayType = (day_type: any) => {
        // Nếu giá trị chưa có màu, gán màu mới
        if (!dayTypeColorMap.has(day_type)) {
            const randomColor =
                availableColors[dayTypeColorMap.size % availableColors.length];
            dayTypeColorMap.set(day_type, randomColor);
        }
        return dayTypeColorMap.get(day_type);
    };

    //tạo map để ánh xạ màu
    const roomTypeColorMap = new Map();
    //hàm lấy màu theo giá trị room_type_name
    const getColorByRoomsType = (room_type_name: any) => {
        // Nếu giá trị chưa có màu, gán màu mới
        if (!roomTypeColorMap.has(room_type_name)) {
            roomTypeColorMap.set(room_type_name, getRandomColor());
        }
        return roomTypeColorMap.get(room_type_name);
    };

    //tạo map để ánh xạ màu
    const seatsTypeColorMap = new Map();
    //hàm lấy màu theo giá trị seat_type_name
    const getColorBySeatsType = (seat_type_name: any) => {
        // Nếu giá trị chưa có màu, gán màu mới
        if (!seatsTypeColorMap.has(seat_type_name)) {
            seatsTypeColorMap.set(seat_type_name, getRandomColor());
        }
        return seatsTypeColorMap.get(seat_type_name);
    };

    //gọi hàm xóa ticket
    const handleDelete = (id: number) => {
        deleteTicket.mutate(id);
    };

    // lưu id và các giá trị để sử dụng cho edit ticket price
    const handleClick = (
        id: number,
        day_type: string,
        price: string,
        room_name: string,
        room_type_name: string,
        seat_type_name: string
    ) => {
        setSelectedTicket({
            id,
            day_type,
            price,
            room_name,
            room_type_name,
            seat_type_name,
            key: id,
        });
    };

    const columns: TableColumnsType<TicketsPrice> = [
        {
            title: "Loại ghế",
            dataIndex: "seat_type_name",
            key: "seat_type_name",
            filters: ticketsData
                ? Array.from(
                      new Set(
                          ticketsData
                              .map((item: any) => String(item.seat_type_name))
                              .filter(Boolean)
                      )
                  ).map((value) => ({
                      text: String(value),
                      value: String(value),
                  }))
                : [],
            onFilter: (value, record) => record.seat_type_name === value,
            render: (seat_type_name) => (
                <Tag color={getColorBySeatsType(seat_type_name)}>
                    {seat_type_name}
                </Tag>
            ),
        },
        {
            className: clsx(styles.roomTypeName),
            title: "Hình thức chiếu",
            dataIndex: "room_type_name",
            key: "room_type_name",
            filters: ticketsData
                ? Array.from(
                      new Set(
                          ticketsData
                              .map((item: any) => String(item.room_type_name))
                              .filter(Boolean)
                      )
                  ).map((value) => ({
                      text: String(value),
                      value: String(value),
                  }))
                : [],
            onFilter: (value, record) => record.room_type_name === value,
            render: (room_type_name) => (
                <Tag color={getColorBySeatsType(room_type_name)}>
                    {room_type_name}
                </Tag>
            ),
        },
        {
            title: "Loại ngày áp dụng",
            dataIndex: "day_type",
            key: "day_type",
            filters: ticketsData
                ? Array.from(
                      new Set(
                          ticketsData
                              .map((item: any) => String(item.day_type))
                              .filter(Boolean)
                      )
                  ).map((value) => ({
                      text: String(value),
                      value: String(value),
                  }))
                : [],
            onFilter: (value, record) => record.day_type === value,
            render: (day_type) => (
                <Tag color={getColorBySeatsType(day_type)}>{day_type}</Tag>
            ),
        },
        {
            title: "Loại phòng chiếu",
            dataIndex: "room_name",
            key: "room_name",
            filters: ticketsData
                ? Array.from(
                      new Set(
                          ticketsData
                              .map((item: any) => String(item.room_name))
                              .filter(Boolean)
                      )
                  ).map((value) => ({
                      text: String(value),
                      value: String(value),
                  }))
                : [],
            onFilter: (value, record) => record.room_name === value,
            render: (room_name) => (
                <Tag color={getColorBySeatsType(room_name)}>{room_name}</Tag>
            ),
        },
        {
            title: "Giá vé",
            dataIndex: "price",
            key: "price",
            sorter: (a: any, b: any) => a.price - b.price,
            render: (value, record) => <span>{`${record.price} VNĐ`}</span>,
        },
        {
            title: "Hành động",
            render: (_, items: any) => {
                return (
                    <Space
                        onClick={() => {
                            handleClick(
                                items.id,
                                items.day_type,
                                items.price,
                                items.room_name,
                                items.room_type_name,
                                items.seat_type_name
                            );
                        }}
                    >
                        <Popconfirm
                            title="Xóa phim này?"
                            description="Bạn có chắc chắn muốn xóa không?"
                            okText="Yes"
                            onConfirm={() => handleDelete(items.id)}
                            cancelText="No"
                        >
                            <Button type="primary" danger>
                                <DeleteOutlined /> Xóa
                            </Button>
                        </Popconfirm>
                        <EditTicketPrice
                            id={items.id}
                            selectedTicket={selectedTicket}
                        ></EditTicketPrice>
                    </Space>
                );
            },
        },
    ];

    return (
        <div>
            {contextHolder}
            <AddTicketPrice></AddTicketPrice>
            <Table<TicketsPrice>
                columns={columns}
                dataSource={ticketsData}
                showSorterTooltip={{ target: "sorter-icon" }}
            />
        </div>
    );
};

export default TicketsPrice;
