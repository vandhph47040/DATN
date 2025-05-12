import { PlusCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Modal, Select } from "antd";
import { useState } from "react";
import {
  useTicketsPrice,
  useUpdateTicketPrice,
} from "../../../services/adminServices/ticketPrice.service";

const AddTicketPrice = ({ id }: any) => {
  const [formTicketPrice] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { data } = useTicketsPrice();
  const updateTicket = useUpdateTicketPrice(id);
  const showModal = () => {
    setOpen(true);
  };

  const handleOk = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setOpen(false);
      setConfirmLoading(false);
    }, 2000);
  };

  const handleCancel = () => {
    console.log("Clicked cancel button");
    setOpen(false);
  };

  const onFinish = (formData: any) => {
    updateTicket.mutate(formData, {
      onSuccess: () => {
        messageApi.success("Thêm mới giá vé thành công");
      },
      onError: (error: any) => {
        messageApi.error(
          error?.response?.data?.message || "Thêm mới thất bại thất bại"
        );
      },
    });
  };

  // Hàm loại bỏ giá trị trùng lặp theo một key cụ thể
  const getUniqueOptions = (data: any[], key: string) => {
    return Array.from(new Map(data.map((item) => [item[key], item])).values());
  };
  return (
    <>
      <Button type="primary" onClick={showModal}>
        <PlusCircleOutlined /> Thêm mới vé
      </Button>
      <Modal
        title="Thêm mới giá vé"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        width={470}
      >
        {contextHolder}
        <Form
          form={formTicketPrice}
          name="ticket-price-add-form"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={onFinish}
        >
          <Form.Item
            className="input-label"
            label="Loại ghế"
            name="seat_type_name"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập loại ghế",
              },
            ]}
          >
            <Select
              options={getUniqueOptions(data || [], "seat_type_name").map(
                (item) => ({
                  label: item.seat_type_name,
                  value: item.seat_type_name,
                })
              )}
              placeholder="Chọn loại ghế"
            />
          </Form.Item>
          <Form.Item
            className="input-label"
            label="Hình thức chiếu"
            name="room_type_name"
            rules={[
              {
                required: true,
                message: "nhập hình thức chiếu",
              },
            ]}
          >
            <Select
              options={getUniqueOptions(data || [], "room_type_name").map(
                (item) => ({
                  label: item.room_type_name,
                  value: item.room_type_name,
                })
              )}
              placeholder="Chọn hình thức chiếu"
            />
          </Form.Item>
          <Form.Item
            className="input-label"
            label="Loại ngày áp dụng"
            name="day_type"
            rules={[
              {
                required: true,
                message: "ngày áp dụng",
              },
            ]}
          >
            <Select
              options={getUniqueOptions(data || [], "day_type").map((item) => ({
                label: item.day_type,
                value: item.day_type,
              }))}
              placeholder="Chọn ngày áp dụng"
            />
          </Form.Item>
          <Form.Item
            className="input-label"
            label="Loại phòng chiếu"
            name="room_name"
            rules={[
              {
                required: true,
                message: "Nhập loại phòng chiếu",
              },
            ]}
          >
            <Select
              options={getUniqueOptions(data || [], "room_name").map(
                (item) => ({
                  label: item.room_name,
                  value: item.room_name,
                })
              )}
              placeholder="Chọn ngày áp dụng"
            />
          </Form.Item>
          <Form.Item
            className="input-label"
            label="Giá vé"
            name="price"
            rules={[
              {
                required: true,
                message: "Nhập giá vé",
              },
            ]}
          >
            <Input placeholder="Giá vé"></Input>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddTicketPrice;
