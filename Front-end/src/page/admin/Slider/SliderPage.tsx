import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  Upload,
  message,
  Popconfirm,
  Image,
  Tooltip,
  Tag,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import sliderService from "../../../services/slider.service";
import { Slider, SliderFormData } from "../../../types/slider.type";
import styles from "../globalAdmin.module.css";

const SliderPage: React.FC = () => {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Lấy danh sách slider
  const fetchSliders = async () => {
    setLoading(true);
    try {
      const data = await sliderService.getSliders();
      setSliders(data);
      setPagination({
        ...pagination,
        total: data.length,
      });
    } catch (error) {
      message.error("Không thể tải danh sách slider");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  // Mở modal thêm/sửa
  const showModal = (slider?: Slider) => {
    setFileList([]);
    if (slider) {
      setEditingId(slider.id);
      form.setFieldsValue({
        title: slider.title,
        is_active: slider.is_active,
      });

      // Hiển thị ảnh hiện tại khi sửa
      if (slider.image_path) {
        setFileList([
          {
            uid: "-1",
            name: "Ảnh hiện tại",
            status: "done",
            url: `http://localhost:8000/storage/${slider.image_path}`,
          } as UploadFile,
        ]);
      }
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // Đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setFileList([]);
  };

  // Cấu hình upload hình ảnh
  const uploadProps: UploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      // Kiểm tra kích thước file (giới hạn 2MB theo controller)
      if (file.size > 2 * 1024 * 1024) {
        message.error("Kích thước file không được vượt quá 2MB");
        return Upload.LIST_IGNORE;
      }
      // Kiểm tra định dạng file
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Chỉ chấp nhận file hình ảnh");
        return Upload.LIST_IGNORE;
      }

      // Tạo một file list mới với originFileObj được gán đúng
      const newFile = new File([file], file.name, { type: file.type });
      const uploadFile: UploadFile = {
        uid: Math.random().toString(),
        name: file.name,
        status: "done",
        originFileObj: file,
        size: file.size,
        type: file.type,
      };

      setFileList([uploadFile]);
      return false;
    },
    customRequest: ({ file, onSuccess }) => {
      // Custom upload implementation để giữ file trong state thay vì thực sự upload
      setTimeout(() => {
        onSuccess?.("ok");
      }, 0);
    },
    fileList,
  };

  // Xử lý lưu form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Kiểm tra xem có file hình ảnh không khi thêm mới
      if (!editingId && fileList.length === 0) {
        message.error("Vui lòng chọn hình ảnh cho slider");
        return;
      }

      // Debug thông tin file
      console.log("File list:", fileList);

      let imageFile = null;
      // Kiểm tra xem có phải là đang cập nhật slider không
      if (editingId) {
        // Kiểm tra xem người dùng có thay đổi ảnh không (kiểm tra originFileObj)
        if (fileList.length > 0 && fileList[0].originFileObj) {
          // Có thay đổi ảnh
          imageFile = fileList[0].originFileObj;
          console.log("Updating slider with new image:", imageFile);
        } else {
          // Không thay đổi ảnh, giữ nguyên ảnh cũ
          console.log("Updating slider without changing image");
          // Không cần gán imageFile, service sẽ giữ nguyên ảnh cũ
        }
      } else {
        // Thêm mới slider, bắt buộc phải có ảnh
        if (fileList.length > 0) {
          if (fileList[0].originFileObj) {
            imageFile = fileList[0].originFileObj;
            console.log("Using originFileObj for new slider:", imageFile);
          } else {
            imageFile = fileList[0];
            console.log("Using fileList item for new slider:", imageFile);
          }
        }
      }

      const formData: SliderFormData = {
        title: values.title,
        image: imageFile,
        is_active: values.is_active,
      };

      if (editingId) {
        // Cập nhật slider
        await sliderService.updateSlider(editingId, formData);
        message.success("Cập nhật slider thành công");
      } else {
        // Thêm mới slider
        await sliderService.createSlider(formData);
        message.success("Thêm slider mới thành công");
      }

      handleCancel();
      fetchSliders();
    } catch (error: any) {
      console.error("Lỗi khi lưu slider:", error);
      // Hiển thị thông báo lỗi cụ thể nếu có
      if (error.message) {
        message.error(error.message);
      } else {
        message.error("Lỗi khi lưu slider");
      }
    }
  };

  // Xóa slider
  const handleDelete = async (id: number) => {
    try {
      await sliderService.deleteSlider(id);
      message.success("Xóa slider thành công");
      fetchSliders();
    } catch (error) {
      console.error("Lỗi khi xóa slider:", error);
      message.error("Lỗi khi xóa slider");
    }
  };

  // Thay đổi trạng thái active
  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await sliderService.toggleActive(id, isActive);
      message.success(
        `Slider đã được ${isActive ? "kích hoạt" : "vô hiệu hóa"}`
      );
      fetchSliders();
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái:", error);
      message.error("Lỗi khi thay đổi trạng thái");
    }
  };

  // Xử lý thay đổi phân trang
  const handleTableChange = (pagination: any) => {
    setPagination({
      ...pagination,
    });
  };

  // Cấu hình bảng
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Hình ảnh",
      dataIndex: "image_path",
      key: "image_path",
      render: (text: string) => (
        <Image
          src={`http://localhost:8000/storage/${text}`}
          width={200}
          height={80}
          style={{ objectFit: "cover" }}
          alt="Slider"
        />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Đang hiển thị" : "Bị ẩn"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (_, record: Slider) => (
        <Space size="middle">
          <Tooltip title="Sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title={record.is_active ? "Ẩn" : "Hiển thị"}>
            <Button
              type={record.is_active ? "default" : "primary"}
              icon={
                record.is_active ? <EyeInvisibleOutlined /> : <EyeOutlined />
              }
              onClick={() => handleToggleActive(record.id, !record.is_active)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa slider này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý Slider</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Thêm Slider mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={sliders}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title={editingId ? "Sửa Slider" : "Thêm Slider mới"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={editingId ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input placeholder="Nhập tiêu đề cho slider" />
          </Form.Item>

          <Form.Item
            name="image"
            label="Hình ảnh"
            rules={[
              {
                required: !editingId,
                message: "Vui lòng chọn hình ảnh!",
              },
            ]}
            extra={
              editingId
                ? "Bạn có thể giữ nguyên ảnh hiện tại hoặc chọn ảnh mới"
                : undefined
            }
          >
            <Upload
              {...uploadProps}
              maxCount={1}
              listType="picture"
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>
                {editingId ? "Chọn ảnh mới (không bắt buộc)" : "Chọn hình ảnh"}
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Trạng thái"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SliderPage;
