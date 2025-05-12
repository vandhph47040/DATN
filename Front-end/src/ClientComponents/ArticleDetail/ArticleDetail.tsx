import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Article } from "../../types/Article.type";
import Header from "../Header/Header";
import AppFooter from "../Footer/footer";
import "./ArticleDetail.css";

const URL_IMAGE = "http://localhost:8000";

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [hotMovies, setHotMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticleDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${URL_IMAGE}/api/articles/${id}/client`
        );
        setArticle(response.data);

        const relatedResponse = await axios.get(
          `${URL_IMAGE}/api/articles-client`
        );
        const allArticles = relatedResponse.data;

        const related = allArticles.filter(
          (a: Article) =>
            a.id !== response.data.id && a.category === response.data.category
        );
        setRelatedArticles(related);
      } catch (err) {
        setError("Không thể tải bài viết. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    const fetchHotMovies = async () => {
      try {
        console.log(
          "Fetching hot movies from:",
          `${URL_IMAGE}/api/movies-for-client?status=now_showing`
        );
        const response = await axios.get(`${URL_IMAGE}/api/movies-for-client`, {
          params: { status: "now_showing" },
        });
        console.log(
          "Hot movies API response (full):",
          JSON.stringify(response.data, null, 2)
        );

        let movies = [];
        if (Array.isArray(response.data)) {
          movies = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          movies = response.data.data;
        } else {
          console.error(
            "Invalid movies response format, expected array:",
            response.data
          );
          throw new Error("Invalid movies response format");
        }

        const formattedMovies = movies.map((movie: any) => ({
          id: movie.id,
          title: movie.title || movie.name || "Unknown Title",
          image: movie.poster || movie.image || "/default-image.jpg",
          created_at:
            movie.created_at || movie.release_date || new Date().toISOString(),
          rated: movie.rated ? movie.rated.split(" ")[0] : "N/A",
        }));

        console.log("Formatted movies:", formattedMovies);

        const shuffled = formattedMovies.sort(() => 0.5 - Math.random());
        const selectedMovies = shuffled.slice(0, 3);
        console.log("Selected 3 movies:", selectedMovies);

        setHotMovies(selectedMovies);
      } catch (err: any) {
        console.error("Lỗi khi lấy phim đang chiếu:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setHotMovies([]);
      }
    };

    if (id) {
      fetchArticleDetail();
      fetchHotMovies();
    }
  }, [id]);

  useEffect(() => {
    if (article) {
      console.log("Đường dẫn ảnh:", article.image);
    }
  }, [article]);

  const showChill = (movieId: number) => {
    navigate(`/filmDetail/${movieId}`);
  };

  const goToArticle = (articleId: number) => {
    navigate(`/article/${articleId}`);
  };

  if (loading) {
    return (
      <div className="page-container">
        <Header />
        <div className="loading-container">
          <div className="loading">Đang tải bài viết...</div>
        </div>
        <AppFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <Header />
        <div className="error-container">
          <div className="error">{error}</div>
        </div>
        <AppFooter />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="page-container">
        <Header />
        <div className="not-found-container">
          <div className="not-found">Không tìm thấy bài viết</div>
        </div>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="page-container">
      <Header />
      <main className="main-content">
        <div className="article-detail-container">
          <div className="content-wrapper">
            {/* Cột bên trái: Chi tiết bài viết và tin tức khác */}
            <div className="left-column">
              <div className="article-detail">
                <div className="article-header">
                  <h1 className="article-title">{article.title}</h1>
                  <div className="article-meta">
                    <span className="article-author">
                      <i className="fas fa-user"></i> {article.author}
                    </span>
                    <span className="article-date">
                      <i className="fas fa-calendar-alt"></i>{" "}
                      {new Date(article.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                {article.image && (
                  <div className="article-image">
                    <img
                      src={`${URL_IMAGE}${article.image}`}
                      alt={article.title}
                    />
                  </div>
                )}

                <div className="article-content">
                  {article.body || (
                    <p>
                      Đây là nội dung mẫu. Lorem ipsum dolor sit amet,
                      consectetur adipiscing elit. Sed do eiusmod tempor
                      incididunt ut labore et dolore magna aliqua.
                    </p>
                  )}
                </div>
              </div>

              {relatedArticles.length > 0 && (
                <div className="related-articles">
                  <h2 className="related-title">Tin Tức Khác</h2>
                  <div className="related-articles-grid">
                    {relatedArticles.map((relatedArticle) => (
                      <div
                        key={relatedArticle.id}
                        className="related-article-card"
                        onClick={() => goToArticle(relatedArticle.id)}
                      >
                        <div className="related-article-image">
                          <img
                            src={`${URL_IMAGE}${relatedArticle.image}`}
                            alt={relatedArticle.title}
                          />
                        </div>
                        <div className="related-article-content">
                          <h3>{relatedArticle.title}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cột bên phải: Phim Đang Hot */}
            <div className="right-column">
              <div className="hot-movies">
                <h2 className="hot-movies-title">PHIM ĐANG CHIẾU</h2>
                <div className="hot-movies-list">
                  {hotMovies.length > 0 ? (
                    hotMovies.map((movie) => (
                      <div
                        key={movie.id}
                        className="hot-movie-item"
                        onClick={() => showChill(movie.id)}
                      >
                        <div className="hot-movie-image">
                          <img
                            src={`${URL_IMAGE}${movie.image}`}
                            alt={movie.title}
                          />
                          <span className="movie-rated">{movie.rated}</span>
                        </div>
                        <div className="hot-movie-content">
                          <h3>{movie.title}</h3>
                          <div className="article-meta">
                            <span className="article-date">
                              {new Date(movie.created_at).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Không có phim đang chiếu nào.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default ArticleDetail;
