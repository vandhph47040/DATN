import React from "react";
import { Button, Divider, message, Popconfirm, Skeleton, Table } from "antd";
import type { TableColumnsType } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import DetailFilm from "./DetailFilm";
import {
    GET_FILM_LIST,
    RESTORE_FILM,
    DETAIL_DELETE_FILM,
} from "../../../config/ApiConfig";

interface DataType {
    key: React.Key;
    id: number;
    name: string;
    age: number;
    address: string;
}

const StoppedMovies: React.FC = () => {
    const [messageApi, holderMessageApi] = message.useMessage();
    const queryClient = useQueryClient();

    const columns: TableColumnsType<DataType> = [
        {
            title: "Tên Phim",
            dataIndex: "title",
            key: "title",
            render: (text: string, item: any) => (
                <DetailFilm
                    id={item.id}
                    film={text}
                    apiUrl={`${DETAIL_DELETE_FILM(item.id)}`}
                ></DetailFilm>
            ),
        },

        {
            title: "Hành động",
            render: (_, items: any) => {
                return (
                    <Popconfirm
                        title="Khôi phục phim này?"
                        description="khôi phục nhé"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => restore(items.id)}
                    >
                        <Button type="primary">Khôi phục</Button>
                    </Popconfirm>
                );
            },
        },
    ];

    const { data, isLoading, isError } = useQuery({
        queryKey: ["StoppedMovies"],
        queryFn: async () => {
            const { data } = await axios.get(`${GET_FILM_LIST}`);
            console.log(data);

            return data.trashed_movies.map((item: any) => ({
                ...item,
                key: item.id,
            }));
        },
        staleTime: 1000 * 60 * 10,
    });

    const { mutate: restore } = useMutation({
        mutationFn: async (id: number) => {
            await axios.put(RESTORE_FILM(id));
            console.log(RESTORE_FILM(id));
        },
        onSuccess: () => {
            messageApi.success("Khôi phục phim thành công");
            queryClient.invalidateQueries({
                queryKey: ["StoppedMovies"],
            });
            queryClient.invalidateQueries({
                queryKey: ["filmList"],
            });
        },
    });
    return (
        <div>
            {holderMessageApi}
            <Divider />
            <Skeleton loading={isLoading} active>
                <Table<DataType> columns={columns} dataSource={data} />
            </Skeleton>
        </div>
    );
};

export default StoppedMovies;
