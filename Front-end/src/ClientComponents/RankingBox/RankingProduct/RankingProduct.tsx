import { Image } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import { URL_IMAGE } from "../../../config/ApiConfig";
import "./rankingProduct.css";

const RankingProduct = ({ className, number, name, image, id }: any) => {
  return (
    <Link to={`/filmDetail/${id}`} className={`r-product ${className}`}>
      <div className="img-box">
        <img className="image" src={`${URL_IMAGE}${image}`} alt={name}></img>
      </div>
      <div className="title">
        <span className="number">{number}</span>
        <h2 className="product-name cliptextTitle">{name}</h2>
      </div>
    </Link>
  );
};

export default RankingProduct;
