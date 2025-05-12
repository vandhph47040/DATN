import { URL_IMAGE } from "../../../config/ApiConfig";
import { Spin } from "antd";
import clsx from "clsx";
import styles from "../globalAdmin.module.css";
import { useFilmManage } from "../../../services/adminServices/filmManage.service";
import { useAdminContext } from "../../../AdminComponents/UseContextAdmin/adminContext";

const contentStyle: React.CSSProperties = {
    padding: 50,
};

const content = <div style={contentStyle} />;

const ListNameFilms = () => {
    const { listFilms } = useAdminContext();
    const { data: moviesName, isLoading, isError } = useFilmManage();

    // Chọn dữ liệu ưu tiên từ listFilms, nếu rỗng thì fallback về moviesName
    const filmsToRender =
        listFilms && Object.keys(listFilms).length > 0 ? listFilms : moviesName;

    if (isLoading)
        return (
            <Spin tip="Loading" size="large">
                {content}
            </Spin>
        );

    return (
        <>
            {filmsToRender?.map((film: any) => (
                <div key={film.key} className={clsx(styles.listProduct)}>
                    <img
                        className={clsx(styles.moviesNameOfImage)}
                        src={`${URL_IMAGE}${film.poster}`}
                        alt={film.title}
                    />
                    <h2 className={clsx(styles.moviesNameOfTitle)}>
                        {film.title}
                    </h2>
                </div>
            ))}
        </>
    );
};

export default ListNameFilms;
