import { useMutation } from "@tanstack/react-query";
import { useComboContext } from "../UseContext/CombosContext";
import { useFinalPriceContext } from "../UseContext/FinalPriceContext";
import { useSeatsContext } from "../UseContext/SeatsContext";
import { useStepsContext } from "../UseContext/StepsContext";
import axios from "axios";
import { useFilmContext } from "../UseContext/FIlmContext";
import { useAuthContext } from "../UseContext/tokenContext";
import { usePromotionContext } from "../UseContext/PromotionContext";

const useShowtimeData = () => {
    const {
        setQuantityCombo,
        setNameCombo,
        setTotalComboPrice,
        setQuantityMap,
        setHoldComboID,
    } = useComboContext();
    const {
        setTypeSeats,
        setNameSeats,
        setTotalSeatPrice,
        setQuantitySeats,
        setSelectedSeatIds,
        setSeatRoomPrice,
    } = useSeatsContext();
    const { setTotalPrice } = useFinalPriceContext();
    const { setCurrentStep } = useStepsContext();
    const { roomIdFromShowtimes, showtimeIdFromBooking } = useFilmContext();
    const { tokenUserId } = useAuthContext();
    const {
        setQuantityPromotion,
        setTotalPricePoint,
        setUsedPoints,
        setTotalPriceVoucher,
    } = usePromotionContext();

    // Hàm reset dữ liệu
    const resetDataShowtimes = () => {
        setQuantitySeats(0);
        setTypeSeats(null);
        setNameSeats([]);
        setTotalSeatPrice(0);
        setQuantityCombo(0);
        setNameCombo([]);
        setTotalComboPrice(0);
        setQuantityMap({});
        setTotalPrice(0);
        setCurrentStep(1);
        setHoldComboID([]);
        setSelectedSeatIds([]);
        setQuantityPromotion(0);
        setUsedPoints(0);
        setTotalPricePoint(0);
        setTotalPriceVoucher(0);
        // setSeatRoomPrice(0);
    };

    //giải phóng ghế
    const releaseSeatsMutation = useMutation({
        mutationFn: async (seatIds: number[]) => {
            await axios.post(
                `http://localhost:8000/api/release-seats`, // API hủy ghế
                {
                    seats: seatIds,
                    room_id: roomIdFromShowtimes,
                    showtime_id: showtimeIdFromBooking,
                },
                { headers: { Authorization: `Bearer ${tokenUserId}` } }
            );
        },
        onSuccess: () => {
            // Chỉ cập nhật lại ghế đã giải phóng, giữ nguyên ghế đang chọn
        },
    });
    const releaseSeats = (seatIds?: number[]) => {
        // debugger;
        if (seatIds && seatIds.length > 0) {
            releaseSeatsMutation.mutate(seatIds);
        }
    };

    return {
        setQuantityCombo,
        setNameCombo,
        setTotalComboPrice,
        setQuantityMap,
        setTypeSeats,
        setNameSeats,
        setTotalSeatPrice,
        setQuantitySeats,
        setTotalPrice,
        setCurrentStep,
        setSelectedSeatIds,
        setQuantityPromotion,
        setTotalPricePoint,
        setUsedPoints,
        resetDataShowtimes,
        releaseSeats,
    };
};
export default useShowtimeData;
