import React from "react";
import { Image } from "antd";
import { Link } from "react-router-dom";
import "./InfomationProduct.css";

interface InfomationProductProps {
  className?: string;
  id: number;
  image: string;
  category: string;
  created_at: string;
  title: string;
}

const InfomationProduct: React.FC<InfomationProductProps> = ({
  className = "",
  id,
  image,
  category,
  created_at,
  title,
}) => {
  return (
    <Link className={`infomationProduct ${className}`} to={`/article/${id}`}>
      <div className="info-thumnail">
        <img className="product-image" src={image} alt={title} />
      </div>
      <div className="type">
        <h5 className="category">{category}</h5>
        <span className="date">
          {new Date(created_at).toLocaleDateString("vi-VN")}
        </span>
      </div>
      <h4 className="title cliptext">{title}</h4>
    </Link>
  );
};

export default InfomationProduct;
