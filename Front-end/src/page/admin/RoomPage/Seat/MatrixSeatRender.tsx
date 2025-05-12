import clsx from "clsx";
import styles from "./SeatManage.module.css";
import { useGetSeatsByRoom } from "../../../../services/adminServices/seatManage.service";
import { Spin } from "antd";
import { useState } from "react";
import EditSeats from "./EditSeats";

const MatrixSeatRender = ({ roomId }: { roomId: string }) => {
    const [selectedSeat, setSelectedSeat] = useState<{
        row: string;
        col: number;
        id: number;
        type: string;
        status: string;
    } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: SeatsByRoom, isLoading } = useGetSeatsByRoom(Number(roomId));

    const handleSeatClick = (
        row: string,
        col: number,
        id: number,
        type: string,
        status: string
    ) => {
        setSelectedSeat({ row, col, id, type, status });
        setIsModalOpen(true);
    };

    // Nhóm ghế theo hàng
    const groupedSeats = SeatsByRoom
        ? SeatsByRoom.reduce((acc: Record<string, any[]>, seat) => {
              if (!acc[seat.row]) acc[seat.row] = [];
              acc[seat.row].push(seat);
              return acc;
          }, {})
        : {};

    return (
        <div>
            <div className={clsx(styles.screen)}>MÀN HÌNH</div>
            {isLoading ? (
                <div className={clsx(styles.loadingIcon)}>
                    <Spin />
                </div>
            ) : SeatsByRoom?.length === 0 ? (
                <div className={clsx(styles.noSeats)}>
                    <span>Chưa có ma trận ghế cho phòng này</span>
                </div>
            ) : (
                <div className={styles.seatMatrix}>
                    {groupedSeats &&
                        Object.entries(groupedSeats).map(([row, seats]) => (
                            <div key={row} className={styles.seatRow}>
                                {/* Hiển thị tên hàng */}
                                <div className={clsx(styles.rowLabel)}>
                                    {row}
                                </div>
                                <div className={clsx(styles.rowSeats)}>
                                    {seats.map((seat) => (
                                        <div
                                            key={`${seat.row}-${seat.column}`}
                                            className={clsx(
                                                styles.seat,
                                                seat.type === "Thường" &&
                                                    styles.normalType,
                                                seat.type === "VIP" &&
                                                    styles.VIPType,
                                                seat.type === "Sweetbox" &&
                                                    styles.SweetboxType,
                                                seat.status === "empty" &&
                                                    styles.empty,
                                                seat.status === "disabled" &&
                                                    styles.disabled
                                            )}
                                            onClick={() =>
                                                handleSeatClick(
                                                    seat.row,
                                                    seat.column,
                                                    seat.id,
                                                    seat.type,
                                                    seat.status
                                                )
                                            }
                                        >
                                            {seat.row}
                                            {seat.column}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>
            )}
            <EditSeats
                roomId={roomId}
                isModalOpen={isModalOpen}
                handleOk={() => setIsModalOpen(false)}
                handleCancel={() => setIsModalOpen(false)}
                selectedSeat={selectedSeat}
            />
        </div>
    );
};

export default MatrixSeatRender;
