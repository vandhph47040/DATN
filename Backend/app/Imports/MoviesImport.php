<?php

namespace App\Imports;

use App\Models\Movies;
use App\Models\Actor;
use App\Models\Genre;
use App\Models\Director;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class MoviesImport implements ToModel, WithHeadingRow
{

    protected $posterPaths;

    public function __construct(array $posterPaths = [])
    {
        $this->posterPaths = $posterPaths;
    }

    public function model(array $row)
    {
        $director = Director::firstOrCreate(
            ['name_director' => $row['director']]
        );

        // Debug giá trị của $row['poster']
        // Log::info('Row poster value: ' . ($row['poster'] ?? 'null'));

        // Ánh xạ poster từ file upload nếu có
        $posterPath = $row['poster'] ?? null;
        // Log::info('Poster path before mapping: ' . ($posterPath ?? 'null'));
        // Log::info('Poster paths array: ' . json_encode($this->posterPaths));

        if ($posterPath && isset($this->posterPaths[$posterPath])) {
            $posterPath = $this->posterPaths[$posterPath];
            // Log::info('Poster path updated to: ' . $posterPath);
        } else {
            // Log::info('Poster path not updated, keeping original: ' . ($posterPath ?? 'null'));
        }

        $movie = Movies::create([
            'title' => $row['title'],
            'director_id' => $director->id,
            'release_date' => $this->transformDate($row['release_date']),
            'running_time' => $row['running_time'],
            'language' => $row['language'],
            'rated' => $row['rated'],
            'description' => $row['description'] ?? null,
            'poster' => $posterPath,
            'trailer' => $row['trailer'] ?? null,
            'movie_status' => $row['movie_status'],
        ]);

        // Xử lý actors
        $actors = explode(',', $row['actors']);
        $actorIds = [];
        foreach ($actors as $actorName) {
            $actor = Actor::firstOrCreate(['name_actor' => trim($actorName)]);
            $actorIds[] = $actor->id;
        }
        $movie->actors()->sync($actorIds);

        // Xử lý genres
        $genres = explode(',', $row['genres']);
        $genreIds = [];
        foreach ($genres as $genreName) {
            $genre = Genre::firstOrCreate(['name_genre' => trim($genreName)]);
            $genreIds[] = $genre->id;
        }
        $movie->genres()->sync($genreIds);

        return $movie;
    }

    // Chuyển đổi định dạng ngày từ Excel
    private function transformDate($value)
    {
        if (is_numeric($value)) {
            return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value)->format('Y-m-d');
        }
        return $value;
    }
}
