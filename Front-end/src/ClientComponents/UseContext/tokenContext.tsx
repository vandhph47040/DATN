import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [tokenUserId, setTokenUserId] = useState<string | null>(null);

  //  Lấy token từ localStorage khi component mount
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setTokenUserId(token);
    }
  }, []);

  // Cập nhật localStorage khi tokenUserId thay đổi
  useEffect(() => {
    if (tokenUserId) {
      localStorage.setItem("auth_token", tokenUserId);
    } else {
      localStorage.removeItem("auth_token"); // Xoá nếu không có giá trị
    }
  }, [tokenUserId]);

  return (
    <AuthContext.Provider value={{ tokenUserId, setTokenUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook để sử dụng context
export const useAuthContext = () => {
  return useContext(AuthContext);
};
