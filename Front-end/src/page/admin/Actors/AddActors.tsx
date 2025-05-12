import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, message, Modal } from "antd";
import axios from "axios";
import { GET_ACTOR_LIST } from "../../../config/ApiConfig";
import { useState } from "react";
import { PlusCircleOutlined } from "@ant-design/icons";
import clsx from "clsx";
import styles from "../globalAdmin.module.css";

const AddActor = () => {
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
            const response = await axios.post(GET_ACTOR_LIST, formData);
            return response.data;
        },
        onSuccess: () => {
            messageApi.success("Thêm thành công");
            queryClient.invalidateQueries({ queryKey: ["Actors"] });
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
                <PlusCircleOutlined /> Thêm mới diễn viên
            </Button>
            <Modal
                title="Thêm mới diễn viên"
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
                        label="Tên diễn viên"
                        name="name_actor"
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
                        <Input placeholder="Nhập tên diễn viên" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default AddActor;
