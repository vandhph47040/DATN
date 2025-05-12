import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import styles from "./navigate.module.css";

const Navigate = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path; // so sánh để đổi styles
  return (
    <div className={clsx(styles.navigate, "main-base")}>
      <Link
        className={clsx(styles.film, isActive("/playingFilm") && styles.nowing)}
        to="/playingFilm"
      >
        Phim đang chiếu
      </Link>
      <Link
        className={clsx(
          styles.comingFilm,
          styles.film,
          isActive("/comingFilm") && styles.nowing
        )}
        to="/comingFilm"
      >
        Phim sắp chiếu
      </Link>
      <Link
        className={clsx(styles.film, isActive("/cinemaFilm") && styles.nowing)}
        to="/cinemaFilm"
      >
        Rạp Forest
      </Link>
    </div>
  );
};

export default Navigate;
