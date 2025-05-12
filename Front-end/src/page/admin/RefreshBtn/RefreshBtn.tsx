import { ReloadOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "antd";
import React from "react";
import { RefreshBtnProps } from "../../types/interface";

const RefreshBtn: React.FC<RefreshBtnProps> = ({ queryKey }) => {
    const queryClient = useQueryClient();
    const handleRefresh = async () => {
        await queryClient.invalidateQueries({ queryKey });
        queryClient.refetchQueries({ queryKey });
    };

    return (
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Refresh Data
        </Button>
    );
};

export default RefreshBtn;
