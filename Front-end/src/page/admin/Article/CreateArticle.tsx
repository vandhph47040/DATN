// import { useState, useEffect } from "react";
// import { Button, Input, Select, Card, Space, Upload, message } from "antd";
// import axios from "axios";
// const { TextArea } = Input;
// import { UploadOutlined } from "@ant-design/icons";
// import "./CreatePost.css";
// import { CREATE_ARTICLE } from "../../../config/ApiConfig";

// interface ErrorResponse {
//   error?: {
//     status?: string[];
//     [key: string]: string[] | undefined;
//   };
//   [key: string]: any;
// }

// export default function CreatePost() {
//   const [title, setTitle] = useState("");
//   const [author, setAuthor] = useState("");
//   const [image, setImage] = useState<File | null>(null);
//   const [category, setCategory] = useState<string | null>(null);
//   const [content, setContent] = useState("");
//   const [status, setStatus] = useState("Active");
//   const [errors, setErrors] = useState<Record<string, string[]>>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async () => {
//     setErrors({});
//     setIsSubmitting(true);

//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("author", author);
//     if (image) formData.append("image", image);
//     formData.append("category", category || "");
//     formData.append("body", content);
//     formData.append("status", status);

//     try {
//       const response = await axios.post(CREATE_ARTICLE, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       console.log("Article created:", response.data);
//       message.success("Bài viết đã được tạo thành công!");
//       // Có thể thêm reset form hoặc chuyển hướng ở đây
//     } catch (error) {
//       console.error("Error:", error);

//       // Xử lý lỗi từ API
//       if (axios.isAxiosError(error) && error.response) {
//         const responseData = error.response.data as ErrorResponse;

//         if (responseData.error) {
//           setErrors(responseData.error as Record<string, string[]>);

//           // Hiển thị thông báo lỗi chung
//           const firstErrorField = Object.keys(responseData.error)[0];
//           const firstErrorMessage =
//             responseData.error[firstErrorField]?.[0] || "Có lỗi xảy ra";
//           message.error(firstErrorMessage);
//         } else {
//           message.error("Có lỗi không xác định xảy ra khi tạo bài viết");
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
//         title="Tạo bài viết"
//         extra={
//           <Button type="primary" onClick={handleSubmit} loading={isSubmitting}>
//             Tạo bài viết
//           </Button>
//         }
//       >
//         <Space direction="vertical" size="middle" className="w-full">
//           <Input
//             placeholder="Enter title"
//             size="large"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             status={errors.title ? "error" : ""}
//           />
//           {errors.title && (
//             <div className="error-message">{errors.title[0]}</div>
//           )}

//           <Input
//             placeholder="Author"
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
//               setImage(file);
//               return false;
//             }}
//             showUploadList={false}
//           >
//             <Button icon={<UploadOutlined />}>Upload Image</Button>
//           </Upload>
//           {image && (
//             <img
//               src={URL.createObjectURL(image)}
//               alt="Uploaded"
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
//             placeholder="Select a category"
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
//               { value: "Active", label: "Hoạt động" },
//               { value: "InActive", label: "Ngưng hoạt động" },
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
