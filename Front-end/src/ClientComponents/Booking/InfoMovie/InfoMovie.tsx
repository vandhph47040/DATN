import { Divider, Image } from "antd";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { URL_IMAGE } from "../../../config/ApiConfig";
import SeatInfo from "../SeatInfo/SeatInfo";
import ComboInfo from "../ComboInfo/ComboInfo";
import clsx from "clsx";
import styles from "./InfoMovie.module.css";
import { useEffect } from "react";
import { useFilmContext } from "../../UseContext/FIlmContext";
import { useFinalPriceContext } from "../../UseContext/FinalPriceContext";
import { useSeatsContext } from "../../UseContext/SeatsContext";
import { useComboContext } from "../../UseContext/CombosContext";
import { useStepsContext } from "../../UseContext/StepsContext";
import PromotionInfo from "../Promotion/PromotionInfo/PromotionInfo";
import { usePromotionContext } from "../../UseContext/PromotionContext";

const InfoMovie = () => {
    const { filmId, showtimesTime, showtimesDate, roomTypeShowtimes } =
        useFilmContext();
    const { quantityCombo } = useComboContext();
    const { quantitySeats } = useSeatsContext();
    const { setDataDetailFilm, dataDetailFilm } = useStepsContext();
    const { totalPrice } = useFinalPriceContext();
    const { quantityPromotion } = usePromotionContext();

    // lấy detail film
    const { data: detailFilm } = useQuery({
        queryKey: ["film", filmId],
        queryFn: async () => {
            const { data } = await axios.get(
                `http://localhost:8000/api/movie-details-booking/${filmId}`
            );
            // console.log("detail-id", data.data);

            return data.data;
        },

        staleTime: 1000 * 60 * 10,
    });

    // Gán data detail film vào state để quản lý
    useEffect(() => {
        setDataDetailFilm(detailFilm);
    }, [detailFilm]);

    // lấy dữ liệu từ sessionStorage
    const check = sessionStorage.getItem("dataDetailFilm");

    //chuyển đổi về dạng obj
    const chuyendoi = check ? JSON.parse(check) : null;

    // console.log(sessionStorage.getItem("dataDetailFilm"));
    return (
        <div className={clsx(styles.infoMovie)}>
            <div className={clsx(styles.bookingFilm)}>
                <div className={clsx(styles.filmImage)}>
                    <img
                        className={clsx(styles.filmThumbnail)}
                        src={`${URL_IMAGE}${detailFilm?.poster}`}
                    />
                </div>
                <div className={clsx(styles.filmInfo)}>
                    <div className={clsx(styles.infoTitle, "cliptextTitle")}>
                        {chuyendoi?.title}
                    </div>
                    <div className={clsx(styles.infoGenres)}>
                        {chuyendoi?.genres.map((genre: any, index: number) => (
                            <span
                                key={index}
                                className={clsx(styles.genreItem)}
                            >
                                {genre.name_genre}
                            </span>
                        ))}
                    </div>
                    <div className={clsx(styles.infoSub)}>
                        <span className={clsx(styles.subRoomType)}>
                            {roomTypeShowtimes}
                        </span>
                        <span className={clsx(styles.subForm)}>
                            {chuyendoi?.language}
                        </span>
                    </div>
                    <div
                        className={clsx(styles.subRated)}
                        style={
                            chuyendoi?.rated === "P"
                                ? {
                                      backgroundColor: "#024ca1",
                                  }
                                : chuyendoi?.rated === "K"
                                ? {
                                      backgroundColor: "#00b6e6",
                                  }
                                : chuyendoi?.rated === "T13"
                                ? {
                                      backgroundColor: "#f58020",
                                  }
                                : chuyendoi?.rated === "T16"
                                ? {
                                      backgroundColor: "#f9ad19",
                                  }
                                : chuyendoi?.rated === "T16"
                                ? {
                                      backgroundColor: "#5d9e3a",
                                  }
                                : undefined
                        }
                    >
                        {chuyendoi?.rated}
                    </div>
                </div>
            </div>
            <div className={clsx(styles.bookingDetail)}>
                <span>
                    Suất:{" "}
                    <span className={clsx(styles.detailTime)}>
                        {dayjs(showtimesTime, "HH:mm:ss").format("HH:mm")}
                    </span>
                </span>{" "}
                -
                <span className={clsx(styles.detailDay)}> {showtimesDate}</span>
            </div>

            {(quantitySeats && <SeatInfo />) === 0 ? "" : <SeatInfo />}
            {(quantityCombo && <ComboInfo />) === 0 ? "" : <ComboInfo />}
            {(quantityPromotion && <PromotionInfo />) === 0 ? (
                ""
            ) : (
                <PromotionInfo />
            )}
            <div className={clsx(styles.bookingTotal)}>
                <Divider className={clsx(styles.dividerCustom)} dashed />
                <div className={clsx(styles.totalInfo)}>
                    <div className={clsx(styles.totalLabel)}>Tổng cộng</div>
                    <div className={clsx(styles.totalPrice)}>
                        {parseInt(totalPrice).toLocaleString("vi-VN")}đ
                    </div>
                </div>
            </div>
        </div>
    );
};
export default InfoMovie;
