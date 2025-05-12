import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, Tag, Spin, Empty, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { searchMovies } from "../../../services/search.service";
import {
  SearchMovie,
  MovieGenre,
  MovieActor,
} from "../../../types/search.types";
import { URL_IMAGE } from "../../../config/ApiConfig";
import styles from "./SearchPage.module.css";

const { Search } = Input;

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<SearchMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");

  useEffect(() => {
    const currentKeyword = searchParams.get("keyword");
    if (currentKeyword) {
      setKeyword(currentKeyword);
      performSearch(currentKeyword);
    }
  }, [searchParams]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setLoading(true);

    try {
      const results = await searchMovies({ keyword: searchTerm });
      setSearchResults(results);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm phim:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    if (!value.trim()) return;

    // Update URL with new search term
    setSearchParams({ keyword: value });
    performSearch(value);
  };

  const handleMovieClick = (movieId: number) => {
    navigate(`/filmDetail/${movieId}`);
  };

  return (
    <div className={styles.searchPageContainer}>
      <div className={styles.searchHeader}>
        <h1>Tìm kiếm phim</h1>
        <Search
          className={styles.searchInput}
          placeholder="Tìm kiếm phim, diễn viên, đạo diễn, thể loại..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <div className={styles.searchResultsContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spin size="large" />
          </div>
        ) : searchResults.length === 0 ? (
          <Empty
            description={
              <span>
                {keyword
                  ? "Không tìm thấy kết quả phù hợp"
                  : "Vui lòng nhập từ khóa để tìm kiếm"}
              </span>
            }
          />
        ) : (
          <>
            <h2>Kết quả tìm kiếm cho: "{keyword}"</h2>
            <p>Tìm thấy {searchResults.length} kết quả</p>

            <div className={styles.movieGrid}>
              {searchResults.map((movie) => (
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
                  onClick={() => handleMovieClick(movie.id)}
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
                          {movie.genres.map((genre: MovieGenre) => (
                            <Tag key={genre.id} color="blue">
                              {genre.name_genre}
                            </Tag>
                          ))}
                        </div>
                        <div className={styles.tagsContainer}>
                          <strong>Diễn viên:</strong>
                          {movie.actors.slice(0, 3).map((actor: MovieActor) => (
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
                          {movie.directors?.name_director ||
                            "Không có thông tin"}
                        </div>
                      </div>
                    }
                  />
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
