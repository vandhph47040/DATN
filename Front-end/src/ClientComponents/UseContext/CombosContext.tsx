import { createContext, useContext, useEffect, useState } from "react";

const ComboContext = createContext<any>(null);

export const CombosProvider = ({ children }: { children: React.ReactNode }) => {
  const [quantityCombo, setQuantityCombo] = useState<number | null>(() => {
    const storedQuantityCombo = sessionStorage.getItem("quantityCombo");
    return storedQuantityCombo ? JSON.parse(storedQuantityCombo) : 0;
  }); // tổng số lượng combo
  const [nameCombo, setNameCombo] = useState<string[]>(() => {
    const storedNameCombo = sessionStorage.getItem("nameCombo");
    return storedNameCombo ? JSON.parse(storedNameCombo) : [];
  }); // tên combo
  const [totalComboPrice, setTotalComboPrice] = useState<string | null>(() => {
    const storedTotalComboPrice = sessionStorage.getItem("totalComboPrice");
    return storedTotalComboPrice ? JSON.parse(storedTotalComboPrice) : null;
  }); // tổng số tiền combo
  const [quantityMap, setQuantityMap] = useState<Record<string, number>>(() => {
    const storedQuantityMap = sessionStorage.getItem("quantityMap");
    return storedQuantityMap ? JSON.parse(storedQuantityMap) : {};
  }); // giá trị mặc định của combo
  const [holdComboID, setHoldComboID] = useState<string[]>(() => {
    const storedHoldComboID = sessionStorage.getItem("holdComboID");
    return storedHoldComboID ? JSON.parse(storedHoldComboID) : [];
  }); // id combo đã chọn

  // cập nhât sessionStorage khi các state thay đổi
  useEffect(() => {
    sessionStorage.setItem("quantityCombo", JSON.stringify(quantityCombo));
    sessionStorage.setItem("nameCombo", JSON.stringify(nameCombo));
    sessionStorage.setItem("totalComboPrice", JSON.stringify(totalComboPrice));
    sessionStorage.setItem("quantityMap", JSON.stringify(quantityMap));
    sessionStorage.setItem("holdComboID", JSON.stringify(holdComboID));
  }, [quantityCombo, nameCombo, totalComboPrice, quantityMap, holdComboID]);
  return (
    <ComboContext.Provider
      value={{
        quantityCombo,
        setQuantityCombo,
        nameCombo,
        setNameCombo,
        totalComboPrice,
        setTotalComboPrice,
        quantityMap,
        setQuantityMap,
        holdComboID,
        setHoldComboID,
      }}
    >
      {children}
    </ComboContext.Provider>
  );
};

export const useComboContext = () => {
  return useContext(ComboContext);
};
