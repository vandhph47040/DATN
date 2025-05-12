import { useEffect, useState } from "react";
import {
    Button,
    DatePicker,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Select,
    Skeleton,
} from "antd";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { EditOutlined } from "@ant-design/icons";
import {
    useDetailCalendar,
    useUpdateCalendar,
} from "../../../services/adminServices/calendarManage.service";

dayjs.extend(isSameOrBefore);

const EditCalendar = ({ id }: any) => {
    const [openEdit, setOpenEdit] = useState(false);
    const [formShowtime] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const { data, isLoading } = useDetailCalendar(id, openEdit);

    const { mutate } = useUpdateCalendar(
        id,
        messageApi,
        setOpenEdit,
        formShowtime
    );

    useEffect(() => {
        if (data) {
            formShowtime.setFieldsValue({
                movie_id: data.movie_id,
                title: data.movie?.title,
                movie_status: data.movie?.movie_status,
                show_date: dayjs(data.show_date).format("YYYY-MM-DD"),
                end_date: dayjs(data.end_date).format("YYYY-MM-DD"),
            });
        }
        return () => {
            formShowtime.resetFields();
        };
    }, [data, formShowtime, openEdit]);

    const onFinish = (formData: any) => {
        mutate(formData);
        setOpenEdit(false);
        formShowtime.resetFields();
    };
    const showModal = () => {
        setOpenEdit(true);
    };

    const handleCancel = () => {
        setOpenEdit(false);
        formShowtime.resetFields();
    };

    return (
        <>
            <Button type="primary" onClick={showModal}>
                <EditOutlined /> Cập nhật
            </Button>
            <Modal
                title="Cập nhật lịch chiếu"
                open={openEdit}
                onOk={() => formShowtime.submit()}
                onCancel={handleCancel}
            >
                {contextHolder}
                <Skeleton loading={isLoading} active>
                    <Form
                        form={formShowtime}
                        name="showtimes-edit-form"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        onFinish={onFinish}
                        initialValues={data}
                    >
                        <Form.Item
                            label="movie_id"
                            name="movie_id"
                            style={{ display: "none" }}
                        >
                            <InputNumber disabled />
                        </Form.Item>
                        <Form.Item label="Phim chiếu" name="title">
                            <Input disabled></Input>
                        </Form.Item>

                        <Form.Item
                            name="show_date"
                            label="Ngày bắt đầu"
                            rules={[
                                {
                                    required: true,
                                    message: "Thêm ngày kết thúc",
                                },
                            ]}
                            getValueProps={(value) => ({
                                value: value ? dayjs(value) : null,
                            })}
                            getValueFromEvent={(e) => e?.format("YYYY-MM-DD")}
                        >
                            <DatePicker
                                disabled
                                style={{ width: "100%" }}
                                format="YYYY-MM-DD"
                                allowClear
                            />
                        </Form.Item>

                        <Form.Item
                            name="end_date"
                            label="Ngày kết thúc"
                            rules={[
                                {
                                    required: true,
                                    message: "Thêm ngày kết thúc",
                                },
                            ]}
                            getValueProps={(value) => ({
                                value: value ? dayjs(value) : null,
                            })}
                            getValueFromEvent={(e) => e?.format("YYYY-MM-DD")}
                        >
                            <DatePicker
                                style={{ width: "100%" }}
                                format="YYYY-MM-DD"
                                allowClear
                                disabledDate={(current) => {
                                    const startDate =
                                        formShowtime.getFieldValue("show_date");
                                    return startDate
                                        ? current.isSameOrBefore(
                                              startDate,
                                              "day"
                                          )
                                        : false;
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Trạng thái"
                            name="movie_status"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập trạng thái",
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn trạng thái"
                                allowClear
                                onChange={(value) =>
                                    formShowtime.setFieldValue(
                                        "movie_status",
                                        value
                                    )
                                }
                                disabled
                            >
                                <Select.Option value="now_showing">
                                    Đang chiếu
                                </Select.Option>
                                <Select.Option value="coming_soon">
                                    Sắp chiếu
                                </Select.Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Skeleton>
            </Modal>
        </>
    );
};

export default EditCalendar;
