import React from "react";
import { Card, Form, Input, Button, Checkbox, Typography, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser } from "../features/auth/authSlice";
import bg from "../assets/login-bg.svg";

const { Title, Paragraph, Text } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    try {
      await dispatch(loginUser(values)).unwrap();
      message.success("Login successful");
      navigate("/dashboard");
    } catch (err) {
      message.error(err || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={bg} alt="background" className="left-bg-svg" />
        <div className="left-content">
          <Title level={1} style={{ color: "#fff", margin: 0 }}>
            Aspire
          </Title>
          <Paragraph
            style={{
              color: "rgba(255,255,255,0.95)",
              marginTop: 8,
              fontSize: 18,
            }}
          >
            Build beautiful, production-ready admin interfaces in minutes.
            Aspire gives your team a polished dashboard, secure access controls,
            and flexible components so you can focus on business logic — not UI.
          </Paragraph>

          <div className="feature-list" style={{ marginTop: 18 }}>
            <div className="feature-item">
              <CheckCircleOutlined style={{ color: "#fff", marginRight: 10 }} />
              <div>
                <strong>Fast setup</strong>
                <div className="feature-sub">
                  Pre-built layouts & components
                </div>
              </div>
            </div>

            <div className="feature-item">
              <CheckCircleOutlined style={{ color: "#fff", marginRight: 10 }} />
              <div>
                <strong>Secure by default</strong>
                <div className="feature-sub">
                  Role-based auth & safe defaults
                </div>
              </div>
            </div>

            <div className="feature-item">
              <CheckCircleOutlined style={{ color: "#fff", marginRight: 10 }} />
              <div>
                <strong>Customizable</strong>
                <div className="feature-sub">
                  Themeable, responsive, and extendable
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <Card className="login-card">
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <Title level={3} style={{ margin: 0 }}>
              Welcome back
            </Title>
            <Text type="secondary">Sign in to continue to Aspire</Text>
          </div>

          <Form
            name="login"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Enter a valid email" },
              ]}
            >
              <Input
                size="large"
                prefix={<UserOutlined />}
                placeholder="name@example.com"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item>
              <div className="form-row">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <a className="forgot" href="#">
                  Forgot password?
                </a>
              </div>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large">
                Sign in
              </Button>
            </Form.Item>

            <div className="signup-row">
              <Text type="secondary">
                Don't have an account? <a href="#">Sign up</a>
              </Text>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}
