import { createContext, useContext, useEffect, useState } from "react";

const FinalPriceContext = createContext<any>(null);

export const FinalPriceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [totalPrice, setTotalPrice] = useState<number | null>(() => {
    const storedTotalPrice = sessionStorage.getItem("totalPrice");
    return storedTotalPrice ? JSON.parse(storedTotalPrice) : 0;
  }); // tổng tiền mua vé

  // cập nhât sessionStorage khi các state thay đổi
  useEffect(() => {
    sessionStorage.setItem("totalPrice", JSON.stringify(totalPrice));
  }, [totalPrice]);

  return (
    <FinalPriceContext.Provider
      value={{
        totalPrice,
        setTotalPrice,
      }}
    >
      {children}
    </FinalPriceContext.Provider>
  );
};

export const useFinalPriceContext = () => {
  return useContext(FinalPriceContext);
};
