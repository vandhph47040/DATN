import { createContext, useContext, useEffect, useState } from "react";

const StepsContext = createContext<any>(null);

export const StepsProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentStep, setCurrentStep] = useState(() => {
        const storedCurrentStep = sessionStorage.getItem("currentStep");
        return storedCurrentStep ? JSON.parse(storedCurrentStep) : 1;
    }); // step payment
    const [calendarShowtimeID, setCalendarShowtimeID] = useState<string | null>(
        () => {
            const storedCalendarShowtimeID =
                sessionStorage.getItem("calendarShowtimeID");
            return storedCalendarShowtimeID
                ? JSON.parse(storedCalendarShowtimeID)
                : null;
        }
    ); // id lịch chiếu của suất chiếu
    const [userIdFromShowtimes, setUserIdFromShowtimes] = useState<
        number | null
    >(() => {
        const storedUserIdFromShowtimes = sessionStorage.getItem(
            "userIdFromShowtimes"
        );
        return storedUserIdFromShowtimes
            ? JSON.parse(storedUserIdFromShowtimes)
            : 0;
    }); // user ID
    const [dataDetailFilm, setDataDetailFilm] = useState(() => {
        const storedDetailFilm = sessionStorage.getItem("dataDetailFilm");
        return storedDetailFilm
            ? JSON.parse(storedDetailFilm)
            : {
                  title: "",
                  language: "",
                  rated: "",
                  genres: [],
              };
    }); // lưu tạm thời data 1 phim
    const [paymentType, setPaymentType] = useState<string | null>(() => {
        const storedPaymentType = sessionStorage.getItem("paymentType");
        return storedPaymentType ? JSON.parse(storedPaymentType) : "";
    }); //hình thức thanh toán
    const [pathName, setPathName] = useState("");
    // thay đổi state dataDetailFilm thì lấy ở sessionStorage
    useEffect(() => {
        if (dataDetailFilm) {
            sessionStorage.setItem(
                "dataDetailFilm",
                JSON.stringify(dataDetailFilm)
            );
        }
    }, [dataDetailFilm]);

    // thay đổi các state khác thì lấy ở sessionStorage
    useEffect(() => {
        sessionStorage.setItem("currentStep", JSON.stringify(currentStep));
        sessionStorage.setItem(
            "calendarShowtimeID",
            JSON.stringify(calendarShowtimeID)
        );
        sessionStorage.setItem(
            "userIdFromShowtimes",
            JSON.stringify(userIdFromShowtimes)
        );
        sessionStorage.setItem("paymentType", JSON.stringify(paymentType));
    }, [currentStep, calendarShowtimeID, userIdFromShowtimes, paymentType]);

    return (
        <StepsContext.Provider
            value={{
                currentStep,
                setCurrentStep,
                calendarShowtimeID,
                setCalendarShowtimeID,
                userIdFromShowtimes,
                setUserIdFromShowtimes,
                dataDetailFilm,
                setDataDetailFilm,
                paymentType,
                setPaymentType,
                pathName,
                setPathName,
            }}
        >
            {children}
        </StepsContext.Provider>
    );
};

export const useStepsContext = () => {
    return useContext(StepsContext);
};
