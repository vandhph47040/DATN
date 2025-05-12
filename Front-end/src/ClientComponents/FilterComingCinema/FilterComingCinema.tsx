import { Select } from "antd";
import clsx from "clsx";
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../FilterPlayingCinema/FilterPlayingCinema.module.css";
import {
  filterComingSoonMoviesByGenre,
  fetchComingSoonMovies,
} from "../../services/comingfilm.service";

// Định nghĩa props cho component
interface FilterComingCinemaProps {
  onFilterChange?: (filterType: string, value: string | number) => void;
  onFilteredDataChange?: (data: any[]) => void;
}

const FilterComingCinema = ({
  onFilterChange,
  onFilteredDataChange,
}: FilterComingCinemaProps) => {
  // State để lưu các tùy chọn filter hiện tại
  const [activeFilters, setActiveFilters] = useState({
    sortBy: "Mới nhất",
    genre: "Tất cả",
    releaseYear: 0, // 0 đại diện cho "Tất cả năm"
    language: "Tất cả",
    status: "coming_soon",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Danh sách năm phát hành (từ năm hiện tại trở về 10 năm trước)
  const currentYear = new Date().getFullYear();
  const releaseYears = Array.from({ length: 11 }, (_, i) => currentYear - i);

  // Danh sách ngôn ngữ phim
  const languages = [
    { value: "vi", label: "Tiếng Việt" },
    { value: "en", label: "Tiếng Anh" },
    { value: "ko", label: "Tiếng Hàn" },
    { value: "ja", label: "Tiếng Nhật" },
    { value: "zh", label: "Tiếng Trung" },
    { value: "fr", label: "Tiếng Pháp" },
    { value: "th", label: "Tiếng Thái" },
  ];

  // Hàm để lấy danh sách phim theo filter
  const fetchFilteredMovies = async () => {
    setIsLoading(true);
    try {
      let filteredMovies: any[] = [];

      // Lấy danh sách phim sắp chiếu từ API movies-index
      console.log("Lấy danh sách phim sắp chiếu từ API movies-index");
      const { data } = await axios.get(
        "http://localhost:8000/api/movies-index"
      );
      filteredMovies = data.coming_soon || [];

      // Lọc theo thể loại
      if (activeFilters.genre !== "Tất cả") {
        console.log("Lọc theo thể loại:", activeFilters.genre);
        filteredMovies = filteredMovies.filter((movie: any) =>
          movie.genres.some((g: any) => g.name_genre === activeFilters.genre)
        );
      }

      // Lọc theo năm phát hành
      if (activeFilters.releaseYear > 0) {
        console.log("Lọc theo năm phát hành:", activeFilters.releaseYear);
        filteredMovies = filteredMovies.filter((movie: any) => {
          const releaseYear = new Date(movie.release_date).getFullYear();
          return releaseYear === activeFilters.releaseYear;
        });
      }

      // Lọc theo ngôn ngữ
      if (activeFilters.language !== "Tất cả") {
        console.log("Lọc theo ngôn ngữ:", activeFilters.language);

        // In ra các thuộc tính của phim để kiểm tra cấu trúc
        if (filteredMovies.length > 0) {
          console.log(
            "Các thuộc tính của phim:",
            Object.keys(filteredMovies[0])
          );
          console.log(
            "Ngôn ngữ của phim:",
            filteredMovies[0].language,
            filteredMovies[0].original_language
          );
        }

        filteredMovies = filteredMovies.filter((movie: any) => {
          // Kiểm tra cả language và original_language vì không chắc chắn thuộc tính nào chứa mã ngôn ngữ
          return (
            (movie.language && movie.language === activeFilters.language) ||
            (movie.original_language &&
              movie.original_language === activeFilters.language)
          );
        });
      }

      // Sắp xếp
      if (activeFilters.sortBy === "Mới nhất") {
        filteredMovies.sort(
          (a: any, b: any) =>
            new Date(b.release_date).getTime() -
            new Date(a.release_date).getTime()
        );
      } else if (activeFilters.sortBy === "Phổ biến") {
        filteredMovies.sort(
          (a: any, b: any) => (b.popularity || 0) - (a.popularity || 0)
        );
      }

      console.log("Kết quả filter:", filteredMovies.length, "phim sắp chiếu");

      // Trả về kết quả cho component cha
      if (onFilteredDataChange) {
        onFilteredDataChange(filteredMovies);
      }

      return filteredMovies;
    } catch (error) {
      console.error("Lỗi khi lọc phim sắp chiếu:", error);

      // Trả về mảng rỗng trong trường hợp lỗi
      if (onFilteredDataChange) {
        onFilteredDataChange([]);
      }

      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi API khi filter thay đổi
  useEffect(() => {
    fetchFilteredMovies();
  }, [activeFilters]);

  const handleChange = (value: string, filterType: string) => {
    console.log(`Đã chọn ${value} cho ${filterType}`);

    // Cập nhật state
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));

    // Gọi callback để thông báo thay đổi filter
    if (onFilterChange) {
      onFilterChange(filterType, value);
    }
  };

  const handleReleaseYearChange = (value: number) => {
    console.log(`Đã chọn năm ${value} cho releaseYear`);

    setActiveFilters({
      ...activeFilters,
      releaseYear: value,
    });

    if (onFilterChange) {
      onFilterChange("releaseYear", value);
    }
  };

  return (
    <div className="main-base">
      <Select
        className={clsx(styles.selectOption)}
        defaultValue="Mới nhất"
        onChange={(value) => handleChange(value, "sortBy")}
        options={[
          { value: "Mới nhất", label: "Mới nhất" },
          { value: "Phổ biến", label: "Phổ biến" },
        ]}
      />
      <Select
        className={clsx(styles.selectOption)}
        defaultValue="Tất cả"
        onChange={(value) => handleChange(value, "genre")}
        options={[
          { value: "Tất cả", label: "Tất cả" },
          { value: "Hành động", label: "Hành động" },
          { value: "Tình cảm", label: "Tình cảm" },
          { value: "Kinh dị", label: "Kinh dị" },
          { value: "Viễn tưởng", label: "Viễn tưởng" },
          { value: "Hài hước", label: "Hài hước" },
          { value: "Hoạt hình", label: "Hoạt hình" },
          { value: "Bí ẩn", label: "Bí ẩn" },
        ]}
      />
      <Select
        className={clsx(styles.selectOption)}
        defaultValue={0}
        onChange={handleReleaseYearChange}
        options={[
          { value: 0, label: "Tất cả năm" },
          ...releaseYears.map((year) => ({
            value: year,
            label: `Năm ${year}`,
          })),
        ]}
      />
      <Select
        className={clsx(styles.selectOption)}
        defaultValue="Tất cả"
        onChange={(value) => handleChange(value, "language")}
        options={[{ value: "Tất cả", label: "Tất cả ngôn ngữ" }, ...languages]}
      />
    </div>
  );
};

export default FilterComingCinema;
