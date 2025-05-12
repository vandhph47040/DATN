import React, { useEffect, useRef, useState } from "react";
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import type {
    InputRef,
    TableColumnsType,
    TableColumnType,
    TableProps,
} from "antd";
import {
    Button,
    Divider,
    Input,
    message,
    Popconfirm,
    Skeleton,
    Space,
    Table,
    Tag,
} from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import DetailFilm from "../FilmManage/DetailFilm";
import EditFilm from "../FilmManage/EditFilm";
import { FormData } from "../../../types/interface";
import clsx from "clsx";
import styles from "../globalAdmin.module.css";
import {
    useDeleteFilm,
    useFilmManage,
    useUpdateFilm,
} from "../../../services/adminServices/filmManage.service";

type DataIndex = keyof FormData;

const FilmManage: React.FC = () => {
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const [messageApi, holderMessageApi] = message.useMessage();
    const [activeFilterColumn, setActiveFilterColumn] =
        useState<DataIndex | null>(null); // kiểm tra xem có dùng filter không
    const [selectionType, setSelectionType] = useState<"checkbox" | "radio">(
        "checkbox"
    );
    const searchInput = useRef<InputRef>(null);
    const { data: films, isLoading, isError } = useFilmManage();
    const deleteFilm = useDeleteFilm(messageApi);

    const handleSearch = (
        selectedKeys: string[],
        confirm: FilterDropdownProps["confirm"],
        dataIndex: DataIndex
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
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
        dataIndex: DataIndex
    ): TableColumnType<FormData> => ({
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
                    onPressEnter={() => {
                        handleSearch(
                            selectedKeys as string[],
                            confirm,
                            dataIndex
                        );
                        setActiveFilterColumn(null);
                    }}
                    style={{ marginBottom: 8, display: "block" }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => {
                            handleSearch(
                                selectedKeys as string[],
                                confirm,
                                dataIndex
                            );
                            setActiveFilterColumn(null);
                        }}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => {
                            clearFilters && handleReset(clearFilters);
                            setActiveFilterColumn(null);
                        }}
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
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                            setActiveFilterColumn(null);
                        }}
                    >
                        Close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: () => {
            // Ẩn icon ở các cột không được chọn
            if (activeFilterColumn && activeFilterColumn !== dataIndex)
                return null;
            return (
                <SearchOutlined
                    style={{
                        color:
                            activeFilterColumn === dataIndex
                                ? "#1677ff"
                                : undefined,
                    }}
                    onClick={() => setActiveFilterColumn(dataIndex)}
                />
            );
        },
        onFilter: (value, record: any) => {
            const recordValue = record[dataIndex];
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

    const onRowSelectionChange = (
        selectedRowKeys: React.Key[],
        selectedRows: FormData[]
    ) => {
        console.log(
            `selectedRowKeys: ${selectedRowKeys}`,
            "selectedRows: ",
            selectedRows
        );
    };
    const rowSelection: TableProps<FormData>["rowSelection"] = {
        onChange: onRowSelectionChange,
        getCheckboxProps: (record: FormData) => ({
            disabled: record.title === "Disabled Film",
            name: record.title,
        }),
    };

    const renderDetailFilm = React.useCallback(
        (text: string, item: any) => (
            <DetailFilm id={item.id} film={text}></DetailFilm>
        ),
        []
    );

    const columns: TableColumnsType<FormData> = React.useMemo(
        () => [
            {
                title: "Tên Phim",
                dataIndex: "title",
                key: "title",
                ...getColumnSearchProps("title"),
                render: renderDetailFilm,
            },
            {
                title: "Đạo diễn",
                dataIndex: "directors",
                key: "directors",
                ...getColumnSearchProps("directors"),
                onFilter: (value: any, record: any) => {
                    const directorName = record.directors?.name_director || "";
                    return removeAccents(directorName).includes(
                        removeAccents(value)
                    );
                },
                render: (records: any) => {
                    return (
                        <div
                            className={clsx(
                                styles.directorsColumn,
                                "cliptextTitle"
                            )}
                        >
                            {records.name_director}
                        </div>
                    );
                },
            },
            {
                title: "Thể loại",
                dataIndex: "genres",
                key: "genres",
                width: 190,
                ...getColumnSearchProps("genres"),
                onFilter: (value: any, record: any) => {
                    const genreNames = record.genres
                        ? record.genres.map((g: any) => g.name_genre).join(", ")
                        : "";
                    return removeAccents(genreNames).includes(
                        removeAccents(value)
                    );
                },

                render: (genres: any) => {
                    if (!Array.isArray(genres)) {
                        genres = [genres];
                    }

                    const colorMap: { [key: string]: string } = {
                        "Hành động": "volcano",
                        "Chính kịch": "geekblue",
                        "Hài hước": "green",
                        "Kinh dị": "red",
                        "Phiêu lưu": "orange",
                        "Lãng mạn": "violet",
                        "Tình cảm": "pink",
                    };
                    return (
                        <div
                            className={clsx(
                                styles.genresColumn,
                                "cliptextTitle"
                            )}
                        >
                            {genres.map((genre: any, index: number) => {
                                const color =
                                    colorMap[genre.name_genre] || "blue";
                                return (
                                    <Tag
                                        color={color}
                                        key={index}
                                        style={{ marginBottom: "5px" }}
                                    >
                                        {genre.name_genre}
                                    </Tag>
                                );
                            })}
                        </div>
                    );
                },
            },
            {
                title: "Ngày phát hành",
                dataIndex: "release_date",
                key: "release_date",
                ...getColumnSearchProps("release_date"),
                onFilter: (value: any, record) => {
                    return removeAccents(record.release_date).includes(
                        removeAccents(value)
                    );
                },
                render: (record: any) => <span>{record}</span>,
            },
            {
                title: "Thời lượng",
                dataIndex: "running_time",
                key: "running_time",
                render: (time: number) => {
                    return `${time}`;
                },
            },
            {
                title: "Trạng thái",
                dataIndex: "movie_status",
                key: "movie_status",
                ...getColumnSearchProps("movie_status"),
                render: (_: string, record: any) => {
                    // const today = new Date();
                    // const releaseDate = new Date(record.release_date);

                    // const shouldBeNowShowing = releaseDate <= today;
                    // const updatedStatus = shouldBeNowShowing
                    //     ? "now_showing"
                    //     : record.movie_status;
                    return (
                        // <Tag
                        //     color={
                        //         updatedStatus === "now_showing"
                        //             ? "green"
                        //             : "red"
                        //     }
                        // >
                        //     {updatedStatus}
                        // </Tag>
                        <Tag
                            color={
                                record.movie_status === "now_showing"
                                    ? "green"
                                    : "red"
                            }
                        >
                            {record.movie_status}
                        </Tag>
                    );
                },
            },
            {
                title: "Trailer",
                dataIndex: "trailer",
                key: "trailer",
                render: (trailer: string) => {
                    return (
                        <a href={trailer} target="_blank">
                            Xem Trailer
                        </a>
                    );
                },
            },
            {
                title: "Hành động",
                render: (_, items: any) => {
                    return (
                        <Space>
                            <Popconfirm
                                title="Xóa phim này?"
                                description="Bạn có chắc chắn muốn xóa không?"
                                okText="Yes"
                                onConfirm={() => handleDelete(items.id)}
                                cancelText="No"
                            >
                                <Button type="primary" danger>
                                    <DeleteOutlined /> Xóa
                                </Button>
                            </Popconfirm>
                            <EditFilm id={items.id}></EditFilm>
                        </Space>
                    );
                },
            },
        ],
        [renderDetailFilm]
    );

    const dataSource = React.useMemo(() => films, [films]);

    const handleDelete = (id: number) => {
        deleteFilm.mutate(id);
    };

    return (
        <div>
            {holderMessageApi}
            <Divider />
            <Skeleton loading={isLoading} active>
                <Table<FormData>
                    columns={columns}
                    dataSource={dataSource}
                    rowSelection={{ type: selectionType, ...rowSelection }}
                    rowClassName={() => clsx(styles.customRow)}
                />
            </Skeleton>
        </div>
    );
};

export default FilmManage;
