import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { Card, Form, Input, Button, message, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { CurrentUser } from "../api/users";

const { Title, Text } = Typography;

export const Login = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      const { email, password } = values;

      // Call the login method
      const userId = await Meteor.callAsync("users.login", email, password);

      if (userId) {
        // Set the current user
        CurrentUser.set(userId);
        message.success("Login successful!");
        onLoginSuccess(userId);
      } else {
        message.error("Invalid email or password");
      }
    } catch (error) {
      message.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 400, margin: "0 auto", marginTop: 50 }}>
      <Title level={2} style={{ textAlign: "center" }}>
        FileNest Login
      </Title>
      <Text
        type="secondary"
        style={{ display: "block", textAlign: "center", marginBottom: 24 }}
      >
        Please login to access your files
      </Text>

      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={handleLogin}
        layout="vertical"
      >
        <Form.Item
          name="email"
          rules={[{ required: true, message: "Please input your email!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{ width: "100%" }}
            loading={loading}
          >
            Log in
          </Button>
        </Form.Item>

        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Demo Accounts:</Text>
          <ul style={{ paddingLeft: 20 }}>
            <li>
              <Text strong>Admin:</Text> john@example.com / password
            </li>
            <li>
              <Text strong>Viewer:</Text> jane@example.com / password
            </li>
            <li>
              <Text strong>Guest:</Text> bob@example.com / password
            </li>
          </ul>
        </div>
      </Form>
    </Card>
  );
};
