import UserProfile from "../../../ClientComponents/UserProfile/UserProfile";
import { FloatButton } from "antd";
import AppFooter from "../../../ClientComponents/Footer/footer";
import Header from "../../../ClientComponents/Header/Header";

const UserProfileRender = () => {
    return (
        <div style={{ background: "var(--mainBase-color)" }}>
            <Header></Header>
            <UserProfile></UserProfile>
            <FloatButton.BackTop />
            <AppFooter></AppFooter>
        </div>
    );
};

export default UserProfileRender;
