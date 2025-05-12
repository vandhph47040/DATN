import { InsertRowAboveOutlined } from "@ant-design/icons";
import { Button, Modal, Space } from "antd";
import { useState } from "react";
import CreateOneSeat from "./CreateOneSeat";
import DeleteAllSeat from "./DeleteAllSeat";
import MatrixSeatRender from "./MatrixSeatRender";
import clsx from "clsx";
import styles from "./SeatManage.module.css";
import SeatsInfoUI from "./SeatsInfoUI";
const SeatManage = ({ name, roomId }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button color="purple" variant="solid" onClick={showModal}>
        <InsertRowAboveOutlined /> Quản lý ghế
      </Button>
      <Modal
        title={`Quản lý ghế phòng ${name}`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={650}
      >
        <Space className={clsx(styles.spaceEle)}>
          <CreateOneSeat roomId={roomId}></CreateOneSeat>
          <DeleteAllSeat roomId={roomId} handleOk={handleOk}></DeleteAllSeat>
        </Space>
        <MatrixSeatRender roomId={roomId}></MatrixSeatRender>
        <SeatsInfoUI></SeatsInfoUI>
      </Modal>
    </>
  );
};

export default SeatManage;
