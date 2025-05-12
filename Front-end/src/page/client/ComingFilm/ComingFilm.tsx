import React, { useState } from "react";
import ClientLayout from "../Layout";
import ComingMain from "../../../ClientComponents/ComingMain/ComingMain";
import FilterComingCinema from "../../../ClientComponents/FilterComingCinema/FilterComingCinema";
import { useNavigate } from "react-router-dom";

const ComingFilm = () => {
    const navigate = useNavigate();
    const [filteredMovies, setFilteredMovies] = useState<any[]>([]);

    const handleMovieClick = (movieId: number) => {
        navigate(`/filmDetail/${movieId}`);
    };

    const handleFilterChange = (filterType: string, value: string | number) => {
        console.log(`Filter thay đổi: ${filterType} = ${value}`);
    };

    const handleFilteredDataChange = (movies: any[]) => {
        console.log(`Nhận được ${movies.length} phim sắp chiếu đã lọc`);
        setFilteredMovies(movies);
    };

    return (
        <div style={{ minHeight: "1600px" }}>
            <ClientLayout>
                <FilterComingCinema
                    onFilterChange={handleFilterChange}
                    onFilteredDataChange={handleFilteredDataChange}
                />
                <ComingMain
                    showChill={handleMovieClick}
                    filteredMovies={filteredMovies}
                />
            </ClientLayout>
        </div>
    );
};

export default ComingFilm;
