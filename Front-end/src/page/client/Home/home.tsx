import { Link } from "react-router-dom";
import Banner from "../../../ClientComponents/Banner/Banner";
import InfomationBox from "../../../ClientComponents/InfomationBox/InfomationBox";
import InfomationSlide from "../../../ClientComponents/InfomationBox/InfomationSlide/InfomationSlide";
import RankingBox from "../../../ClientComponents/RankingBox/RankingBox";
import RankingSlide from "../../../ClientComponents/RankingBox/RankingSlide/RankingSlide";
import TitleMenu from "../../../ClientComponents/TitleMenu/TitleMenu";
import ClientLayout from "../Layout";
import ModalImage from "../../../ClientComponents/Modal Image/ModalImage";
import { useEffect, useState } from "react";

const Home = () => {
    const [isModalOpen, setIsModalOpen] = useState(false); // State modal

    useEffect(() => {
        const hasSeenModal = sessionStorage.getItem("hasSeenModal");
        const TimeoutModalImage = setTimeout(() => {
            if (!hasSeenModal) {
                setIsModalOpen(true);
                sessionStorage.setItem("hasSeenModal", "true");
            }
        }, 1300);
        return () => clearTimeout(TimeoutModalImage);
    }, []);

    return (
        <ClientLayout>
            <ModalImage
                isModalOpen={isModalOpen}
                handleClose={() => setIsModalOpen(false)}
            ></ModalImage>
            <Banner></Banner>
            <RankingBox>
                <TitleMenu name="Xếp hạng phim" nameSub="Ranking"></TitleMenu>
                <RankingSlide></RankingSlide>
            </RankingBox>
            <TitleMenu name="Mini Game" nameSub="Minigame"></TitleMenu>
            <Link to={"/vongquaymayman"}>
                <div className="main-base">
                    <img
                        style={{ width: "100%", marginTop: "40px" }}
                        src="../../../../public/imageFE/wheel.jpg"
                        alt=""
                    />
                </div>
            </Link>
            <InfomationBox>
                <TitleMenu name="Thông tin" nameSub="Infomation"></TitleMenu>
                <InfomationSlide></InfomationSlide>
            </InfomationBox>
        </ClientLayout>
    );
};

export default Home;
