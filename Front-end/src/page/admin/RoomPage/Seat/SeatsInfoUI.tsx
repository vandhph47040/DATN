import clsx from "clsx";
import styles from "./SeatsInfoUI.module.css";

const SeatsInfoUI = () => {
    return (
        <div className={clsx(styles.seatsInfoContainer)}>
            <div className={clsx(styles.warnning)}>
                <p>Số cột phải là CHẴN nếu muốn build GHẾ SWEETBOX</p>
                <p>Ghế Sweetbox đi theo cặp A1-A2, A3-A4, A5-A6, ...</p>
            </div>

            <div className={clsx(styles.bookingSeatsInfo)}>
                <div className={clsx(styles.flexBooking)}>
                    <div className={clsx(styles.seatsInfo)}>
                        <div
                            className={clsx(
                                styles.bookingSeats,
                                styles.seatsBooked
                            )}
                        />
                        <span className={clsx(styles.bookingSeatsName)}>
                            Ghế bị ẩn ở client
                        </span>
                    </div>
                    <div className={clsx(styles.seatsInfo)}>
                        <div
                            className={clsx(
                                styles.bookingSeats,
                                styles.seatsMaintenance
                            )}
                        />
                        <span className={clsx(styles.bookingSeatsName)}>
                            Ghế đang bảo trì
                        </span>
                    </div>
                </div>
                <div className={clsx(styles.flexBooking)}>
                    <div className={clsx(styles.seatsInfo)}>
                        <div
                            className={clsx(
                                styles.bookingSeats,
                                styles.seatsNormal
                            )}
                        />
                        <span className={clsx(styles.bookingSeatsName)}>
                            Ghế thường
                        </span>
                    </div>
                    <div className={clsx(styles.seatsInfo)}>
                        <div
                            className={clsx(
                                styles.bookingSeats,
                                styles.seatsVIP
                            )}
                        />
                        <span className={clsx(styles.bookingSeatsName)}>
                            Ghế VIP
                        </span>
                    </div>
                    <div className={clsx(styles.seatsInfo)}>
                        <div
                            className={clsx(
                                styles.bookingSeats,
                                styles.seatSweetbox
                            )}
                        />
                        <span className={clsx(styles.bookingSeatsName)}>
                            Ghế sweatbox
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatsInfoUI;
