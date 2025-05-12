import React, { useState, useEffect } from "react";
import "./InfomationBox.css";
import { fetchArticlesForClient } from "../../services/Article.service";
import { Article } from "../../types/Article.type";

interface InfomationBoxProps {
  children: React.ReactElement<{
    articles?: Article[];
    loading?: boolean;
    error?: string | null;
  }>;
}

const InfomationBox: React.FC<InfomationBoxProps> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getArticles = async () => {
      try {
        setLoading(true);
        console.log("Fetching articles in InfomationBox...");
        const response = await fetchArticlesForClient();
        console.log("Articles received:", response);
        setArticles(response);
      } catch (err) {
        console.error("Error in InfomationBox:", err);
        setError("Không thể tải dữ liệu bài viết. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    getArticles();
  }, []);

  // Clone children và truyền thêm props articles
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { articles, loading, error });
    }
    return child;
  });

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (loading) {
    return <div className="loading-message">Đang tải dữ liệu...</div>;
  }

  return <div className="infomation-box">{childrenWithProps}</div>;
};

export default InfomationBox;
