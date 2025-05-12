import { Button, Col, Collapse, Form, Image, message, Row, Space } from "antd";
import React, { useEffect, useState } from "react";
import AddActor from "../Actors/AddActors";
import AddDirector from "../Directors/AddDirector";
import AddGenre from "../Genres/AddGenre";
import clsx from "clsx";
import styles from "../globalAdmin.module.css";
import {
    FileAddOutlined,
    FileTextOutlined,
    VerticalAlignTopOutlined,
} from "@ant-design/icons";
import {
    useCreateFilmWithExcel,
    useGetDefaultExcel,
} from "../../../services/adminServices/filmManage.service";

const AddSubValue = () => {
    const [formExcel] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const [selectedFilesExcel, setSelectedFilesExcel] = useState<File[]>([]);
    const [previewExcel, setPreviewExcel] = useState<string[]>([]);
    const [excelFileName, setExcelFileName] = useState<string>("");

    const [activeKey, setActiveKey] = useState<string | string[]>("");
    const [activeKey2, setActiveKey2] = useState<string | string[]>("");

    const handleChangeImageExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            const previewUrls = fileArray.map((file) =>
                URL.createObjectURL(file)
            );

            // console.log("Selected files:", fileArray);
            // console.log("Preview URLs:", previewUrls);

            setSelectedFilesExcel((prev) => [...prev, ...fileArray]);
            setPreviewExcel((prev) => [...prev, ...previewUrls]);
        }
    };

    const onFinish = (formData: FormData) => {
        const newForm = {
            posters: selectedFilesExcel,
            excel_file: formData.excel_file,
        };
        createFilm(newForm);
        formExcel.resetFields();
        setSelectedFilesExcel([]);
        setPreviewExcel([]);
        setExcelFileName("");
    };

    const { mutate: createFilm } = useCreateFilmWithExcel({
        form: formExcel,
        messageApi,
    });

    const { data, refetch, isFetching } = useGetDefaultExcel();
    const handleDownload = async () => {
        const result = await refetch();

        if (result.data) {
            const url = window.URL.createObjectURL(new Blob([result.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "template cinema Forest.xlsx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
    };

    const items = [
        {
            key: "1",
            label: "Thêm mới Diễn viên, Đạo diễn, Thể loại",
            children: (
                <div className={clsx(styles.addSubValue)}>
                    <AddActor />
                    <AddDirector />
                    <AddGenre />
                </div>
            ),
        },
    ];

    const items2 = [
        {
            key: "1",
            label: "THÊM MỚI PHIM VỚI EXCEL",
            children: (
                <>
                    <Form
                        form={formExcel}
                        name="add-film-form-excel"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        onFinish={onFinish}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    className={clsx(styles.inputLabel)}
                                    label="Poster"
                                    name="excel_poster"
                                >
                                    <div className={clsx(styles.spaceExcel)}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="uploadFileExcel"
                                            multiple
                                            onChange={handleChangeImageExcel}
                                            style={{ display: "none" }}
                                        />
                                        <label
                                            htmlFor="uploadFileExcel"
                                            className={clsx(styles.addImage)}
                                        >
                                            <VerticalAlignTopOutlined /> Thêm
                                            ảnh
                                        </label>

                                        <div className={clsx(styles.boxImages)}>
                                            {previewExcel.map((src, idx) => (
                                                <Image
                                                    key={idx}
                                                    src={src}
                                                    alt={`poster-${idx}`}
                                                    width={135}
                                                    height={200}
                                                    style={{
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="File Excel"
                                    name="excel_file"
                                    valuePropName="file"
                                    getValueFromEvent={(e) => {
                                        return e?.target?.files?.[0];
                                    }}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng chọn file Excel",
                                        },
                                    ]}
                                >
                                    <div className={clsx(styles.spaceExcel)}>
                                        <input
                                            id="fileExcel"
                                            type="file"
                                            accept=".xlsx,.xls"
                                            style={{ display: "none" }}
                                            onChange={(e) => {
                                                const file =
                                                    e.target.files?.[0];
                                                if (file) {
                                                    setExcelFileName(file.name);
                                                }
                                                formExcel.setFieldValue(
                                                    "excel_file",
                                                    file
                                                );
                                            }}
                                        />

                                        <label
                                            htmlFor="fileExcel"
                                            className={clsx(styles.fileExcel)}
                                        >
                                            <FileAddOutlined
                                                className={clsx(
                                                    styles.iconExcel
                                                )}
                                            />
                                            Thêm file Excel
                                        </label>
                                        <span>{excelFileName}</span>
                                    </div>
                                </Form.Item>
                            </Col>

                            <Col span={24} className={clsx(styles.btnAddExcel)}>
                                <Button htmlType="submit" type="primary">
                                    Thêm
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                    <div
                        className={clsx(styles.defaultExcel)}
                        onClick={handleDownload}
                    >
                        <FileTextOutlined className={clsx(styles.iconExcel)} />{" "}
                        Tải file Excel mẫu
                    </div>
                </>
            ),
        },
    ];

    return (
        <div>
            {contextHolder}
            <Collapse
                className={clsx(styles.collapse)}
                activeKey={activeKey}
                onChange={setActiveKey}
                ghost
                items={items}
            />
            <hr />
            <Collapse
                className={clsx(styles.collapse2)}
                activeKey={activeKey2}
                onChange={setActiveKey2}
                ghost
                items={items2}
            />
        </div>
    );
};

export default AddSubValue;
