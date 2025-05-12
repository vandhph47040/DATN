import { Button, message } from "antd";
import { useState } from "react";
import SeatsForm from "./SeatsForm";
import { useCreateSeat } from "../../../../services/adminServices/seatManage.service";

const CreateOneSeat = ({ roomId }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const createSeat = useCreateSeat(messageApi); // gọi api cập nhật ghế

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleUpdateSeat = (data: any) => {
        createSeat.mutate(
            { data },
            {
                onSuccess: () => {
                    handleCancel();
                },
            }
        );
    };

    return (
        <>
            {contextHolder}
            <Button type="primary" onClick={showModal}>
                Thêm mới ghế
            </Button>
            <SeatsForm
                roomId={roomId}
                isEditing={false}
                onDelete={false}
                isModalOpen={isModalOpen}
                handleOk={handleOk}
                handleCancel={handleCancel}
                onSubmit={handleUpdateSeat}
            ></SeatsForm>
        </>
    );
};

export default CreateOneSeat;
