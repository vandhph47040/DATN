import {
    Button,
    Col,
    Drawer,
    DrawerProps,
    Form,
    Image,
    Input,
    Row,
    Skeleton,
} from "antd";
import { useEffect, useState, memo } from "react";
import { URL_IMAGE } from "../../../config/ApiConfig";
import clsx from "clsx";
import styles from "../globalAdmin.module.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const DetailFilm = ({ id, film }: any) => {
    const [openModal, setOpenModal] = useState(false);
    const [size, setSize] = useState<DrawerProps["size"]>();
    const [poster, setPoster] = useState("");
    const [form] = Form.useForm();

    const onClose = () => {
        setOpenModal(false);
    };
    const showLargeDrawer = () => {
        setSize("large");
        setOpenModal(true);
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ["film", id],
        queryFn: async () => {
            try {
                const { data } = await axios.get(
                    `http://localhost:8000/api/movies-details/${id}`
                );
                console.log("check-data-detail", data);

                return data.data;
            } catch (err) {
                console.error("Error fetching film details:", err);
                throw err;
            }
        },
        enabled: openModal && !!id,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
    });

    useEffect(() => {
        if (openModal && data && id) {
            form.setFieldsValue({
                ...data,
                directors: data.directors?.name_director || "không có",
                actors: Array.isArray(data.actors)
                    ? data.actors
                          .map((actor: any) => actor.name_actor)
                          .join(", ")
                    : "không có",
                genres: Array.isArray(data.genres)
                    ? data.genres
                          .map((genre: any) => genre.name_genre)
                          .join(", ")
                    : "không có",
            });

            setPoster(data.poster || "");
        }
    }, [data, openModal, form]);

    return (
        <div>
            <a onClick={showLargeDrawer}>{film}</a>
            <Drawer
                title={`Chi tiết phim ${film}`}
                className={clsx(styles.customDrawerTitle)}
                placement="right"
                size={size}
                onClose={onClose}
                open={openModal}
                destroyOnClose
                extra={
                    <Button type="primary" onClick={onClose}>
                        OK
                    </Button>
                }
            >
                <Skeleton loading={isLoading} active>
                    <Form
                        name="detail-film-form"
                        layout="vertical"
                        form={form}
                        initialValues={data}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    className={clsx(styles.inputLabel)}
                                    name="title"
                                    label="Tên phim:"
                                >
                                    <Input
                                        className={clsx(styles.inputDetail)}
                                        disabled
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    className={clsx(styles.inputLabel)}
                                    name="trailer"
                                    label="Trailer:"
                                >
                                    <Input
                                        className={clsx(styles.inputDetail)}
                                        disabled
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    className={clsx(styles.inputLabel)}
                                    name="poster"
                                    label="Poster:"
                                >
                                    {poster && (
                                        <Image
                                            className={clsx(
                                                styles.imagePreview
                                            )}
                                            src={`${URL_IMAGE}${poster}`}
                                            alt="poster"
                                            width={160}
                                            height={240}
                                        ></Image>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    className={clsx(styles.inputLabel)}
                                    name="actors"
                                    label="Diễn viên:"
                                >
                                    <Input
                                        className={clsx(styles.inputDetail)}
                                        disabled
                                    ></Input>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    className={clsx(styles.inputLabel)}
                                    name="movie_status"
                                    label="Trạng thái:"
                                >
                                    <Input
                                        className={clsx(styles.inputDetail)}
                                        disabled
                                    ></Input>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    className={clsx(styles.inputLabel)}
                                    name="directors"
                                    label="Đạo diễn:"
                                >
                                    <Input
                                        className={clsx(styles.inputDetail)}
                                        disabled
                                    ></Input>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    className={clsx(styles.inputLabel)}
                                    name="release_date"
                                    label="Ngày phát hành: "
                                >
                                    <Input
                                        className={clsx(styles.inputDetail)}
                                        disabled
                                    ></Input>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    className={clsx(styles.inputLabel)}
                                    name="running_time"
                                    label="Thời lượng:"
                                >
                                    <Input
                                        className={clsx(styles.inputDetail)}
                                        disabled
                                    ></Input>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    className={clsx(styles.inputLabel)}
                                    name="rated"
                                    label="Đánh giá:"
                                >
                                    <Input
                                        className={clsx(styles.inputDetail)}
                                        disabled
                                    ></Input>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    className={clsx(styles.inputLabel)}
                                    name="language"
                                    label="Ngôn ngữ:"
                                >
                                    <Input
                                        className={clsx(styles.inputDetail)}
                                        disabled
                                    ></Input>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    className={clsx(styles.inputLabel)}
                                    name="id"
                                    label="ID:"
                                >
                                    <Input
                                        className={clsx(styles.inputDetail)}
                                        disabled
                                    ></Input>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    className={clsx(styles.inputLabel)}
                                    name="genres"
                                    label="Thể loại:"
                                >
                                    <Input
                                        className={clsx(styles.inputDetail)}
                                        disabled
                                    ></Input>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    className={clsx(styles.inputLabel)}
                                    name="description"
                                    label="Mô tả:"
                                >
                                    <Input.TextArea
                                        className={clsx(styles.inputDetail)}
                                        disabled
                                        rows={4}
                                    ></Input.TextArea>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Skeleton>
            </Drawer>
        </div>
    );
};

export default memo(DetailFilm);
