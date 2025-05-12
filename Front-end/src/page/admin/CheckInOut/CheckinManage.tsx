import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import styles from "./CheckInOut.module.css";
import { Divider, Tag } from "antd";
import { useOrdersList } from "../../../services/adminServices/orderManage.service";
import dayjs from "dayjs";
import CheckinTable from "./CheckinTable";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { QrcodeOutlined } from "@ant-design/icons";

const CheckinManage = () => {
    const [datePicker, setDatePicker] = useState<string>(""); // ngày chọn
    const [orderListManage, setOrderListManage] = useState([]); // dữ liệu từ API
    const [waitingTickets, setWaitingTickets] = useState(0);
    const [checkedTickets, setCheckedTickets] = useState(0);
    const [absentTickets, setAbsentTickets] = useState(0);
    const [showTable, setShowTable] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null); // Trạng thái được chọn
    const day = dayjs();

    // Gọi API danh sách đơn hàng
    const { data: orderList, isLoading } = useOrdersList();

    //format ngày và set dữ liệu
    useEffect(() => {
        setOrderListManage(orderList);
        setDatePicker(day.format("DD-MM-YYYY"));
    }, [orderList, day]);

    // Xử lý số lượng vé hiển thị
    useEffect(() => {
        const waitingCount = orderList?.filter(
            (item: any) =>
                item.check_in === "waiting" && item.show_date === datePicker
        ).length;
        setWaitingTickets(waitingCount);

        const checkedCount = orderList?.filter(
            (item: any) =>
                item.check_in === "checked_in" && item.show_date === datePicker
        ).length;
        setCheckedTickets(checkedCount);

        const absentCount = orderList?.filter(
            (item: any) =>
                item.check_in === "absent" && item.show_date === datePicker
        ).length;
        setAbsentTickets(absentCount);
    }, [orderList, datePicker]);

    // Xử lý khi click vào từng trạng thái
    const toggleTable = (status: string, color: string) => {
        if (selectedStatus === status) {
            setShowTable(false);
            setSelectedStatus(null);
        } else {
            setShowTable(true);
            setSelectedStatus(status);
            document.documentElement.style.setProperty("--line-color", color);
        }
    };

    // Lọc danh sách theo trạng thái đã chọn
    const newOrderList = selectedStatus
        ? orderListManage?.filter((item: any) => {
              return (
                  item.check_in === selectedStatus &&
                  item.show_date === datePicker
              );
          })
        : [];

    // lấy camera của máy tính
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [resultScanQr, setResultScanQr] = useState("");
    const [showVideo, setShowVideo] = useState(false);
    const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
    const controlsRef = useRef<{ stop: () => void } | null>(null);

    const handleScanQR = () => {
        if (showVideo && controlsRef.current) {
            controlsRef.current.stop(); // Tắt camera
            setShowVideo(false);
            setResultScanQr("");
            return;
        }
        setShowVideo(true);
    };

    // xử lý quét QR
    useEffect(() => {
        if (showVideo) {
            const codeReader = new BrowserMultiFormatReader();
            codeReaderRef.current = codeReader;

            codeReader
                .decodeFromVideoDevice(
                    undefined,
                    videoRef.current!,
                    (result, err) => {
                        if (result) {
                            setResultScanQr(result.getText());
                        }
                    }
                )
                .then((controls) => {
                    controlsRef.current = controls; // Lưu lại controls để tắt camera sau này
                });

            return () => {
                if (controlsRef.current) {
                    controlsRef.current.stop(); // Đảm bảo tắt camera khi component unmount
                }
            };
        }
    }, [showVideo]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.today}>
                    Check-in hôm nay: {datePicker}
                </div>
                <div className={styles.ticketSummary}>
                    <Tag
                        color="purple"
                        className={clsx(styles.ticket, styles.waiting)}
                    >
                        Số vé đang đợi: {waitingTickets}
                    </Tag>
                    <Tag
                        color="geekblue"
                        className={clsx(styles.ticket, styles.checked)}
                    >
                        Số vé đã kiểm tra: {checkedTickets}
                    </Tag>
                    <Tag className={clsx(styles.ticket, styles.absent)}>
                        Số vé bỏ trống: {absentTickets}
                    </Tag>
                </div>
            </div>
            <Divider>Trạng thái ngày: {datePicker} </Divider>
            <div className={clsx(styles.mainSub)}>
                <div className={clsx(styles.scanQR)}>
                    <div className={clsx(styles.boxScan)}>
                        <span
                            className={clsx(styles.btnScan)}
                            onClick={handleScanQR}
                        >
                            <span className={clsx(styles.icon)}>
                                <QrcodeOutlined />
                            </span>{" "}
                            <span>
                                {showVideo ? "Dừng Scan QR" : "Scan QR"}
                            </span>
                        </span>
                    </div>
                    {showVideo && (
                        <>
                            <div className={clsx(styles.boxScan)}>
                                {" "}
                                <video
                                    ref={videoRef}
                                    style={{ width: "85%" }}
                                />
                            </div>

                            <div className={clsx(styles.text)}>
                                Di chuyển QR vào giữa khung hình để quét
                            </div>
                        </>
                    )}
                    {resultScanQr && showVideo && (
                        <div className={clsx(styles.resultScanQr)}>
                            <span>Thông tin vé:</span>

                            <div>
                                {resultScanQr.split(".").map((item, index) => (
                                    <div
                                        key={index}
                                        className={clsx(styles.resultItem)}
                                    >
                                        {item.trim()}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className={clsx(styles.renderTable)}>
                    <div className={styles.orderSections}>
                        <Tag
                            className={clsx(styles.title, {
                                [styles.active]: selectedStatus === "waiting",
                            })}
                            color="purple"
                            onClick={() => toggleTable("waiting", "purple")}
                        >
                            Vé đang đợi Check-in
                        </Tag>
                        <Tag
                            className={clsx(styles.title, {
                                [styles.active]:
                                    selectedStatus === "checked_in",
                            })}
                            color="geekblue"
                            onClick={() => toggleTable("checked_in", "blue")}
                        >
                            Vé đã được kiểm tra
                        </Tag>
                        <Tag
                            className={clsx(styles.title, {
                                [styles.active]: selectedStatus === "absent",
                            })}
                            onClick={() => toggleTable("absent", "gray")}
                        >
                            Vé bị bỏ trống
                        </Tag>
                    </div>

                    {showTable && (
                        <CheckinTable
                            className={clsx(styles.tableCheckIn)}
                            orderListManage={newOrderList}
                            selectedStatus={selectedStatus}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckinManage;
