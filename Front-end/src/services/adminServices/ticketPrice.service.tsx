import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
    DELETE_TICKETPRICE,
    DETAIL_TICKETPRICE,
    GET_TICKETSPRICE,
    UPDATE_TICKETPRICE,
} from "../../config/ApiConfig";
import { handleApiError } from "./utils";

// Hàm lấy dữ liệu ticketPrice
export const useTicketsPrice = () => {
    return useQuery({
        queryKey: ["ticketsPrice"],
        queryFn: async () => {
            const { data } = await axios.get(GET_TICKETSPRICE);
            console.log("check", data.data);
            return data.data.map((item: any) => ({ ...item, key: item.id }));
        },
        staleTime: 1000 * 60 * 10, // Dữ liệu cache trong 10 phút
    });
};

// hàm xóa dữ liệu
export const useDeleteTicketPrice = (messageApi: any) => {
    const query = useQueryClient();
    return useMutation({
        mutationFn: async (id: any) => {
            await axios.delete(DELETE_TICKETPRICE(id));
        },

        onSuccess: () => {
            query.invalidateQueries({
                queryKey: ["ticketsPrice"],
            });
            messageApi.success("Xóa vé thành công");
        },
        onError: handleApiError,
    });
};

// hàm lấy chi tiết giá vé
export const useDetailTicketsPrice = (id: any, open: boolean) => {
    return useQuery({
        queryKey: ["detailTicketsPrice", id],
        queryFn: async () => {
            const { data } = await axios.get(DETAIL_TICKETPRICE(id));

            return data.data;
        },
        staleTime: 1000 * 60 * 10, // Dữ liệu cache trong 10 phút
        enabled: id && open === true,
    });
};

// hàm sửa dữ liệu
export const useUpdateTicketPrice = (messageApi: any) => {
    const query = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, formData }: { id: any; formData: any }) => {
            await axios.put(UPDATE_TICKETPRICE(id), formData);
        },
        onSuccess: () => {
            query.invalidateQueries({
                queryKey: ["ticketsPrice"],
            });
            messageApi.success("Cập nhật vé thành công");
        },
        onError: handleApiError,
    });
};
