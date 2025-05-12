import clsx from "clsx";
import styles from "./RoomPage.module.css";

const LayoutMatrixExample = ({ backgroundImg }: { backgroundImg: string }) => {
    return (
        <>
            <hr />
            <div className={clsx(styles.title)}>Ví dụ cho ảnh Event</div>
            <div className={clsx(styles.matrix)}>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        backgroundColor: backgroundImg ? "none" : "#a615d2",
                        color: backgroundImg ? "transparent" : "white",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #a615d2",
                    }}
                >
                    A1
                </span>

                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        backgroundColor: backgroundImg ? "none" : "#a615d2",
                        color: backgroundImg ? "transparent" : "white",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #a615d2",
                    }}
                >
                    A2
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        backgroundColor: backgroundImg ? "none" : "#a615d2",
                        color: backgroundImg ? "transparent" : "white",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #a615d2",
                    }}
                >
                    A3
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        backgroundColor: backgroundImg ? "none" : "#a615d2",
                        color: backgroundImg ? "transparent" : "white",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #a615d2",
                    }}
                >
                    A4
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        backgroundColor: backgroundImg ? "none" : "#a615d2",
                        color: backgroundImg ? "transparent" : "white",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #a615d2",
                    }}
                >
                    A5
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        backgroundColor: backgroundImg ? "none" : "#a615d2",
                        color: backgroundImg ? "transparent" : "white",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #a615d2",
                    }}
                >
                    A6
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        backgroundColor: backgroundImg ? "none" : "#a615d2",
                        color: backgroundImg ? "transparent" : "white",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #a615d2",
                    }}
                >
                    A7
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        backgroundColor: backgroundImg ? "none" : "#a615d2",
                        color: backgroundImg ? "transparent" : "white",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #a615d2",
                    }}
                >
                    A8
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        backgroundColor: backgroundImg ? "none" : "#a615d2",
                        color: backgroundImg ? "transparent" : "white",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #a615d2",
                    }}
                >
                    A9
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        backgroundColor: backgroundImg ? "none" : "#a615d2",
                        color: backgroundImg ? "transparent" : "white",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #a615d2",
                    }}
                >
                    A10
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        backgroundColor: backgroundImg ? "none" : "#a615d2",
                        color: backgroundImg ? "transparent" : "white",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #a615d2",
                    }}
                >
                    A11
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        backgroundColor: backgroundImg ? "none" : "#a615d2",
                        color: backgroundImg ? "transparent" : "white",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #a615d2",
                    }}
                >
                    A12
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        backgroundColor: backgroundImg ? "none" : "#a615d2",
                        color: backgroundImg ? "transparent" : "white",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #a615d2",
                    }}
                >
                    A13
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        backgroundColor: backgroundImg ? "none" : "#a615d2",
                        color: backgroundImg ? "transparent" : "white",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #a615d2",
                    }}
                >
                    A14
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        backgroundColor: backgroundImg ? "none" : "#a615d2",
                        color: backgroundImg ? "transparent" : "white",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #a615d2",
                    }}
                >
                    A15
                </span>
            </div>
        </>
    );
};

export default LayoutMatrixExample;
