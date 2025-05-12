import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
    BACKGROUND_IMG_SEATS,
    CREATE_SEAT,
    DELETE_ALL_SEATS_IN_ROOM,
    DELETE_SEAT,
    GET_SEATS_BY_ROOM,
    GET_SEATS_TYPE,
    UPDATE_SEAT,
    UPDATE_SEAT_STATUS,
} from "../../config/ApiConfig";
import { handleApiError } from "./utils";

// lấy danh sách ghế trong phòng chiếu
export const useGetSeatsByRoom = (id: number) => {
    const { data, isLoading } = useQuery({
        queryKey: ["SeatsByRoom", id],
        queryFn: async () => {
            try {
                const { data } = await axios.get(GET_SEATS_BY_ROOM(id));
                console.log("check-seats-by_room", data);

                const seatArray = data
                    ? Object.entries(data).flatMap(
                          ([row, cols]: [string, any]) =>
                              Object.entries(cols).map(
                                  ([col, seat]: [string, any]) => ({
                                      row,
                                      column: Number(col),
                                      ...seat,
                                  })
                              )
                      )
                    : [];

                return seatArray.sort((a, b) => {
                    if (a.row === b.row) return a.column - b.column;
                    return a.row.localeCompare(b.row);
                });
            } catch (error) {
                return [];
            }
        },
        staleTime: 1000 * 60 * 10,
        refetchOnMount: false,
        retry: 2,
    });

    return { data, isLoading };
};

// lấy danh sách loại ghế
export const useOptionSeats = () => {
    const { data } = useQuery({
        queryKey: ["OptionSeats"],
        queryFn: async () => {
            const { data } = await axios.get(GET_SEATS_TYPE);
            // console.log("check-ghế", data);
            return data;
        },
        staleTime: 1000 * 60 * 10,
        refetchOnMount: false,
    });
    return { data };
};

//Xóa 1 ghế
export const useDeleteOneSeat = (messageApi: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (seatId: number) => {
            await axios.delete(DELETE_SEAT(seatId));
        },
        onSuccess: () => {
            messageApi.success("Xóa ghế thành công");
            queryClient.invalidateQueries({
                queryKey: ["SeatsByRoom"],
            });
        },
        onError: handleApiError,
    });
};

//xóa tất cả ghế của phòng
export const useDeleteAllSeats = (messageApi: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (roomId: number) => {
            await axios.delete(DELETE_ALL_SEATS_IN_ROOM(roomId));
        },
        onSuccess: () => {
            messageApi.success("Xóa tất cả ghế thành công");
            queryClient.invalidateQueries({
                queryKey: ["SeatsByRoom"],
            });
        },
        onError: handleApiError,
    });
};

// cập nhật ghế của phòng
export const useUpdateSeat = (messageApi: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ seatId, data }: { seatId: number; data: any }) => {
            await axios.put(UPDATE_SEAT(seatId), data);
        },
        onSuccess: () => {
            messageApi.success("Cập nhật ghế thành công");
            queryClient.invalidateQueries({
                queryKey: ["SeatsByRoom"],
            });
        },
        onError: handleApiError,
    });
};

// thêm mới ghế của phòng
export const useCreateSeat = (messageApi: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ data }: { data: any }) => {
            const response = await axios.post(CREATE_SEAT, data);
            console.log("check - response", response);

            return response.data.data;
        },
        onSuccess: () => {
            messageApi.success("Thêm mới ghế thành công");
            queryClient.invalidateQueries({
                queryKey: ["SeatsByRoom"],
            });
        },

        onError: handleApiError,
    });
};

// ẩn ghế
export const useHideSeat = (messageApi: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ roomId, data }: { roomId: number; data: any }) => {
            await axios.put(UPDATE_SEAT_STATUS(roomId), data);
        },
        onSuccess: () => {
            messageApi.success("Cập nhật trạng thái thành công");
            queryClient.invalidateQueries({
                queryKey: ["SeatsByRoom"],
            });
        },
        onError: handleApiError,
    });
};

// chỉnh background ghế
export const useUpdateBackgroundSeat = (messageApi: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ roomId, data }: { roomId: number; data: any }) => {
            await axios.put(BACKGROUND_IMG_SEATS(roomId), data);
        },
        onSuccess: () => {
            messageApi.success("Cập nhật BackGround thành công");
            queryClient.invalidateQueries({
                queryKey: ["roomsCinema"],
            });
        },
        onError: handleApiError,
    });
};
