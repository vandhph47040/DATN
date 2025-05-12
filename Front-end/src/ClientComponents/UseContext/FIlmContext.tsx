import { createContext, useContext, useEffect, useState } from "react";

const FilmContext = createContext<any>(null);

export const FilmsProvider = ({ children }: { children: React.ReactNode }) => {
  const [filmId, setFilmId] = useState<number | null>(() => {
    const storedFilmId = sessionStorage.getItem("filmId");
    return storedFilmId ? JSON.parse(storedFilmId) : null;
  }); // id phim
  const [showtimesTime, setShowtimesTime] = useState<string | null>(() => {
    const storedShowtimesTime = sessionStorage.getItem("showtimesTime");
    return storedShowtimesTime ? JSON.parse(storedShowtimesTime) : null;
  }); // thời gian suất chiếu
  const [showtimesEndTime, setShowtimesEndTime] = useState<string | null>(
    () => {
      const storedShowtimesEndTime = sessionStorage.getItem("showtimesEndTime");
      return storedShowtimesEndTime ? JSON.parse(storedShowtimesEndTime) : null;
    }
  ); // thời gian kết thúc suất chiếu
  const [showtimesDate, setShowtimesDate] = useState<string | null>(() => {
    const storedShowtimesDate = sessionStorage.getItem("showtimesDate");
    return storedShowtimesDate ? JSON.parse(storedShowtimesDate) : "";
  }); // ngày suất chiếu
  const [roomIdFromShowtimes, setRoomIdFromShowtimes] = useState<number | null>(
    () => {
      const storedRoomIdFromShowtimes = sessionStorage.getItem(
        "roomIdFromShowtimes"
      );
      return storedRoomIdFromShowtimes
        ? JSON.parse(storedRoomIdFromShowtimes)
        : 0;
    }
  ); // id room_id booking
  const [roomNameShowtimes, setRoomNameShowtimes] = useState<string>(() => {
    const storedRoomNameShowtimes = sessionStorage.getItem("roomNameShowtimes");
    return storedRoomNameShowtimes ? JSON.parse(storedRoomNameShowtimes) : "";
  }); // name room booking
  const [roomTypeShowtimes, setRoomTypeShowtimes] = useState<string>(() => {
    const storedRoomTypeShowtimes = sessionStorage.getItem("roomTypeShowtimes");
    return storedRoomTypeShowtimes ? JSON.parse(storedRoomTypeShowtimes) : "";
  }); // type room booking
  const [showtimeIdFromBooking, setShowtimeIdFromBooking] = useState<
    number | null
  >(() => {
    const storedShowtimeIdFromBooking = sessionStorage.getItem(
      "showtimeIdFromBooking"
    );
    return storedShowtimeIdFromBooking
      ? JSON.parse(storedShowtimeIdFromBooking)
      : 0;
  }); // id suất chiếu booking
  const [listShowtimes, setListShowtimes] = useState<any[]>(() => {
    const storedListShowtimes = sessionStorage.getItem("listShowtimes");
    return storedListShowtimes ? JSON.parse(storedListShowtimes) : [];
  }); // danh sách suất chiếu

  // cập nhât sessionStorage khi các state thay đổi
  useEffect(() => {
    sessionStorage.setItem("filmId", JSON.stringify(filmId));
    sessionStorage.setItem("showtimesTime", JSON.stringify(showtimesTime));
    sessionStorage.setItem(
      "showtimesEndTime",
      JSON.stringify(showtimesEndTime)
    );
    sessionStorage.setItem("showtimesDate", JSON.stringify(showtimesDate));
    sessionStorage.setItem(
      "roomIdFromShowtimes",
      JSON.stringify(roomIdFromShowtimes)
    );
    sessionStorage.setItem(
      "roomNameShowtimes",
      JSON.stringify(roomNameShowtimes)
    );
    sessionStorage.setItem(
      "roomTypeShowtimes",
      JSON.stringify(roomTypeShowtimes)
    );
    sessionStorage.setItem(
      "showtimeIdFromBooking",
      JSON.stringify(showtimeIdFromBooking)
    );
    sessionStorage.setItem("listShowtimes", JSON.stringify(listShowtimes));
  }, [
    filmId,
    showtimesTime,
    showtimesEndTime,
    showtimesDate,
    roomIdFromShowtimes,
    roomNameShowtimes,
    roomTypeShowtimes,
    listShowtimes,
  ]);
  return (
    <FilmContext.Provider
      value={{
        filmId,
        setFilmId,
        showtimesTime,
        setShowtimesTime,
        showtimesEndTime,
        setShowtimesEndTime,
        showtimesDate,
        setShowtimesDate,
        roomIdFromShowtimes,
        setRoomIdFromShowtimes,
        showtimeIdFromBooking,
        setShowtimeIdFromBooking,
        listShowtimes,
        setListShowtimes,
        roomTypeShowtimes,
        setRoomTypeShowtimes,
        roomNameShowtimes,
        setRoomNameShowtimes,
      }}
    >
      {children}
    </FilmContext.Provider>
  );
};

export const useFilmContext = () => {
  return useContext(FilmContext);
};
