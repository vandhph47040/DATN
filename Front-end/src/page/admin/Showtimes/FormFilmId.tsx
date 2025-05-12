import React from "react";
import { Button, Form, Select, Spin } from "antd";
import { FieldType } from "../../../types/interface";

interface Props {
    form: any;
    films: any[];
    isLoading: boolean;
    onFinish: (formData: any) => void;
    onFilmChange: (value: number) => void;
}

const SearchByFilmForm: React.FC<Props> = ({
    form,
    films,
    isLoading,
    onFinish,
    onFilmChange,
}) => {
    return (
        <Form
            name="searchByFilm"
            onFinish={onFinish}
            autoComplete="off"
            layout="inline"
            form={form}
        >
            <Form.Item<FieldType>
                label="Phim:"
                name="movie_id"
                rules={[{ required: true, message: "Chọn phim cần tìm" }]}
            >
                <Select
                    placeholder="Chọn phim"
                    style={{ width: "220px" }}
                    onChange={onFilmChange}
                    loading={isLoading}
                >
                    {films?.map((item: any) => (
                        <Select.Option key={item.id} value={item.id}>
                            {item.title}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Tìm kiếm
                </Button>
            </Form.Item>
        </Form>
    );
};

export default SearchByFilmForm;
