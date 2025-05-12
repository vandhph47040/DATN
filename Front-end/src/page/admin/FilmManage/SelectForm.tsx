import { useQuery } from "@tanstack/react-query";
import { Select } from "antd";
import axios from "axios";
import React, { useEffect, useMemo, useCallback } from "react";
import { SelectFormProps } from "../../../types/interface";
import authService from "../../../services/auth.service";

const SelectForm: React.FC<SelectFormProps> = React.memo(
    ({
        queryKey,
        endpoint,
        labelKey = "name_actor",
        valueKey = "name_actor",
        onChange,
        form,
        placeholder = "Please select",
    }) => {
        const { data, refetch, isError, error } = useQuery({
            queryKey: [queryKey],
            queryFn: async () => {
                try {
                    // Lấy token từ authService
                    const token = authService.getToken();

                    // Gọi API với token trong header
                    const { data } = await axios.get(endpoint, {
                        headers: {
                            Authorization: token ? `Bearer ${token}` : "",
                        },
                    });

                    return data.map((item: any) => ({
                        label: item[labelKey],
                        value: item[valueKey],
                    }));
                } catch (error: any) {
                    // Trả về mảng rỗng để tránh lỗi khi render
                    return [];
                }
            },
            staleTime: 1000 * 60 * 15,
            retry: 1, // Giảm số lần thử lại để tránh quá nhiều request lỗi
        });

        // Memo hóa options để tránh render lại khi không cần thiết
        const options = useMemo(() => data ?? [], [data]);

        // Memo hóa handleChange để tránh tạo lại mỗi lần render
        const handleChange = useCallback(
            (value: string[]) => {
                form?.setFieldsValue({ [queryKey]: value });
                onChange?.(value, queryKey);
            },
            [form, onChange, queryKey]
        );

        return (
            <Select
                mode="multiple"
                allowClear
                style={{ width: "100%" }}
                placeholder={
                    isError ? `Không thể tải ${placeholder}` : placeholder
                }
                onChange={handleChange}
                options={options}
                value={form?.getFieldValue(labelKey)}
                loading={!data && !isError}
                disabled={isError}
            />
        );
    }
);

export default SelectForm;
