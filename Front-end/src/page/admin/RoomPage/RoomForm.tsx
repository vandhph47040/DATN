import { Button, Form, Input, message, Modal, Select, Skeleton } from "antd";
import React, { useEffect, useMemo } from "react";
import { useDetailRoom } from "../../../services/adminServices/roomManage.service";
import LayoutMatrixExample from "./LayoutMatrixExample";
import { useUpdateBackgroundSeat } from "../../../services/adminServices/seatManage.service";
import styles from "./RoomPage.module.css";

const { Option } = Select;

const RoomForm = ({
    editingRoom,
    id,
    open,
    onSubmit,
    onClose,
    loading,
    roomsTypeList,
}: any) => {
    const [form] = Form.useForm();
    const [backgroundImg, setBackgroundImg] = React.useState<string>("");
    const [messageApi, contextHolder] = message.useMessage();

    // Gọi API lấy dữ liệu chi tiết phòng khi `open` thay đổi
    const { data: detailRoom, isLoading } = useDetailRoom(id, open);

    // api chỉnh background ghế
    const updateBackgroundSeat = useUpdateBackgroundSeat(messageApi);

    const handleUpdate = () => {
        updateBackgroundSeat.mutate({
            roomId: id,
            data: {
                background_img: backgroundImg,
            },
        });
        onClose();
    };

    // Cập nhật form khi dữ liệu phòng thay đổi
    useEffect(() => {
        if (detailRoom && id) {
            form.setFieldsValue({
                name: detailRoom.name,
                room_type_id: detailRoom.room_type_id,
                background_img: detailRoom.background_img,
            });
            setBackgroundImg(detailRoom.background_img);
        }
    }, [detailRoom, id]);

    const roomOptions = useMemo(() => {
        return roomsTypeList.map((type: any) => (
            <Option key={type.id} value={type.id}>
                {type.name}
            </Option>
        ));
    }, [roomsTypeList]);

    const handleFinish = (values: any) => {
        onSubmit(values);
        onClose();
    };

    return (
        <>
            {contextHolder}
            <Modal
                title={editingRoom ? "Cập nhật phòng" : "Thêm phòng mới"}
                open={open}
                onCancel={onClose}
                footer={null}
            >
                <Skeleton loading={isLoading} active>
                    <Form form={form} layout="vertical" onFinish={handleFinish}>
                        <Form.Item
                            className={styles.specail1}
                            label="Tên phòng"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên phòng!",
                                },
                            ]}
                        >
                            <Input placeholder="Nhập tên phòng" />
                        </Form.Item>

                        <Form.Item
                            className={styles.specail1}
                            label="Loại phòng"
                            name="room_type_id"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn loại phòng!",
                                },
                            ]}
                        >
                            <Select placeholder="Chọn loại phòng">
                                {roomOptions}
                            </Select>
                        </Form.Item>
                        {editingRoom && (
                            <Form.Item
                                className={styles.specail}
                                label="Ảnh nền ghế Event"
                                name="background_img"
                            >
                                <Input
                                    onChange={(e: any) =>
                                        setBackgroundImg(e.target.value)
                                    }
                                />
                            </Form.Item>
                        )}

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                style={{ marginRight: 8 }}
                            >
                                {editingRoom ? "Cập nhật" : "Thêm mới"}
                            </Button>
                            <Button onClick={onClose} disabled={loading}>
                                Hủy
                            </Button>
                            {editingRoom && (
                                <Button
                                    color="pink"
                                    variant="solid"
                                    onClick={handleUpdate}
                                    style={{ marginLeft: "10px" }}
                                >
                                    Cập nhật ảnh nền
                                </Button>
                            )}
                        </Form.Item>
                    </Form>
                    {editingRoom && (
                        <LayoutMatrixExample
                            backgroundImg={backgroundImg}
                        ></LayoutMatrixExample>
                    )}
                </Skeleton>
            </Modal>
        </>
    );
};

export default RoomForm;
