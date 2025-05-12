import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { GET_USER, Orders_Confirmed } from "../config/ApiConfig";
import { useAuthContext } from "../ClientComponents/UseContext/TokenContext";
import { handleApiError } from "./adminServices/utils";

// lấy tổng tỉền tiêu dùng của user
export const useGetTotalUsedMoneyUser = () => {
    const { tokenUserId } = useAuthContext();
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["totalUsedMoneyUser"],
        queryFn: async () => {
            const { data } = await axios.get(Orders_Confirmed, {
                headers: {
                    Authorization: `Bearer ${tokenUserId}`,
                },
            });

            return data.data;
        },
        staleTime: 1000 * 60 * 10,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    return { data, isLoading, isError, error };
};

// tạo mã discount cho user
export const useGetDiscountFromWheel = () => {
    const { tokenUserId } = useAuthContext();
    return useMutation({
        mutationFn: async ({ data }: { data: any }) => {
            await axios.post(
                "http://localhost:8000/api/discount-codes/assign-user",
                data,
                { headers: { Authorization: `Bearer ${tokenUserId}` } }
            );
        },

        onError: handleApiError,
    });
};

export const useGetUserId = () => {
    const { tokenUserId } = useAuthContext();

    return useQuery({
        queryKey: ["getUserId"],
        queryFn: async () => {
            try {
                const { data } = await axios.get(GET_USER, {
                    headers: { Authorization: `Bearer ${tokenUserId}` },
                });
                console.log("User ID:", data); // Log user ID to console

                return data;
            } catch (error) {
                console.error("Lỗi khi lấy userId:", error);
                return null;
            }
        },
        enabled: !!tokenUserId,
        retry: 1,
        staleTime: 1000 * 60 * 10,
    });
};
