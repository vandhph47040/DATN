import clsx from "clsx";
import styles from "./Introduce.module.css";

const Introduce = () => {
    return (
        <div className={clsx(styles.introduceContainer)}>
            <h1 className={clsx(styles.title)}>VÒNG QUAY MAY MẮN</h1>
            <div className={clsx(styles.prizeSection)}>
                <h4 className={clsx(styles.subTitle)}>Cơ hội trúng</h4>
                <div className={clsx(styles.prizeList)}>
                    <div className={clsx(styles.prizeItem)}>
                        <span className={clsx(styles.prizeName)}>
                            Gấu bông FOREST
                        </span>
                    </div>
                    <div className={clsx(styles.prizeItem2)}>
                        <span className={clsx(styles.prizeName)}>VOUCHER</span>
                        <div className={clsx(styles.prizeWrapper)}>
                            <span className={clsx(styles.prizeValue)}>50K</span>
                            <span className={clsx(styles.line)}></span>
                        </div>
                        <div className={clsx(styles.prizeWrapper)}>
                            <span
                                className={clsx(
                                    styles.prizeValue,
                                    styles.secoundPrizeValue
                                )}
                            >
                                20K
                            </span>
                            <span
                                className={clsx(
                                    styles.line,
                                    styles.lineSecound
                                )}
                            ></span>
                        </div>

                        <div className={clsx(styles.prizeWrapper)}>
                            <span
                                className={clsx(
                                    styles.prizeValue,
                                    styles.threePrizeValue
                                )}
                            >
                                10K
                            </span>
                            <span
                                className={clsx(styles.line, styles.lineThree)}
                            ></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Introduce;
