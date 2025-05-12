import { Button, message, Popconfirm } from "antd";
import { useDeleteAllSeats } from "../../../../services/adminServices/seatManage.service";

const DeleteAllSeat = ({
    roomId,
    handleOk,
}: {
    roomId: any;
    handleOk: () => void;
}) => {
    const [messageApi, contextHolder] = message.useMessage();

    const { mutate: deleteAllSeats } = useDeleteAllSeats(messageApi); // api xóa tất ghế
    const handleDeleteAll = () => {
        if (!roomId) return;

        deleteAllSeats(roomId);
    };
    return (
        <>
            {" "}
            {contextHolder}
            <Popconfirm
                title="Bạn có chắc muốn xóa tất cả ghế?"
                description="Hành động này không thể hoàn tác!"
                onConfirm={handleDeleteAll}
                okText="Xóa"
                cancelText="Hủy"
            >
                <Button type="primary" danger>
                    Xóa tất cả ghế
                </Button>
            </Popconfirm>
        </>
    );
};

export default DeleteAllSeat;
