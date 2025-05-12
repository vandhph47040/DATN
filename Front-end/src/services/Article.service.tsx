import axios from "axios";
import { Article } from "../types/Article.type";

const API_URL = "http://localhost:8000/api"; // URL của backend

// Hàm lấy danh sách bài viết từ API
export const fetchArticlesForClient = async (): Promise<Article[]> => {
  try {
    const url = `${API_URL}/articles-client`;
    console.log("Fetching articles from:", url);

    const response = await axios.get(url);
    console.log("API Response:", response.data);

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid response format");
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    } else {
      console.error("Error fetching articles:", error);
    }
    throw error;
  }
};

// Định nghĩa kiểu dữ liệu cho đối tượng bài viết
export interface Article {
  id: number;
  title: string;
  author: string;
  image: string | null;
  category: string;
  body: string;
  view: number;
  status: string;
  created_at: string;
  updated_at: string;
}
