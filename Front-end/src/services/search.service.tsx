import axios from "axios";
import {
  SearchMovie,
  SearchRequest,
  SearchResponse,
} from "../types/search.types";

const API_URL = "http://localhost:8000/api";

/**
 * Search for movies by keyword (title, actor, director, or genre)
 * @param params Search parameters containing the keyword
 * @returns Promise with search results
 */
export const searchMovies = async (
  params: SearchRequest
): Promise<SearchMovie[]> => {
  try {
    // Lấy tất cả phim từ API /movies-index và lọc trên client
    const response = await axios.get<{
      movies: SearchMovie[];
      coming_soon: SearchMovie[];
      now_showing: SearchMovie[];
    }>(`${API_URL}/movies-index`);

    // Kết hợp tất cả phim
    const allMovies = [
      ...(response.data.movies || []),
      ...(response.data.coming_soon || []),
      ...(response.data.now_showing || []),
    ];

    // Loại bỏ các phim trùng lặp dựa trên ID
    const uniqueMovies = Array.from(
      new Map(allMovies.map((movie) => [movie.id, movie])).values()
    );

    // Nếu không có từ khóa, trả về tất cả phim
    if (!params.keyword) {
      return uniqueMovies;
    }

    // Lọc phim theo từ khóa (không phân biệt hoa thường)
    const keyword = params.keyword.toLowerCase();

    return uniqueMovies.filter((movie) => {
      // Tìm theo tiêu đề
      if (movie.title.toLowerCase().includes(keyword)) {
        return true;
      }

      // Tìm theo diễn viên
      if (
        movie.actors &&
        movie.actors.some((actor) =>
          actor.name_actor.toLowerCase().includes(keyword)
        )
      ) {
        return true;
      }

      // Tìm theo đạo diễn
      if (
        movie.directors &&
        movie.directors.name_director.toLowerCase().includes(keyword)
      ) {
        return true;
      }

      // Tìm theo thể loại
      if (
        movie.genres &&
        movie.genres.some((genre) =>
          genre.name_genre.toLowerCase().includes(keyword)
        )
      ) {
        return true;
      }

      return false;
    });
  } catch (error) {
    console.error("Error searching movies:", error);
    throw error;
  }
};

/**
 * Get movie details by ID
 * @param movieId The ID of the movie to retrieve
 * @returns Promise with movie details
 */
export const getMovieById = async (movieId: number): Promise<SearchMovie> => {
  try {
    const response = await axios.get<{ data: SearchMovie }>(
      `${API_URL}/movies-details/${movieId}`
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching movie with ID ${movieId}:`, error);
    throw error;
  }
};

/**
 * Get related movies based on genres
 * @param movieId The ID of the movie to find related movies for
 * @returns Promise with related movies
 */
export const getRelatedMovies = async (
  movieId: number
): Promise<SearchMovie[]> => {
  try {
    const response = await axios.get<{ data: SearchMovie[] }>(
      `${API_URL}/movies/${movieId}/related`
    );
    return response.data.data || [];
  } catch (error) {
    console.error(
      `Error fetching related movies for movie ID ${movieId}:`,
      error
    );
    throw error;
  }
};
