import axios from "axios";

const BASE_URL = "http://localhost:8000/api";

interface ShowtimeResponse {
  data: any[];
  message?: string;
}

export const fetchShowtimesByMovie = async (
  movieId: string
): Promise<ShowtimeResponse> => {
  try {
    const response = await axios.get(
      `${BASE_URL}/showTime?movie_id=${movieId}`
    );
    return {
      data: response.data || [],
      message: "Success",
    };
  } catch (error) {
    console.error("Error fetching showtimes:", error);
    return {
      data: [],
      message: "Không thể tải lịch chiếu",
    };
  }
};
