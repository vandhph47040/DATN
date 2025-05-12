import axios from "axios";
import axiosInstance from "../utils/axios-instance";
import {
  Slider,
  SliderDetailResponse,
  SliderFormData,
  SliderResponse,
} from "../types/slider.type";

const API_URL = "http://localhost:8000/api/sliders";
const API_ENDPOINT = "/sliders";

class SliderService {
  // Lấy danh sách tất cả slider
  async getSliders(): Promise<Slider[]> {
    try {
      const response = await axiosInstance.get<SliderResponse>(API_ENDPOINT);
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách slider:", error);
      return [];
    }
  }

  // Lấy danh sách slider đang hoạt động
  async getActiveSliders(): Promise<Slider[]> {
    try {
      const response = await axiosInstance.get<SliderResponse>(
        `${API_ENDPOINT}/active`
      );
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách slider đang hoạt động:", error);
      return [];
    }
  }

  // Lấy thông tin một slider
  async getSlider(id: number): Promise<Slider | null> {
    try {
      const response = await axiosInstance.get<SliderDetailResponse>(
        `${API_ENDPOINT}/${id}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin slider id=${id}:`, error);
      return null;
    }
  }

  // Thêm slider mới
  async createSlider(formData: SliderFormData): Promise<any> {
    try {
      // Debug thông tin formData
      console.log("FormData image:", formData.image);
      console.log("FormData title:", formData.title);
      console.log("FormData is_active:", formData.is_active);

      // Kiểm tra hình ảnh trước khi gửi
      if (!formData.image) {
        console.error("Không tìm thấy file hình ảnh trong formData");
        throw new Error("Vui lòng chọn hình ảnh cho slider");
      }

      // Tạo bản sao của file để tránh vấn đề với originFileObj
      let imageFile: File;
      if (formData.image instanceof File) {
        imageFile = formData.image;
      } else if (
        typeof formData.image === "object" &&
        formData.image !== null
      ) {
        // Nếu không phải File instance thực sự, tạo một file mới từ metadata
        console.log("File không phải là File instance thực sự, tạo mới...");
        try {
          // @ts-ignore - bỏ qua lỗi type để xử lý trường hợp đặc biệt
          if (
            formData.image.originFileObj &&
            formData.image.originFileObj instanceof File
          ) {
            // @ts-ignore
            imageFile = formData.image.originFileObj;
          } else {
            throw new Error("Không thể tạo file từ dữ liệu đã cho");
          }
        } catch (fileError) {
          console.error("Lỗi khi xử lý file:", fileError);
          throw new Error(
            "Định dạng file không hợp lệ, vui lòng chọn lại hình ảnh"
          );
        }
      } else {
        throw new Error("Định dạng file không hợp lệ");
      }

      const form = new FormData();
      form.append("title", formData.title || ""); // Đảm bảo title không null

      // Debug thông tin về file image
      console.log("Image file type:", imageFile.type);
      console.log("Image file size:", imageFile.size);
      console.log("Image file name:", imageFile.name);

      form.append("image", imageFile);

      // Gửi is_active dưới dạng "có field" - controller sẽ kiểm tra sự tồn tại của field
      if (formData.is_active) {
        form.append("is_active", "1");
      }

      // Sử dụng axios trực tiếp với URL đầy đủ để tránh interceptor thêm params
      // axiosInstance.interceptors có thể đã thêm role=admin vào params
      const response = await axios.post(API_URL, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Lỗi khi tạo slider mới:", error);

      // Hiển thị thông báo lỗi chi tiết nếu có
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      }

      throw error;
    }
  }

  // Cập nhật slider
  async updateSlider(id: number, formData: SliderFormData): Promise<any> {
    try {
      console.log("Updating slider with formData:", formData);

      const form = new FormData();
      form.append("title", formData.title || "");

      // Chỉ xử lý và gửi hình ảnh nếu có hình ảnh mới
      if (formData.image) {
        console.log("New image detected, processing...");

        // Xử lý file tương tự như createSlider
        let imageFile: File;
        if (formData.image instanceof File) {
          imageFile = formData.image;
        } else if (
          typeof formData.image === "object" &&
          formData.image !== null
        ) {
          // Nếu không phải File instance thực sự, tạo một file mới từ metadata
          console.log("File không phải là File instance thực sự, tạo mới...");
          try {
            // @ts-ignore - bỏ qua lỗi type để xử lý trường hợp đặc biệt
            if (
              formData.image.originFileObj &&
              formData.image.originFileObj instanceof File
            ) {
              // @ts-ignore
              imageFile = formData.image.originFileObj;
            } else {
              throw new Error("Không thể tạo file từ dữ liệu đã cho");
            }
          } catch (fileError) {
            console.error("Lỗi khi xử lý file:", fileError);
            throw new Error(
              "Định dạng file không hợp lệ, vui lòng chọn lại hình ảnh"
            );
          }
        } else {
          throw new Error("Định dạng file không hợp lệ");
        }

        console.log("Adding image to form data:", imageFile.name);
        form.append("image", imageFile);
      } else {
        console.log("No new image, keeping the existing one");
      }

      // Gửi is_active dưới dạng "có field" - controller sẽ kiểm tra sự tồn tại của field
      if (formData.is_active) {
        form.append("is_active", "1");
      }
      form.append("_method", "PUT");

      // Sử dụng axios trực tiếp với URL đầy đủ
      const response = await axios.post(`${API_URL}/${id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error(`Lỗi khi cập nhật slider id=${id}:`, error);

      // Hiển thị thông báo lỗi chi tiết nếu có
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      }

      throw error;
    }
  }

  // Xóa slider
  async deleteSlider(id: number): Promise<any> {
    try {
      const response = await axiosInstance.delete(`${API_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa slider id=${id}:`, error);
      throw error;
    }
  }

  // Thay đổi trạng thái active
  async toggleActive(id: number, isActive: boolean): Promise<any> {
    try {
      const form = new FormData();

      // Gửi is_active dưới dạng "có field" - controller sẽ kiểm tra sự tồn tại của field
      if (isActive) {
        form.append("is_active", "1");
      }
      form.append("_method", "PUT");

      // Sử dụng axios trực tiếp với URL đầy đủ
      const response = await axios.post(`${API_URL}/${id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error(`Lỗi khi thay đổi trạng thái slider id=${id}:`, error);

      // Hiển thị thông báo lỗi chi tiết nếu có
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      }

      throw error;
    }
  }
}

export default new SliderService();
