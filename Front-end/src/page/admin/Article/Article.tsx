import { useState, useEffect } from "react";
import { Modal, Button, Input, Select, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import {
  GET_ARTICLE,
  DELETE_ARTICLE,
  UPDATE_ARTICLE,
  CREATE_ARTICLE,
} from "../../../config/ApiConfig";
import "./ArticleList.css";

const { TextArea } = Input;

// Define interfaces for type safety
interface Article {
  id: number;
  title?: string | null;
  author?: string | null;
  category?: string | null;
  body?: string | null;
  status?: string | null;
  views: number;
  created_at?: string | null;
  image?: string | null;
}

interface FormData {
  title: string;
  author: string;
  category: string;
  body: string;
  status: string;
  file: File | null;
  imageUrl: string;
}

interface ErrorResponse {
  error?: Record<string, string[]>;
}

const ArticleList = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState<FormData>({
    title: "",
    author: "",
    category: "",
    body: "",
    status: "",
    file: null,
    imageUrl: "",
  });
  const [createFormData, setCreateFormData] = useState<FormData>({
    title: "",
    author: "",
    category: "",
    body: "",
    status: "Active",
    file: null,
    imageUrl: "",
  });
  const [createErrors, setCreateErrors] = useState<Record<string, string[]>>(
    {}
  );

  // Hàm format ngày tháng
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A"; // Xử lý trường hợp null hoặc undefined
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A"; // Xử lý ngày không hợp lệ
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Simple text escape to mitigate XSS and handle undefined/null
  const escapeText = (text: string | null | undefined): string => {
    if (text == null) return "";
    return text.replace(/</g, "<").replace(/>/g, ">");
  };

  // Fetch danh sách bài viết
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Article[]>(GET_ARTICLE);
      const sanitizedArticles = response.data.map((article) => ({
        id: article.id,
        title: article.title ?? "",
        author: article.author ?? "",
        category: article.category ?? "",
        body: article.body ?? "",
        status: article.status ?? "InActive",
        views: article.views ?? 0,
        created_at: article.created_at ?? "",
        image: article.image ?? "",
      }));
      setArticles(sanitizedArticles);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bài viết:", error);
      message.error("Không thể tải danh sách bài viết!");
    }
    setLoading(false);
  };

  // Xóa bài viết với Modal.confirm
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Xác nhận xóa bài viết",
      content:
        "Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await axios.delete(DELETE_ARTICLE(id));
          setArticles(articles.filter((article) => article.id !== id));
          message.success("Bài viết đã được xóa!");
        } catch (error) {
          console.error("Lỗi khi xóa bài viết:", error);
          message.error("Lỗi khi xóa bài viết!");
        }
      },
      onCancel() {
        // Không làm gì khi hủy
      },
    });
  };

  // Khi nhấn nút "Sửa"
  const handleEditClick = (article: Article) => {
    setEditingArticle(article);
    setEditFormData({
      title: article.title ?? "",
      author: article.author ?? "",
      category: article.category ?? "",
      body: article.body ?? "",
      status:
        article.status === "Active" || article.status === "InActive"
          ? article.status
          : "Active",
      file: null,
      imageUrl:
        article.image && article.image.startsWith("http") ? article.image : "",
    });
    setIsEditModalOpen(true);
  };

  // Cập nhật bài viết
  const handleUpdatePost = async () => {
    if (!editingArticle) {
      message.error("Không có bài viết nào được chọn để cập nhật!");
      return;
    }

    setIsUpdating(true);
    const { id } = editingArticle;
    const { title, author, category, body, status, file } = editFormData;

    const data = new FormData();
    data.append("title", title);
    data.append("author", author);
    data.append("category", category);
    data.append("body", body);
    data.append("status", status);
    data.append("_method", "PUT");
    if (file) data.append("image", file);

    try {
      await axios.post(UPDATE_ARTICLE(id), data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Bài viết đã được cập nhật!");
      setIsEditModalOpen(false);
      setEditFormData({
        title: "",
        author: "",
        category: "",
        body: "",
        status: "",
        file: null,
        imageUrl: "",
      });
      fetchArticles();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const responseData = error.response.data as ErrorResponse;
        if (responseData.error) {
          const firstErrorField = Object.keys(responseData.error)[0];
          const firstErrorMessage =
            responseData.error[firstErrorField]?.[0] || "Có lỗi xảy ra";
          message.error(firstErrorMessage);
        } else {
          message.error("Lỗi không xác định khi cập nhật bài viết!");
        }
      } else {
        message.error("Lỗi kết nối đến máy chủ!");
      }
      console.error("Lỗi khi cập nhật bài viết:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Khi nhấn nút "Tạo bài viết"
  const handleCreateClick = () => {
    setCreateFormData({
      title: "",
      author: "",
      category: "",
      body: "",
      status: "Active",
      file: null,
      imageUrl: "",
    });
    setCreateErrors({});
    setIsCreateModalOpen(true);
  };

  // Tạo bài viết
  const handleCreatePost = async () => {
    setCreateErrors({});
    setIsCreating(true);

    const { title, author, category, body, status, file } = createFormData;
    const data = new FormData();
    data.append("title", title);
    data.append("author", author);
    data.append("category", category);
    data.append("body", body);
    data.append("status", status);
    if (file) data.append("image", file);

    try {
      await axios.post(CREATE_ARTICLE, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Bài viết đã được tạo thành công!");
      setIsCreateModalOpen(false);
      setCreateFormData({
        title: "",
        author: "",
        category: "",
        body: "",
        status: "Active",
        file: null,
        imageUrl: "",
      });
      fetchArticles();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const responseData = error.response.data as ErrorResponse;
        if (responseData.error) {
          setCreateErrors(responseData.error);
          const firstErrorField = Object.keys(responseData.error)[0];
          const firstErrorMessage =
            responseData.error[firstErrorField]?.[0] || "Có lỗi xảy ra";
          message.error(firstErrorMessage);
        } else {
          message.error("Có lỗi không xác định xảy ra khi tạo bài viết!");
        }
      } else {
        message.error("Có lỗi kết nối đến máy chủ!");
      }
      console.error("Lỗi khi tạo bài viết:", error);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className="container">
      <div className="header">
        <h2 className="title">Danh sách bài viết</h2>
        <div className="button-group">
          <Button onClick={fetchArticles} disabled={loading}>
            Refresh
          </Button>
          <Button type="primary" onClick={handleCreateClick}>
            Tạo bài viết
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Đang tải...</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Danh mục</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td>{escapeText(article.title)}</td>
                  <td>{escapeText(article.category)}</td>
                  <td>
                    <span
                      className={
                        article.status === "Active"
                          ? "status-active"
                          : "status-inactive"
                      }
                    >
                      {article.status === "Active"
                        ? "Hoạt động"
                        : "Ngưng hoạt động"}
                    </span>
                  </td>
                  <td>{formatDate(article.created_at)}</td>{" "}
                  {/* Format ngày tháng */}
                  <td>
                    <Button onClick={() => handleEditClick(article)}>
                      Sửa
                    </Button>
                    <Button danger onClick={() => handleDelete(article.id)}>
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal cập nhật bài viết */}
      <Modal
        title="Cập nhật bài viết"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsEditModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="update"
            type="primary"
            onClick={handleUpdatePost}
            loading={isUpdating}
          >
            Cập nhật
          </Button>,
        ]}
      >
        <Input
          className="modal-input"
          placeholder="Tiêu đề"
          value={editFormData.title}
          onChange={(e) =>
            setEditFormData({ ...editFormData, title: e.target.value })
          }
        />
        <Input
          className="modal-input"
          placeholder="Tác giả"
          value={editFormData.author}
          onChange={(e) =>
            setEditFormData({ ...editFormData, author: e.target.value })
          }
        />
        <Upload
          beforeUpload={(file: File) => {
            setEditFormData({
              ...editFormData,
              file,
              imageUrl: URL.createObjectURL(file),
            });
            return false;
          }}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
        </Upload>
        {editFormData.imageUrl && (
          <img
            src={editFormData.imageUrl}
            alt="Preview"
            className="uploaded-image"
          />
        )}
        <Select
          className="modal-select"
          value={editFormData.category}
          onChange={(value) =>
            setEditFormData({ ...editFormData, category: value })
          }
          placeholder="Chọn danh mục"
          options={[
            { value: "Khuyến mãi", label: "Khuyến mãi" },
            { value: "Tin tức", label: "Tin tức" },
          ]}
        />
        <TextArea
          className="modal-textarea"
          placeholder="Nội dung"
          value={editFormData.body}
          onChange={(e) =>
            setEditFormData({ ...editFormData, body: e.target.value })
          }
          rows={4}
        />
        <Select
          className="modal-select"
          value={editFormData.status}
          onChange={(value) =>
            setEditFormData({ ...editFormData, status: value })
          }
          placeholder="Chọn trạng thái"
          options={[
            { value: "Active", label: "Hoạt động" },
            { value: "InActive", label: "Ngưng hoạt động" },
          ]}
        />
      </Modal>

      {/* Modal tạo bài viết */}
      <Modal
        title="Tạo bài viết"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsCreateModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="create"
            type="primary"
            onClick={handleCreatePost}
            loading={isCreating}
          >
            Tạo
          </Button>,
        ]}
      >
        <Input
          className="modal-input"
          placeholder="Tiêu đề"
          value={createFormData.title}
          onChange={(e) =>
            setCreateFormData({ ...createFormData, title: e.target.value })
          }
          status={createErrors.title ? "error" : ""}
        />
        {createErrors.title?.length > 0 && (
          <div className="error-message">{createErrors.title[0]}</div>
        )}
        <Input
          className="modal-input"
          placeholder="Tác giả"
          value={createFormData.author}
          onChange={(e) =>
            setCreateFormData({ ...createFormData, author: e.target.value })
          }
          status={createErrors.author ? "error" : ""}
        />
        {createErrors.author?.length > 0 && (
          <div className="error-message">{createErrors.author[0]}</div>
        )}
        <Upload
          beforeUpload={(file: File) => {
            setCreateFormData({
              ...createFormData,
              file,
              imageUrl: URL.createObjectURL(file),
            });
            return false;
          }}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
        </Upload>
        {createFormData.imageUrl && (
          <img
            src={createFormData.imageUrl}
            alt="Preview"
            className="uploaded-image"
          />
        )}
        {createErrors.image?.length > 0 && (
          <div className="error-message">{createErrors.image[0]}</div>
        )}
        <Select
          className="modal-select"
          value={createFormData.category}
          onChange={(value) =>
            setCreateFormData({ ...createFormData, category: value })
          }
          placeholder="Chọn danh mục"
          status={createErrors.category ? "error" : ""}
          options={[
            { value: "Khuyến mãi", label: "Khuyến mãi" },
            { value: "Tin tức", label: "Tin tức" },
          ]}
        />
        {createErrors.category?.length > 0 && (
          <div className="error-message">{createErrors.category[0]}</div>
        )}
        <TextArea
          className="modal-textarea"
          placeholder="Nội dung"
          value={createFormData.body}
          onChange={(e) =>
            setCreateFormData({ ...createFormData, body: e.target.value })
          }
          status={createErrors.body ? "error" : ""}
          rows={4}
        />
        {createErrors.body?.length > 0 && (
          <div className="error-message">{createErrors.body[0]}</div>
        )}
        <Select
          className="modal-select"
          value={createFormData.status}
          onChange={(value) =>
            setCreateFormData({ ...createFormData, status: value })
          }
          status={createErrors.status ? "error" : ""}
          options={[
            { value: "Active", label: "Hoạt động" },
            { value: "InActive", label: "Ngưng hoạt động" },
          ]}
        />
        {createErrors.status?.length > 0 && (
          <div className="error-message">{createErrors.status[0]}</div>
        )}
      </Modal>
    </div>
  );
};

export default ArticleList;
