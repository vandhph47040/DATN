import { useState } from "react";
import { Modal } from "antd";
import CalendarMovies from "../CalendarMovies/CalendarMovies";
import { Link } from "react-router-dom";
import clsx from "clsx";

import styles from "./PlayingProduct.module.css";

const PlayingProduct = ({
  id,
  title,
  className,
  genres,
  release_date,
  poster,
  trailer,
  showChill,
  onClick,
}: any) => {
  const [videoKey, setVideoKey] = useState(0);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);

  const showModal1 = () => {
    setVideoKey((prevKey) => prevKey + 1);
    setIsModalOpen1(true);
  };

  const handleCancel1 = () => {
    setIsModalOpen1(false);
  };

  const showModal2 = () => {
    setIsModalOpen2(true);
  };

  const handleCancel2 = () => {
    setIsModalOpen2(false);
  };

  return (
    <div
      className={clsx(styles.playingProduct, className)}
      onClick={() => onClick()}
    >
      <div className={clsx(styles.productImg)}>
        <Link to={`/filmDetail/${id}`}>
          <img className={clsx(styles.img)} src={poster} alt="" />
        </Link>

        <div className={clsx(styles.hoverBtn)}>
          <button className={clsx(styles.btn)} onClick={showModal2}>
            Đặt vé
          </button>
          <button className={clsx(styles.btn)} onClick={showModal1}>
            Trailer
          </button>
        </div>
      </div>

      {/* Modal lịch chiếu */}
      <Modal
        title="Lịch chiếu phim"
        width={700}
        open={isModalOpen2}
        onCancel={handleCancel2}
        footer={null}
      >
        <CalendarMovies id={id} setIsModalOpen2={setIsModalOpen2} />
      </Modal>

      {/* Modal Trailer */}
      <Modal
        width={720}
        open={isModalOpen1}
        onCancel={handleCancel1}
        footer={null}
        closable={false}
        destroyOnClose={true}
      >
        {isModalOpen1 && (
          <iframe
            key={videoKey}
            width="670"
            height="375"
            src={`${trailer}?autoplay=1`}
            title="YouTube video player"
            style={{ border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        )}
      </Modal>

      <div className={clsx(styles.productSub)}>
        <h4 className={clsx(styles.category, "cliptextTitle")}>{genres}</h4>
        {showChill && <span className={clsx(styles.date)}>{release_date}</span>}
      </div>

      {!showChill && (
        <h4 className={clsx(styles.startDay)}>
          Ngày khởi chiếu:{" "}
          <span className={clsx(styles.wordRender)}>{release_date}</span>
        </h4>
      )}

      <h2 className={clsx(styles.productTitle, "cliptextTitle")}>{title}</h2>
    </div>
  );
};

export default PlayingProduct;
