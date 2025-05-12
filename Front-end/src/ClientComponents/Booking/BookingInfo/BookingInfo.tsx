import InfoMovie from "../InfoMovie/InfoMovie";
import SeatHoldTime from "../SeatHoldTime/SeatHoldTime";
import clsx from "clsx";
import styles from "./BookingInfo.module.css";
import { useEffect, useState } from "react";
import DetailBooking from "../DetailBooking/DetailBooking";
import { useStepsContext } from "../../UseContext/StepsContext";
import useIsolatedSeatChecker from "../ValidateSeats/ValidateSeats";
import { useSeatsContext } from "../../UseContext/SeatsContext";
import CustomNotification from "../Notification/Notification";
const BookingInfo = ({ nextStep, prevStep, className }: any) => {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState(false); // State để kiểm soát lỗi
    const { currentStep, paymentType, dataDetailFilm } = useStepsContext();
    const { nameSeats, matrixSeatsManage, selectedSeatIds, typeSeats } =
        useSeatsContext();
    const { checkIsolatedSeat } = useIsolatedSeatChecker();
    const { openNotification, contextHolder } = CustomNotification();

    // console.log("check-list", matrixSeatsManage);
    // console.log("selectedSeatIds", selectedSeatIds);
    // console.log("nameSeats", nameSeats);

    // Reset lỗi khi quay lại bước trước (step < 3)
    useEffect(() => {
        if (currentStep < 3) {
            setError(false); // Ẩn thông báo lỗi
        }
    }, [currentStep]);

    // hiển thị thông báo lỗi khi chưa chọn hình thức thanh toán
    const handleNextPayment = () => {
        if (currentStep === 3) {
            if (!paymentType) {
                setError(true); // Hiển thị lỗi khi chưa chọn phương thức
                return;
            }
            setOpen(true); // Mở modal khi có paymentType
            return;
        }
        nextStep();
    };

    return (
        <>
            {contextHolder}
            <div
                className={clsx(styles.bookingInfo, className)}
                style={currentStep === 1 ? { marginTop: "20px" } : {}}
            >
                {currentStep !== 1 ? <SeatHoldTime></SeatHoldTime> : ""}
                <InfoMovie></InfoMovie>
                <div className={clsx(styles.bookingActions)}>
                    <button
                        className={clsx(styles.btnBack, styles.btnLink)}
                        onClick={prevStep}
                    >
                        Quay lại
                    </button>
                    <button
                        className={clsx(styles.btnNext, styles.btnLink)}
                        onClick={() => {
                            if (
                                checkIsolatedSeat(nameSeats, matrixSeatsManage)
                            ) {
                                openNotification({
                                    description:
                                        "Không được để trống lẻ một ghế bên trái hay phải",
                                });
                                return;
                            }
                            handleNextPayment();
                        }}
                    >
                        {currentStep === 3 ? "Thanh toán" : "Tiếp tục"}
                    </button>
                </div>
                {error && !paymentType && (
                    <span className={clsx(styles.errorMessage)}>
                        * Phải chọn hình thức thanh toán
                    </span>
                )}
            </div>
            <DetailBooking open={open} setOpen={setOpen} />
        </>
    );
};

export default BookingInfo;
