import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClientLayout from "../../page/client/Layout";
import "./FilmDetail.css";
import axios from "axios";
import { Modal } from "antd";
import CalendarMovies from "../CalendarMovies/CalendarMovies";

interface MovieDetail {
  id: number;
  title: string;
  poster: string | null;
  genres: { id: number; name_genre: string }[];
  release_date: string;
  description: string | null;
  running_time: string;
  language: string;
  rated: string;
  trailer: string | null;
  directors:
    | { id: number; name_director: string }
    | { id: number; name_director: string }[];
  actors: { id: number; name_actor: string }[];
}

interface RelatedMovie {
  id: number;
  movie_title: string;
  poster: string | null;
  release_date?: string;
}

const FilmDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<RelatedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMovie = async () => {
      if (!id) {
        setError("Không có ID phim");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8000/api/movies-details/${id}`
        );
        console.log("Movie data:", response.data);
        setMovie(response.data.data);
      } catch (err) {
        console.error("Error fetching movie:", err);
        setError("Không thể tải thông tin phim");
      } finally {
        setLoading(false);
      }
    };

    const loadRelatedMovies = async () => {
      if (!id) return;

      try {
        const response = await axios.get(
          `http://localhost:8000/api/movies/${id}/related`
        );
        console.log("Related movies:", response.data);
        if (response.data && response.data.data) {
          setRelatedMovies(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching related movies:", err);
      }
    };

    loadMovie();
    loadRelatedMovies();
  }, [id]);

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!movie) return <div className="not-found">Không tìm thấy phim</div>;

  const handleViewShowtimesAndBook = () => {
    setIsModalOpen(true);
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
  };

  // Hàm hiển thị đạo diễn
  const renderDirectors = () => {
    if (!movie.directors) return <span>Không có thông tin</span>;

    if (!Array.isArray(movie.directors)) {
      return (
        <span>
          <a
            href={`/director/${movie.directors.id}`}
            className="director-link"
            onClick={(e) => {
              e.preventDefault();
              navigate(`/director/${movie.directors.id}`);
            }}
          >
            {movie.directors.name_director}
          </a>
        </span>
      );
    }

    if (movie.directors.length > 0) {
      return movie.directors.map((d, index) => (
        <span key={d.id}>
          <a
            href={`/director/${d.id}`}
            className="director-link"
            onClick={(e) => {
              e.preventDefault();
              navigate(`/director/${d.id}`);
            }}
          >
            {d.name_director}
          </a>
          {index < movie.directors.length - 1 && ", "}
        </span>
      ));
    }

    return <span>Không có thông tin</span>;
  };

  // Hàm hiển thị diễn viên
  const renderActors = () => {
    if (!movie.actors || movie.actors.length === 0) {
      return <span>Không có thông tin</span>;
    }

    return movie.actors.map((a, index) => (
      <span key={a.id}>
        <a
          href={`/actor/${a.id}`}
          className="actor-link"
          onClick={(e) => {
            e.preventDefault();
            navigate(`/actor/${a.id}`);
          }}
        >
          {a.name_actor}
        </a>
        {index < movie.actors.length - 1 && ", "}
      </span>
    ));
  };

  return (
    <ClientLayout>
      <div className="film-detail">
        <div className="film-header">
          <div className="poster-container">
            <img
              src={
                movie.poster
                  ? `http://localhost:8000${movie.poster}`
                  : "https://picsum.photos/300/450"
              }
              alt={movie.title}
              className="film-poster"
            />
          </div>
          <div className="film-info">
            <h1 className="film-title">{movie.title}</h1>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Thể loại:</span>
                <span className="info-value">
                  {movie.genres && movie.genres.length > 0
                    ? movie.genres.map((g) => g.name_genre).join(", ")
                    : "Không có thông tin"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Ngày phát hành:</span>
                <span className="info-value">
                  {movie.release_date
                    ? new Date(movie.release_date).toLocaleDateString("vi-VN")
                    : "Không có thông tin"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Thời lượng:</span>
                <span className="info-value">
                  {movie.running_time || "Không có thông tin"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Ngôn ngữ:</span>
                <span className="info-value">
                  {movie.language || "Không có thông tin"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Đánh giá:</span>
                <span className="info-value">
                  {movie.rated || "Không có thông tin"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Đạo diễn:</span>
                <span className="info-value">{renderDirectors()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Diễn viên:</span>
                <span className="info-value">{renderActors()}</span>
              </div>
            </div>
            <div className="action-buttons">
              <button
                className="action-btn book-ticket-btn"
                onClick={handleViewShowtimesAndBook}
              >
                Xem lịch chiếu và đặt vé
              </button>
            </div>
          </div>
        </div>
        <div className="film-description">
          <h2 className="section-title">Mô tả</h2>
          <p>{movie.description || "Không có mô tả"}</p>
        </div>
        {movie.trailer && (
          <div className="film-trailer">
            <h2 className="section-title">Trailer</h2>
            <div className="trailer-container">
              <iframe
                width="100%"
                height="100%"
                src={movie.trailer}
                title={`${movie.title} trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}
        {relatedMovies.length > 0 && (
          <div className="related-movies">
            <h2 className="section-title">Phim cùng thể loại</h2>
            <div className="related-movies-grid">
              {relatedMovies.map((relatedMovie) => (
                <div
                  key={relatedMovie.id}
                  className="related-movie-card"
                  onClick={() => navigate(`/filmDetail/${relatedMovie.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={
                      relatedMovie.poster
                        ? `http://localhost:8000${relatedMovie.poster}`
                        : "https://picsum.photos/200/300"
                    }
                    alt={relatedMovie.movie_title}
                    className="related-movie-poster"
                  />
                  <p className="related-movie-title">
                    {relatedMovie.movie_title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal lịch chiếu */}
      <Modal
        title="Lịch chiếu phim"
        width={700}
        open={isModalOpen}
        onCancel={handleCancelModal}
        footer={null}
      >
        {movie && (
          <CalendarMovies id={movie.id} setIsModalOpen2={setIsModalOpen} />
        )}
      </Modal>
    </ClientLayout>
  );
};

export default FilmDetail;
