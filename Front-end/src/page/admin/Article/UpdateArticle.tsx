// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { Button, Input, Select, Card, Space, Upload, message } from "antd";
// import { UploadOutlined } from "@ant-design/icons";
// import axios from "axios";
// import "./UpdatePost.css";
// import { GET_ARTICLE, UPDATE_ARTICLE } from "../../../config/ApiConfig";
// const { TextArea } = Input;

// interface ErrorResponse {
//   error?: {
//     status?: string[];
//     [key: string]: string[] | undefined;
//   };
//   [key: string]: any;
// }

// export default function UpdatePost() {
//   const { id } = useParams();
//   const [title, setTitle] = useState("");
//   const [author, setAuthor] = useState("");
//   const [image, setImage] = useState<string | null>(null);
//   const [category, setCategory] = useState<string | null>(null);
//   const [content, setContent] = useState("");
//   const [status, setStatus] = useState("Active");
//   const [file, setFile] = useState<File | null>(null);
//   const [errors, setErrors] = useState<Record<string, string[]>>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     setIsLoading(true);
//     axios
//       .get(`${GET_ARTICLE}/${id}`)
//       .then((response) => {
//         const data = response.data;
//         setTitle(data.title);
//         setAuthor(data.author);
//         setImage(data.image);
//         setCategory(data.category);
//         setContent(data.body);
//         setStatus(data.status);
//         setIsLoading(false);
//       })
//       .catch((error) => {
//         console.error("Error fetching post:", error);
//         message.error("Không thể tải dữ liệu bài viết!");
//         setIsLoading(false);
//       });
//   }, [id]);

//   const handleUpdatePost = async () => {
//     setErrors({});
//     setIsSubmitting(true);

//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("author", author);
//     formData.append("category", category || "");
//     formData.append("body", content);
//     formData.append("status", status);
//     if (file) {
//       formData.append("image", file);
//     }

//     try {
//       await axios.put(`${UPDATE_ARTICLE}/${id}`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       message.success("Bài viết đã được cập nhật thành công!");
//     } catch (error) {
//       console.error("Lỗi khi cập nhật bài viết:", error);

//       if (axios.isAxiosError(error) && error.response) {
//         const responseData = error.response.data as ErrorResponse;

//         if (responseData.error) {
//           setErrors(responseData.error as Record<string, string[]>);
//           const firstErrorField = Object.keys(responseData.error)[0];
//           const firstErrorMessage =
//             responseData.error[firstErrorField]?.[0] || "Có lỗi xảy ra";
//           message.error(firstErrorMessage);
//         } else {
//           message.error("Có lỗi không xác định xảy ra khi cập nhật bài viết");
//         }
//       } else {
//         message.error("Có lỗi kết nối đến máy chủ");
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Danh sách các danh mục
//   const categoryOptions = [
//     { value: "Khuyến mãi", label: "Khuyến mãi" },
//     { value: "Tin tức", label: "Tin tức" },
//   ];

//   return (
//     <div className="post-container">
//       <Card
//         className="post-card"
//         title="Cập nhật bài viết"
//         extra={
//           <Button
//             type="primary"
//             onClick={handleUpdatePost}
//             loading={isSubmitting}
//             disabled={isLoading}
//           >
//             Cập nhật
//           </Button>
//         }
//         loading={isLoading}
//       >
//         <Space direction="vertical" size="middle" className="w-full">
//           <Input
//             placeholder="Nhập tiêu đề"
//             size="large"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             status={errors.title ? "error" : ""}
//           />
//           {errors.title && (
//             <div className="error-message">{errors.title[0]}</div>
//           )}

//           <Input
//             placeholder="Tác giả"
//             size="large"
//             value={author}
//             onChange={(e) => setAuthor(e.target.value)}
//             status={errors.author ? "error" : ""}
//           />
//           {errors.author && (
//             <div className="error-message">{errors.author[0]}</div>
//           )}

//           <Upload
//             beforeUpload={(file) => {
//               setFile(file);
//               return false;
//             }}
//             showUploadList={false}
//           >
//             <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
//           </Upload>
//           {image && !file && (
//             <img src={image} alt="Uploaded" className="uploaded-image" />
//           )}
//           {file && (
//             <img
//               src={URL.createObjectURL(file)}
//               alt="New upload"
//               className="uploaded-image"
//             />
//           )}
//           {errors.image && (
//             <div className="error-message">{errors.image[0]}</div>
//           )}

//           <Select
//             className="w-full"
//             value={category}
//             onChange={setCategory}
//             placeholder="Chọn danh mục"
//             status={errors.category ? "error" : ""}
//             options={categoryOptions}
//           />
//           {errors.category && (
//             <div className="error-message">{errors.category[0]}</div>
//           )}

//           <TextArea
//             className="custom-textarea"
//             value={content}
//             onChange={(e) => setContent(e.target.value)}
//             status={errors.body ? "error" : ""}
//           />
//           {errors.body && <div className="error-message">{errors.body[0]}</div>}

//           <Select
//             className="w-full"
//             value={status}
//             onChange={setStatus}
//             status={errors.status ? "error" : ""}
//             options={[
//               { value: "Active", label: "Công khai" },
//               { value: "InActive", label: "Nháp" },
//             ]}
//           />
//           {errors.status && (
//             <div className="error-message">{errors.status[0]}</div>
//           )}
//         </Space>
//       </Card>
//     </div>
//   );
// }
