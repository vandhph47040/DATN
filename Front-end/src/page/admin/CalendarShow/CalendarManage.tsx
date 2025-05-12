import React, { useRef, useState } from "react";
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import type { InputRef, TableColumnType } from "antd";
import {
    Button,
    Input,
    message,
    Popconfirm,
    Skeleton,
    Space,
    Table,
    Tag,
} from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import AddCalendar from "../CalendarShow/AddCalendar";
import Column from "antd/es/table/Column";
import ColumnGroup from "antd/es/table/ColumnGroup";
import EditCalendar from "../CalendarShow/EditCalendar";
import "@ant-design/v5-patch-for-react-19";
import { DataTypeGenresActorsDirectors } from "../../../types/interface";
import RefreshBtn from "../RefreshBtn/RefreshBtn";
import {
    useCalendarManage,
    useDeleteCalendar,
    usePublishCalendarShowtime,
} from "../../../services/adminServices/calendarManage.service";

type DataIndex = keyof DataTypeGenresActorsDirectors;

const CalendarManage: React.FC = () => {
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState<
        string | string[] | null
    >(null);
    const searchInput = useRef<InputRef>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [activeFilterColumn, setActiveFilterColumn] = useState<
        DataIndex | string[] | null
    >(null);
    const [refresh, setRefresh] = useState(false);

    const handleSearch = (
        selectedKeys: string[],
        confirm: FilterDropdownProps["confirm"],
        dataIndex: DataIndex | string[]
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        // Chuyển mảng thành chuỗi hoặc giữ nguyên nếu là chuỗi
        const columnKey = Array.isArray(dataIndex)
            ? dataIndex.join(".")
            : dataIndex;
        setSearchedColumn(columnKey);
        setActiveFilterColumn(null);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText("");
    };

    // Hàm chuẩn hóa chuỗi (xoá dấu tiếng Việt)
    const removeAccents = (str: string) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    };

    const getColumnSearchProps = (
        dataIndex: DataIndex | string[]
    ): TableColumnType<any> => ({
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
                    placeholder={`Search`}
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
                            setSearchText((selectedKeys as string[])[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button type="link" size="small" onClick={() => close()}>
                        Close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: () =>
            activeFilterColumn === dataIndex ? (
                <SearchOutlined style={{ color: "#1677ff" }} />
            ) : (
                <SearchOutlined />
            ),
        onFilter: (value, record) => {
            const recordValue = Array.isArray(dataIndex)
                ? dataIndex.reduce(
                      (obj, key) => (obj ? obj[key] : null),
                      record
                  )
                : record[dataIndex];

            if (!recordValue) return false;

            const normalizedRecord = removeAccents(recordValue.toString());
            const normalizedValue = removeAccents(value as string);

            return normalizedRecord.includes(normalizedValue);
        },
        filterDropdownProps: {
            onOpenChange: (open) => {
                if (open) {
                    setActiveFilterColumn(dataIndex);
                    setTimeout(() => searchInput.current?.select(), 100);
                } else {
                    setActiveFilterColumn(null);
                }
            },
        },
        render: (text) => (searchedColumn === dataIndex ? text : text),
    });

    const { data: calendarManage, isLoading } = useCalendarManage(); // lấy danh sách lịch chiếu

    const { mutate: deleteCalendar } = useDeleteCalendar(messageApi); // xóa lịch chiếu

    const { mutate: publishCalendar } = usePublishCalendarShowtime(messageApi);

    const handleChangeStatus = (item: any) => {
        publishCalendar({
            id: item.id,
            formData: { is_public: !item.is_public },
        });
        setRefresh((prev) => !prev);
    };

    return (
        <div>
            <AddCalendar></AddCalendar>
            <RefreshBtn queryKey={["showtimesFilm"]}></RefreshBtn>
            {contextHolder}
            <Skeleton loading={isLoading} active>
                <Table<DataTypeGenresActorsDirectors>
                    dataSource={calendarManage}
                >
                    <Column
                        title="Tên phim"
                        dataIndex={["movie", "title"]}
                        key="movie_title"
                        {...getColumnSearchProps(["movie", "title"])}
                        render={(_, record) => (
                            <span
                                style={{
                                    color: "var(--border-color)",
                                    fontWeight: 500,
                                    fontSize: "16px",
                                }}
                            >
                                {record?.movie?.title || "Không có tên"}
                            </span>
                        )}
                    />

                    <ColumnGroup title="Thời gian chiếu">
                        <Column
                            title="Ngày bắt đầu"
                            dataIndex="show_date"
                            key="show_date"
                            sorter={(a, b) =>
                                new Date(a.show_date).getTime() -
                                new Date(b.show_date).getTime()
                            }
                        />
                        <Column
                            title="Ngày kết thúc"
                            dataIndex="end_date"
                            key="end_date"
                        />
                    </ColumnGroup>
                    <Column
                        title="Phân loại"
                        dataIndex={["movie", "movie_status"]} // Truy cập trực tiếp
                        key="movie_status"
                        sorter={
                            (a, b) =>
                                a.movie.movie_status.localeCompare(
                                    b.movie.movie_status
                                ) // So sánh chuỗi
                        }
                        render={(_, record: any) => {
                            if (!record.movie) {
                                return <Tag color="gray">Không có dữ liệu</Tag>;
                            }
                            return record.movie.movie_status ===
                                "now_showing" ? (
                                <Tag color="green">Đang chiếu</Tag>
                            ) : (
                                <Tag color="red">Sắp chiếu</Tag>
                            );
                        }}
                    />

                    <Column
                        title="Action"
                        key="action"
                        render={(
                            _: any,
                            record: DataTypeGenresActorsDirectors
                        ) => {
                            console.log(record);

                            return (
                                <Space size="middle">
                                    <Popconfirm
                                        title="Xóa lịch chiếu phim này?"
                                        description="Bạn có chắc chắn muốn xóa không?"
                                        okText="Yes"
                                        onConfirm={() =>
                                            deleteCalendar(record.id)
                                        }
                                        cancelText="No"
                                    >
                                        <Button type="primary" danger>
                                            <DeleteOutlined /> Xóa
                                        </Button>
                                    </Popconfirm>
                                    <EditCalendar id={record.id}></EditCalendar>
                                    <Button
                                        onClick={() =>
                                            handleChangeStatus(record)
                                        }
                                        style={{
                                            backgroundColor: record.is_public
                                                ? "#722ED1"
                                                : undefined,
                                            color: record.is_public
                                                ? "#fff"
                                                : undefined,
                                            borderColor: record.is_public
                                                ? "#722ED1"
                                                : undefined,
                                        }}
                                    >
                                        {record.is_public
                                            ? "Published"
                                            : "Publish"}
                                    </Button>
                                </Space>
                            );
                        }}
                    />
                </Table>
            </Skeleton>
        </div>
    );
};

export default CalendarManage;
