import axios from "axios";

const API_URL = "http://localhost:8000/api"; // Đảm bảo URL đúng với backend của bạn

// Hàm lấy token từ localStorage (hoặc bạn có thể dùng context/auth service)
const getAuthToken = () => {
  return localStorage.getItem("token"); // Giả sử token được lưu ở đây sau khi đăng nhập
};

export const fetchMovies = async () => {
  try {
    const response = await axios.get(`${API_URL}/movies`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`, // Thêm token vào header
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
};

export const fetchMovieById = async (id: string) => {
  try {
    // Sử dụng endpoint movies-details thay vì movies
    const response = await axios.get(`${API_URL}/movies-details/${id}`);
    // Không thêm token vào header vì API này không yêu cầu xác thực
    return response.data;
  } catch (error) {
    console.error("Error fetching movie:", error);
    throw error;
  }
};

export const fetchMoviesByGenre = async (genreId: string) => {
  try {
    const response = await axios.get(`${API_URL}/movies?genre_id=${genreId}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`, // Thêm token vào header
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching movies by genre:", error);
    throw error;
  }
};
