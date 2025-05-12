import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Skeleton, Spin } from "antd";
import clsx from "clsx";

import { GET_SHOW_BY_FILM_DATE } from "../../config/ApiConfig";
import BoxNumbers from "./BoxNumbers/BoxNumbers";
import BoxDay from "./BoxDays/BoxDay";
import styles from "./CalendarMovie.module.css";
import { useFilmContext } from "../UseContext/FIlmContext";
import { useStepsContext } from "../UseContext/StepsContext";
import { Showtime } from "../../types/interface";
import { useSeatsContext } from "../UseContext/SeatsContext";

const CalendarMovies = ({ id }: any) => {
    const [searchDateRaw, setSearchDateRaw] = useState<string | null>(null);
    const [searchDateFormatted, setSearchDateFormatted] = useState<
        string | null
    >(null);
    const { setCalendarShowtimeID } = useStepsContext();
    const {
        setShowtimesTime,
        setShowtimesEndTime,
        setShowtimesDate,
        setRoomIdFromShowtimes,
        setShowtimeIdFromBooking,
        setListShowtimes,
        setRoomTypeShowtimes,
        setRoomNameShowtimes,
    } = useFilmContext();
    const { setSeatRoomPrice } = useSeatsContext();

    // lấy danh sách lịch chiếu
    const { data: calendarMovie, isLoading: isLoadingCalendarMovie } = useQuery(
        {
            queryKey: ["calendarMovie", id],
            queryFn: async () => {
                const { data } = await axios.get(
                    `http://localhost:8000/api/calendar-show/date-range/${id}`
                );
                return data.show_dates;
            },
            staleTime: 1000 * 60 * 10,
            retry: false,
            refetchOnWindowFocus: false,
        }
    );

    // list ngày để hiện ngày thực tế
    const daysOfWeek = [
        "Chủ Nhật",
        "Thứ Hai",
        "Thứ Ba",
        "Thứ Tư",
        "Thứ Năm",
        "Thứ Sáu",
        "Thứ Bảy",
    ];

    // lấy danh sách các suất chiếu
    const { data: LoadShowByFilmAndDate, isLoading: isLoadingFilmAndDate } =
        useQuery({
            queryKey: ["LoadShowByFilmAndDate", searchDateRaw, id],
            queryFn: async () => {
                if (!searchDateRaw) return null;
                const { data } = await axios.get(
                    `${GET_SHOW_BY_FILM_DATE}/${id}/${searchDateRaw}`
                );
                return data.show_times.map((item: any) => ({
                    ...item,
                    key: item.id,
                }));
            },
            enabled: !!searchDateRaw,
            staleTime: 1000 * 60,
            retry: false,
        });

    // lấy danh sách suất chiếu lưu vào state
    useEffect(() => {
        if (LoadShowByFilmAndDate) {
            setListShowtimes(LoadShowByFilmAndDate);
        }
    }, [LoadShowByFilmAndDate]);

    //  tìm kiếm mặc định suất chiếu đầu tiên khi đặt vé
    useEffect(() => {
        if (calendarMovie && calendarMovie.length > 0) {
            const firstDate = dayjs(calendarMovie[0]).format("YYYY-MM-DD");
            if (searchDateRaw !== firstDate) {
                setSearchDateRaw(firstDate);
                setSearchDateFormatted(dayjs(firstDate).format("DD/MM"));
                setShowtimesDate(dayjs(firstDate).format("DD/MM"));
            }
        }
    }, [calendarMovie, id]);

    // xử lý gán các giá trị vào state
    const handleShowtimeClick = (
        item: any,
        setCalendarShowtimeID: (id: number) => void,
        setRoomIdFromShowtimes: (id: number) => void,
        setRoomTypeShowtimes: (id: string) => void,
        setRoomNameShowtimes: (name: string) => void,
        setShowtimeIdFromBooking: (id: number) => void,
        setShowtimesTime: (time: string) => void,
        setShowtimesEndTime: (time: string) => void,
        setSeatRoomPrice: (price: number) => void
    ) => {
        // console.log("item-check", item);

        setCalendarShowtimeID(item.calendar_show_id);
        setRoomIdFromShowtimes(item.room_id);
        setRoomTypeShowtimes(item.room.room_type.name);
        setRoomNameShowtimes(item.room.name);
        setShowtimeIdFromBooking(item.id);
        setShowtimesTime(item.start_time);
        setShowtimesEndTime(item.end_time);
        setSeatRoomPrice(parseInt(item.room.room_type.price));
    };

    // nhóm các suất chiếu có cùng 1 phòng chiếu
    const groupByRoom = (showtimes: Showtime[]): Record<string, Showtime[]> => {
        return showtimes.reduce((acc: any, item: any) => {
            const roomName = item.room.room_type.name;
            if (!acc[roomName]) {
                acc[roomName] = [];
            }
            acc[roomName].push(item);
            return acc;
        }, {});
    };

    return (
        <div>
            {isLoadingCalendarMovie ? (
                <Skeleton loading={isLoadingCalendarMovie} active></Skeleton>
            ) : calendarMovie === undefined || calendarMovie?.length === 0 ? (
                <div className={clsx(styles.noShowtimes)}>
                    Hiện tại phim chưa có lịch chiếu
                </div>
            ) : (
                <>
                    <div className={clsx(styles.calendarDays)}>
                        {calendarMovie
                            ?.slice(0, 9)
                            ?.map((item: any, index: any) => {
                                const dayIndex = new Date(item).getDay();
                                const formatted = dayjs(item).format("DD/MM");
                                const rawFormat =
                                    dayjs(item).format("YYYY-MM-DD");

                                return (
                                    <BoxDay
                                        key={index}
                                        searchDate={searchDateFormatted}
                                        date={formatted}
                                        number={daysOfWeek[dayIndex]}
                                        onClick={() => {
                                            setSearchDateRaw(rawFormat);
                                            setSearchDateFormatted(formatted);
                                            setShowtimesDate(formatted);
                                        }}
                                    />
                                );
                            })}
                    </div>
                    {isLoadingFilmAndDate ? (
                        <div className={clsx(styles.loadingTime)}>
                            <Spin />
                        </div>
                    ) : (
                        <div className={clsx(styles.calendarNumbers)}>
                            {LoadShowByFilmAndDate &&
                            LoadShowByFilmAndDate.filter((item: any) =>
                                dayjs(
                                    `${searchDateRaw} ${item.start_time}`
                                ).isAfter(dayjs(), "minute")
                            ).length > 0 ? (
                                Object.entries(
                                    groupByRoom(LoadShowByFilmAndDate)
                                )
                                    .filter(([_, showtimes]) =>
                                        showtimes.some((item: any) =>
                                            dayjs(
                                                `${searchDateRaw} ${item.start_time}`
                                            ).isAfter(dayjs(), "minute")
                                        )
                                    )
                                    .map(([roomName, showtimes]) => (
                                        <div
                                            key={roomName}
                                            className={clsx(styles.groupByRoom)}
                                        >
                                            <div
                                                className={clsx(
                                                    styles.filmRoom
                                                )}
                                            >
                                                {roomName}
                                            </div>
                                            <div
                                                className={clsx(
                                                    styles.showtimesRow
                                                )}
                                            >
                                                {showtimes
                                                    .filter((item: any) =>
                                                        dayjs(
                                                            `${searchDateRaw} ${item.start_time}`
                                                        ).isAfter(
                                                            dayjs(),
                                                            "minute"
                                                        )
                                                    )
                                                    .map((item: any) => {
                                                        return (
                                                            <BoxNumbers
                                                                key={item.id}
                                                                time={dayjs(
                                                                    item.start_time,
                                                                    "HH:mm:ss"
                                                                ).format(
                                                                    "HH:mm"
                                                                )}
                                                                onClick={() =>
                                                                    handleShowtimeClick(
                                                                        item,
                                                                        setCalendarShowtimeID,
                                                                        setRoomIdFromShowtimes,
                                                                        setRoomTypeShowtimes,
                                                                        setRoomNameShowtimes,
                                                                        setShowtimeIdFromBooking,
                                                                        setShowtimesTime,
                                                                        setShowtimesEndTime,
                                                                        setSeatRoomPrice
                                                                    )
                                                                }
                                                            />
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <p className={clsx(styles.noShowtimes)}>
                                    *Chưa có suất chiếu nào cho ngày đã chọn.
                                </p>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CalendarMovies;
