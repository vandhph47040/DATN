import {
    Button,
    Col,
    Collapse,
    DatePicker,
    Form,
    Image,
    Input,
    message,
    Row,
    Select,
    Space,
} from "antd";
import { GET_ACTOR_LIST, GET_GENRES } from "../../../config/ApiConfig";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { FormData } from "../../../types/interface";
import { VerticalAlignTopOutlined } from "@ant-design/icons";
import SelectForm from "./SelectForm";
import ListNameFilms from "./ListNameFilms";
import clsx from "clsx";
import styles from "../globalAdmin.module.css";
import { useDirectorsManage } from "../../../services/adminServices/directorManage.service";
import { useAdminContext } from "../../../AdminComponents/UseContextAdmin/adminContext";
import { useCreateFilm } from "../../../services/adminServices/filmManage.service";
import AddSubValue from "./AddSubValue";

const AddFilm = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [selectedFile, setSelectedFile] = useState<File | undefined>();
    const [preview, setPreview] = useState<string>();

    const onFinish = (formData: FormData) => {
        const newForm = {
            title: formData.title,
            poster: selectedFile,
            trailer: formData.trailer,
            name_directors: formData.name_director,
            name_actors: formData.name_actor,
            movie_status: formData.movie_status,
            release_date: formData.release_date,
            running_time: formData.running_time,
            rated: formData.rated,
            language: formData.language,
            genre_id: formData.genre_id,
            name_genres: formData.name_genres,
            description: formData.description,
            director_id: formData.name_director[0],
        };
        createFilm(newForm);
        form.resetFields();
    };

    const { refetch: refetchDataDirectors } = useDirectorsManage(); // api lấy danh sách đạo diễn
    const { directors } = useAdminContext();
    useEffect(() => {
        refetchDataDirectors();
    }, []);

    const handleChangeSelect = (value: string[], fieldName: string) => {
        form.setFieldsValue({ [fieldName]: value });
    };

    const { mutate: createFilm } = useCreateFilm({
        form,
        messageApi,
        setSelectedFile,
        setPreview,
    }); // thêm mới film

    useEffect(() => {
        if (!selectedFile) {
            setPreview(undefined);
            return;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            setSelectedFile(undefined);
            setPreview(undefined);
            return;
        }

        if (!file.type.startsWith("image/")) {
            message.error("Vui lòng chọn tệp hình ảnh (jpg, png, jpeg).");
            e.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            message.error("Kích thước ảnh không được vượt quá 2MB.");
            e.target.value = "";
            return;
        }

        setSelectedFile(file ?? undefined);
        setPreview(URL.createObjectURL(file));
    };

    return (
        <div className={clsx(styles.containerAddFilm)}>
            <div className={clsx(styles.formAddFilm)}>
                {contextHolder}
                <h1 className={clsx(styles.titleAddFilm)}>Thêm mới phim</h1>

                <Form
                    form={form}
                    name="add-film-form"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={onFinish}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                className={clsx(styles.inputLabel)}
                                label="Tiêu đề"
                                name="title"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập tên phim",
                                    },
                                    {
                                        min: 3,
                                        message:
                                            "Tên phim phải có ít nhất 3 ký tự",
                                    },
                                ]}
                            >
                                <Input placeholder="Nhập tên phim" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                className={clsx(styles.inputLabel)}
                                label="Trailer"
                                name="trailer"
                            >
                                <Input placeholder="Nhập tên trailer"></Input>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                className={clsx(styles.inputLabel)}
                                label="Poster"
                                name="poster"
                            >
                                <Space.Compact>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="uploadFile"
                                        onChange={handleChangeImage}
                                        style={{ display: "none" }}
                                    />
                                    <label
                                        htmlFor="uploadFile"
                                        className={clsx(styles.addImage)}
                                    >
                                        <VerticalAlignTopOutlined /> Thêm ảnh
                                    </label>
                                    {selectedFile && (
                                        <Image
                                            src={preview}
                                            alt="poster"
                                            style={{
                                                marginTop: "8px",
                                                objectFit: "cover",
                                            }}
                                            width={180}
                                            height={220}
                                        />
                                    )}
                                </Space.Compact>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                className={clsx(styles.inputLabel)}
                                label="Diễn viên"
                                name="name_actor"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập diễn viên",
                                    },
                                ]}
                            >
                                <SelectForm
                                    queryKey="Actors"
                                    endpoint={GET_ACTOR_LIST}
                                    labelKey="name_actor"
                                    valueKey="name_actor"
                                    name="name_actor"
                                    onChange={handleChangeSelect}
                                    form={form}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                className={clsx(styles.inputLabel)}
                                label="Trạng thái"
                                name="movie_status"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập trạng thái",
                                    },
                                ]}
                            >
                                <Select placeholder="Chọn trạng thái">
                                    <Select.Option value="now_showing">
                                        Đang chiếu
                                    </Select.Option>
                                    <Select.Option value="coming_soon">
                                        Sắp chiếu
                                    </Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                className={clsx(styles.inputLabel)}
                                label="Đạo diễn"
                                name="name_director"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập đạo diễn",
                                    },
                                ]}
                            >
                                <Select
                                    allowClear
                                    style={{ width: "100%" }}
                                    placeholder="Please select"
                                    onChange={(value) =>
                                        handleChangeSelect(
                                            [value],
                                            "name_director"
                                        )
                                    }
                                    options={directors}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                className={clsx(styles.inputLabel)}
                                name="release_date"
                                label="Ngày phát hành"
                                rules={[
                                    {
                                        required: true,
                                        message: "Thêm ngày phát hành",
                                    },
                                ]}
                                getValueFromEvent={(e: any) =>
                                    e?.format("YYYY-MM-DD")
                                }
                                getValueProps={(e: string) => ({
                                    value: e ? dayjs(e) : "",
                                })}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="YYYY-MM-DD"
                                    allowClear
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                className={clsx(styles.inputLabel)}
                                label="Thời lượng"
                                name="running_time"
                            >
                                <Input
                                    placeholder="Nhập Thời lượng phim"
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                className={clsx(styles.inputLabel)}
                                label="Giới hạn tuổi"
                                name="rated"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập giới hạn tuổi",
                                    },
                                ]}
                            >
                                <Select>
                                    <Select.Option value="P">P</Select.Option>
                                    <Select.Option value="K">K</Select.Option>
                                    <Select.Option value="T13">
                                        T13
                                    </Select.Option>
                                    <Select.Option value="T16">
                                        T16
                                    </Select.Option>
                                    <Select.Option value="T18">
                                        T18
                                    </Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                className={clsx(styles.inputLabel)}
                                label="Ngôn ngữ"
                                name="language"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập ngôn ngữ",
                                    },
                                    {
                                        type: "string",
                                    },
                                ]}
                            >
                                <Input placeholder="Loại ngôn ngữ" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                className={clsx(styles.inputLabel)}
                                label="Thể loại"
                                name="name_genres"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập ID sản phẩm",
                                    },
                                ]}
                            >
                                <SelectForm
                                    queryKey="Genres"
                                    endpoint={GET_GENRES}
                                    labelKey="name_genre"
                                    valueKey="name_genre"
                                    onChange={handleChangeSelect}
                                    form={form}
                                    name="name_genre"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                className={clsx(styles.inputLabel)}
                                name="description"
                                label="Description:"
                            >
                                <Input.TextArea
                                    rows={4}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                style={{ display: "none" }}
                                name="director_id"
                                label="ID đạo diễn:"
                            >
                                <Input disabled></Input>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button htmlType="submit" type="primary">
                        Thêm
                    </Button>
                </Form>
                <AddSubValue></AddSubValue>
            </div>

            <div className={clsx(styles.listAddFilm)}>
                <ListNameFilms></ListNameFilms>
            </div>
        </div>
    );
};

export default AddFilm;
