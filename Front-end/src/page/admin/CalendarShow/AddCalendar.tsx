import React, { useState } from "react";
import { Button, DatePicker, Form, Input, message, Modal, Select } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import {
    useCreateCalendar,
    useHasShowtime,
} from "../../../services/adminServices/calendarManage.service";

dayjs.extend(isSameOrBefore);

const AddCalendar: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [formShowtime] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const showModal = () => {
        setOpen(true);
    };

    const handleCancel = () => {
        formShowtime.resetFields();
        setOpen(false);
    };

    const { filmList } = useHasShowtime(); // lấy list phim đã có lịch chiếu

    const { mutate } = useCreateCalendar(messageApi, formShowtime); // thêm lịch chiếu

    const onFinish = (newFormData: any) => {
        console.log("re-render-addShowtimes", newFormData);
        mutate(newFormData);
        formShowtime.resetFields();
        setOpen(false);
    };

    return (
        <>
            <Button
                type="primary"
                onClick={showModal}
                style={{ marginBottom: "15px" }}
            >
                <PlusCircleOutlined />
                Tạo lịch chiếu
            </Button>
            <Modal
                title="Thêm lịch chiếu"
                open={open}
                onOk={() => formShowtime.submit()}
                onCancel={handleCancel}
            >
                {contextHolder}
                <Form
                    form={formShowtime}
                    name="showtimes-add-form"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="movie_id"
                        label="movie_id"
                        getValueProps={(e: string) => ({
                            value: e,
                        })}
                        style={{ display: "none" }}
                    >
                        <Input></Input>
                    </Form.Item>
                    <Form.Item
                        label="Phim chiếu"
                        name="title"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập phim chiếu",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Chọn phim"
                            onChange={(value) => {
                                const selectedFilm = filmList?.find(
                                    (film: any) => film.title === value
                                );
                                formShowtime.setFieldsValue({
                                    show_date: selectedFilm?.release_date
                                        ? dayjs(
                                              selectedFilm.release_date,
                                              "YYYY-MM-DD"
                                          )
                                        : null,
                                    movie_id: selectedFilm?.id,
                                    movie_status: selectedFilm?.movie_status,
                                });
                            }}
                        >
                            {filmList?.map((film: any) => (
                                <Select.Option
                                    key={film.id}
                                    value={film.title}
                                    disabled={film.hasShowtime}
                                >
                                    {film.title}{" "}
                                    {film.hasShowtime
                                        ? "(Đã có lịch chiếu)"
                                        : ""}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="show_date"
                        label="Ngày bắt đầu"
                        rules={[
                            { required: true, message: "Thêm ngày phát hành" },
                        ]}
                    >
                        <DatePicker
                            style={{ width: "100%" }}
                            format="YYYY-MM-DD"
                            allowClear
                            value={formShowtime.getFieldValue("show_date")}
                            onChange={(date) =>
                                formShowtime.setFieldValue("show_date", date)
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        name="end_date"
                        label="Ngày kết thúc"
                        rules={[
                            {
                                required: true,
                                message: "Thêm ngày kết thúc",
                            },
                        ]}
                        getValueFromEvent={(e: any) => e?.format("YYYY-MM-DD")}
                        getValueProps={(e: string) => ({
                            value: e ? dayjs(e) : null,
                        })}
                    >
                        <DatePicker
                            style={{ width: "100%" }}
                            format="YYYY-MM-DD"
                            allowClear
                            disabledDate={(current) => {
                                const startDate =
                                    formShowtime.getFieldValue("show_date");
                                return startDate
                                    ? current.isSameOrBefore(startDate, "day")
                                    : false;
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Trạng thái"
                        name="movie_status"
                        getValueProps={(e: string) => ({
                            value: e,
                        })}
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập trạng thái",
                            },
                        ]}
                    >
                        <Select placeholder="Chọn trạng thái" disabled>
                            <Select.Option value="now_showing">
                                Đang chiếu
                            </Select.Option>
                            <Select.Option value="coming_soon">
                                Sắp chiếu
                            </Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default AddCalendar;
