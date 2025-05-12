import { Drawer } from "antd";
import { useState } from "react";
import { useAdminContext } from "../../../AdminComponents/UseContextAdmin/adminContext";
import OrderDetailUI from "./OrderDetailUI";

const OrderDetail = ({ id, showDataUser }: any) => {
    const { siderWidth } = useAdminContext();
    const [open, setOpen] = useState(false);

    const showLargeDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };

    return (
        <>
            <a onClick={showLargeDrawer}>{id}</a>
            <Drawer
                title={`Chi tiết đơn hàng số ${id}`}
                placement="right"
                onClose={onClose}
                width={`calc(100% - ${siderWidth}px)`}
                open={open}
            >
                <OrderDetailUI
                    id={id}
                    showDataUser={showDataUser}
                ></OrderDetailUI>
            </Drawer>
        </>
    );
};

export default OrderDetail;
