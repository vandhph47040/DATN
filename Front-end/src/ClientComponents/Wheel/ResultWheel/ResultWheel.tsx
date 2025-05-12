import { Modal } from "antd";
import clsx from "clsx";
import styles from "./ResultWheel.module.css";
import {
    useGetDiscountFromWheel,
    useGetUserId,
} from "../../../services/Wheel.service";
import { useEffect } from "react";

const ResultWheel = ({
    currentPrize,
    isModalOpen,
    setIsModalOpen,
    isFree,
    userId,
}: {
    currentPrize: string;
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    isFree: boolean;
    userId: number;
}) => {
    const isDiscountPrize = ["Giảm 10K", "Giảm 20K", "Giảm 50K"].includes(
        currentPrize
    ); // ss kết quả để css

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    // gọi api để thêm discount cho user
    const { mutate: assignDiscount } = useGetDiscountFromWheel();
    const prizeToDiscountId: Record<string, number> = {
        "Giảm 10K": 10,
        "Giảm 20K": 20,
        "Giảm 50K": 50,
    };
    console.log("check", userId);

    useEffect(() => {
        if (isModalOpen && isDiscountPrize && !isFree) {
            const discount_code_id = prizeToDiscountId[currentPrize];
            console.log(typeof discount_code_id);

            if (!discount_code_id) return;
            assignDiscount({
                data: {
                    user_id: userId,
                    discount_code_id,
                },
            });
        }
    }, [isModalOpen, isDiscountPrize, isFree, currentPrize, assignDiscount]);

    return (
        <Modal
            title=""
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={null}
        >
            {isFree && (
                <span className={clsx(styles.freePlay)}>
                    Phần thưởng không được thêm vào vì đang CHƠI MIỄN PHÍ
                </span>
            )}
            <div className={clsx(styles.main)}>
                <h3 className={clsx(styles.title)}>Xin chúc mừng</h3>
                {isDiscountPrize && (
                    <span className={clsx(styles.subTitle)}>
                        Bạn nhận được:
                    </span>
                )}
                <div
                    className={clsx(
                        isDiscountPrize
                            ? styles.prizeWrapper
                            : styles.defaultPrize
                    )}
                >
                    <span
                        className={clsx(
                            isDiscountPrize
                                ? styles.prizeValue
                                : styles.defaultPrize
                        )}
                    >
                        {currentPrize}
                    </span>
                    <span
                        className={clsx(isDiscountPrize ? styles.line : "")}
                    ></span>
                </div>
                <img
                    className={clsx(styles.layoutResultGame)}
                    src="../../../public/imageFE/layoutResultGame.png"
                    alt="layoutResultGame"
                />
            </div>
        </Modal>
    );
};

export default ResultWheel;
