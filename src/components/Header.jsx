import React from "react";
import { Avatar, Space, Typography } from "antd";

const { Text } = Typography;

export default function TopHeader({ user = { name: "Admin" } }) {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <Text strong style={{ fontSize: 18 }}>
          Welcome back, {user.name}
        </Text>
        <div style={{ marginTop: 4 }}>
          <Text type="secondary">
            Here's what's happening with your workspace.
          </Text>
        </div>
      </div>

      <div className="header-right">
        <Space align="center">
          <Avatar>{user.name ? user.name.charAt(0) : "A"}</Avatar>
        </Space>
      </div>
    </header>
  );
}
