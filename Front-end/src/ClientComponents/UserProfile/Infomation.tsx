import clsx from "clsx";

import { useInfomationContext } from "../UseContext/InfomationContext";
import styles from "./Infomation.module.css";
import { CloseCircleOutlined } from "@ant-design/icons";
import { useState } from "react";

const Infomation = () => {
    const {
        textInfomation,
        countInfomation,
        setCountInfomation,
        removeInfomationFromID,
    } = useInfomationContext();

    const [readItems, setReadItems] = useState<number[]>([]); // set trạng thái đã đọc cho item

    const changeStatus = (id: number) => {
        if (!readItems.includes(id)) {
            setReadItems((prev) => [...prev, id]);
            setCountInfomation((prev: number) => prev - 1);
            localStorage.setItem(
                "countInfomation",
                JSON.stringify(countInfomation)
            );
        }
    };

    const handleRemove = (id: number) => {
        // Nếu item chưa được click thì mới giảm count
        if (!readItems.includes(id)) {
            setCountInfomation((prev: number) => prev - 1);
            localStorage.setItem(
                "countInfomation",
                JSON.stringify(countInfomation)
            );
        }
        removeInfomationFromID(id);
    };

    return (
        <div className={clsx(styles.wrapper)}>
            {textInfomation.map(
                (item: {
                    id: number;
                    title: string;
                    content: string;
                    date: string;
                }) => {
                    const isRead = readItems.includes(item.id);
                    return (
                        <div
                            key={item.id}
                            className={clsx(styles.item, {
                                [styles.read]: isRead,
                            })}
                            onClick={() => changeStatus(item.id)}
                        >
                            <h3 className={clsx(styles.title)}>{item.title}</h3>
                            <p className={clsx(styles.content)}>
                                {item.content}
                            </p>
                            <p className={clsx(styles.date)}> {item.date}</p>
                            <span
                                className={clsx(styles.close)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(item.id);
                                }}
                            >
                                <CloseCircleOutlined />
                            </span>
                        </div>
                    );
                }
            )}
        </div>
    );
};

export default Infomation;
