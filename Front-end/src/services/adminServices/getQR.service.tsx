import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { TICKET_DETAIL } from "../../config/ApiConfig";
import { useFinalPriceContext } from "../../ClientComponents/UseContext/FinalPriceContext";
import { useComboContext } from "../../ClientComponents/UseContext/CombosContext";
import { useSeatsContext } from "../../ClientComponents/UseContext/SeatsContext";
import { useFilmContext } from "../../ClientComponents/UseContext/FIlmContext";
import { usePromotionContext } from "../../ClientComponents/UseContext/PromotionContext";
import { useStepsContext } from "../../ClientComponents/UseContext/StepsContext";
import { useAuthContext } from "../../ClientComponents/UseContext/TokenContext";
import { handleApiError } from "./utils";

export const useGetQRTicket = () => {
    const { totalPrice } = useFinalPriceContext();
    const { totalComboPrice, holdComboID } = useComboContext();
    const { totalSeatPrice, selectedSeatIds } = useSeatsContext();
    const { totalPricePoint, usedPoints, totalPriceVoucher, promoCode } =
        usePromotionContext();
    const { filmId, showtimeIdFromBooking } = useFilmContext();
    const { calendarShowtimeID, paymentType, userIdFromShowtimes } =
        useStepsContext();
    const { tokenUserId } = useAuthContext();

    return useMutation({
        mutationFn: async () => {
            const { data } = await axios.post(
                TICKET_DETAIL,
                {
                    totalPrice: totalPrice,
                    total_combo_price: totalComboPrice,
                    total_ticket_price: totalSeatPrice,
                    total_price_point: totalPricePoint,
                    total_price_voucher: totalPriceVoucher,
                    movie_id: filmId,
                    showtime_id: showtimeIdFromBooking,
                    calendar_show_id: calendarShowtimeID,
                    seat_ids: selectedSeatIds,
                    combo_ids: holdComboID,
                    payment_method: paymentType,
                    is_payment_completed: true,
                    user_id: userIdFromShowtimes,
                    usedPoints: usedPoints,
                    discount_code: promoCode ?? "",
                },
                {
                    headers: {
                        Authorization: `Bearer ${tokenUserId}`,
                    },
                }
            );
            return data;
        },

        onError: handleApiError,
    });
};
