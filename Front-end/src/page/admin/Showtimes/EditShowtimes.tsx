import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Button,
    DatePicker,
    Form,
    TimePicker,
    message,
    Modal,
    Select,
    Input,
    Skeleton,
} from "antd";
import axios from "axios";
import {
    GET_DETAIL_ONE_SHOWTIMES,
    UPDATE_ONE_SHOWTIMES,
} from "../../../config/ApiConfig";
import { useCallback, useEffect, useState } from "react";
import { EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import clsx from "clsx";
import styles from "../globalAdmin.module.css";
import { handleApiError } from "../../../services/adminServices/utils";
import { useGetRooms } from "../../../services/adminServices/roomManage.service";

const EditShowtimes = ({
    id,
    setShowtimesData,
    selectedDate,
    setDataByFilmId,
}: any) => {
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const onFinish = async (formData: any) => {
        const formatTimeField = (value: any, format: string) =>
            value ? dayjs(value).format(format) : null;

        const formattedData = {
            ...formData,
            room_id: selectedRoomId,
            start_time: formatTimeField(formData.start_time, "HH:mm"),
            end_time: formatTimeField(formData.end_time, "HH:mm"),
            selected_date: formatTimeField(
                formData.selected_date,
                "YYYY-MM-DD"
            ),
        };
        console.log("check-formatData", formattedData);

        mutate(formattedData, {
            onSuccess: async () => {
                messageApi.success("Cập nhật thành công");
                setShowtimesData &&
                    setShowtimesData((prevData: any) =>
                        prevData.map((item: any) =>
                            item.id === id
                                ? { ...item, ...formattedData }
                                : item
                        )
                    );

                setDataByFilmId &&
                    setDataByFilmId((prevData: any) =>
                        prevData.map((item: any) =>
                            item.id === id
                                ? { ...item, ...formattedData }
                                : item
                        )
                    );

                await queryClient.invalidateQueries({
                    queryKey: ["showtimes", id],
                });

                form.resetFields();
                setOpen(false);
            },
            onError: handleApiError,
        });
    };

    const showModal = () => {
        setOpen(true);
    };

    const handleOk = () => {
        form.submit();
        setOpen(false);
    };

    const handleCancel = () => {
        form.resetFields();
        setOpen(false);
    };

    const handleChangeSelect = useCallback(
        (value: string[], fieldName: string) => {
            form.setFieldsValue({ [fieldName]: value });
        },
        [form]
    );

    const { mutate } = useMutation({
        mutationFn: async (formData) => {
            const response = await axios.put(
                UPDATE_ONE_SHOWTIMES(id),
                formData
            );
            return response.data;
        },
    });

    const { data: detailShowtimes, isLoading } = useQuery({
        queryKey: ["showtimes", id],
        queryFn: async () => {
            const { data } = await axios.get(GET_DETAIL_ONE_SHOWTIMES(id));
            console.log("check show-time", data);

            return {
                ...data,
                selected_date: data.selected_date
                    ? dayjs(data.selected_date)
                    : undefined, // Chỉ chuyển đổi nếu có giá trị
            };
        },
        staleTime: 1000 * 60 * 10,
        enabled: open,
    });

    useEffect(() => {
        if (open && detailShowtimes) {
            setSelectedRoomId(detailShowtimes.room.id);
            form.setFieldsValue({
                title: detailShowtimes.calendar_show.movie.title,
                selected_date: selectedDate
                    ? dayjs(selectedDate, "YYYY-MM-DD")
                    : null,
                room: {
                    name: detailShowtimes.room.name,
                    room_type: {
                        name: detailShowtimes.room.room_type.name,
                    },
                },
                start_time: detailShowtimes.start_time
                    ? dayjs(detailShowtimes.start_time, "HH:mm")
                    : null,
                end_time: detailShowtimes.end_time
                    ? dayjs(detailShowtimes.end_time, "HH:mm")
                    : null,
                status: detailShowtimes.status,
                calendar_show_id: detailShowtimes.calendar_show_id,
            });
        }
    }, [detailShowtimes, selectedDate, form, open]);

    // Lấy danh sách phòng và loại phòng
    const { rooms, seatTypes } = useGetRooms();

    const handleRoomChange = (value: number) => {
        // debugger;
        setSelectedRoomId(value);
        const selectedRoom = rooms?.find((room: any) => room.id === value);
        const roomTypeName = seatTypes?.find(
            (seatType: any) => seatType.id === selectedRoom?.room_type_id
        );

        form.setFieldsValue({
            room: {
                name: selectedRoom?.name || "",
                room_type: {
                    name: roomTypeName?.name || "Chưa có định dạng",
                },
            },
            room_id: value,
        });
        // debugger;
    };

    return (
        <>
            {contextHolder}
            <Button
                type="primary"
                onClick={showModal}
                className={clsx(styles.addBtnForm)}
            >
                <EditOutlined /> Cập nhật
            </Button>
            <Modal
                title="Cập nhật suất chiếu"
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Skeleton loading={isLoading} active>
                    <Form
                        form={form}
                        name="edit-showtimes-form"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        onFinish={onFinish}
                    >
                        <Form.Item
                            className={clsx(styles.inputLabel)}
                            label="Phim chiếu"
                            name="title"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn phim",
                                },
                            ]}
                        >
                            <Input disabled></Input>
                        </Form.Item>
                        <Form.Item
                            className={clsx(styles.inputLabel)}
                            label="Ngày chiếu"
                            name="selected_date"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập ngày chiếu",
                                },
                            ]}
                        >
                            <DatePicker format="YYYY-MM-DD" disabled />
                        </Form.Item>
                        <Form.Item
                            className={clsx(styles.inputLabel)}
                            label="Phòng chiếu"
                            name={["room", "name"]}
                            rules={[
                                {
                                    required: true,
                                    message: "hình thức dịch",
                                },
                            ]}
                        >
                            <Select onChange={handleRoomChange}>
                                {rooms?.map((item: any) => (
                                    <Select.Option
                                        value={item.id}
                                        key={item.id}
                                    >
                                        {item.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            className={clsx(styles.inputLabel)}
                            label="Hình thức chiếu"
                            name={["room", "room_type", "name"]}
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập hình thức chiếu",
                                },
                            ]}
                        >
                            <Select
                                disabled
                                allowClear
                                style={{ width: "100%" }}
                                placeholder="Please select"
                                onChange={(value) =>
                                    handleChangeSelect([value], "name")
                                }
                                options={rooms}
                                value={form.getFieldValue("name")}
                            />
                        </Form.Item>

                        <Form.Item
                            className={clsx(styles.inputLabel)}
                            label="Thời gian bắt đầu"
                            name="start_time"
                            rules={[
                                {
                                    required: true,
                                    message: "Nhập thời gian chiếu",
                                },
                            ]}
                        >
                            <TimePicker
                                format="HH:mm"
                                style={{ width: "100%" }}
                            ></TimePicker>
                        </Form.Item>
                        <Form.Item
                            className={clsx(styles.inputLabel)}
                            label="Thời gian kết thúc"
                            name="end_time"
                            dependencies={["start_time"]}
                            rules={[
                                {
                                    required: true,
                                    message: "Nhập thời gian kết thúc",
                                },
                            ]}
                        >
                            <TimePicker
                                format="HH:mm"
                                style={{ width: "100%" }}
                                disabledTime={() => {
                                    const startTime =
                                        form.getFieldValue("start_time");
                                    if (!startTime) return {}; // Nếu chưa chọn start_time, không giới hạn

                                    return {
                                        disabledHours: () =>
                                            [...Array(24).keys()].filter(
                                                (h) => h < startTime.hour()
                                            ),
                                        disabledMinutes: (selectedHour) =>
                                            selectedHour === startTime.hour()
                                                ? [...Array(60).keys()].filter(
                                                      (m) =>
                                                          m <=
                                                          startTime.minute()
                                                  )
                                                : [],
                                    };
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            className={clsx(styles.inputLabel)}
                            label="Trạng thái"
                            name="status"
                            rules={[
                                {
                                    required: true,
                                    message: "Nhập  trạng thái",
                                },
                            ]}
                        >
                            <Select placeholder="Trạng thái">
                                <Select.Option value="coming_soon">
                                    Sắp chiếu
                                </Select.Option>
                                <Select.Option value="now_showing">
                                    Đang chiếu
                                </Select.Option>
                                <Select.Option value="referenced">
                                    Đã chiếu
                                </Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            style={{ display: "none" }}
                            className={clsx(styles.inputLabel)}
                            label="ID"
                            name="calendar_show_id"
                            rules={[
                                {
                                    required: true,
                                    message: "Nhập ID lịch chiếu",
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Form>
                </Skeleton>
            </Modal>
        </>
    );
};

export default EditShowtimes;
