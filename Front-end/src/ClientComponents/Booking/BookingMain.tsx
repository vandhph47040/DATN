import { message, Steps } from "antd";
import BookingSeat from "./BookingSeat/BookingSeat";
import BookingInfo from "./BookingInfo/BookingInfo";
import ComboFood from "./ComboFood/ComboFood";
import PaymentGate from "./PaymentGate/PaymentGate";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import axios from "axios";

import styles from "./BookingMain.module.css";
import CustomNotification from "./Notification/Notification";
import { useStepsContext } from "../UseContext/StepsContext";
import { useSeatsContext } from "../UseContext/SeatsContext";
import { useFilmContext } from "../UseContext/FIlmContext";
import { useAuthContext } from "../UseContext/TokenContext";
import useShowtimeData from "../refreshDataShowtimes/RefreshDataShowtimes";
import { usePromotionContext } from "../UseContext/PromotionContext";
import { useFinalPriceContext } from "../UseContext/FinalPriceContext";
import { useComboContext } from "../UseContext/CombosContext";
import LayoutPaymentResult from "./ResultPayment/LayoutPaymentResult";
import SuccesResult from "./ResultPayment/SuccesResult/SuccesResult";
import ErrorResult from "./ResultPayment/ErrorResult/ErrorResult";
import dayjs from "dayjs";

const BookingMain = () => {
    const { quantitySeats, selectedSeatIds, setShouldRefetch, totalSeatPrice } =
        useSeatsContext();
    const { totalComboPrice } = useComboContext();
    const { currentStep, setCurrentStep, userIdFromShowtimes } =
        useStepsContext();
    const {
        roomIdFromShowtimes,
        showtimeIdFromBooking,
        showtimesTime,
        showtimesDate,
    } = useFilmContext();
    const { tokenUserId } = useAuthContext();
    const { setUsedPoints, setTotalPricePoint, setQuantityPromotion } =
        usePromotionContext();
    const { setTotalPrice } = useFinalPriceContext();

    const { resetDataShowtimes, releaseSeats } = useShowtimeData();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const status = searchParams.get("status");

    const showtimesDateFullYear = dayjs(showtimesDate, "DD/MM").format(
        "YYYY-MM-DD"
    );

    // Thông báo phải đặt ghế để tiếp tục
    const { openNotification, contextHolder } = CustomNotification();

    //api giữ ghế
    const holdSeatMutation = useMutation({
        mutationFn: async (seatIds: number[]) => {
            const { data } = await axios.post(
                "http://localhost:8000/api/hold-seats",
                {
                    seats: seatIds,
                    room_id: roomIdFromShowtimes,
                    showtime_id: showtimeIdFromBooking,
                },
                {
                    headers: {
                        Authorization: `Bearer ${tokenUserId}`,
                    },
                }
            );

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    "matrixSeats",
                    roomIdFromShowtimes,
                    showtimeIdFromBooking,
                ],
            });

            setShouldRefetch(true);

            try {
                const eventData = {
                    timestamp: new Date().getTime(),
                    seats: selectedSeatIds,
                    action: "hold",
                    userId: userIdFromShowtimes,
                };

                localStorage.setItem("seat_update", JSON.stringify(eventData));

                const updateEvent = new CustomEvent("seatUpdateEvent", {
                    detail: eventData,
                });

                window.dispatchEvent(updateEvent);
            } catch (e) {
                console.error("Lỗi khi lưu vào localStorage:", e);
            }
        },
        onError: (error) => {
            console.log("Error holding seats:", error);
            if (error.status === 400) {
                openNotification({
                    description:
                        "Bạn được đặt tối đa 8 ghế, kiểm tra lại số lượng ở trình duyệt khác",
                });
            }
            if (error.status === 409) {
                openNotification({
                    description: "Ghế đã được giữ bởi người khác",
                });
            }
            setCurrentStep(1);
        },
    });

    // Xử lý khi ấn tiếp tục
    const nextStep = () => {
        if (currentStep === 1 && quantitySeats === 0) {
            openNotification({
                description: "Đặt ghế để tiếp tục",
            });
            return;
        }
        // debugger;
        if (
            dayjs(`${showtimesDateFullYear} ${showtimesTime.trim()}`).isBefore(
                dayjs(),
                "minute"
            )
        ) {
            openNotification({
                description:
                    "Suất chiếu đã bắt đầu, đến quầy trực tiếp để đặt ghế",
            });
            return;
        }

        // debugger;
        if (currentStep === 1 && quantitySeats !== 0) {
            holdSeatMutation.mutate(selectedSeatIds);
        }
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };
    // Xử lý khi ấn quay lại
    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }

        if (currentStep === 2 && selectedSeatIds.length > 0) {
            releaseSeats(selectedSeatIds);
        }

        if (currentStep <= 3) {
            setTotalPricePoint(0);
            setUsedPoints(0);
            setQuantityPromotion(0);
            setTotalPrice(totalSeatPrice + totalComboPrice);
        }
    };

    // điều hướng về main khi step về 0 và chuyển hướng payment status
    useEffect(() => {
        if (currentStep === 0) {
            navigate("/playingFilm");
            resetDataShowtimes();
            setCurrentStep(1);
        } else if (status === "success" || status === "error") {
            setCurrentStep(4);
        }

        // refetch thời gian giữ ghế khi current < 2
        if (currentStep < 2) {
            sessionStorage.removeItem("timeLeft");
        }
    }, [currentStep, navigate]);

    useEffect(() => {
        return () => {
            const storedSeats = sessionStorage.getItem("selectedSeatIds");
            const selectedSeatIds: number[] = storedSeats
                ? JSON.parse(storedSeats)
                : [];

            const storedCurrentStep = sessionStorage.getItem("currentStep");
            const nowCurrentStep: number = storedCurrentStep
                ? JSON.parse(storedCurrentStep)
                : 0;
            // releaseSeats(selectedSeatIds);

            if (nowCurrentStep !== 4) {
                releaseSeats(selectedSeatIds);
            }
        };
    }, []);

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <>
                        <BookingSeat className={clsx(styles.bookingLeft)} />
                        <BookingInfo
                            className={clsx(styles.bookingRight)}
                            nextStep={nextStep}
                            prevStep={prevStep}
                        />
                    </>
                );
            case 2:
                return (
                    <>
                        <ComboFood className={clsx(styles.bookingLeft)} />
                        <BookingInfo
                            className={clsx(styles.bookingRight)}
                            nextStep={nextStep}
                            prevStep={prevStep}
                        />
                    </>
                );
            case 3:
                return (
                    <>
                        <PaymentGate className={clsx(styles.bookingLeft)} />
                        <BookingInfo
                            className={clsx(styles.bookingRight)}
                            nextStep={nextStep}
                            prevStep={prevStep}
                            currentStep={currentStep}
                        />
                    </>
                );
            case 4:
                return (
                    <>
                        <LayoutPaymentResult>
                            {status === "success" ? (
                                <SuccesResult />
                            ) : (
                                <ErrorResult />
                            )}
                        </LayoutPaymentResult>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div className={clsx("main-base")}>
                {contextHolder}
                <Steps
                    className={clsx(styles.stepsBooking)}
                    current={currentStep}
                    items={[
                        { title: "Chọn Phim" },
                        { title: "Chọn ghế" },
                        { title: "Chọn đồ ăn" },
                        { title: "Chọn thanh toán" },
                        { title: "Xác nhận" },
                    ]}
                />
                <div className={clsx(styles.bookingMain)}>
                    {renderStepContent()}
                </div>
            </div>
        </>
    );
};

export default BookingMain;
