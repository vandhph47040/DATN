import { Card, Button, message } from "antd";
import styles from "./Promotions.module.css";
import { MY_DISCOUNT_CODE } from "../../config/ApiConfig";
import { useState, useEffect } from "react";
import axios from "axios";

interface PromotionsProps {
  token: string | null;
}

const Promotions: React.FC<PromotionsProps> = ({ token }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        if (!token) {
          message.error("Không tìm thấy token. Vui lòng đăng nhập lại.");
          setLoading(false); // Ensure loading is set to false
          return;
        }

        // Log the request details for debugging
        console.log("Fetching promotions from:", MY_DISCOUNT_CODE);
        console.log("Using token:", token);

        const response = await axios.get(MY_DISCOUNT_CODE, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Explicitly set Content-Type
          },
          timeout: 10000, // Add timeout to prevent hanging requests
        });

        console.log("API Response:", response.data); // Log response for debugging

        if (response.data.success) {
          const mappedPromotions = response.data.data.map((promo: any) => ({
            id: promo.id,
            code: promo.name_code,
            description: `Giảm ${Number(promo.percent).toFixed(
              2
            )}% tối đa ${Number(promo.maxPrice).toLocaleString("vi-VN")} VND`,
            discountValue: `${Number(promo.percent).toFixed(2)}%`,
            condition: `Tối đa ${Number(promo.maxPrice).toLocaleString(
              "vi-VN"
            )} VND`,

            expiryDate: promo.end_date.split("-").reverse().join("/"),
            status: "Chưa sử dụng",
          }));
          setPromotions(mappedPromotions);
        } else {
          message.error(
            response.data.message || "Không thể lấy danh sách mã giảm giá."
          );
        }
      } catch (error) {
        // Enhanced error logging
        console.error("Error fetching promotions:", error);
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
          message.error(
            error.response?.data?.message ||
              `Lỗi server: ${error.response.status}. Vui lòng thử lại sau.`
          );
        } else if (error.request) {
          console.error("No response received:", error.request);
          message.error(
            "Không thể kết nối đến server. Vui lòng kiểm tra mạng."
          );
        } else {
          console.error("Error setting up request:", error.message);
          message.error("Đã xảy ra lỗi khi gửi yêu cầu.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [token]);

  return (
    <div className={styles.promotionSection}>
      <h3 className={styles.promotionTitle}>Ưu đãi bạn đang có</h3>
      {loading ? (
        <p>Đang tải...</p>
      ) : promotions.length > 0 ? (
        <div className={styles.promotionList}>
          {promotions.map((promo: any) => (
            <Card key={promo.id} className={styles.promotionCard}>
              <div className={styles.promotionContent}>
                <div className={styles.promotionLeft}>
                  <div className={styles.discountValue}>
                    {promo.discountValue}
                  </div>
                  <div className={styles.condition}>{promo.condition}</div>
                </div>
                <div className={styles.promotionRight}>
                  <div className={styles.promotionHeader}>
                    <span className={styles.promotionCode}>{promo.code}</span>
                    <span className={styles.promotionStatus}>
                      {promo.status}
                    </span>
                  </div>
                  <div className={styles.promotionDescription}>
                    {promo.description}
                  </div>
                  <div className={styles.promotionExpiry}>
                    HSD: {promo.expiryDate}
                  </div>
                  <Button
                    type="primary"
                    className={styles.copyButton}
                    onClick={() => {
                      navigator.clipboard.writeText(promo.code);
                      message.success(`Đã sao chép mã: ${promo.code}`);
                    }}
                  >
                    Sao chép mã
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className={styles.emptyContent}>
          <p>Chưa có ưu đãi nào chưa sử dụng.</p>
        </div>
      )}
    </div>
  );
};

export default Promotions;
