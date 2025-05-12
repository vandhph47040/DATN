import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, InputNumber, message, Modal } from "antd";
import axios from "axios";
import { GET_GENRES } from "../../../config/ApiConfig";
import { useState } from "react";
import { PlusCircleOutlined } from "@ant-design/icons";
import clsx from "clsx";
import styles from "../globalAdmin.module.css";

const AddGenre = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const [open, setOpen] = useState(false);

    const onFinish = (formData: any) => {
        mutate(formData, {
            onError: (error: any) => {
                messageApi.error(
                    error?.response?.data?.message || "Thêm thất bại"
                );
            },
        });
    };

    const showModal = () => {
        setOpen(true);
    };

    const handleOk = () => form.submit();

    const handleCancel = () => {
        form.resetFields();
        setOpen(false);
    };

    const { mutate } = useMutation({
        mutationFn: async (formData) => {
            const response = await axios.post(GET_GENRES, formData);
            return response.data;
        },
        onSuccess: () => {
            messageApi.success("Thêm thành công");
            queryClient.invalidateQueries({ queryKey: ["Genres"] });
            form.resetFields();
            setOpen(false);
        },
        onError: (error: any) => {
            messageApi.error(
                error?.response?.data?.message || "Có lỗi xảy ra!"
            );
        },
    });

    return (
        <>
            {contextHolder}
            <Button
                type="primary"
                onClick={showModal}
                className={clsx(styles.addBtnForm)}
            >
                <PlusCircleOutlined /> Thêm mới thể loại
            </Button>
            <Modal
                title="Thêm mới thể loại"
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form
                    form={form}
                    name="add-genre-form"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        className={clsx(styles.inputLabel)}
                        label="Thể loại"
                        name="name_genre"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập thể loại",
                            },
                            {
                                min: 3,
                                message: "ít nhất 3 ký tự",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tên thể loại" />
                    </Form.Item>

                    {/* <Form.Item
                        className={clsx(styles.inputLabel)}
                        label="ID"
                        name="id"
                        rules={[
                            {
                                required: true,
                                message: "Phải có ID",
                            },
                        ]}
                    >
                        <InputNumber placeholder="Nhập id"></InputNumber>
                    </Form.Item> */}
                </Form>
            </Modal>
        </>
    );
};

export default AddGenre;
