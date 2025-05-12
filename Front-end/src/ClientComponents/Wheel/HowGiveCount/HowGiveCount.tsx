import { Collapse } from "antd";
import clsx from "clsx";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./HowGiveCount.module.css";

const HowGiveCount = () => {
    const [activeKey, setActiveKey] = useState<string | string[]>("");

    const items = [
        {
            key: "1",
            label: "Lấy lượt chơi như nào?",
            children: (
                <div className={styles.boxGet}>
                    <h2 className={clsx(styles.title)}>
                        Chỉ cần chi tiêu từ{" "}
                        <span className={clsx(styles.priceGet)}>555.555</span>đ
                        trong tuần (tính trên tổng các hóa đơn), bạn sẽ nhận
                        ngay <span className={clsx(styles.priceGet)}>1 </span>
                        lượt quay may mắn!
                    </h2>
                    <p className={clsx(styles.sub)}>
                        - Mỗi tuần, sau 23:59:59 ngày chủ nhật.
                    </p>
                    <p className={clsx(styles.sub)}>
                        + Hệ thống sẽ tự động làm mới và tính lại số tiền đã chi
                        tiêu.
                    </p>
                    <p className={clsx(styles.sub)}>
                        + Đồng thời lượt chơi còn dư của tuần cũ cũng sẽ bị xóa.
                    </p>
                    <p className={clsx(styles.sub)}>
                        + Lịch sử chơi sẽ được giữ lại để bạn có thể theo dõi.
                    </p>
                    <p className={clsx(styles.sub)}>
                        - <Link to={"/playingFilm"}>Đặt vé ngay</Link> hôm nay
                        để tích lũy và nhận lượt quay hấp dẫn!
                    </p>
                </div>
            ),
        },
    ];

    const onChangeActiveCollapse = (key: string | string[]) => {
        setActiveKey(key);
    };

    return (
        <div>
            <Collapse
                className={clsx(styles.collapseWheel)}
                activeKey={activeKey}
                onChange={onChangeActiveCollapse}
                ghost
                items={items}
            />
        </div>
    );
};

export default HowGiveCount;
