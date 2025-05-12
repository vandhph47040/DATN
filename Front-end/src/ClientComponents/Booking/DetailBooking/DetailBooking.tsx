import { Modal } from "antd";
import styles from "./DetailBooking.module.css";
import dayjs from "dayjs";
import clsx from "clsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useStepsContext } from "../../UseContext/StepsContext";
import { useFilmContext } from "../../UseContext/FIlmContext";
import { useFinalPriceContext } from "../../UseContext/FinalPriceContext";
import { useSeatsContext } from "../../UseContext/SeatsContext";
import { useComboContext } from "../../UseContext/CombosContext";
import {
    PAYMENT_WITH_PAYPAL,
    PAYMENT_WITH_VNPAY,
} from "../../../config/ApiConfig";
import { useAuthContext } from "../../UseContext/TokenContext";
import { usePromotionContext } from "../../UseContext/PromotionContext";
import { handleApiError } from "../../../services/adminServices/utils";

const DetailBooking = ({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) => {
    const { dataDetailFilm, calendarShowtimeID, paymentType } =
        useStepsContext();
    const {
        showtimesTime,
        showtimesDate,
        filmId,
        showtimeIdFromBooking,
        roomTypeShowtimes,
    } = useFilmContext();
    const { totalPrice } = useFinalPriceContext();
    const { totalSeatPrice, typeSeats, selectedSeatIds, seatRoomPrice } =
        useSeatsContext();
    const {
        nameCombo,
        totalComboPrice,
        holdComboID,
        setHoldComboID,
        setNameCombo,
        setQuantityCombo,
        setTotalComboPrice,
    } = useComboContext();
    const {
        usedPoints,
        promoCode,
        totalPricePoint,
        totalPriceVoucher,
        setPromoCode,
        setTotalPriceVoucher,
        setQuantityPromotion,
        setPromoCodeLocal,
        setIsVoucherUsed,
    } = usePromotionContext();
    const { setTotalPrice } = useFinalPriceContext();
    const { tokenUserId } = useAuthContext();

    const queryClient = useQueryClient();
    const [isSelected, setIsSelected] = useState(false);
    const currentYear = dayjs().year();

    const onOk = async () => {
        const selectedPaymentUrl =
            paymentType === "VNpay" ? PAYMENT_WITH_VNPAY : PAYMENT_WITH_PAYPAL;

        paymentMutation.mutate(selectedPaymentUrl, {
            onSuccess: (data: any) => {
                window.location.href = data;
            },
            onError: (error) => {
                if (
                    error?.response?.data?.message ===
                    "Mã khuyến mại đã được dùng hết"
                ) {
                    handleApiError(error);
                    setPromoCode("");
                    setPromoCodeLocal(null);
                    setIsVoucherUsed(false);
                    usedPoints !== 0
                        ? setQuantityPromotion(1)
                        : setQuantityPromotion(0);
                    setTotalPriceVoucher(0);
                    setTotalPrice(totalPrice + totalPriceVoucher);
                } else {
                    handleApiError(error);
                    setHoldComboID([]);
                    setNameCombo([]);
                    setQuantityCombo(0);
                    setTotalPrice(totalPrice - totalComboPrice);
                    setTotalComboPrice(0);
                    queryClient.invalidateQueries({
                        queryKey: ["optionsCombos"],
                    });
                }
            },
        });

        setOpen(false);
    };

    const onCancel = () => {
        setOpen(false);
        setIsSelected(false);
    };

    const handleClick = () => {
        setIsSelected(!isSelected);
    };

    const paymentRequest = async (url: string) => {
        // console.log("discount_code:", promoCode);
        const { data } = await axios.post(
            url,
            {
                totalPrice,
                total_combo_price: totalComboPrice,
                total_ticket_price: totalSeatPrice,
                total_price_point: totalPricePoint,
                total_price_voucher: totalPriceVoucher,
                movie_id: filmId,
                showtime_id: showtimeIdFromBooking,
                calendar_show_id: calendarShowtimeID,
                seat_ids: selectedSeatIds,
                combo_ids: holdComboID,
                usedPoints: usedPoints,
                discount_code: promoCode ?? "",
            },
            {
                headers: {
                    Authorization: `Bearer ${tokenUserId}`,
                },
            }
        );
        return data.data;
    };

    const paymentMutation = useMutation({
        mutationFn: (paymentUrl: string) => paymentRequest(paymentUrl),
    });

    sessionStorage.setItem("paymentSuccess", "true");

    return (
        <Modal
            centered
            open={open}
            closable={false}
            onOk={onOk}
            onCancel={onCancel}
            okText="Thanh toán"
            cancelButtonProps={{ style: { display: "none" } }}
            okButtonProps={{
                className: clsx(styles.customOkButton),
                disabled: !isSelected,
            }}
            width={385}
        >
            <div className={clsx(styles.infoBox)}>
                <h1 className={clsx(styles.info)}>THÔNG TIN ĐẶT VÉ</h1>
                <div className={clsx(styles.movieInfo)}>
                    <h2 className={clsx(styles.sectionTitle)}>Phim</h2>
                    <div className={clsx(styles.subBox)}>
                        <h3 className={clsx(styles.movieTitle)}>
                            {dataDetailFilm?.title}
                        </h3>
                        <div className={clsx(styles.movieDetails)}>
                            <span className={clsx(styles.format)}>
                                {roomTypeShowtimes}
                            </span>
                            {"  "}
                            <span className={clsx(styles.language)}>
                                {dataDetailFilm?.language}
                            </span>
                        </div>
                        <div className={clsx(styles.rated)}>
                            {dataDetailFilm?.rated}
                        </div>
                    </div>
                </div>
                <div className={clsx(styles.bookingContent)}>
                    <h2 className={clsx(styles.sectionTitle)}>Nội dung</h2>
                    <div className={clsx(styles.ticketDetails)}>
                        <div className={clsx(styles.cinemaRoom)}>RAP 2</div>
                        <div className={clsx(styles.showtime)}>
                            {dayjs(showtimesTime, "HH:mm:ss").format("HH:mm")} -{" "}
                            {dayjs(
                                `${showtimesDate}/${currentYear}`,
                                "DD/MM/YYYY"
                            ).format("YYYY/MM/DD")}
                        </div>
                        <div className={clsx(styles.seatInfo)}>
                            {typeSeats?.map((item: any, index: any) => (
                                <div key={index}>
                                    <span className={clsx(styles.seatLabel)}>
                                        Ghế {item.type}:{" "}
                                    </span>
                                    <span className={clsx(styles.seatName)}>
                                        {item.seatCode}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className={clsx(styles.comboInfo)}>
                            {nameCombo?.map((item: any, index: any) => (
                                <div key={index}>
                                    <span className={clsx(styles.comboLabel)}>
                                        {item.defaultQuantityCombo}{" "}
                                    </span>
                                    <span className={clsx(styles.comboName)}>
                                        x {item.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className={clsx(styles.allInfo)}>
                    <h2 className={clsx(styles.all)}>Tổng</h2>
                    <div className={clsx(styles.totalPrice)}>
                        {totalPrice.toLocaleString("vi-VN")} VNĐ
                    </div>
                </div>
            </div>
            <div className={clsx(styles.checked)}>
                <span className={clsx(styles.paragraph)}>
                    Tôi xác nhận thông tin đặt vé là chính xác
                </span>{" "}
                <span
                    className={clsx(styles.selectButton, {
                        [styles.active]: isSelected,
                    })}
                    onClick={handleClick}
                ></span>
            </div>
        </Modal>
    );
};

export default DetailBooking;
