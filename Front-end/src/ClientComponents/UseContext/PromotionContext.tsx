import { createContext, useContext, useEffect, useState } from "react";

const PromotionContext = createContext<any>(null);

export const PromotionProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [promoCodeLocal, setPromoCodeLocal] = useState<string>("");
    const [isVoucherUsed, setIsVoucherUsed] = useState<boolean>(false);
    const [promotionOptions, setPromotionOptions] = useState<string | []>([]);
    const [quantityPromotion, setQuantityPromotion] = useState<number | null>(
        0
    );
    const [totalPriceVoucher, setTotalPriceVoucher] = useState<number>(() => {
        const storedTotalPriceVoucher =
            sessionStorage.getItem("totalPriceVoucher");
        return storedTotalPriceVoucher
            ? JSON.parse(storedTotalPriceVoucher)
            : 0;
    });
    const [totalPricePoint, setTotalPricePoint] = useState<number>(() => {
        const storedTotalPricePoint = sessionStorage.getItem("totalPricePoint");
        return storedTotalPricePoint ? JSON.parse(storedTotalPricePoint) : 0;
    });
    const [userPoints, setUserPoints] = useState<number>(() => {
        const storedUserPoint = sessionStorage.getItem("userPoints");
        return storedUserPoint ? JSON.parse(storedUserPoint) : 0;
    });
    const [usedPoints, setUsedPoints] = useState<number>(() => {
        const storedUsedPoints = sessionStorage.getItem("usedPoints");
        return storedUsedPoints ? JSON.parse(storedUsedPoints) : 0;
    });
    const [rankUser, setRankUser] = useState<string>(() => {
        const storedRankUser = sessionStorage.getItem("rankUser");
        return storedRankUser ? JSON.parse(storedRankUser) : "";
    });
    // Thêm promoCode và setPromoCode vào context
    const [promoCode, setPromoCode] = useState<string>(() => {
        const storedPromoCode = sessionStorage.getItem("promoCode");
        return storedPromoCode ? JSON.parse(storedPromoCode) : "";
    });

    useEffect(() => {
        sessionStorage.setItem("userPoints", JSON.stringify(userPoints));
        sessionStorage.setItem("rankUser", JSON.stringify(rankUser));
        sessionStorage.setItem("usedPoints", JSON.stringify(usedPoints));
        sessionStorage.setItem(
            "totalPricePoint",
            JSON.stringify(totalPricePoint)
        );
        sessionStorage.setItem(
            "totalPriceVoucher",
            JSON.stringify(totalPriceVoucher)
        );
        sessionStorage.setItem("promoCode", JSON.stringify(promoCode)); // Lưu promoCode vào sessionStorage
    }, [
        userPoints,
        rankUser,
        usedPoints,
        totalPricePoint,
        totalPriceVoucher,
        promoCode,
    ]);

    return (
        <PromotionContext.Provider
            value={{
                promotionOptions,
                setPromotionOptions,
                quantityPromotion,
                setQuantityPromotion,
                totalPriceVoucher,
                setTotalPriceVoucher,
                totalPricePoint,
                setTotalPricePoint,
                userPoints,
                setUserPoints,
                usedPoints,
                setUsedPoints,
                rankUser,
                setRankUser,
                promoCode, // Thêm promoCode
                setPromoCode, // Thêm setPromoCode
                promoCodeLocal,
                setPromoCodeLocal,
                isVoucherUsed,
                setIsVoucherUsed,
            }}
        >
            {children}
        </PromotionContext.Provider>
    );
};

export const usePromotionContext = () => {
    return useContext(PromotionContext);
};
