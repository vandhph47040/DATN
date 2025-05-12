import { Button, message, Popconfirm, Skeleton, Space, Table, Tag } from "antd";
import {
    useDeleteAtRoom,
    useDeleteRoom,
    useGetRooms,
} from "../../../services/adminServices/roomManage.service";
import { DeleteOutlined, LockOutlined } from "@ant-design/icons";
import UpdateRoom from "./UpdateRoom";
import { useEffect, useState } from "react";
import CreateRoom from "./CreateRoom";
import SeatManage from "./Seat/SeatManage";

const RoomPage = () => {
    const [messageApi, holderMessageApi] = message.useMessage();
    const [roomsTypeList, setRoomsTypeList] = useState([]); // lưu loại phòng từ api

    const { rooms, seatTypes, isSeatTypesLoading } = useGetRooms(); // api lấy danh sách phòng và loại phòng
    const deleteRoom = useDeleteRoom(messageApi); // api xóa phòng
    const deleteAtRoom = useDeleteAtRoom(messageApi); // api bảo trì phòng

    // lưu data vào state quản lý
    useEffect(() => {
        if (seatTypes) {
            setRoomsTypeList(seatTypes);
        }
    }, [seatTypes]);

    // xử lý xóa phòng
    const handleDelete = (id: number) => {
        deleteRoom.mutate(id);
    };

    // xử lý bảo trì phòng
    const handleDeleteAtRoom = (id: number) => {
        deleteAtRoom.mutate(id);
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
            title: "Trạng thái",
            dataIndex: "deleted_at",
            key: "deleted_at",
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
                    <Space>
                        <SeatManage
                            name={record.name}
                            roomId={record.id}
                        ></SeatManage>
                        <UpdateRoom
                            id={record.id}
                            editingRoom={true}
                            roomsTypeList={roomsTypeList}
                        ></UpdateRoom>
                        <Popconfirm
                            title="Xóa phòng chiếu này?"
                            description="Bạn có chắc chắn muốn xóa không?"
                            okText="Yes"
                            onConfirm={() => handleDelete(record.id)}
                            cancelText="No"
                        >
                            <Button type="primary" danger>
                                <DeleteOutlined /> Xóa
                            </Button>
                        </Popconfirm>
                        <Button onClick={() => handleDeleteAtRoom(record.id)}>
                            <LockOutlined /> Bảo trì
                        </Button>
                    </Space>
                );
            },
        },
    ];

    return (
        <>
            {holderMessageApi}
            <CreateRoom
                editingRoom={false}
                roomsTypeList={roomsTypeList}
            ></CreateRoom>
            <Skeleton loading={isSeatTypesLoading} active>
                <Table columns={columns} dataSource={rooms} rowKey="id"></Table>
            </Skeleton>
        </>
    );
};

export default RoomPage;
