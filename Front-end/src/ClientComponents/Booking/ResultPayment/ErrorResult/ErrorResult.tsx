import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";
import styles from "./ErrorResult.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import useShowtimeData from "../../../refreshDataShowtimes/RefreshDataShowtimes";
import { useEffect, useState } from "react";

const ErrorResult = () => {
    const navigate = useNavigate();
    const { resetDataShowtimes, releaseSeats } = useShowtimeData();
    const [searchParams] = useSearchParams();
    const message = searchParams.get("message");
    const [canShow, setCanShow] = useState(false);

    useEffect(() => {
        const paymentSuccess = sessionStorage.getItem("paymentSuccess");
        if (paymentSuccess === "true") {
            sessionStorage.removeItem("paymentSuccess");
            setCanShow(true);
        } else {
            navigate("/", { replace: true });
        }
    }, []);

    if (!canShow) return null;

    return (
        <div className={clsx(styles.container)}>
            <span className={clsx(styles.icon)}>
                <FontAwesomeIcon icon={faXmark} />
            </span>
            <h3 className={clsx(styles.title)}>Đặt vé thất bại!</h3>

            <p className={clsx(styles.message)}>{message}</p>
            <p className={clsx(styles.message)}>
                Mời bạn quay lại trang chủ để thực hiện lại đặt vé
            </p>
            <div className={clsx(styles.btnLink)}>
                <button
                    className={clsx(styles.homeButton)}
                    onClick={() => {
                        navigate("/");
                        resetDataShowtimes();
                        releaseSeats();
                    }}
                >
                    Quay lại trang chủ
                </button>
            </div>
        </div>
    );
};

export default ErrorResult;
