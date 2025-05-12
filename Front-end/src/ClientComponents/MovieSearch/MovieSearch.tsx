import { useState } from "react";
import { Input, Spin, Empty, Card, Tag } from "antd";
import styles from "./MovieSearch.module.css";
import { URL_IMAGE } from "../../config/ApiConfig";
import { SearchMovie } from "../../types/search.types";
import { searchMovies } from "../../services/search.service";
import { useQuery } from "@tanstack/react-query";

interface MovieSearchProps {
  onMovieClick: (movieId: number) => void;
}

const MovieSearch = ({ onMovieClick }: MovieSearchProps) => {
  const [keyword, setKeyword] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0);

  const {
    data: movies,
    isLoading,
    isFetched,
  } = useQuery({
    queryKey: ["movieSearch", keyword, searchTrigger],
    queryFn: async () => {
      if (!keyword.trim()) return [];
      return await searchMovies({ keyword });
    },
    enabled: !!keyword && searchTrigger > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleSearch = () => {
    if (!keyword.trim()) return;
    setSearchTrigger((prev) => prev + 1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputContainer}>
        <Input.Search
          placeholder="Tìm kiếm phim, diễn viên, đạo diễn, thể loại..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onSearch={handleSearch}
          onKeyPress={handleKeyPress}
          enterButton
          size="large"
          className={styles.searchInput}
        />
      </div>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Spin size="large" />
        </div>
      ) : isFetched && (!movies || movies.length === 0) ? (
        <Empty description="Không tìm thấy kết quả phù hợp" />
      ) : (
        <div className={styles.resultsContainer}>
          {movies?.map((movie: SearchMovie) => (
            <Card
              key={movie.id}
              hoverable
              className={styles.movieCard}
              cover={
                <img
                  alt={movie.title}
                  src={`${URL_IMAGE}${movie.poster}`}
                  className={styles.moviePoster}
                />
              }
              onClick={() => onMovieClick(movie.id)}
            >
              <Card.Meta
                title={movie.title}
                description={
                  <div className={styles.movieDetails}>
                    <div>
                      <strong>Ngày phát hành:</strong> {movie.release_date}
                    </div>
                    <div className={styles.tagsContainer}>
                      <strong>Thể loại:</strong>
                      {movie.genres.map((genre) => (
                        <Tag key={genre.id} color="blue">
                          {genre.name_genre}
                        </Tag>
                      ))}
                    </div>
                    <div className={styles.tagsContainer}>
                      <strong>Diễn viên:</strong>
                      {movie.actors.slice(0, 3).map((actor) => (
                        <Tag key={actor.id} color="green">
                          {actor.name_actor}
                        </Tag>
                      ))}
                      {movie.actors.length > 3 && (
                        <Tag color="green">+{movie.actors.length - 3}</Tag>
                      )}
                    </div>
                    <div>
                      <strong>Đạo diễn:</strong>{" "}
                      {movie.directors?.name_director || "Không có thông tin"}
                    </div>
                  </div>
                }
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MovieSearch;
