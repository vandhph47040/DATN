import React, { useEffect, useState } from "react";
import {
    useGetRooms,
    useListDeleteAtRooms,
    useRestoreRoom,
} from "../../../services/adminServices/roomManage.service";
import { Button, message, Table, Tag } from "antd";
import dayjs from "dayjs";
import { SettingOutlined } from "@ant-design/icons";

const RestoreRooms = () => {
    const [messageApi, holderMessageApi] = message.useMessage();
    const [roomsTypeList, setRoomsTypeList] = useState([]); // lưu loại phòng từ api

    const { data: listDeleteAtRooms } = useListDeleteAtRooms();
    const { seatTypes } = useGetRooms(); // api lấy danh sách phòng và loại phòng
    const restoreRoom = useRestoreRoom(messageApi); // api khôi phục phòng

    useEffect(() => {
        if (seatTypes) {
            setRoomsTypeList(seatTypes);
        }
    }, [seatTypes]);

    // xử lý khôi phục phòng
    const handleRestoreRoom = (id: number) => {
        restoreRoom.mutate(id);
    };

    const columns = [
        {
            title: "Tên phòng",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Sức chứa",
            dataIndex: "capacity",
            key: "capacity",
        },
        {
            title: "Loại phòng",
            dataIndex: "room_type",
            key: "room_type",
            render: (value: any, record: any) => {
                const roomType = seatTypes?.find(
                    (type: any) => type.id === record.room_type_id
                ); // lọc để lấy ra type rooms
                return (
                    <span>{roomType ? roomType.name : "Không xác định"}</span>
                );
            },
        },
        {
            title: "Thời gian bắt đầu bảo trì",
            dataIndex: "deleted_at",
            key: "deleted_at",
            render: (_: string, record: any) => {
                return (
                    <span>
                        {dayjs(record.deleted_at).format("YYYY-MM-DD - HH:mm")}
                    </span>
                );
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (_: string, record: any) =>
                record.deleted_at === null ? (
                    <Tag color="green">Hoạt động</Tag>
                ) : (
                    <Tag color="red">Đang bảo trì</Tag>
                ),
        },
        {
            title: "Hành động",
            key: "actions",
            render: (value: any, record: any) => {
                return (
                    <Button
                        type="primary"
                        onClick={() => handleRestoreRoom(record.id)}
                    >
                        <SettingOutlined /> Vận hành lại
                    </Button>
                );
            },
        },
    ];

    return (
        <>
            {holderMessageApi}
            <Table
                dataSource={listDeleteAtRooms}
                columns={columns}
                rowKey="id"
            ></Table>
        </>
    );
};

export default RestoreRooms;
