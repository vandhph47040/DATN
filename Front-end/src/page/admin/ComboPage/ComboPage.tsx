import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Button, Modal, Input, message, Form, Upload } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  UploadOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import comboService from "../../../services/combo.service";
import { Combo } from "../../../types/combo.types";
import styles from "./Combo.module.css";
import { URL_IMAGE } from "../../../config/ApiConfig";

const ComboPage: React.FC = () => {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCombo, setCurrentCombo] = useState<Combo | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Hàm lấy danh sách combo
  const fetchCombos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await comboService.getCombos(true);
      setCombos(response.combo);
    } catch (error) {
      message.error("Không thể tải danh sách combo");
      console.error("Lỗi khi lấy combo:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Gọi fetchCombos khi component mount
  useEffect(() => {
    fetchCombos();
  }, [fetchCombos]);

  // Hiển thị modal
  const showModal = useCallback(
    (combo?: Combo) => {
      if (combo) {
        setIsEditMode(true);
        setCurrentCombo(combo);
        form.setFieldsValue({
          name: combo.name,
          description: combo.description,
          quantity: combo.quantity,
          price: combo.price,
        });
        setPreviewUrl(combo.image ? `${URL_IMAGE}${combo.image}` : "");
      } else {
        setIsEditMode(false);
        setCurrentCombo(null);
        form.resetFields();
        setPreviewUrl("");
      }
      setImageFile(null);
      setIsModalVisible(true);
    },
    [form]
  );

  // Đóng modal
  const handleCancel = useCallback(() => {
    setIsModalVisible(false);
    form.resetFields();
    setImageFile(null);
    setPreviewUrl("");
  }, [form]);

  // Tạo combo mới
  const handleCreate = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("quantity", values.quantity);
      formData.append("price", values.price);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await comboService.createCombo(formData);
      setCombos((prev) => [...prev, response.combo]);
      message.success("Thêm combo thành công!");
      handleCancel();
    } catch (error: any) {
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin!");
      } else if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors)
          .flat()
          .map((msg) => String(msg));
        errors.forEach((msg) => message.error(msg));
      } else {
        message.error("Không thể thêm combo!");
      }
    }
  }, [form, imageFile, handleCancel]);

  // Cập nhật combo
  const handleUpdate = useCallback(async () => {
    if (!currentCombo) return;
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("quantity", values.quantity);
      formData.append("price", values.price);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await comboService.updateCombo(
        currentCombo.id,
        formData
      );
      setCombos((prev) =>
        prev.map((combo) =>
          combo.id === currentCombo.id ? response.combo : combo
        )
      );
      message.success("Cập nhật combo thành công!");
      handleCancel();
    } catch (error: any) {
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin!");
      } else if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors)
          .flat()
          .map((msg) => String(msg));
        errors.forEach((msg) => message.error(msg));
      } else {
        message.error("Không thể cập nhật combo!");
      }
    }
  }, [form, currentCombo, imageFile, handleCancel]);

  // Xóa mềm combo
  const handleSoftDelete = useCallback((id: string | number) => {
    Modal.confirm({
      title: "Xác nhận xóa mềm",
      content: "Bạn có chắc chắn muốn xóa mềm combo này?",
      async onOk() {
        try {
          await comboService.deleteCombo(id);
          setCombos((prev) =>
            prev.map((combo) =>
              combo.id === id
                ? { ...combo, deleted_at: new Date().toISOString() }
                : combo
            )
          );
          message.success("Xóa mềm combo thành công!");
        } catch (error) {
          message.error("Không thể xóa mềm combo!");
        }
      },
    });
  }, []);

  // Khôi phục combo
  const handleRestore = useCallback(
    (id: string | number) => {
      Modal.confirm({
        title: "Xác nhận khôi phục",
        content: "Bạn có chắc chắn muốn khôi phục combo này?",
        async onOk() {
          try {
            await comboService.restoreCombo(id);
            await fetchCombos();
            message.success("Khôi phục combo thành công!");
          } catch (error) {
            message.error("Không thể khôi phục combo!");
          }
        },
      });
    },
    [fetchCombos]
  );

  // Xóa mềm nhiều combo
  const handleSoftDeleteMultiple = useCallback(() => {
    const selectedActiveCombos = combos.filter(
      (combo) => selectedRowKeys.includes(combo.id) && !combo.deleted_at
    );
    if (selectedActiveCombos.length === 0) {
      message.warning("Vui lòng chọn combo chưa bị xóa để xóa mềm!");
      return;
    }

    Modal.confirm({
      title: "Xác nhận xóa mềm nhiều combo",
      content: `Bạn có chắc chắn muốn xóa mềm ${selectedActiveCombos.length} combo?`,
      async onOk() {
        try {
          await comboService.deleteMultipleCombos(
            selectedActiveCombos.map((combo) => combo.id)
          );
          await fetchCombos();
          setSelectedRowKeys([]);
          message.success("Xóa mềm nhiều combo thành công!");
        } catch (error) {
          message.error("Không thể xóa mềm nhiều combo!");
        }
      },
    });
  }, [combos, selectedRowKeys, fetchCombos]);

  // Khôi phục nhiều combo
  const handleRestoreMultiple = useCallback(() => {
    const selectedDeletedCombos = combos.filter(
      (combo) => selectedRowKeys.includes(combo.id) && combo.deleted_at
    );
    if (selectedDeletedCombos.length === 0) {
      message.warning("Vui lòng chọn combo đã bị xóa mềm để khôi phục!");
      return;
    }

    Modal.confirm({
      title: "Xác nhận khôi phục nhiều combo",
      content: `Bạn có chắc chắn muốn khôi phục ${selectedDeletedCombos.length} combo?`,
      async onOk() {
        try {
          await comboService.restoreMultipleCombos(
            selectedDeletedCombos.map((combo) => combo.id)
          );
          await fetchCombos();
          setSelectedRowKeys([]);
          message.success("Khôi phục nhiều combo thành công!");
        } catch (error) {
          message.error("Không thể khôi phục nhiều combo!");
        }
      },
    });
  }, [combos, selectedRowKeys, fetchCombos]);

  // Cột của bảng
  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "id", key: "id" },
      { title: "Tên", dataIndex: "name", key: "name" },
      { title: "Mô tả", dataIndex: "description", key: "description" },
      { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
      {
        title: "Giá (VNĐ)",
        dataIndex: "price",
        key: "price",
        render: (price: number) => price.toLocaleString(),
      },
      {
        title: "Hình ảnh",
        dataIndex: "image",
        key: "image",
        render: (image: string) =>
          image ? (
            <img
              src={`${URL_IMAGE}${image}`}
              alt="combo"
              className={styles.tableImage}
              onError={(e) => {
                e.currentTarget.src = "/placeholder-image.png";
              }}
            />
          ) : (
            <span>Không có ảnh</span>
          ),
      },
      {
        title: "Trạng thái",
        dataIndex: "deleted_at",
        key: "status",
        render: (deleted_at: string | null) =>
          deleted_at ? "Đã xóa mềm" : "Hoạt động",
      },
      {
        title: "Hành động",
        key: "action",
        render: (_: any, record: Combo) => (
          <>
            <Button
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
              disabled={!!record.deleted_at}
              style={{ marginRight: 8 }}
            >
              Sửa
            </Button>
            {record.deleted_at ? (
              <Button
                type="dashed"
                icon={<UndoOutlined />}
                onClick={() => handleRestore(record.id)}
              >
                Khôi phục
              </Button>
            ) : (
              <Button
                type="dashed"
                icon={<EyeInvisibleOutlined />}
                onClick={() => handleSoftDelete(record.id)}
              >
                Xóa mềm
              </Button>
            )}
          </>
        ),
      },
    ],
    [showModal, handleSoftDelete, handleRestore]
  );

  // Cấu hình chọn hàng
  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      onChange: (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
      },
    }),
    [selectedRowKeys]
  );

  return (
    <div className={styles.comboContainer}>
      <h2>Danh sách Combo</h2>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          style={{ marginRight: 8 }}
        >
          Thêm Combo
        </Button>
        <Button
          type="dashed"
          icon={<EyeInvisibleOutlined />}
          onClick={handleSoftDeleteMultiple}
          disabled={selectedRowKeys.length === 0}
          style={{ marginRight: 8 }}
        >
          Xóa mềm nhiều
        </Button>
        <Button
          type="dashed"
          icon={<UndoOutlined />}
          onClick={handleRestoreMultiple}
          disabled={selectedRowKeys.length === 0}
        >
          Khôi phục nhiều
        </Button>
      </div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={combos}
        rowKey="id"
        loading={loading}
        rowClassName={(record) => (record.deleted_at ? styles.softDeleted : "")}
      />
      <Modal
        title={isEditMode ? "Sửa Combo" : "Thêm Combo"}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={isEditMode ? handleUpdate : handleCreate}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên combo"
            rules={[{ required: true, message: "Vui lòng nhập tên combo!" }]}
          >
            <Input placeholder="Tên combo" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea placeholder="Mô tả" />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng!" },
              {
                validator: async (_, value) => {
                  if (value <= 0) {
                    throw new Error("Số lượng phải lớn hơn 0!");
                  }
                  if (!Number.isInteger(Number(value))) {
                    throw new Error("Số lượng phải là số nguyên!");
                  }
                },
              },
            ]}
          >
            <Input type="number" min={1} step={1} placeholder="Số lượng" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá (VNĐ)"
            rules={[
              { required: true, message: "Vui lòng nhập giá!" },
              {
                validator: async (_, value) => {
                  if (value < 0) {
                    throw new Error("Giá không được âm!");
                  }
                  if (!Number.isInteger(Number(value))) {
                    throw new Error("Giá phải là số nguyên!");
                  }
                },
              },
            ]}
          >
            <Input type="number" min={0} step={1000} placeholder="Giá (VNĐ)" />
          </Form.Item>
          <Form.Item
            label="Hình ảnh"
            rules={[
              { required: !isEditMode, message: "Vui lòng tải lên hình ảnh!" },
            ]}
          >
            <Upload
              accept="image/*"
              beforeUpload={(file) => {
                setImageFile(file);
                setPreviewUrl(URL.createObjectURL(file));
                return false;
              }}
              fileList={
                imageFile
                  ? [
                      {
                        uid: "-1",
                        name: imageFile.name,
                        status: "done",
                        url: previewUrl,
                      },
                    ]
                  : []
              }
              onRemove={() => {
                setImageFile(null);
                setPreviewUrl("");
              }}
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
            </Upload>
          </Form.Item>
          {previewUrl && !imageFile && (
            <div style={{ marginBottom: 24 }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: "150px" }}
              />
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default ComboPage;
