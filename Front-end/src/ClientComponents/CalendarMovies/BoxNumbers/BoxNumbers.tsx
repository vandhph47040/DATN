import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import styles from "./BoxNumbers.module.css";
import { useFilmContext } from "../../UseContext/FIlmContext";
import { useAuthContext } from "../../UseContext/TokenContext";
import useShowtimeData from "../../refreshDataShowtimes/RefreshDataShowtimes";
import { useEffect } from "react";

const BoxNumbers = ({ time, onClick }: any) => {
    const { filmId } = useFilmContext();
    const { tokenUserId, setTokenUserId } = useAuthContext();
    const { resetDataShowtimes } = useShowtimeData();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            setTokenUserId(token);
        }
    }, []);

    const handleClick = () => {
        if (!tokenUserId) {
            navigate("/auth/login"); // Chuyển hướng nếu chưa đăng nhập
        } else {
            resetDataShowtimes(); // Reset dữ liệu khi chuyển trang
            onClick && onClick(); // Gọi callback nếu có
            navigate(`/booking/${filmId}`); // Chuyển hướng đến trang đặt vé
        }
    };

    return (
        <div className={clsx(styles.boxNumbers)} onClick={handleClick}>
            {time}
        </div>
    );
};

export default BoxNumbers;

// import { Link } from "react-router-dom";
// import clsx from "clsx";
// import styles from "./BoxNumbers.module.css";
// import { useFilmContext } from "../../UseContext/FIlmContext";
// const BoxNumbers = ({ time, onClick }: any) => {
//     const { filmId } = useFilmContext();
//     return (
//         <Link
//             to={`/booking/${filmId}`}
//             className={clsx(styles.boxNumbers)}
//             onClick={() => onClick()}
//         >
//             {time}
//         </Link>
//     );
// };

// export default BoxNumbers;
