import { notification } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import clsx from "clsx";
import styles from "./Notification.module.css";

// Props cho component
interface NotificationProps {
    title?: string;
    description: string;
    pauseOnHover?: boolean;
}

const CustomNotification = () => {
    const [api, contextHolder] = notification.useNotification();

    const openNotification = ({
        title = "Không thể tiếp tục...",
        description,
        pauseOnHover = true,
    }: NotificationProps) => {
        api.open({
            message: (
                <>
                    <span className={clsx(styles.notificationIcon)}>
                        <CloseCircleOutlined />
                    </span>{" "}
                    <span className={clsx(styles.notificationTitle)}>
                        {title}
                    </span>
                </>
            ),
            description,
            className: styles.customNotification,
            pauseOnHover,
        });
    };

    return { openNotification, contextHolder };
};

export default CustomNotification;
