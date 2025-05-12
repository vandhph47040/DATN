import React, { useEffect, useState } from "react";
import { Divider, message, Spin } from "antd";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { GET_ONE_SHOWTIMES } from "../../../config/ApiConfig";
import dayjs from "dayjs";
import { useForm } from "antd/es/form/Form";
import AddShowtimes from "./AddShowtimes";
import ShowtimesAllRooms from "./ShowtimesAllRooms";
import clsx from "clsx";
import styles from "../globalAdmin.module.css";
import { useGetRooms } from "../../../services/adminServices/roomManage.service";
import {
    useFilmManage,
    useGetShowtimesByFilmId,
} from "../../../services/adminServices/filmManage.service";
import SearchByRoomAndDateForm from "./FormRoomAndDate";
import SearchByFilmForm from "./FormFilmId";
import ShowtimesByFilmId from "./ShowtimesByFilmId";

const contentStyle: React.CSSProperties = {
    paddingTop: 100,
};

const content = <div style={contentStyle} />;

const ShowtimesManage: React.FC = () => {
    const [formRoomDate] = useForm();
    const [formFilmId] = useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingFilmId, setIsLoadingFilmId] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedFilmId, setSelectedFilmId] = useState<number | null>(null);
    const [searchedDate, setSearchedDate] = useState<string | null>(null);
    const [searchedRoom, setSearchedRoom] = useState<string | null>(null);
    const [searchedFilmId, setSearchedFilmId] = useState<number | null>(null);
    const [showtimesData, setShowtimesData] = useState<any[]>([]);
    const [isSearchedDateandRoom, setIsSearchedDateandRoom] = useState(false);
    const [isSearchedFilmId, setIsSearchedFilmId] = useState(false);
    const [dataByFilmId, setDataByFilmId] = useState<string[]>([]);

    const handleRoomChange = (value: string) => {
        setSelectedRoom(value);
    };

    const handleDateChange = (date: dayjs.Dayjs | null) => {
        if (date) {
            const formattedDate = date.format("YYYY-MM-DD");
            setSelectedDate(formattedDate);
        } else {
            setSelectedDate(null);
        }
    };

    const onFinishDateandRoom = (formData: any) => {
        setIsSearchedDateandRoom(true);
        setIsSearchedFilmId(false);
        setSearchedDate(selectedDate);
        setSearchedRoom(selectedRoom);
        mutate(formData);
        formFilmId.resetFields();
    };

    // hàm tìm suất chiếu
    const { mutate } = useMutation({
        mutationFn: async (formData: any) => {
            setIsLoading(true);
            const newFormData = {
                ...formData,
                date: formData.date
                    ? dayjs(formData.date).format("YYYY/MM/DD")
                    : null,
            };

            try {
                const response = await axios.post(
                    GET_ONE_SHOWTIMES,
                    newFormData
                );
                console.log(response.data);

                setShowtimesData(response.data || []);
            } catch (error: any) {
                messageApi.error(
                    error?.response?.data?.message || "Có lỗi xảy ra!"
                );
                setShowtimesData([]);
            } finally {
                setIsLoading(false);
            }
        },
        onError: (error: any) => {
            setIsLoading(false);
            messageApi.error(
                error?.response?.data?.message || "Có lỗi xảy ra!"
            );
        },
    });

    // lấy danh sách phòng
    const { rooms, isRoomsLoading, seatTypes } = useGetRooms();

    // lấy danh sách phim
    const { data: listFilms, isLoading: loadingFilms } = useFilmManage();

    // lưu dũ liệu vào state
    const handleFilmIdChange = (value: number) => {
        setSelectedFilmId(value);
    };

    // api lấy suất chiếu với id film
    const { mutate: getShowtimesByFilmId } = useGetShowtimesByFilmId();

    // xử lý  khi submit
    const onFinishFilmId = (formData: any) => {
        setIsLoadingFilmId(true);
        setIsSearchedFilmId(true);
        setIsSearchedDateandRoom(false);

        const filmTitle = listFilms.find(
            (film: any) => film.id === selectedFilmId
        )?.title;
        setSearchedFilmId(filmTitle || "");

        getShowtimesByFilmId(selectedFilmId as number, {
            onSuccess: (data) => {
                console.log("check-data", data);
                setDataByFilmId(data || []);
                setIsLoadingFilmId(false);
            },
            onError: () => {
                setDataByFilmId([]);
                setIsLoadingFilmId(false);
            },
        });
        formRoomDate.resetFields();
    };

    return (
        <div style={{ minHeight: "1500px" }}>
            <div className={clsx(styles.flexbox)}>
                <SearchByRoomAndDateForm
                    form={formRoomDate}
                    rooms={rooms}
                    isRoomsLoading={isRoomsLoading}
                    onFinish={onFinishDateandRoom}
                    onRoomChange={handleRoomChange}
                    onDateChange={handleDateChange}
                />
                <SearchByFilmForm
                    form={formFilmId}
                    films={listFilms || []}
                    isLoading={loadingFilms}
                    onFinish={onFinishFilmId}
                    onFilmChange={handleFilmIdChange}
                />
            </div>

            <Divider variant="solid" style={{ borderColor: "#7cb305" }}>
                {isSearchedFilmId
                    ? `Các suất chiếu phim: ${searchedFilmId}`
                    : isSearchedDateandRoom
                    ? `Lịch chiếu ngày: ${searchedDate}`
                    : ""}
            </Divider>

            <div className={clsx(styles.addShowtimes)}>
                <AddShowtimes setDataByFilmId={setDataByFilmId}></AddShowtimes>
            </div>
            {isLoading || isLoadingFilmId ? (
                <Spin tip="Loading">{content}</Spin>
            ) : isSearchedFilmId ? (
                dataByFilmId?.length ? (
                    <ShowtimesByFilmId
                        dataByFilmId={dataByFilmId}
                        setDataByFilmId={setDataByFilmId}
                    />
                ) : (
                    <p className={clsx(styles.warningText)}>
                        {`Chưa có suất chiếu cho phim ${searchedFilmId}`}
                    </p>
                )
            ) : isSearchedDateandRoom ? (
                showtimesData?.length ? (
                    <ShowtimesAllRooms
                        setShowtimesData={setShowtimesData}
                        showtimesData={showtimesData}
                        selectedDate={selectedDate}
                        seatTypes={seatTypes}
                    />
                ) : (
                    <p className={clsx(styles.warningText)}>
                        {`Chưa có suất chiếu nào ngày ${searchedDate} phòng chiếu ${searchedRoom}`}
                    </p>
                )
            ) : null}
        </div>
    );
};

export default ShowtimesManage;
