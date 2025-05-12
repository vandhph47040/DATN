import { Button, message, Modal } from "antd";
import React, { useState } from "react";
import SeatsForm from "./SeatsForm";
import { useUpdateSeat } from "../../../../services/adminServices/seatManage.service";

interface EditSeatsProps {
    isModalOpen: boolean;
    handleOk: () => void;
    handleCancel: () => void;
    selectedSeat: {
        row: string;
        col: string | number;
        id: number;
        type: string;
    } | null;
    roomId: string;
}

const EditSeats: React.FC<EditSeatsProps> = ({
    isModalOpen,
    handleOk,
    handleCancel,
    selectedSeat,
    roomId,
}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const updateSeat = useUpdateSeat(messageApi); // gọi api cập nhật ghế
    const [openModal, setOpenModal] = useState(false);

    const handleUpdateSeat = (data: any) => {
        if (!selectedSeat || !selectedSeat.id) return; // Đảm bảo ID hợp lệ
        console.log("check-id", selectedSeat.id);
        updateSeat.mutate(
            { seatId: selectedSeat.id, data }, // Đổi `id` thành `seatId` để khớp với hook
            {
                onSuccess: () => {
                    handleClose();
                },
            }
        );
    };

    const handleClose = () => {
        setOpenModal(false);
    };

    return (
        <>
            {contextHolder}
            {selectedSeat && (
                <SeatsForm
                    roomId={roomId}
                    isEditing={true}
                    onDelete={true}
                    seatData={selectedSeat}
                    handleOk={handleOk}
                    handleCancel={handleCancel}
                    onSubmit={handleUpdateSeat}
                    isModalOpen={isModalOpen}
                />
            )}
        </>
    );
};

export default EditSeats;
