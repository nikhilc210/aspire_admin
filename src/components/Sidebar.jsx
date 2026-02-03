import React from "react";
import { Menu } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  MailOutlined,
  LogoutOutlined,
  ProfileOutlined,
} from "@ant-design/icons";

export default function Sidebar({
  selectedKey = "admin",
  onSelect = () => {},
  onLogout = () => {},
}) {
  return (
    <div style={{ paddingTop: 18, paddingBottom: 18 }}>
      <div
        style={{
          color: "#fff",
          fontWeight: 700,
          margin: "0 16px 12px 16px",
          fontSize: 18,
        }}
      >
        Aspire
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={({ key }) => {
          if (key === "logout") {
            onLogout();
          } else {
            onSelect(key);
          }
        }}
        items={[
          { key: "admin", icon: <ProfileOutlined />, label: "Admin" },
          { key: "job", icon: <UserOutlined />, label: "Job" },
          { key: "applied", icon: <TeamOutlined />, label: "Applied Job" },
          { key: "contact", icon: <MailOutlined />, label: "Contact us" },
          { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
        ]}
      />
    </div>
  );
}
