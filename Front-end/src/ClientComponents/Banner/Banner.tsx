import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";
import axios from "axios";

import "./banner.css";
import { Image } from "antd";

interface SliderItem {
    id: number;
    title: string;
    image_path: string;
    is_active: boolean;
}

const Banner = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [overlayWidth, setOverlayWidth] = useState(0);
    const [sliders, setSliders] = useState<SliderItem[]>([]);

    const spaceBetween = 90; // Khớp với giá trị truyền vào Swiper

    const calcOverlayWidth = () => {
        const wrapper = containerRef.current?.querySelector(".swiper-wrapper");
        const activeSlide = containerRef.current?.querySelector(
            ".swiper-slide-active"
        );

        if (wrapper && activeSlide) {
            const wrapperRect = wrapper.getBoundingClientRect();
            const slideRect = activeSlide.getBoundingClientRect();

            const side =
                (wrapperRect.width - slideRect.width) / 2 - spaceBetween;
            setOverlayWidth(Math.max(side, 0));
        }
    };

    useEffect(() => {
        // Tính lần đầu
        calcOverlayWidth();

        // Tính lại khi resize
        window.addEventListener("resize", calcOverlayWidth);

        // Tính lại sau mỗi lần swiper thay đổi slide
        const interval = setInterval(calcOverlayWidth, 500); // Hoặc dùng observer/Swiper event

        return () => {
            window.removeEventListener("resize", calcOverlayWidth);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        // Lấy dữ liệu slider từ API
        const fetchSliders = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/active-sliders"
                );
                if (response.data && response.data.data) {
                    setSliders(response.data.data);
                }
            } catch (error) {
                console.error("Lỗi khi tải slider:", error);
            }
        };

        fetchSliders();
    }, []);

    // Render ảnh slide từ API hoặc fallback về text mặc định
    const renderSlide = (index: number) => {
        if (sliders.length > index) {
            const slider = sliders[index];
            return (
                <img
                    src={`http://localhost:8000/storage/${slider.image_path}`}
                    alt={slider.title}
                    width="100%"
                    height="100%"
                />
            );
        }
        return `Slide ${index + 1}`;
    };

    return (
        <div
            className="banner-box"
            ref={containerRef}
            style={{ position: "relative" }}
        >
            <div
                className="slide-overlay left"
                style={{ width: `${overlayWidth}px` }}
            />
            <div
                className="slide-overlay right"
                style={{ width: `${overlayWidth}px` }}
            />
            <Swiper
                slidesPerView="auto"
                spaceBetween={90}
                loop={true}
                navigation={true}
                centeredSlides={true}
                speed={1000}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                pagination={{ clickable: true }}
                modules={[Autoplay, Navigation, Pagination]}
            >
                <SwiperSlide className="custom-slide">
                    {renderSlide(0)}
                </SwiperSlide>
                <SwiperSlide className="custom-slide">
                    {renderSlide(1)}
                </SwiperSlide>
                <SwiperSlide className="custom-slide">
                    {renderSlide(2)}
                </SwiperSlide>
                <SwiperSlide className="custom-slide">
                    {renderSlide(3)}
                </SwiperSlide>
                <SwiperSlide className="custom-slide">
                    {renderSlide(4)}
                </SwiperSlide>
                <SwiperSlide className="custom-slide">
                    {renderSlide(5)}
                </SwiperSlide>
                <SwiperSlide className="custom-slide">
                    {renderSlide(6)}
                </SwiperSlide>
            </Swiper>
            <div className="promotion">
                <div className="promotion-1">
                    <img
                        className="promotion-image"
                        src="../../../public/imageFE/banner11.png"
                    />
                </div>
                <div className="promotion-2">
                    <img
                        className="promotion-image"
                        src="../../../public/imageFE/banner22.png"
                    />
                </div>
            </div>
        </div>
    );
};

export default Banner;
