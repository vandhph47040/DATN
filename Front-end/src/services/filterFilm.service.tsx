import axios from "axios";

const API_URL = "http://localhost:8000/api";

interface FilterOptions {
  sortBy?: string;
  genre?: string;
  cinema?: string;
}

export const fetchFilteredMovies = async (options: FilterOptions = {}) => {
  try {
    // Lấy danh sách phim từ API
    const { data } = await axios.get("http://localhost:8000/api/movies-index");

    let filteredMovies = [...data.now_showing];

    // Lọc theo thể loại
    if (options.genre && options.genre !== "Tất cả") {
      filteredMovies = filteredMovies.filter((movie: any) =>
        movie.genres.some((g: any) => g.name_genre === options.genre)
      );
    }

    // Lọc theo rạp
    if (options.cinema && options.cinema !== "Tất cả") {
      filteredMovies = filteredMovies.filter(
        (movie: any) =>
          movie.cinemas?.some((c: any) => c.name === options.cinema) || false
      );
    }

    // Sắp xếp
    if (options.sortBy === "Mới nhất") {
      filteredMovies.sort(
        (a: any, b: any) =>
          new Date(b.release_date).getTime() -
          new Date(a.release_date).getTime()
      );
    } else if (options.sortBy === "Phổ biến") {
      filteredMovies.sort(
        (a: any, b: any) => (b.popularity || 0) - (a.popularity || 0)
      );
    }

    return filteredMovies.map((movie: any) => ({
      ...movie,
      key: movie.id,
    }));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phim:", error);
    return [];
  }
};

/**
 * Lấy danh sách phim theo thể loại
 * @param movieId ID của phim để lấy phim liên quan
 * @returns Danh sách phim liên quan
 */
export const fetchRelatedMovies = async (movieId: number) => {
  try {
    const { data } = await axios.get(`${API_URL}/movies/${movieId}/related`);
    return data.data || [];
  } catch (error) {
    console.error(`Lỗi khi lấy phim liên quan cho phim ID ${movieId}:`, error);
    return [];
  }
};

/**
 * Lọc phim theo năm phát hành và ngôn ngữ
 * @param releaseYear Năm phát hành phim
 * @param language Ngôn ngữ phim
 * @returns Danh sách phim đã lọc
 */
export const filterMoviesByYearAndLanguage = async (
  releaseYear?: number,
  language?: string
) => {
  try {
    const params: any = {};
    if (releaseYear) params.release_year = releaseYear;
    if (language) params.language = language;

    const { data } = await axios.get(`${API_URL}/filter`, { params });
    return data.data || [];
  } catch (error) {
    console.error("Lỗi khi lọc phim theo năm và ngôn ngữ:", error);

    // Nếu API filter lỗi, sử dụng API movies-index và lọc trên client
    try {
      const { data } = await axios.get(`${API_URL}/movies-index`);
      let filteredMovies = data.now_showing || [];

      // Lọc theo năm phát hành (client-side)
      if (releaseYear) {
        filteredMovies = filteredMovies.filter((movie: any) => {
          const movieReleaseYear = new Date(movie.release_date).getFullYear();
          return movieReleaseYear === releaseYear;
        });
      }

      // Lọc theo ngôn ngữ (client-side)
      if (language) {
        filteredMovies = filteredMovies.filter(
          (movie: any) => movie.language === language
        );
      }

      return filteredMovies;
    } catch (fallbackError) {
      console.error("Lỗi khi sử dụng API dự phòng:", fallbackError);
      return [];
    }
  }
};

/**
 * Lấy danh sách phim đang chiếu lọc theo thể loại
 * @param status Trạng thái phim ('now_showing' hoặc 'coming_soon')
 * @param genre Thể loại phim
 * @returns Danh sách phim đã lọc
 */
export const fetchMoviesByStatusAndGenre = async (
  status: string = "now_showing",
  genre?: string
) => {
  try {
    // Sử dụng API movies-index thay vì API movies-for-client (vì API movies-for-client trả về lỗi 404)
    const { data } = await axios.get(`${API_URL}/movies-index`);

    // Lấy danh sách phim theo trạng thái
    let filteredMovies =
      status === "now_showing" ? data.now_showing : data.coming_soon;

    // Lọc theo thể loại nếu có
    if (genre && genre !== "Tất cả") {
      filteredMovies = filteredMovies.filter((movie: any) =>
        movie.genres.some((g: any) => g.name_genre === genre)
      );
    }

    return filteredMovies || [];
  } catch (error) {
    console.error("Lỗi khi lấy phim theo trạng thái và thể loại:", error);
    return [];
  }
};
