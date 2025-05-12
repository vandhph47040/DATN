import React, { useRef, useState, useEffect } from "react";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RankingProduct from "../RankingProduct/RankingProduct";
import "./RankingSlide.css";

interface Movie {
  id: number;
  movie_title: string;
  poster: string;
  rank: number;
  total_tickets: number;
}

interface Product {
  id: number;
  name: string;
  img: string;
  rank: number;
}

const RankingSlide = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [index, setIndex] = useState(0);
  const visibleItems = 3;
  const listRef = useRef(null);

  useEffect(() => {
    const fetchRankingMovies = async () => {
      try {
        // Lấy danh sách phim từ API ranking
        const response = await fetch(
          "http://localhost:8000/api/movies-ranking"
        );
        const data = await response.json();

        // Kiểm tra xem có dữ liệu phim không
        if (data && data.data && Array.isArray(data.data)) {
          // Chuyển đổi dữ liệu sang định dạng Product
          const mappedProducts = data.data.map((movie: Movie) => ({
            id: movie.id,
            name: movie.movie_title,
            img: movie.poster,
            rank: movie.rank,
          }));

          // Cập nhật state với danh sách phim
          setProducts(mappedProducts);
        } else {
          console.error("Không có dữ liệu phim hợp lệ");
          setProducts([]); // Set mảng rỗng nếu không có dữ liệu
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu phim:", error);
        setProducts([]); // Set mảng rỗng khi có lỗi
      }
    };

    fetchRankingMovies();
  }, []);

  const handleNext = () => {
    if (index + visibleItems < products.length) {
      setIndex(index + visibleItems);
    }
  };

  const handlePrev = () => {
    if (index + visibleItems >= 0) {
      setIndex(index - visibleItems);
    }
  };

  return (
    <div>
      <div className="carousel-container">
        <button
          className="prev-btn"
          onClick={handlePrev}
          disabled={index === 0}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div className="carousel-wrapper">
          <div
            className="carousel-list"
            ref={listRef}
            style={{
              transform: `translateX(-${index * (310 + 75)}px)`,
            }}
          >
            {products.map((product) => (
              <RankingProduct
                key={product.id}
                className="carousel-item"
                number={product.rank} // Số thứ tự theo rank
                name={product.name}
                image={product.img}
                id={product.id} // ID phim để link đến trang chi tiết
              ></RankingProduct>
            ))}
          </div>
        </div>
        <button
          className="next-btn"
          onClick={handleNext}
          disabled={index + visibleItems >= products.length}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
};

export default RankingSlide;
