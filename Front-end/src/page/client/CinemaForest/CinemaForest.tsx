import React from "react";
import { Form, Input } from "antd";
import ClientLayout from "../Layout";
const CinemaForest = () => {
  return (
    <ClientLayout>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "24px",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#ffffff",
          }}
        >
          <div style={{ flex: 1 }}>
            <Form layout="vertical">
              <Form.Item label="Tên rạp chiếu">
                <Input
                  defaultValue="Movies Forest"
                  disabled
                  style={{ backgroundColor: "#ffffff", color: "#000000" }}
                />
              </Form.Item>

              <Form.Item label="Địa chỉ">
                <Input.TextArea
                  rows={2}
                  defaultValue="Tòa nhà FPT Polytechnic, Cổng số 2, 13 P. Trịnh Văn Bô, Xuân Phương, Nam Từ Liêm, Hà Nội"
                  disabled
                  style={{ backgroundColor: "#ffffff", color: "#000000" }}
                />
              </Form.Item>

              <Form.Item label="Địa chỉ map">
                <Input.TextArea
                  rows={3}
                  defaultValue="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.195782232924!2d105.7434745!3d21.0383151!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313455e940879933%3A0xcf10b34e9f1a03df!2zVHLGsOG7nW5nIENhbyDEkOG6s25nIEZQVCBQb2x5dGVjaG5pYw!5e0!3m2!1svi!2s!4v1714371701651!5m2!1svi!2s"
                  disabled
                  style={{ backgroundColor: "#ffffff", color: "#000000" }}
                />
              </Form.Item>
            </Form>
          </div>
          <div style={{ flex: 1 }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.195782232924!2d105.7434745!3d21.0383151!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313455e940879933%3A0xcf10b34e9f1a03df!2zVHLGsOG7nW5nIENhbyDEkOG6s25nIEZQVCBQb2x5dGVjaG5pYw!5e0!3m2!1svi!2s!4v1714371701651!5m2!1svi!2s"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps FPT Polytechnic"
            ></iframe>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default CinemaForest;
