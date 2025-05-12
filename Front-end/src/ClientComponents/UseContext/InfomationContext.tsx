import { createContext, useContext, useEffect, useState } from "react";

const InfomationContext = createContext<any>(null);

export const InfomationProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [countInfomation, setCountInfomation] = useState<number>(() => {
        const storedCount = localStorage.getItem("countInfomation");
        return storedCount ? parseInt(storedCount) : 0;
    }); // số lượng thông tin hiện ở avatar
    const [textInfomation, setTextInfomation] = useState<
        { id: number; title: string; content: string; date: string }[]
    >(() => {
        const storedText = localStorage.getItem("textInfomation");
        return storedText ? JSON.parse(storedText) : [];
    }); // tên thông tin hiện ở thông báo trong avatar

    useEffect(() => {
        localStorage.setItem("countInfomation", countInfomation.toString());
        localStorage.setItem("textInfomation", JSON.stringify(textInfomation));
        countInfomation <= 0 && setCountInfomation(0);
    }, [countInfomation, textInfomation]);

    const removeInfomationFromID = (id: number) => {
        const updated = textInfomation.filter((item) => item.id !== id);
        setTextInfomation(updated);
        localStorage.setItem("textInfomation", JSON.stringify(updated));
    };

    return (
        <InfomationContext.Provider
            value={{
                countInfomation,
                setCountInfomation,
                textInfomation,
                setTextInfomation,
                removeInfomationFromID,
            }}
        >
            {children}
        </InfomationContext.Provider>
    );
};

// Hook để sử dụng context
export const useInfomationContext = () => {
    return useContext(InfomationContext);
};
