import { Modal } from "antd";
import clsx from "clsx";
import styles from "./ModalImage.module.css";
import { Link } from "react-router-dom";

const ModalImage = ({
    isModalOpen,
    handleClose,
}: {
    isModalOpen: boolean;
    handleClose: () => void;
}) => {
    return (
        <Modal
            open={isModalOpen}
            onOk={handleClose}
            onCancel={handleClose}
            footer={null}
            styles={{
                mask: {
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                },
            }}
            className="customImageModal"
        >
            <div className={clsx(styles.mainModal)}>
                <Link to="/vongquaymayman">
                    {" "}
                    <img
                        className={clsx(styles.imgModal)}
                        src="../../../public/imageFE/modalImage.png"
                        alt=""
                    />
                </Link>
            </div>
        </Modal>
    );
};

export default ModalImage;
