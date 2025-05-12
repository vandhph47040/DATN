import { useState } from "react";
import FilterPlayingCinema from "../../../ClientComponents/FilterPlayingCinema/FilterPlayingCinema";
import PlayingMain from "../../../ClientComponents/PlayingMain/PlayingMain";
import ClientLayout from "../Layout";
import { useNavigate } from "react-router-dom";

const PlayingFilm = () => {
    const navigate = useNavigate();
    const [filteredMovies, setFilteredMovies] = useState<any[]>([]);

    const handleMovieClick = (movieId: number) => {
        navigate(`/filmDetail/${movieId}`);
    };

    const handleFilterChange = (filterType: string, value: string | number) => {
        console.log(`Filter thay đổi: ${filterType} = ${value}`);
    };

    const handleFilteredDataChange = (movies: any[]) => {
        console.log(`Nhận được ${movies.length} phim đã lọc`);
        setFilteredMovies(movies);
    };

    return (
        <div style={{ minHeight: "1600px" }}>
            <ClientLayout>
                <FilterPlayingCinema
                    onFilterChange={handleFilterChange}
                    onFilteredDataChange={handleFilteredDataChange}
                />
                <PlayingMain
                    showChill={handleMovieClick}
                    filteredMovies={filteredMovies}
                />
            </ClientLayout>
        </div>
    );
};

export default PlayingFilm;
