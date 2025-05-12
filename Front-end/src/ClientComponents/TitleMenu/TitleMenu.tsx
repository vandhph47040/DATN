import clsx from "clsx";
import styles from "./TitleMenu.module.css";
const TitleMenu = (props: any) => {
  return (
    <div className={clsx("main-base")}>
      <div className={clsx(styles.ranking)}>
        <div className={clsx(styles.title)}>
          <h1 className={clsx(styles.subVn)}>{props.name}</h1>
          <h1 className={clsx(styles.subEn)}>{props.nameSub}</h1>
        </div>
      </div>
    </div>
  );
};

export default TitleMenu;
