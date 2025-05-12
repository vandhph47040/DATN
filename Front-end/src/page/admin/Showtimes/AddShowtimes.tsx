import { useMutation, useQuery } from "@tanstack/react-query";
import {
    Button,
    Form,
    TimePicker,
    message,
    Modal,
    Select,
    Tag,
    Input,
} from "antd";
import axios from "axios";
import {
    GET_CALENDAR,
    GET_DATES_BY_CALENDAR,
    GET_FILM_LIST,
    UPDATE_SHOWTIMES,
} from "../../../config/ApiConfig";
import { useCallback, useState } from "react";
import { PlusCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import clsx from "clsx";
import styles from "../globalAdmin.module.css";
import { useGetRooms } from "../../../services/adminServices/roomManage.service";
import { handleApiError } from "../../../services/adminServices/utils";
import { useGetShowtimesByFilmId } from "../../../services/adminServices/filmManage.service";

const AddShowtimes = ({ setDataByFilmId }: any) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [selectedCalendarShowId, setSelectedCalendarShowId] = useState<
        number | null
    >(null);

    const { mutate: getShowtimesByFilmId } = useGetShowtimesByFilmId();

    const onFinish = (formData: any) => {
        const formattedData = {
            ...formData,
            start_time: dayjs(formData.start_time).format("HH:mm"),
            end_time: dayjs(formData.end_time).format("HH:mm"),
            selected_dates: formData.selected_dates.map((date: string) =>
                dayjs(date).format("YYYY-MM-DD")
            ),
            calendar_show_id: Number(formData.calendar_show_id),
        };
        console.log("check-data", formattedData);

        mutate(formattedData, {
            onSuccess: () => {
                messageApi.success(`Thêm thành công suất chiếu`);

                getShowtimesByFilmId(formattedData.title, {
                    onSuccess: (data) => {
                        setDataByFilmId(data);
                    },
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

    const handleOk = () => form.submit();

    const handleCancel = () => {
        form.resetFields();
        setOpen(false);
    };

    // danh sách film
    const { data: filmList } = useQuery({
        queryKey: ["filmList"],
        queryFn: async () => {
            const { data } = await axios.get(GET_FILM_LIST);
            console.log("list-film", data.movies);

            return data.movies.map((item: any) => ({
                ...item,
                key: item.id,
            }));
        },
        enabled: open,
        staleTime: 1000 * 60 * 10,
    });

    // lấy danh sách lịch chiếu của các phim
    const { data: idCalendarShow } = useQuery({
        queryKey: ["showtimesFilm"],
        queryFn: async () => {
            const { data } = await axios.get(GET_CALENDAR);
            return data.map((item: any) => ({
                ...item,
                key: item.id,
            }));
        },
        enabled: open,
        staleTime: 1000 * 60 * 10,
    });

    // Khi chọn phim, cập nhật `calendar_show_id`
    const handleFilmChange = (value: number) => {
        const selectedShow = idCalendarShow?.find(
            (show: any) => show.movie_id === value
        );
        const calendarShowId = selectedShow ? selectedShow.id : null;

        setSelectedCalendarShowId(calendarShowId);
        form.setFieldsValue({
            calendar_show_id: calendarShowId || "",
        });
    };

    // lấy lịch chiếu của phim
    const { data: datesByCalendar } = useQuery({
        queryKey: ["datesByCalendar", selectedCalendarShowId],
        queryFn: async () => {
            if (!selectedCalendarShowId) return [];
            const { data } = await axios.post(GET_DATES_BY_CALENDAR, {
                calendar_show_id: selectedCalendarShowId,
            });
            console.log("days-by-calendar", data);
            // const datesByCalendar = data.dates;
            return data.dates;
        },
        enabled: !!selectedCalendarShowId, // Chỉ gọi API nếu đã có calendar_show_id
        refetchOnWindowFocus: false,
    });

    const today = dayjs().format("YYYY-MM-DD");

    const filteredDates = datesByCalendar?.filter(
        (item: string) => item >= today
    );

    const handleChangeSelect = useCallback(
        (value: string[], fieldName: string) => {
            form.setFieldsValue({ [fieldName]: value });
        },
        [form]
    );

    // Lấy danh sách phòng và loại phòng
    const { rooms, seatTypes } = useGetRooms();

    const handleRoomChange = (value: number) => {
        const selectedRoom = rooms?.find((room: any) => room.id === value);
        const roomTypeName = seatTypes?.find(
            (seatType: any) => seatType.id === selectedRoom?.room_type_id
        );

        form.setFieldsValue({
            room_id: value,
            room_type: roomTypeName?.name || "Chưa có định dạng",
        });
    };

    const { mutate } = useMutation({
        mutationFn: async (formData) => {
            const response = await axios.post(UPDATE_SHOWTIMES, formData);
            return response.data;
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
                <PlusCircleOutlined /> Thêm suất chiếu
            </Button>
            <Modal
                title="Thêm mới suất chiếu"
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form
                    form={form}
                    name="add-showtimes-form"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        className={clsx(styles.inputLabel)}
                        label="Phòng chiếu"
                        name="room_id"
                        rules={[
                            { required: true, message: "Thêm phòng chiếu" },
                        ]}
                    >
                        <Select
                            placeholder="Chọn phòng"
                            onChange={handleRoomChange}
                        >
                            {rooms?.map((item: any) => (
                                <Select.Option value={item.id} key={item.id}>
                                    {item.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        className={clsx(styles.inputLabel)}
                        label="Phim chiếu"
                        name="title"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên phim",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Chọn phim"
                            onChange={handleFilmChange}
                        >
                            {filmList
                                ?.filter((film: any) =>
                                    idCalendarShow?.some(
                                        (show: any) => show.movie_id === film.id
                                    )
                                )
                                .map((film: any) => (
                                    <Select.Option
                                        key={film.id}
                                        value={film.id}
                                    >
                                        {film.title}{" "}
                                        <span>
                                            {film.movie_status ===
                                            "now_showing" ? (
                                                <Tag color="green">
                                                    Đang chiếu
                                                </Tag>
                                            ) : (
                                                <Tag color="red">Sắp chiếu</Tag>
                                            )}
                                        </span>
                                    </Select.Option>
                                ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        className={clsx(styles.inputLabel)}
                        label="Ngày chiếu"
                        name="selected_dates"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập ngày chiếu",
                            },
                        ]}
                    >
                        <Select mode="multiple" placeholder="Chọn ngày chiếu">
                            {filteredDates?.map((item: any) => (
                                <Select.Option value={item} key={item}>
                                    {item}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        className={clsx(styles.inputLabel)}
                        label="Hình thức chiếu"
                        name="room_type"
                    >
                        <Select
                            allowClear
                            style={{ width: "100%" }}
                            placeholder="Please select"
                            onChange={(value) =>
                                handleChangeSelect([value], "room_type")
                            }
                            options={rooms}
                            value={form.getFieldValue("room_type")}
                            disabled
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
                                                  (m) => m <= startTime.minute()
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
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default AddShowtimes;
