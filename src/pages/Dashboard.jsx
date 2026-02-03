import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Table,
  Spin,
  Empty,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Tooltip,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/Header";
import {
  fetchAdmins,
  createAdmin,
  updateAdminPassword,
  updateAdminStatus,
} from "../features/admin/adminSlice";
import {
  fetchJobs,
  createJob,
  updateJobStatus,
} from "../features/jobs/jobSlice";
import { fetchContacts } from "../features/contacts/contactSlice";
import { fetchApplications } from "../features/applications/applicationSlice";

const { Title, Paragraph } = Typography;

export default function Dashboard() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState("admin");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [jobForm] = Form.useForm();
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [tableSearch, setTableSearch] = useState("");

  const dispatch = useDispatch();
  const admins = useSelector((state) => state.admin?.admins ?? []);
  const adminsStatus = useSelector(
    (state) => state.admin?.adminsStatus ?? "idle",
  );
  const createAdminStatus = useSelector(
    (state) => state.admin?.createAdminStatus ?? "idle",
  );
  const updatePasswordStatus = useSelector(
    (state) => state.admin?.updatePasswordStatus ?? "idle",
  );
  const updateStatusStatus = useSelector(
    (state) => state.admin?.updateStatusStatus ?? "idle",
  );
  const jobs = useSelector((state) => state.jobs?.jobs ?? []);
  const jobsStatus = useSelector((state) => state.jobs?.jobsStatus ?? "idle");
  const updateJobStatusStatus = useSelector(
    (state) => state.jobs?.updateStatusStatus ?? "idle",
  );
  const contacts = useSelector((state) => state.contacts?.contacts ?? []);
  const contactsStatus = useSelector(
    (state) => state.contacts?.contactsStatus ?? "idle",
  );
  const applications = useSelector(
    (state) => state.applications?.applications ?? [],
  );
  const applicationsStatus = useSelector(
    (state) => state.applications?.applicationsStatus ?? "idle",
  );

  const handleCreateAdmin = async (values) => {
    try {
      // eslint-disable-next-line no-unused-vars
      const { confirmPassword, ...payload } = values;
      await dispatch(createAdmin(payload)).unwrap();
      message.success("Admin created successfully");
      setIsModalOpen(false);
      form.resetFields();
      dispatch(fetchAdmins());
    } catch (err) {
      message.error(err || "Failed to create admin");
    }
  };

  const handleUpdatePassword = async (values) => {
    try {
      if (!selectedAdmin) return;
      // eslint-disable-next-line no-unused-vars
      const { confirmPassword, newPassword, oldPassword } = values;
      console.log("Form values:", values);
      console.log("Payload being sent:", {
        id: selectedAdmin._id,
        oldPassword,
        newPassword,
      });
      await dispatch(
        updateAdminPassword({
          id: selectedAdmin._id,
          oldPassword,
          newPassword,
        }),
      ).unwrap();
      message.success("Password updated successfully");
      setPasswordModalOpen(false);
      passwordForm.resetFields();
      setSelectedAdmin(null);
    } catch (err) {
      message.error(err || "Failed to update password");
    }
  };

  const handleToggleStatus = async (admin) => {
    try {
      const newStatus = !admin.blocked;
      await dispatch(
        updateAdminStatus({ id: admin._id, isBlocked: newStatus }),
      ).unwrap();
      message.success(
        newStatus
          ? "Admin blocked successfully"
          : "Admin unblocked successfully",
      );
      // Refresh the admins list to update UI
      dispatch(fetchAdmins());
    } catch (err) {
      message.error(err || "Failed to update status");
    }
  };

  const handleCreateJob = async (values) => {
    try {
      // Parse tags from comma-separated string to array
      const tagsArray = values.tags
        ? values.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [];

      const payload = {
        ...values,
        tags: tagsArray,
        description: descriptionHtml,
      };

      await dispatch(createJob(payload)).unwrap();
      message.success("Job created successfully");
      setJobModalOpen(false);
      jobForm.resetFields();
      setDescriptionHtml("");
      dispatch(fetchJobs());
    } catch (err) {
      message.error(err || "Failed to create job");
    }
  };

  const handleToggleJobStatus = async (job) => {
    try {
      const newStatus = !job.blocked;
      await dispatch(
        updateJobStatus({ id: job._id, blocked: newStatus }),
      ).unwrap();
      message.success(
        newStatus ? "Job blocked successfully" : "Job unblocked successfully",
      );
      dispatch(fetchJobs());
    } catch (err) {
      message.error(err || "Failed to update job status");
    }
  };

  useEffect(() => {
    // reset search when switching sections
    setTableSearch("");
    if (selected === "admin") {
      if (adminsStatus === "idle" || adminsStatus === "failed") {
        dispatch(fetchAdmins()).catch(() => {});
      }
    } else if (selected === "job") {
      if (jobsStatus === "idle" || jobsStatus === "failed") {
        dispatch(fetchJobs()).catch(() => {});
      }
    } else if (selected === "contact") {
      if (contactsStatus === "idle" || contactsStatus === "failed") {
        dispatch(fetchContacts()).catch(() => {});
      }
    } else if (selected === "applied") {
      if (applicationsStatus === "idle" || applicationsStatus === "failed") {
        dispatch(fetchApplications()).catch(() => {});
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
          {
            title: "Action",
            key: "action",
            render: (_, record) => (
              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  type="primary"
                  size="small"
                  style={{
                    backgroundColor: "#1890ff",
                    borderColor: "#1890ff",
                    color: "#ffffff",
                  }}
                  onClick={() => {
                    setSelectedAdmin(record);
                    setPasswordModalOpen(true);
                  }}
                >
                  Update Password
                </Button>
                <Button
                  size="small"
                  style={{
                    backgroundColor: record.blocked ? "#ff4d4f" : "#52c41a",
                    borderColor: record.blocked ? "#ff4d4f" : "#52c41a",
                    color: "#ffffff",
                  }}
                  onClick={() => handleToggleStatus(record)}
                  loading={updateStatusStatus === "loading"}
                >
                  {record.blocked ? "Unblock" : "Block"}
                </Button>
              </div>
            ),
          },
        ];

        // build data source for table
        const dataSource = (admins || []).map((a) => ({ key: a._id, ...a }));
        const q = tableSearch.trim().toLowerCase();
        const filtered = q
          ? dataSource.filter((r) =>
              [r.fullname, r.email, r.location]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q)),
            )
          : dataSource;

        return (
          <Card
            style={{ width: "100%", margin: 0 }}
            bodyStyle={{ padding: 12 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
              }}
            >
              <div>
                <Title level={2}>Admins</Title>
                <Paragraph>List of registered admins.</Paragraph>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Input.Search
                  placeholder="Search..."
                  allowClear
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  onSearch={(val) => setTableSearch(val)}
                  style={{ width: 260 }}
                />
                <Button type="primary" onClick={() => setIsModalOpen(true)}>
                  Add New Admin
                </Button>
              </div>
            </div>

            {adminsStatus === "loading" ? (
              <div style={{ textAlign: "center", padding: 24 }}>
                <Spin />
              </div>
            ) : dataSource && dataSource.length > 0 ? (
              <Table
                columns={columns}
                dataSource={filtered}
                pagination={{ pageSize: 10 }}
                rowKey="key"
              />
            ) : (
              <div style={{ padding: 24 }}>
                <Empty description="No admins found" />
              </div>
            )}

            <Modal
              title="Create New Admin"
              open={isModalOpen}
              onCancel={() => setIsModalOpen(false)}
              footer={null}
            >
              <Form form={form} layout="vertical" onFinish={handleCreateAdmin}>
                <Form.Item
                  name="fullname"
                  label="Full Name"
                  rules={[
                    { required: true, message: "Please enter full name" },
                  ]}
                >
                  <Input placeholder="John Doe" />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Please enter email" },
                    { type: "email", message: "Please enter valid email" },
                  ]}
                >
                  <Input placeholder="john@example.com" />
                </Form.Item>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: "Please enter password" }]}
                >
                  <Input.Password placeholder="Password" />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="Confirm Password"
                  dependencies={["password"]}
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: "Please confirm your password!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            "The new password that you entered do not match!",
                          ),
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Confirm Password" />
                </Form.Item>
                <Form.Item
                  name="location"
                  label="Location"
                  rules={[{ required: true, message: "Please enter location" }]}
                >
                  <Input placeholder="New York, USA" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={createAdminStatus === "loading"}
                    block
                  >
                    Create Admin
                  </Button>
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="Update Password"
              open={passwordModalOpen}
              onCancel={() => {
                setPasswordModalOpen(false);
                setSelectedAdmin(null);
                passwordForm.resetFields();
              }}
              footer={null}
            >
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleUpdatePassword}
              >
                <Form.Item
                  name="oldPassword"
                  label="Old Password"
                  rules={[
                    { required: true, message: "Please enter old password" },
                  ]}
                >
                  <Input.Password placeholder="Old Password" />
                </Form.Item>
                <Form.Item
                  name="newPassword"
                  label="New Password"
                  rules={[
                    { required: true, message: "Please enter new password" },
                  ]}
                >
                  <Input.Password placeholder="New Password" />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="Confirm Password"
                  dependencies={["newPassword"]}
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: "Please confirm your password!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            "The new password that you entered do not match!",
                          ),
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Confirm Password" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={updatePasswordStatus === "loading"}
                    block
                  >
                    Update Password
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
          </Card>
        );
      }
      case "contact": {
        const columns = [
          {
            title: "Name",
            dataIndex: "fullname",
            key: "fullname",
            sorter: (a, b) =>
              (a.fullname || "").localeCompare(b.fullname || ""),
          },
          { title: "Email", dataIndex: "email", key: "email" },
          { title: "Phone", dataIndex: "phone", key: "phone" },
          { title: "Company", dataIndex: "company", key: "company" },
          { title: "Service", dataIndex: "service", key: "service" },
          {
            title: "Message",
            dataIndex: "message",
            key: "message",
            render: (text) =>
              text ? (
                <Tooltip title={text}>
                  <span>
                    {text.length > 60 ? `${text.slice(0, 60)}…` : text}
                  </span>
                </Tooltip>
              ) : (
                "—"
              ),
          },
          {
            title: "Handled",
            dataIndex: "handled",
            key: "handled",
            render: (v) => (
              <Tag color={v ? "green" : "orange"}>{v ? "Yes" : "No"}</Tag>
            ),
            filters: [
              { text: "Handled", value: true },
              { text: "Unhanded", value: false },
            ],
            onFilter: (value, record) => record.handled === value,
          },
          {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (t) => (t ? new Date(t).toLocaleString() : "–"),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
          },
        ];

        // Data source built directly in Table props

        return (
          <Card
            style={{ width: "100%", margin: 0 }}
            bodyStyle={{ padding: 12 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
              }}
            >
              <div>
                <Title level={2}>Contact Messages</Title>
                <Paragraph>
                  List of messages submitted via contact form.
                </Paragraph>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "0 12px 12px",
              }}
            >
              <Input.Search
                placeholder="Search..."
                allowClear
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                onSearch={(val) => setTableSearch(val)}
                style={{ width: 260 }}
              />
            </div>

            {contactsStatus === "loading" ? (
              <div style={{ textAlign: "center", padding: 24 }}>
                <Spin />
              </div>
            ) : contacts && contacts.length > 0 ? (
              <Table
                columns={columns}
                dataSource={(contacts || [])
                  .map((c) => ({ key: c._id, ...c }))
                  .filter((r) => {
                    const q = tableSearch.trim().toLowerCase();
                    if (!q) return true;
                    const pool = [
                      r.fullname,
                      r.email,
                      r.phone,
                      r.company,
                      r.service,
                      r.message,
                    ]
                      .filter(Boolean)
                      .map((v) => String(v).toLowerCase())
                      .join(" ");
                    return pool.includes(q);
                  })}
                pagination={{ pageSize: 10 }}
                rowKey="key"
              />
            ) : (
              <div style={{ padding: 24 }}>
                <Empty description="No contacts found" />
              </div>
            )}
          </Card>
        );
      }
      case "applied": {
        const appColumns = [
          {
            title: "Applicant",
            dataIndex: "fullname",
            key: "fullname",
            sorter: (a, b) =>
              (a.fullname || "").localeCompare(b.fullname || ""),
          },
          {
            title: "Job Title",
            key: "jobTitle",
            render: (_, record) => record.job?.title || "—",
          },
          {
            title: "Type",
            key: "employmentType",
            render: (_, record) =>
              record.job?.employmentType ? (
                <Tag>{record.job.employmentType}</Tag>
              ) : (
                "—"
              ),
          },
          { title: "Email", dataIndex: "email", key: "email" },
          { title: "Phone", dataIndex: "phone", key: "phone" },
          { title: "Company", dataIndex: "company", key: "company" },
          { title: "Service", dataIndex: "service", key: "service" },
          {
            title: "Message",
            dataIndex: "message",
            key: "message",
            render: (text) =>
              text ? (
                <Tooltip title={text}>
                  <span>
                    {text.length > 60 ? `${text.slice(0, 60)}…` : text}
                  </span>
                </Tooltip>
              ) : (
                "—"
              ),
          },
          {
            title: "Resume",
            key: "resumeUrl",
            render: (_, record) => {
              const base = "https://aspire-backend-piyf.onrender.com/api";
              const firstImageUrl = record?.images?.[0]?.url || null;
              const fallbackUrl = record?.resumeUrl || null;
              const url = firstImageUrl || fallbackUrl;

              if (!url) return "—";
              const href = url.startsWith("http") ? url : base + url;
              const label = record?.images?.[0]?.filename || "Download";
              return (
                <a href={href} target="_blank" rel="noreferrer">
                  {label}
                </a>
              );
            },
          },

          {
            title: "Experience",
            key: "experience",
            render: (_, record) => record.job?.experience || "—",
          },
          {
            title: "Tags",
            key: "tags",
            render: (_, record) => {
              const tags = record.job?.tags;
              return Array.isArray(tags) && tags.length ? (
                <>
                  {tags.slice(0, 5).map((t, idx) => (
                    <Tag key={idx}>{t}</Tag>
                  ))}
                  {tags.length > 5 && <Tag>+{tags.length - 5} more</Tag>}
                </>
              ) : (
                "—"
              );
            },
          },
          {
            title: "Applied At",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (t) => (t ? new Date(t).toLocaleString() : "–"),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
          },
        ];

        const appDataSource = (applications || []).map((a) => ({
          key: a._id,
          ...a,
        }));
        const qA = tableSearch.trim().toLowerCase();
        const appFiltered = qA
          ? appDataSource.filter((r) => {
              const job = r.job || {};
              const pieces = [
                r.fullname,
                r.email,
                r.phone,
                r.company,
                r.service,
                r.message,
                job.title,
                job.employmentType,
                job.experience,
                Array.isArray(job.tags) ? job.tags.join(" ") : null,
              ]
                .filter(Boolean)
                .map((v) => String(v).toLowerCase())
                .join(" ");
              return pieces.includes(qA);
            })
          : appDataSource;

        return (
          <Card
            style={{ width: "100%", margin: 0 }}
            bodyStyle={{ padding: 12 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
              }}
            >
              <div>
                <Title level={2}>Applied Jobs</Title>
                <Paragraph>List of all job applications.</Paragraph>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  padding: "0 12px 12px",
                }}
              >
                <Input.Search
                  placeholder="Search..."
                  allowClear
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  onSearch={(val) => setTableSearch(val)}
                  style={{ width: 260 }}
                />
              </div>
            </div>

            {applicationsStatus === "loading" ? (
              <div style={{ textAlign: "center", padding: 24 }}>
                <Spin />
              </div>
            ) : appDataSource && appDataSource.length > 0 ? (
              <Table
                columns={appColumns}
                dataSource={appFiltered}
                pagination={{ pageSize: 10 }}
                rowKey="key"
                scroll={{ x: 1400 }}
              />
            ) : (
              <div style={{ padding: 24 }}>
                <Empty description="No applications found" />
              </div>
            )}
          </Card>
        );
      }
      case "job": {
        const jobColors = [
          "red",
          "blue",
          "green",
          "purple",
          "orange",
          "cyan",
          "magenta",
          "volcano",
          "gold",
          "lime",
        ];
        const jobColumns = [
          {
            title: "Title",
            dataIndex: "title",
            key: "title",
            sorter: (a, b) => (a.title || "").localeCompare(b.title || ""),
          },
          {
            title: "Company",
            dataIndex: "company",
            key: "company",
            sorter: (a, b) => (a.company || "").localeCompare(b.company || ""),
          },
          {
            title: "Location",
            dataIndex: "location",
            key: "location",
            sorter: (a, b) =>
              (a.location || "").localeCompare(b.location || ""),
          },
          {
            title: "Employment Type",
            dataIndex: "employmentType",
            key: "employmentType",
            render: (type) => <Tag>{type}</Tag>,
          },
          {
            title: "Experience",
            dataIndex: "experience",
            key: "experience",
          },
          {
            title: "Tags",
            dataIndex: "tags",
            key: "tags",
            render: (tags) =>
              Array.isArray(tags) ? (
                <>
                  {tags.slice(0, 5).map((tag, idx) => (
                    <Tag key={idx} color={jobColors[idx % jobColors.length]}>
                      {tag}
                    </Tag>
                  ))}
                  {tags.length > 5 && <Tag>+{tags.length - 5} more</Tag>}
                </>
              ) : null,
          },
          {
            title: "Action",
            key: "action",
            render: (_, record) => (
              <Button
                size="small"
                style={{
                  backgroundColor: record.blocked ? "#ff4d4f" : "#52c41a",
                  borderColor: record.blocked ? "#ff4d4f" : "#52c41a",
                  color: "#ffffff",
                }}
                onClick={() => handleToggleJobStatus(record)}
                loading={updateJobStatusStatus === "loading"}
              >
                {record.blocked ? "Unblock" : "Block"}
              </Button>
            ),
          },
          {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (t) => (t ? new Date(t).toLocaleString() : "–"),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
          },
        ];

        const jobDataSource = (jobs || []).map((job) => ({
          key: job._id,
          ...job,
        }));
        const qJ = tableSearch.trim().toLowerCase();
        const jobFiltered = qJ
          ? jobDataSource.filter((r) => {
              const pieces = [
                r.title,
                r.company,
                r.location,
                r.employmentType,
                r.experience,
                Array.isArray(r.tags) ? r.tags.join(" ") : null,
              ]
                .filter(Boolean)
                .map((v) => String(v).toLowerCase())
                .join(" ");
              return pieces.includes(qJ);
            })
          : jobDataSource;

        return (
          <Card
            style={{ width: "100%", margin: 0 }}
            bodyStyle={{ padding: 12 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
              }}
            >
              <div>
                <Title level={2}>Jobs</Title>
                <Paragraph>List of all job postings.</Paragraph>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Input.Search
                  placeholder="Search..."
                  allowClear
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  onSearch={(val) => setTableSearch(val)}
                  style={{ width: 260 }}
                />
                <Button type="primary" onClick={() => setJobModalOpen(true)}>
                  Add New Job
                </Button>
              </div>
            </div>

            {jobsStatus === "loading" ? (
              <div style={{ textAlign: "center", padding: 24 }}>
                <Spin />
              </div>
            ) : jobDataSource && jobDataSource.length > 0 ? (
              <Table
                columns={jobColumns}
                dataSource={jobFiltered}
                pagination={{ pageSize: 10 }}
                rowKey="key"
                scroll={{ x: 1200 }}
              />
            ) : (
              <div style={{ padding: 24 }}>
                <Empty description="No jobs found" />
              </div>
            )}
          </Card>
        );
      }
      case "jobs": {
        const jobColors = [
          "red",
          "blue",
          "green",
          "purple",
          "orange",
          "cyan",
          "magenta",
          "volcano",
          "gold",
          "lime",
        ];
        const jobColumns = [
          {
            title: "Title",
            dataIndex: "title",
            key: "title",
            sorter: (a, b) => (a.title || "").localeCompare(b.title || ""),
          },
          {
            title: "Company",
            dataIndex: "company",
            key: "company",
            sorter: (a, b) => (a.company || "").localeCompare(b.company || ""),
          },
          {
            title: "Location",
            dataIndex: "location",
            key: "location",
            sorter: (a, b) =>
              (a.location || "").localeCompare(b.location || ""),
          },
          {
            title: "Employment Type",
            dataIndex: "employmentType",
            key: "employmentType",
            render: (type) => <Tag>{type}</Tag>,
          },
          {
            title: "Experience",
            dataIndex: "experience",
            key: "experience",
          },
          {
            title: "Tags",
            dataIndex: "tags",
            key: "tags",
            render: (tags) =>
              Array.isArray(tags) ? (
                <>
                  {tags.slice(0, 5).map((tag, idx) => (
                    <Tag key={idx} color={jobColors[idx % jobColors.length]}>
                      {tag}
                    </Tag>
                  ))}
                  {tags.length > 5 && <Tag>+{tags.length - 5} more</Tag>}
                </>
              ) : null,
          },
          {
            title: "Action",
            key: "action",
            render: (_, record) => (
              <Button
                size="small"
                style={{
                  backgroundColor: record.blocked ? "#ff4d4f" : "#52c41a",
                  borderColor: record.blocked ? "#ff4d4f" : "#52c41a",
                  color: "#ffffff",
                }}
                onClick={() => handleToggleJobStatus(record)}
                loading={updateJobStatusStatus === "loading"}
              >
                {record.blocked ? "Unblock" : "Block"}
              </Button>
            ),
          },
          {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (t) => (t ? new Date(t).toLocaleString() : "–"),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
          },
        ];

        const jobDataSource = (jobs || []).map((job) => ({
          key: job._id,
          ...job,
        }));
        const qJJ = tableSearch.trim().toLowerCase();
        const jobFiltered2 = qJJ
          ? jobDataSource.filter((r) => {
              const pieces = [
                r.title,
                r.company,
                r.location,
                r.employmentType,
                r.experience,
                Array.isArray(r.tags) ? r.tags.join(" ") : null,
              ]
                .filter(Boolean)
                .map((v) => String(v).toLowerCase())
                .join(" ");
              return pieces.includes(qJJ);
            })
          : jobDataSource;

        return (
          <Card
            style={{ width: "100%", margin: 0 }}
            bodyStyle={{ padding: 12 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
              }}
            >
              <div>
                <Title level={2}>Jobs</Title>
                <Paragraph>List of all job postings.</Paragraph>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Input.Search
                  placeholder="Search..."
                  allowClear
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  onSearch={(val) => setTableSearch(val)}
                  style={{ width: 260 }}
                />
                <Button type="primary" onClick={() => setJobModalOpen(true)}>
                  Add New Job
                </Button>
              </div>
            </div>

            {jobsStatus === "loading" ? (
              <div style={{ textAlign: "center", padding: 24 }}>
                <Spin />
              </div>
            ) : jobDataSource && jobDataSource.length > 0 ? (
              <Table
                columns={jobColumns}
                dataSource={jobFiltered2}
                pagination={{ pageSize: 10 }}
                rowKey="key"
                scroll={{ x: 1200 }}
              />
            ) : (
              <div style={{ padding: 24 }}>
                <Empty description="No jobs found" />
              </div>
            )}
          </Card>
        );
      }
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

        <Modal
          title="Create New Job"
          open={jobModalOpen}
          onCancel={() => {
            setJobModalOpen(false);
            jobForm.resetFields();
            setDescriptionHtml("");
          }}
          footer={null}
        >
          <Form form={jobForm} layout="vertical" onFinish={handleCreateJob}>
            <Form.Item
              name="title"
              label="Job Title"
              rules={[{ required: true, message: "Please enter job title" }]}
            >
              <Input placeholder="Senior Developer" />
            </Form.Item>
            <Form.Item
              name="company"
              label="Company Name"
              rules={[{ required: true, message: "Please enter company name" }]}
            >
              <Input placeholder="Acme Corp" />
            </Form.Item>
            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: "Please enter location" }]}
            >
              <Input placeholder="New York, USA" />
            </Form.Item>
            <Form.Item
              name="employmentType"
              label="Employment Type"
              rules={[
                {
                  required: true,
                  message: "Please select employment type",
                },
              ]}
            >
              <Input placeholder="Full-time" />
            </Form.Item>
            <Form.Item
              name="experience"
              label="Experience Required"
              rules={[{ required: true, message: "Please enter experience" }]}
            >
              <Input placeholder="5+ years" />
            </Form.Item>
            <Form.Item
              name="tags"
              label="Tags (comma separated)"
              rules={[{ required: true, message: "Please enter tags" }]}
            >
              <Input placeholder="React, Node.js, JavaScript" />
            </Form.Item>
            <Form.Item label="Job Description" required>
              <div
                style={{
                  marginBottom: "8px",
                  display: "flex",
                  gap: "4px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  size="small"
                  onClick={() => document.execCommand("bold")}
                  title="Bold"
                >
                  <strong>B</strong>
                </Button>
                <Button
                  size="small"
                  onClick={() => document.execCommand("italic")}
                  title="Italic"
                >
                  <em>I</em>
                </Button>
                <Button
                  size="small"
                  onClick={() => document.execCommand("underline")}
                  title="Underline"
                >
                  <u>U</u>
                </Button>
                <Button
                  size="small"
                  onClick={() => document.execCommand("insertUnorderedList")}
                  title="Bullet List"
                >
                  • List
                </Button>
                <Button
                  size="small"
                  onClick={() => document.execCommand("insertOrderedList")}
                  title="Ordered List"
                >
                  1. List
                </Button>
                <Button
                  size="small"
                  onClick={() => document.execCommand("removeFormat")}
                  title="Clear Formatting"
                >
                  Clear
                </Button>
              </div>
              <div
                style={{
                  border: "1px solid #d9d9d9",
                  borderRadius: "2px",
                  minHeight: "200px",
                  padding: "8px",
                  overflow: "auto",
                  backgroundColor: "#fff",
                  fontFamily: "inherit",
                }}
                contentEditable
                onInput={(e) => setDescriptionHtml(e.currentTarget.innerHTML)}
                suppressContentEditableWarning
                onMouseUp={() => {
                  const selection = window.getSelection();
                  if (selection.toString()) {
                    console.log("Selected text:", selection.toString());
                  }
                }}
              >
                Enter job description here...
              </div>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Create Job
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
