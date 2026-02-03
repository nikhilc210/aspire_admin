import React, { useState, useEffect } from "react";
import { Card, Typography, Button, Table, Spin, Empty, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/Header";
import { fetchAdmins } from "../features/admin/adminSlice";

const { Title, Paragraph } = Typography;

export default function Dashboard() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState("admin");
  const dispatch = useDispatch();
  const admins = useSelector((state) => state.admin?.admins ?? []);
  const adminsStatus = useSelector(
    (state) => state.admin?.adminsStatus ?? "idle",
  );

  useEffect(() => {
    if (selected === "admin") {
      if (adminsStatus === "idle" || adminsStatus === "failed") {
        dispatch(fetchAdmins()).catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const handleSignOut = () => {
    // placeholder sign-out logic
    navigate("/");
  };

  const renderSection = () => {
    switch (selected) {
      case "admin": {
        const columns = [
          {
            title: "Name",
            dataIndex: "fullname",
            key: "fullname",
            sorter: (a, b) =>
              (a.fullname || "").localeCompare(b.fullname || ""),
          },
          { title: "Email", dataIndex: "email", key: "email" },
          { title: "Location", dataIndex: "location", key: "location" },
          {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (t) => (t ? new Date(t).toLocaleString() : "–"),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
          },
        ];

        // build data source for table
        const dataSource = (admins || []).map((a) => ({ key: a._id, ...a }));

        return (
          <Card
            style={{ width: "100%", margin: 0 }}
            bodyStyle={{ padding: 12 }}
          >
            <div style={{ padding: 12 }}>
              <Title level={2}>Admins</Title>
              <Paragraph>List of registered admins.</Paragraph>
            </div>

            {adminsStatus === "loading" ? (
              <div style={{ textAlign: "center", padding: 24 }}>
                <Spin />
              </div>
            ) : dataSource && dataSource.length > 0 ? (
              <Table
                columns={columns}
                dataSource={dataSource}
                pagination={{ pageSize: 10 }}
                rowKey="key"
              />
            ) : (
              <div style={{ padding: 24 }}>
                <Empty description="No admins found" />
              </div>
            )}
          </Card>
        );
      }
      case "contact":
        return (
          <Card style={{ maxWidth: 980, margin: "24px auto" }}>
            <Title level={2}>Contact Us</Title>
            <Paragraph>Support and contact information.</Paragraph>
            <div style={{ marginTop: 12 }}>
              <div>Email: support@aspire.example</div>
              <div>Phone: +1 (555) 123-4567</div>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <Sidebar
          selectedKey={selected}
          onSelect={setSelected}
          onLogout={handleSignOut}
        />
      </aside>

      <div className="dashboard-main">
        <TopHeader />

        <main className="dashboard-content">{renderSection()}</main>
      </div>
    </div>
  );
}
