import BookingMain from "../../../ClientComponents/Booking/BookingMain";
import { FloatButton } from "antd";
import Header from "../../../ClientComponents/Header/Header";
import AppFooter from "../../../ClientComponents/Footer/footer";

const Booking = () => {
    return (
        <div style={{ background: "var(--mainBase-color)" }}>
            <Header></Header>
            <BookingMain></BookingMain>
            <FloatButton.BackTop />
            <AppFooter></AppFooter>
        </div>
    );
};

export default Booking;
