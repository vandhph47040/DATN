import { useState } from "react";
import PlayingProduct from "../PlayingProduct/PlayingProduct";
import clsx from "clsx";

import { URL_IMAGE } from "../../config/ApiConfig";
import styles from "./PlayingMain.module.css";
import { useFilmContext } from "../UseContext/FIlmContext";

interface PlayingMainProps {
  showChill: (movieId: number) => void;
  filteredMovies?: any[];
}

const PlayingMain = ({ showChill, filteredMovies }: PlayingMainProps) => {
  const [showMore, setShowMore] = useState(false);
  const { setFilmId } = useFilmContext();

  const handleClick = (filmId: number) => {
    setFilmId(filmId);
  };

  // Nếu không có dữ liệu đã lọc, hiển thị thông báo
  if (!filteredMovies || filteredMovies.length === 0) {
    return (
      <div className={clsx(styles.playingMain, "main-base")}>
        <div className={styles.noResults}>Không tìm thấy phim phù hợp</div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.playingMain, "main-base")}>
      {filteredMovies.map((film: any, index: number) => (
        <PlayingProduct
          className={clsx(
            styles.itemMain,
            index >= 8 && !showMore && styles.hidden
          )}
          id={film.id}
          key={film.id}
          trailer={film.trailer}
          poster={`${URL_IMAGE}${film.poster}`}
          genres={film.genres.map((genre: any) => genre.name_genre).join(", ")}
          date={film.date}
          title={film.title}
          release_date={film.release_date}
          showChill={showChill}
          onClick={() => {
            handleClick(film.id);
          }}
        />
      ))}
      {filteredMovies.length > 8 && (
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

export default PlayingMain;
