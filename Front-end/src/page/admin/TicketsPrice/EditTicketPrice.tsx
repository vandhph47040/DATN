import { EditOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import {
    useTicketsPrice,
    useUpdateTicketPrice,
} from "../../../services/adminServices/ticketPrice.service";

const EditTicketPrice = ({ id, selectedTicket }: any) => {
    const [formTicketPrice] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [open, setOpen] = useState(false);
    const [totalPrice, setTotalPrice] = useState(
        selectedTicket ? selectedTicket.price : ""
    );

    const { data: ticketsData, error } = useTicketsPrice();

    useEffect(() => {
        if (selectedTicket) {
            formTicketPrice.setFieldsValue({
                seat_type_name: selectedTicket.seat_type_name,
                room_type_name: selectedTicket.room_type_name,
                room_name: selectedTicket.room_name,
                day_type: selectedTicket.day_type,
                total_price: selectedTicket.price,
            });
            setTotalPrice(selectedTicket.price);
        }
    }, [selectedTicket]); // Chỉ chạy khi selectedTicket hoặc open thay đổi

    const updateTicket = useUpdateTicketPrice(messageApi); // api update
    const showModal = () => {
        setOpen(true);
    };

    const handleOk = async () => {
        try {
            await formTicketPrice.validateFields();
            const formData = formTicketPrice.getFieldsValue();
            // Lấy giá trị của `total_price` trực tiếp từ Input (trường hợp cần thiết)
            console.log("Dữ liệu gửi API:", formData);
            onFinish(formData);
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    const onFinish = (formData: any) => {
        console.log("Dữ liệu gửi API:", formData);
        const payload = {
            id,
            formData: {
                seat_type_name: formData.seat_type_name,
                room_type_name: formData.room_type_name,
                room_name: formData.room_name,
                day_type: formData.day_type,
                price: totalPrice,
            },
        };
        updateTicket.mutate(payload);
        setOpen(false);
    };

    // Cập nhật state total_price khi người dùng nhập
    const handleTotalPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTotalPrice(value); // Cập nhật giá trị của state total_price
        formTicketPrice.setFieldsValue({
            total_price: value, // Cập nhật lại giá trị form
        });
    };

    const handleCancel = () => {
        formTicketPrice.resetFields();
        setOpen(false);
    };

    // lấy các option không lặp nhau
    const getUniqueOptions = (key: string) => {
        return (
            ticketsData?.reduce((acc: any[], item: any) => {
                if (!acc.find((option) => option.value === item[key])) {
                    acc.push({ label: item[key], value: item[key] });
                }
                return acc;
            }, []) || []
        );
    };

    return (
        <>
            <Button type="primary" onClick={showModal}>
                <EditOutlined /> Cập nhật
            </Button>
            <Modal
                title="Cập nhật giá vé"
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
                width={470}
            >
                {contextHolder}
                <Form
                    form={formTicketPrice}
                    name="ticket-price-edit-form"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={onFinish}
                    onValuesChange={(changedValues, allValues) => {
                        console.log("Dữ liệu đang nhập:", allValues);
                    }}
                >
                    <Form.Item
                        className="input-label"
                        label="Loại ghế"
                        name="seat_type_name"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập loại ghế",
                            },
                        ]}
                    >
                        <Select
                            options={getUniqueOptions("seat_type_name")}
                            disabled
                        />
                    </Form.Item>
                    <Form.Item
                        className="input-label"
                        label="Hình thức chiếu"
                        name="room_type_name"
                        rules={[
                            {
                                required: true,
                                message: "nhập hình thức chiếu",
                            },
                        ]}
                    >
                        <Select
                            options={getUniqueOptions("room_type_name")}
                            disabled
                        />
                    </Form.Item>
                    <Form.Item
                        className="input-label"
                        label="Loại ngày áp dụng"
                        name="day_type"
                        rules={[
                            {
                                required: true,
                                message: "ngày áp dụng",
                            },
                        ]}
                    >
                        <Select
                            options={getUniqueOptions("day_type")}
                            disabled
                        />
                    </Form.Item>
                    <Form.Item
                        className="input-label"
                        label="Loại phòng chiếu"
                        name="room_name"
                        rules={[
                            {
                                required: true,
                                message: "Nhập loại phòng chiếu",
                            },
                        ]}
                    >
                        <Select
                            options={getUniqueOptions("room_name")}
                            disabled
                        />
                    </Form.Item>
                    <Form.Item
                        className="input-label"
                        label="Giá vé"
                        name="total_price"
                        rules={[
                            {
                                required: true,
                                message: "Nhập giá vé",
                            },
                        ]}
                    >
                        <Input
                            value={totalPrice}
                            onChange={handleTotalPriceChange}
                            placeholder="Giá vé"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default EditTicketPrice;
