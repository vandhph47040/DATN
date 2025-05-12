import axios from "axios";

const API_URL = "http://localhost:8000/api";

/**
 * Lấy danh sách phim sắp chiếu
 * @returns Danh sách phim sắp chiếu
 */
export const fetchComingSoonMovies = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/movies-for-client`, {
      params: { status: "coming_soon" },
    });

    return data.data || [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phim sắp chiếu:", error);

    // Nếu API movies-for-client lỗi, sử dụng API movies-index
    try {
      const { data } = await axios.get(`${API_URL}/movies-index`);
      return data.coming_soon || [];
    } catch (fallbackError) {
      console.error("Lỗi khi sử dụng API dự phòng:", fallbackError);
      return [];
    }
  }
};

/**
 * Lọc phim sắp chiếu theo thể loại
 * @param genre Thể loại phim
 * @returns Danh sách phim sắp chiếu đã lọc
 */
export const filterComingSoonMoviesByGenre = async (genre: string) => {
  try {
    if (genre === "Tất cả") {
      return fetchComingSoonMovies();
    }

    const { data } = await axios.get(`${API_URL}/movies-for-client`, {
      params: {
        status: "coming_soon",
        genres: genre,
      },
    });

    return data.data || [];
  } catch (error) {
    console.error(`Lỗi khi lọc phim sắp chiếu theo thể loại ${genre}:`, error);

    // Nếu API lỗi, lấy tất cả phim sắp chiếu và lọc trên client
    try {
      const { data } = await axios.get(`${API_URL}/movies-index`);
      const comingSoonMovies = data.coming_soon || [];

      if (genre === "Tất cả") {
        return comingSoonMovies;
      }

      return comingSoonMovies.filter((movie: any) =>
        movie.genres.some((g: any) => g.name_genre === genre)
      );
    } catch (fallbackError) {
      console.error("Lỗi khi sử dụng API dự phòng:", fallbackError);
      return [];
    }
  }
};

/**
 * Lấy chi tiết phim sắp chiếu
 * @param movieId ID của phim
 * @returns Chi tiết phim
 */
export const fetchComingSoonMovieDetails = async (movieId: number) => {
  try {
    const { data } = await axios.get(`${API_URL}/movies/${movieId}`);
    return data.data || null;
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiết phim ID ${movieId}:`, error);
    return null;
  }
};
