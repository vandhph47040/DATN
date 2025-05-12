import Header from "../../ClientComponents/Header/Header";
import Navigate from "../../ClientComponents/Navigate/Navigate";
import AppFooter from "../../ClientComponents/Footer/footer";
import { FloatButton } from "antd";
const ClientLayout = ({ children }: any) => {
    return (
        <div style={{ background: "var(--mainBase-color)" }}>
            <Header></Header>
            <Navigate></Navigate>
            {children}
            <FloatButton.BackTop />
            <AppFooter />
        </div>
    );
};

export default ClientLayout;
