import React, { useEffect, useRef, useState } from "react";
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import type { InputRef, TableColumnsType, TableColumnType } from "antd";
import {
    Button,
    Input,
    message,
    Popconfirm,
    Skeleton,
    Space,
    Table,
} from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { DELETE_DIRECTORS, GET_ACTOR_LIST } from "../../../config/ApiConfig";
import AddActor from "./AddActors";
import EditActor from "./EditActors";
import { DataTypeGenresActorsDirectors } from "../../../types/interface";

type DataIndex = keyof DataTypeGenresActorsDirectors;

const ActorsManage: React.FC = () => {
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();

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
    ): TableColumnType<DataTypeGenresActorsDirectors> => ({
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
        onFilter: (value, record) => {
            const recordValue = record[dataIndex];
            if (!recordValue) return false;

            const normalizedRecord = removeAccents(recordValue.toString());
            const normalizedValue = removeAccents(value as string);

            return normalizedRecord.includes(normalizedValue);
        },

        filterDropdownProps: {
            onOpenChange(open) {
                if (open) {
                    setTimeout(() => searchInput.current?.select(), 100);
                }
            },
        },
        render: (text) => searchedColumn === dataIndex && text,
    });

    const columns: TableColumnsType<DataTypeGenresActorsDirectors> = [
        {
            title: "Diễn viên",
            dataIndex: "name_actor",
            key: "name_actor",
            ...getColumnSearchProps("name_actor"),
            render: (_, record: any) => {
                console.log("record", record);
                return <span>{record.name_actor}</span>;
            },
        },
        {
            title: "Hành động",
            render: (_, items: any) => {
                return (
                    <Space>
                        <Popconfirm
                            title="Xóa diễn viên này?"
                            description="Bạn có chắc chắn muốn xóa không?"
                            okText="Yes"
                            onConfirm={() => {
                                mutate(items.id);
                            }}
                            cancelText="No"
                        >
                            <Button type="primary" danger>
                                <DeleteOutlined /> Xóa
                            </Button>
                        </Popconfirm>
                        <EditActor id={items.id}></EditActor>
                    </Space>
                );
            },
        },
    ];

    const { data, isLoading, isError } = useQuery({
        queryKey: ["Actors"],
        queryFn: async () => {
            const { data } = await axios.get(`${GET_ACTOR_LIST}`);
            console.log(data);

            return data.map((item: any) => ({
                ...item,
                key: item.id,
            }));
        },
    });

    const { mutate } = useMutation({
        mutationFn: async (id: number) => {
            await axios.delete(DELETE_DIRECTORS(id));
        },
        onSuccess: () => {
            messageApi.success("Xóa thành công");
            queryClient.invalidateQueries({
                queryKey: ["Actors"],
            });
        },
        onError: () => {
            messageApi.error(
                "Không thể xóa diễn viên đang tham gia phim đang chiếu"
            );
        },
    });

    return (
        <>
            <AddActor></AddActor>
            {contextHolder}
            <Skeleton loading={isLoading}>
                <Table<DataTypeGenresActorsDirectors>
                    columns={columns}
                    dataSource={data}
                />
            </Skeleton>
        </>
    );
};

export default ActorsManage;
