import clsx from "clsx";
import styles from "./BoxDay.module.css";
const BoxDay = ({ date, number, searchDate, onClick }: any) => {
  return (
    <div
      className={clsx(
        styles.boxDays,
        searchDate === date ? styles.activeBtn : ""
      )}
      onClick={onClick}
    >
      <div className={clsx(styles.titleDays)}>{number}</div>
      <div>{date}</div>
    </div>
  );
};

export default BoxDay;
