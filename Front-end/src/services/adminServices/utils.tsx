import axios from "axios";
import { message } from "antd";

// hàm lấy message lỗi gửi về của BE khi api lỗi
export const handleApiError = (error: unknown) => {
    let errorMessage = "Có lỗi xảy ra!";
    if (axios.isAxiosError(error)) {
        errorMessage =
            error.response?.data?.message || error.message || errorMessage;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    message.error(errorMessage);
};
