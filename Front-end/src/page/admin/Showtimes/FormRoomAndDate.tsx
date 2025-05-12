import React from "react";
import { Button, DatePicker, Form, Select } from "antd";
import { FieldType } from "../../../types/interface";
import dayjs from "dayjs";

interface Props {
    form: any;
    rooms: any[];
    isRoomsLoading: boolean;
    onFinish: (formData: any) => void;
    onRoomChange: (value: string) => void;
    onDateChange: (date: dayjs.Dayjs | null) => void;
}

const SearchByRoomAndDateForm: React.FC<Props> = ({
    form,
    rooms,
    isRoomsLoading,
    onFinish,
    onRoomChange,
    onDateChange,
}) => {
    return (
        <Form
            name="searchRoomDate"
            onFinish={onFinish}
            autoComplete="off"
            layout="inline"
            form={form}
        >
            <Form.Item<FieldType>
                label="Phòng chiếu:"
                name="room_id"
                rules={[{ required: true, message: "Thêm phòng chiếu" }]}
            >
                <Select
                    placeholder="Phòng chiếu"
                    style={{ width: "120px" }}
                    onChange={onRoomChange}
                    loading={isRoomsLoading}
                >
                    {rooms?.map((item: any) => (
                        <Select.Option value={item.id} key={item.id}>
                            {item.name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item<FieldType>
                label="Ngày chiếu:"
                name="date"
                rules={[{ required: true, message: "Thêm ngày chiếu" }]}
            >
                <DatePicker onChange={onDateChange} />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Tìm kiếm
                </Button>
            </Form.Item>
        </Form>
    );
};

export default SearchByRoomAndDateForm;
