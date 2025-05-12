import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GET_DIRECTORS_LIST } from "../../config/ApiConfig";
import { useAdminContext } from "../../AdminComponents/UseContextAdmin/adminContext";
import { useEffect } from "react";

export const useDirectorsManage = () => {
    const { setDirectors } = useAdminContext();

    const { data, refetch } = useQuery({
        queryKey: ["Directors"],
        queryFn: async () => {
            const { data } = await axios.get(GET_DIRECTORS_LIST);
            return data.map((item: any) => ({
                label: item.name_director,
                value: item.id,
            }));
        },
        refetchOnMount: false,
        staleTime: 1000 * 60 * 20,
        cacheTime: 1000 * 60 * 60,
    });

    useEffect(() => {
        if (data) {
            setDirectors(data);
        }
    }, [data, setDirectors]);

    return { refetch };
};
