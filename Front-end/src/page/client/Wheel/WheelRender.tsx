import React from "react";
import Header from "../../../ClientComponents/Header/Header";
import { FloatButton } from "antd";
import AppFooter from "../../../ClientComponents/Footer/footer";
import Wheel from "../../../ClientComponents/Wheel/Wheel";

const WheelRender = () => {
    return (
        <div style={{ background: "var(--mainBase-color)" }}>
            <Header></Header>
            <Wheel></Wheel>
            <FloatButton.BackTop />
            <AppFooter></AppFooter>
        </div>
    );
};

export default WheelRender;
