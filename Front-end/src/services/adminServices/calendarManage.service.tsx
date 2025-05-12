import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
    CREATE_CALENDAR,
    DELETE_CALENDAR,
    DETAIL_CALENDAR,
    GET_CALENDAR,
    GET_FILM_LIST,
    ON_PUBLISH_CALENDARSHOW,
    UPDATE_CALENDAR,
} from "../../config/ApiConfig";
import dayjs from "dayjs";
import { message } from "antd";
import { handleApiError } from "./utils";

// danh sách lịch chiếu
export const useCalendarManage = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["showtimesFilm"],
        queryFn: async () => {
            const { data } = await axios.get(GET_CALENDAR);
            console.log("showtime-data", data);

            return data.map((item: any) => ({
                ...item,
                key: item.id,
            }));
        },
        staleTime: 1000 * 60 * 10,
    });

    return { data, isLoading, isError };
};

// xóa lịch chiếu
export const useDeleteCalendar = (messageApi: any) => {
    const queryClient = useQueryClient();
    const { mutate } = useMutation({
        mutationFn: async (id: number) => {
            await axios.delete(DELETE_CALENDAR(id));
        },
        onSuccess: () => {
            messageApi.success("Xóa lịch chiếu thành công");
            queryClient.invalidateQueries({
                queryKey: ["showtimesFilm"],
            });
        },
        onError: handleApiError,
    });
    return { mutate };
};

// lấy data phim đã có lịch chiếu
export const useHasShowtime = () => {
    const {
        data: movieData,
        isLoading: isMovieLoading,
        error: movieError,
    } = useQuery({
        queryKey: ["filmList"],
        queryFn: async () => {
            const { data } = await axios.get(GET_FILM_LIST);
            return data.movies;
        },
        staleTime: 1000 * 60 * 10,
    });

    const {
        data: showtimeData,
        isLoading: isShowtimeLoading,
        error: showtimeError,
    } = useQuery({
        queryKey: ["showtimesFilm"],
        queryFn: async () => {
            const { data } = await axios.get(GET_CALENDAR);
            return data;
        },
        staleTime: 1000 * 60,
    });

    const isLoading = isMovieLoading || isShowtimeLoading;
    const error = movieError || showtimeError;

    // Kết hợp dữ liệu
    const filmList = movieData?.map((item: any) => ({
        ...item,
        release_date: item.release_date
            ? dayjs(item.release_date).format("YYYY-MM-DD")
            : null,
        hasShowtime: showtimeData?.some(
            (showtime: any) => showtime.movie_id === item.id
        ),
    }));

    return { filmList, isLoading, error };
};

// thêm lịch chiếu
export const useCreateCalendar = (
    messageApi: ReturnType<typeof message.useMessage>[0],
    formShowtime: any
) => {
    const queryClient = useQueryClient();

    const { mutate, isError } = useMutation({
        mutationFn: async (formData: any) => {
            const newFormData = {
                ...formData,
                show_date: formData.show_date
                    ? dayjs(formData.show_date).format("YYYY/MM/DD")
                    : null,
            };
            await axios.post(CREATE_CALENDAR, newFormData);
        },
        onSuccess: () => {
            formShowtime.resetFields();
            messageApi.success("Thêm thành công");
            queryClient.invalidateQueries({
                queryKey: ["showtimesFilm"],
            });
        },
        onError: handleApiError,
    });

    return { mutate, isError };
};

// chi tiết lịch chiếu
export const useDetailCalendar = (id: number, openEdit: boolean) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["showtimesFilm", id],
        queryFn: async () => {
            const { data } = await axios.get(DETAIL_CALENDAR(id));
            console.log("check", data);
            return data;
        },
        enabled: openEdit && !!id,
    });

    return { data, isLoading, error };
};

//  cập nhật lịch chiếu
export const useUpdateCalendar = (
    id: number,
    messageApi: ReturnType<typeof message.useMessage>[0],
    setOpenEdit: (open: boolean) => void,
    formShowtime: any
) => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: async (formData: any) => {
            const response = await axios.put(UPDATE_CALENDAR(id), formData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["showtimesFilm"],
            });
            messageApi.success("Cập nhật thành công");
            setOpenEdit(false);
            formShowtime.resetFields();
        },
        onError: handleApiError,
    });

    return { mutate };
};

export const usePublishCalendarShowtime = (
    messageApi: ReturnType<typeof message.useMessage>[0]
) => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: async ({ id, formData }: { id: number; formData: any }) => {
            await axios.post(ON_PUBLISH_CALENDARSHOW(id), formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["showtimesFilm"],
            });
            messageApi.success("Thay đổi trạng thái thành công");
        },
        onError: handleApiError,
    });
    return { mutate };
};
