import { Button, message } from "antd";
import React, { useState } from "react";
import RoomForm from "./RoomForm";
import { useCreateRoom } from "../../../services/adminServices/roomManage.service";
import { PlusCircleOutlined } from "@ant-design/icons";
import clsx from "clsx";
import styles from "./RoomPage.module.css";

const CreateRoom = ({ editingRoom, roomsTypeList }: any) => {
    const [openModal, setOpenModal] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const handleOpen = () => {
        setOpenModal(true);
    };

    const handleClose = () => {
        setOpenModal(false);
    };

    const { mutate: createRoom } = useCreateRoom(messageApi);

    const handleCreateRoom = (data: any) => {
        createRoom(
            { data },
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
            <Button
                className={clsx(styles.addBtnForm)}
                type="primary"
                onClick={handleOpen}
            >
                <PlusCircleOutlined />
                Thêm mới phòng
            </Button>
            <RoomForm
                open={openModal}
                editingRoom={editingRoom}
                onSubmit={handleCreateRoom}
                onClose={handleClose}
                roomsTypeList={roomsTypeList}
            />
        </>
    );
};

export default CreateRoom;
