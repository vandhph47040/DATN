import React from "react";
import type { TableColumnsType } from "antd";
import { Button, message, Popconfirm, Skeleton, Table } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { DELETE_GENRES, GET_GENRES } from "../../../config/ApiConfig";
import AddGenre from "./AddGenre";
import { DeleteOutlined } from "@ant-design/icons";
import { DataTypeGenresActorsDirectors } from "../../../types/interface";

const GenresManage: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();

    const columns: TableColumnsType<DataTypeGenresActorsDirectors> = [
        {
            title: "Thể loại",
            dataIndex: "genres",
            key: "genres",
            render: (_, record: any) => <span>{record.name_genre}</span>,
        },
        {
            title: "Hành động",
            render: (_, items: any) => {
                return (
                    <Popconfirm
                        title="Xóa thể loại này?"
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
                );
            },
        },
    ];

    const { data, isLoading, isError } = useQuery({
        queryKey: ["Genres"],
        queryFn: async () => {
            const { data } = await axios.get(`${GET_GENRES}`);
            console.log(data);

            return data.map((item: any) => ({
                ...item,
                key: item.id,
            }));
        },
    });

    const { mutate } = useMutation({
        mutationFn: async (id: number) => {
            await axios.delete(DELETE_GENRES(id));
        },
        onSuccess: () => {
            messageApi.success("Xóa thành công");
            queryClient.invalidateQueries({
                queryKey: ["Genres"],
            });
        },
        onError: (error) => {
            messageApi.error(error.message);
        },
    });

    return (
        <>
            <AddGenre></AddGenre>
            <Skeleton loading={isLoading}>
                <Table<DataTypeGenresActorsDirectors>
                    columns={columns}
                    dataSource={data}
                />
            </Skeleton>
        </>
    );
};

export default GenresManage;
