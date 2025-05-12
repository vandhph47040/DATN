import { EditOutlined } from "@ant-design/icons";
import { Button, message, Modal } from "antd";
import RoomForm from "./RoomForm";
import { useState } from "react";
import { useUpdateRoom } from "../../../services/adminServices/roomManage.service";

const UpdateRoom = ({ id, editingRoom, roomsTypeList }: any) => {
    const [openModal, setOpenModal] = useState(false);
    const [roomId, setRoomId] = useState<number | null>(null); // Thêm state lưu ID khi mở modal
    const [messageApi, contextHolder] = message.useMessage();

    const handleOpen = () => {
        setRoomId(id); // Khi mở modal, lưu ID vào state
        setOpenModal(true);
    };
    const handleClose = () => {
        setOpenModal(false);
    };

    const { mutate: updateRoom } = useUpdateRoom(messageApi);

    const handleUpdateRoom = (data: any) => {
        console.log("check-id", id);

        if (!roomId) return; // Đảm bảo ID hợp lệ
        updateRoom(
            { id: roomId, data },
            {
                onSuccess: () => {
                    handleClose();
                },
            }
        );
    };

    return (
        <>
            {contextHolder}
            <Button type="primary" onClick={handleOpen}>
                <EditOutlined /> Cập nhật
            </Button>
            <RoomForm
                id={roomId}
                open={openModal}
                editingRoom={editingRoom}
                onSubmit={handleUpdateRoom}
                onClose={handleClose}
                roomsTypeList={roomsTypeList}
            />
        </>
    );
};

export default UpdateRoom;
