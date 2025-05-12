import React, { useRef, useState } from "react";
import {
    Button,
    Input,
    InputRef,
    Space,
    Table,
    TableColumnsType,
    TableColumnType,
    Tag,
} from "antd";
import { FilterDropdownProps } from "antd/es/table/interface";
import { CopyOutlined, SearchOutlined } from "@ant-design/icons";
import { OrdersType } from "../../../types/interface";
import OrderDetail from "../Order/Orderdetail";
import { useExportPDFOrder } from "../../../services/adminServices/orderManage.service";

type DataIndex = keyof OrdersType;

const CheckinTable = ({ orderListManage, selectedStatus }: any) => {
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [exportedOrderIds, setExportedOrderIds] = useState<number[]>(() => {
        const stored = localStorage.getItem("exportedOrderIds");
        return stored ? JSON.parse(stored) : [];
    });

    const handleSearch = (
        selectedKeys: string[],
        confirm: FilterDropdownProps["confirm"],
        dataIndex: DataIndex
    ) => {
        confirm();
        setSearchedColumn(dataIndex);
    };

    const getColumnSearchProps = (
        dataIndex: DataIndex
    ): TableColumnType<OrdersType> => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
            close,
        }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() =>
                        handleSearch(
                            selectedKeys as string[],
                            confirm,
                            dataIndex
                        )
                    }
                    style={{ marginBottom: 8, display: "block" }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() =>
                            handleSearch(
                                selectedKeys as string[],
                                confirm,
                                dataIndex
                            )
                        }
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() =>
                            clearFilters && handleReset(clearFilters)
                        }
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined
                style={{ color: filtered ? "#1677ff" : undefined }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()),
        filterDropdownProps: {
            onOpenChange(open) {
                if (open) {
                    setTimeout(() => searchInput.current?.select(), 100);
                }
            },
        },
        render: (text) => searchedColumn === dataIndex && text,
    });

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
    };

    // Tạo cache lưu trữ màu cho từng giá trị room_name
    const roomColorMap: Record<string, string> = {};

    //  màu ngẫu nhiên
    const getRandomColor = () => {
        const colors = [
            "magenta",
            "red",
            "volcano",
            "orange",
            "gold",
            "lime",
            "green",
            "cyan",
            "blue",
            "geekblue",
            "purple",
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const renderDetailOrder = React.useCallback(
        (text: string, item: any) => (
            <OrderDetail id={item.id} showDataUser={false}></OrderDetail>
        ),
        []
    );
    const { mutate } = useExportPDFOrder();

    //api xuất pdf
    const handleExportPDF = (bookingId: number) => {
        mutate(bookingId, {
            onSuccess: () => {
                setExportedOrderIds((prev) => {
                    const updated = [...prev, bookingId];
                    localStorage.setItem(
                        "exportedOrderIds",
                        JSON.stringify(updated)
                    );
                    return updated;
                });
            },
        });
    };

    const columns: TableColumnsType<OrdersType> = [
        {
            title: "Mã đơn hàng",
            dataIndex: "id",
            key: "id",
            width: "200px",
            ...getColumnSearchProps("id"),
            render: (value: any, record: any) =>
                record.check_in === "waiting"
                    ? renderDetailOrder(value, record)
                    : record.id,
        },
        {
            title: "Tên phim",
            dataIndex: "movie_title",
            key: "movie_title",
            width: "20%",
            render: (value: string, record: any) => (
                <span>{record.movie_title}</span>
            ),
        },
        {
            title: "Suất chiếu",
            dataIndex: "showtime",
            key: "showtime",
            render: (value: string, record: any) => (
                <Tag color="volcano">{record.showtime}</Tag>
            ),
        },
        {
            title: "Phòng chiếu",
            dataIndex: "room_name",
            key: "room_name",
            render: (value: string) => {
                // Kiểm tra nếu chưa có màu cho room_name, thì tạo màu mới
                if (!roomColorMap[value]) {
                    roomColorMap[value] = getRandomColor();
                }
                return <Tag color={roomColorMap[value]}>{value}</Tag>;
            },
        },
        {
            title: "Trạng thái sử dụng",
            dataIndex: "check_in",
            key: "check_in",

            render: (value: any, record: any) => {
                const color =
                    record.check_in === "checked_in"
                        ? "geekblue"
                        : record.check_in === "waiting"
                        ? "purple"
                        : "default"; // Giá trị mặc định nếu không vắng

                return (
                    <Tag color={color}>
                        {record.check_in === "checked_in"
                            ? "Đã đến"
                            : record.check_in === "waiting"
                            ? "Đang đợi"
                            : "Vắng mặt"}
                    </Tag>
                );
            },
        },
        ...(selectedStatus === "checked_in"
            ? [
                  {
                      title: "Xuất vé",
                      dataIndex: "exportTicket",
                      key: "exportTicket",
                      render: (value: any, record: any) => {
                          const isExported = exportedOrderIds.includes(
                              record.id
                          );

                          return (
                              <Button
                                  onClick={() => handleExportPDF(record.id)}
                                  style={{
                                      backgroundColor: isExported
                                          ? "#13C2C2"
                                          : undefined,
                                      color: isExported ? "#fff" : undefined,
                                      borderColor: isExported
                                          ? "#13C2C2"
                                          : undefined,
                                  }}
                              >
                                  <CopyOutlined />
                                  {isExported ? "Đã xuất vé" : "Xuất vé"}
                              </Button>
                          );
                      },
                  },
              ]
            : []),
    ];

    return <Table<OrdersType> columns={columns} dataSource={orderListManage} />;
};

export default CheckinTable;
