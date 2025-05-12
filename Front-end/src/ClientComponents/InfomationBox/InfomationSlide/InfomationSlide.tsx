import React, { useState } from "react";
import "./InfomationSlide.css";
import InfomationProduct from "../InfomationProduct/InfomationProduct";
import { Article } from "../../../types/Article.type";

interface InfomationSlideProps {
  articles?: Article[];
  loading?: boolean;
  error?: string | null;
}

const InfomationSlide: React.FC<InfomationSlideProps> = ({
  articles = [],
  loading,
  error,
}) => {
  const [showMore, setShowMore] = useState(false);
  const API_URL = "http://localhost:8000"; // URL của backend

  // Hiển thị thông báo loading
  if (loading) {
    return <div className="loading-message">Đang tải dữ liệu...</div>;
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Nếu không có dữ liệu
  if (!articles || articles.length === 0) {
    return <div className="empty-message">Chưa có bài viết nào</div>;
  }

  return (
    <div className="">
      <div className="infomationSlide main-base">
        {articles.map((article, index) => (
          <InfomationProduct
            key={article.id}
            className={`product-info ${
              index >= 8 && !showMore ? "hidden" : ""
            }`}
            id={article.id}
            image={
              article.image && article.image.startsWith("/storage")
                ? `${API_URL}${article.image}`
                : article.image
            }
            category={article.category}
            created_at={article.created_at}
            title={article.title}
          ></InfomationProduct>
        ))}
        <button
          className="show-more-btn"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? "Ẩn bớt " : "Xem thêm..."}
        </button>
      </div>
    </div>
  );
};

export default InfomationSlide;
