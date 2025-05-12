import { Modal } from "antd";
import clsx from "clsx";
import styles from "./ModalSuccessInfo.module.css";

const ModalSuccessInfo = ({
    isModalOpen,
    countPlayGame,
    handleClose,
}: {
    isModalOpen: boolean;
    countPlayGame: number;
    handleClose: () => void;
}) => {
    return (
        <>
            <Modal
                open={isModalOpen}
                onOk={handleClose}
                onCancel={handleClose}
                footer={null}
                height={400}
            >
                <div className={clsx(styles.main)}>
                    <p className={clsx(styles.title)}>
                        Chúc mừng bạn nhận được {countPlayGame} lượt chơi
                    </p>
                    <span className={clsx(styles.sub)}>
                        Game Vòng Quay May Mắn
                    </span>
                    <img
                        className={clsx(styles.image)}
                        src="../../../../../../public/imageFE/layoutResultGame.png"
                        alt="layoutResultGame"
                    />
                </div>
            </Modal>
        </>
    );
};

export default ModalSuccessInfo;
