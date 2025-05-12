import {
    Button,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Popconfirm,
    Select,
    Space,
} from "antd";
import {
    useDeleteOneSeat,
    useHideSeat,
    useOptionSeats,
} from "../../../../services/adminServices/seatManage.service";
import { useEffect } from "react";
import clsx from "clsx";
import styles from "./SeatManage.module.css";

const SeatsForm = ({
    isEditing,
    onDelete,
    handleOk,
    isModalOpen,
    handleCancel,
    seatData,
    onSubmit,
    roomId,
}: any) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();

    const { data: OptionSeats } = useOptionSeats(); // danh sách các loại ghế

    const seatStatus = Form.useWatch("seat_status", form); // fl seat_status
    const initialStatus = seatData?.status; // giá trị ban đầu
    const seatType = Form.useWatch("seat_type_id", form); // fl seat_status
    const initialTypeId = OptionSeats?.find(
        (option: any) => option.name === seatData?.type
    )?.id; // giá trị ban đầu

    const rowSeats = Array.from({ length: 26 }, (_, i) =>
        String.fromCharCode(65 + i)
    ); // Tạo các hàng từ A tới Z

    // gán chi tiết ghế vào form
    useEffect(() => {
        if (seatData && OptionSeats) {
            const matchedType = OptionSeats.find(
                (option: any) => option.name === seatData.type
            );

            form.setFieldsValue({
                row: seatData.row,
                column: seatData.col,
                seat_type_id: matchedType?.id,
                seat_status: seatData.status,
            });
        }
    }, [seatData, form, OptionSeats]);

    // Hook xóa ghế
    const { mutate: deleteOneSeat } = useDeleteOneSeat(messageApi);
    // Hàm xử lý xóa ghế
    const handleDelete = () => {
        if (!seatData?.id) return;

        deleteOneSeat(seatData.id, {
            onSuccess: () => {
                handleOk(); // Đóng modal sau khi xóa thành công
            },
        });
    };

    // hàm xử lý khi click xóa
    const handleSingleSubmit = (values: any) => {
        onSubmit(values);
        handleCancel();
        !isEditing && form.resetFields();
    };

    const { mutate: hideSeat } = useHideSeat(messageApi);

    // hàm ẩn ghế

    const handleHideSeat = () => {
        if (!seatData?.id) {
            messageApi.error("Không tìm thấy ghế!");
            return;
        }

        if (!roomId) {
            messageApi.error("Không tìm thấy phòng!");
            return;
        }

        // Lấy trạng thái ghế từ form, nếu chưa có thì mặc định là "disabled"
        let seatStatus = form.getFieldValue("seat_status") || seatData.status;

        if (!seatStatus) {
            messageApi.error("Trạng thái ghế là bắt buộc!");
            return;
        }

        hideSeat(
            {
                roomId: roomId,
                data: {
                    seat_id: seatData.id,
                    seat_status: seatStatus,
                },
            },
            {
                onSuccess: () => {
                    handleOk(); // Đóng modal sau khi ẩn ghế
                },
            }
        );
    };

    return (
        <>
            {contextHolder}
            <Modal
                title={
                    !isEditing && !onDelete ? `Thêm mới ghế` : `Cập nhật ghế`
                }
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSingleSubmit}
                >
                    <Form.Item
                        name="row"
                        label="Hàng"
                        rules={[
                            { required: true, message: "Vui lòng chọn hàng!" },
                        ]}
                    >
                        <Select placeholder="Chọn hàng" disabled={isEditing}>
                            {rowSeats.map((row: string) => (
                                <Select.Option key={row} value={row}>
                                    {row}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="column"
                        label="Cột"
                        rules={[
                            { required: true, message: "Vui lòng nhập cột!" },
                            {
                                type: "number",
                                min: 0,
                                max: 30,
                                message: "phải là số từ 0 tới 13",
                            },
                        ]}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            disabled={isEditing}
                            placeholder="Nhập số cột (1, 2, ...)"
                        />
                    </Form.Item>
                    <Form.Item
                        name="seat_type_id"
                        label="Loại Ghế"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn loại ghế!",
                            },
                        ]}
                    >
                        <Select placeholder="Chọn loại ghế">
                            {OptionSeats?.map((option: any) => (
                                <Select.Option
                                    key={option.id}
                                    value={option.id}
                                >
                                    {option.name === "Sweetbox"
                                        ? `${option.name} (Thay đổi cả ghế bên cạnh để Sweetbox hoạt động đúng)`
                                        : option.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    {!isEditing && (
                        <Form.Item
                            style={{ display: "none" }}
                            name="room_id"
                            label="Tên phòng"
                            initialValue={roomId}
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên phòng!",
                                },
                            ]}
                        >
                            <Input disabled={isEditing} value={roomId} />
                        </Form.Item>
                    )}
                    {isEditing && (
                        <Form.Item name="seat_status" label="Trạng thái">
                            <Select>
                                <Select.Option key={1} value={"available"}>
                                    Có thể sử dụng
                                </Select.Option>
                                <Select.Option key={2} value={"disabled"}>
                                    Bảo trì ghế
                                </Select.Option>
                                <Select.Option key={3} value={"empty"}>
                                    Ẩn ghế ngoài client
                                </Select.Option>
                            </Select>
                        </Form.Item>
                    )}
                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className={clsx(styles.updatePrice)}
                                disabled={
                                    !seatType || seatType === initialTypeId
                                }
                            >
                                {isEditing ? "Cập Nhật Loại Ghế" : "Thêm Ghế"}
                            </Button>
                            {isEditing && onDelete && (
                                <>
                                    <Popconfirm
                                        title="Xóa ghế này?"
                                        description="Hành động này không thể hoàn tác!"
                                        onConfirm={handleDelete}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                    >
                                        <Button type="primary" danger>
                                            Xóa Ghế
                                        </Button>
                                    </Popconfirm>
                                    <Button
                                        className={clsx(styles.updateStatus)}
                                        onClick={handleHideSeat}
                                        disabled={
                                            !seatStatus ||
                                            seatStatus === initialStatus
                                        }
                                    >
                                        Cập nhật Trạng Thái
                                    </Button>
                                </>
                            )}
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default SeatsForm;
