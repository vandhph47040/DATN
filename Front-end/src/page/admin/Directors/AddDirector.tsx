import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, message, Modal } from "antd";
import axios from "axios";
import { GET_DIRECTORS_LIST } from "../../../config/ApiConfig";
import { useState } from "react";
import { PlusCircleOutlined } from "@ant-design/icons";
import clsx from "clsx";
import styles from "../globalAdmin.module.css";

const AddDirector = () => {
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
            const response = await axios.post(GET_DIRECTORS_LIST, formData);
            return response.data;
        },
        onSuccess: () => {
            messageApi.success("Thêm thành công");
            queryClient.invalidateQueries({ queryKey: ["Directors"] });
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
                <PlusCircleOutlined /> Thêm mới đạo diễn
            </Button>
            <Modal
                title="Thêm mới đạo diễn"
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form
                    form={form}
                    name="add-director-form"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        className={clsx(styles.inputLabel)}
                        label="Tên đạo diễn"
                        name="name_director"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên",
                            },
                            {
                                min: 3,
                                message: "Tên phim phải có ít nhất 3 ký tự",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tên đạo diễn" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default AddDirector;
