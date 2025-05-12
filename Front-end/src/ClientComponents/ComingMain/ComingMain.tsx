import { useState } from "react";
import PlayingProduct from "../PlayingProduct/PlayingProduct";
import { useQuery } from "@tanstack/react-query";
import { URL_IMAGE } from "../../config/ApiConfig";
import clsx from "clsx";
import { fetchComingSoonMovies } from "../../services/comingfilm.service";

import styles from "../PlayingMain/PlayingMain.module.css";
import { useFilmContext } from "../UseContext/FIlmContext";

interface ComingMainProps {
  showChill: (movieId: number) => void;
  filteredMovies?: any[];
}

const ComingMain = ({ showChill, filteredMovies }: ComingMainProps) => {
  const [showMore, setShowMore] = useState(false);
  const { setFilmId } = useFilmContext();

  // Lấy data film sắp chiếu nếu không có dữ liệu đã lọc
  const { data: comingfilms, isLoading } = useQuery({
    queryKey: ["comingfilms"],
    queryFn: fetchComingSoonMovies,
    staleTime: 1000 * 60 * 10,
    enabled: !filteredMovies, // Chỉ gọi API nếu không có dữ liệu đã lọc
  });

  const handleClick = (filmId: number) => {
    setFilmId(filmId);
  };

  // Sử dụng dữ liệu đã lọc nếu có, nếu không thì sử dụng dữ liệu từ API
  const displayMovies = filteredMovies || comingfilms || [];

  // Hiển thị thông báo nếu không có phim nào
  if (displayMovies.length === 0) {
    return (
      <div className={clsx(styles.playingMain, "main-base")}>
        <div className={styles.noResults}>
          {isLoading ? "Đang tải..." : "Không tìm thấy phim sắp chiếu phù hợp"}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.playingMain, "main-base")}>
      {displayMovies.map((film: any, index: number) => (
        <PlayingProduct
          className={clsx(
            styles.itemMain,
            index >= 8 && !showMore && styles.hidden
          )}
          key={film.id}
          id={film.id}
          title={film.title}
          trailer={film.trailer}
          poster={`${URL_IMAGE}${film.poster}`}
          genres={film.genres.map((genre: any) => genre.name_genre).join(", ")}
          release_date={film.release_date}
          showChill={false}
          onClick={() => {
            handleClick(film.id);
          }}
        />
      ))}
      {displayMovies.length > 8 && (
        <button
          className={clsx(styles.showMoreBtn)}
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? "Ẩn bớt " : "Xem thêm..."}
        </button>
      )}
    </div>
  );
};

export default ComingMain;
