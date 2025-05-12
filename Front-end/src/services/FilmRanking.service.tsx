import axios from "axios";

const API_URL = "http://localhost:8000/api"; // URL của backend

// Hàm lấy dữ liệu xếp hạng phim từ API
export const fetchMoviesRanking = async (date?: string) => {
  try {
    // Nếu có tham số date thì gửi kèm, nếu không thì API sẽ sử dụng ngày mặc định (2025-03-25)
    const url = date
      ? `${API_URL}/movies-ranking?date=${date}`
      : `${API_URL}/movies-ranking`;

    const response = await axios.get(url);

    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu xếp hạng phim:", error);
    throw error;
  }
};

// Định nghĩa kiểu dữ liệu cho đối tượng xếp hạng phim
export interface MovieRanking {
  rank: number;
  movie_title: string;
  movie_id?: number; // ID của phim (nếu có từ API)
  total_tickets: number;
  poster: string;
  month_year: string;
}

// Định nghĩa kiểu dữ liệu cho response từ API
export interface MoviesRankingResponse {
  message: string;
  data: MovieRanking[];
}
