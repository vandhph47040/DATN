import { Divider } from "antd";
import clsx from "clsx";
import styles from "../InfoMovie/InfoMovie.module.css";
import { useSeatsContext } from "../../UseContext/SeatsContext";
import { useEffect } from "react";
import { useComboContext } from "../../UseContext/CombosContext";
import { useStepsContext } from "../../UseContext/StepsContext";

const SeatInfo = () => {
    const { typeSeats, setTotalSeatPrice } = useSeatsContext();
    const { totalComboPrice } = useComboContext();
    const { currentStep } = useStepsContext();
    useEffect(() => {
        const newTotalSeatsPrice = typeSeats.reduce(
            (sum: number, seat: any) => {
                const price = Number(seat.price) || 0;
                return sum + price;
            },
            0
        );

        setTotalSeatPrice(newTotalSeatsPrice);
    }, [typeSeats, totalComboPrice, currentStep]);

    // console.log(typeSeats);

    return (
        <div>
            <Divider className={clsx(styles.dividerCustom)} dashed />
            <div className={clsx(styles.bookingSeats)}>
                {typeSeats.map((seats: any, index: any) => (
                    <div className={clsx(styles.seatItem)} key={index}>
                        <div className={clsx(styles.seatInfo)}>
                            <div className={clsx(styles.seatCount)}>
                                <span className={clsx(styles.number)}>
                                    {seats.quantitySeats === 0
                                        ? ""
                                        : `${seats.quantitySeats} x `}
                                </span>
                                <span className={clsx(styles.seatType)}>
                                    Ghế {seats.type}
                                </span>
                            </div>
                            <span className={clsx(styles.seatNumbers)}>
                                <span>Ghế:</span>
                                <span className={clsx(styles.seatName)}>
                                    {(() => {
                                        // Chuyển seatCode thành mảng các ghế
                                        const seatArray = seats.seatCode
                                            ? seats.seatCode
                                                  .split(",")
                                                  .map((seat: string) =>
                                                      seat.trim()
                                                  )
                                            : [];

                                        // Sắp xếp theo phần chữ trước, số sau
                                        const sortedSeats = seatArray.sort(
                                            (a: string, b: string) => {
                                                const matchA =
                                                    a.match(
                                                        /^([A-Za-z]+)(\d+)$/
                                                    );
                                                const matchB =
                                                    b.match(
                                                        /^([A-Za-z]+)(\d+)$/
                                                    );

                                                if (!matchA || !matchB)
                                                    return 0;

                                                const [_, charA, numA] = matchA;
                                                const [__, charB, numB] =
                                                    matchB;

                                                if (charA !== charB) {
                                                    return charA.localeCompare(
                                                        charB
                                                    );
                                                }

                                                return (
                                                    parseInt(numA) -
                                                    parseInt(numB)
                                                );
                                            }
                                        );

                                        return sortedSeats.join(", ");
                                    })()}
                                </span>
                            </span>
                        </div>
                        <div className={clsx(styles.seatPrice)}>
                            {seats.price.toLocaleString("vi-VN")}đ
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SeatInfo;
