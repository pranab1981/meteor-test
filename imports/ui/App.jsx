import React, { useState, useEffect } from "react";
import { Layout, Typography, Button, Spin, message } from "antd";
import { UsersCollection, CurrentUser } from "../api/users";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { LogoutOutlined } from "@ant-design/icons";
import { Users } from "./Users.jsx";
import { Files } from "./Files.jsx";
import { Login } from "./Login.jsx";

const { Header, Content } = Layout;
const { Title } = Typography;

export const App = () => {
  const [userId, setUserId] = useState(CurrentUser.get());
  const [currentUser, setCurrentUser] = useState(null);
  const isLoadingUsers = useSubscribe("users");
  const isLoadingFiles = useSubscribe("files");
  const users = useFind(() => UsersCollection.find());

  // Fetch current user data whenever userId changes
  useEffect(() => {
    if (userId && users.length > 0) {
      const user = users.find((u) => u._id === userId);
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }
  }, [userId, users]);

  const handleLogin = (newUserId) => {
    setUserId(newUserId);
  };

  const handleLogout = () => {
    CurrentUser.clear();
    setUserId(null);
    setCurrentUser(null);
    message.success("Logged out successfully");
  };

  // Show loading state while subscriptions are loading
  if (isLoadingUsers() || isLoadingFiles()) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Loading application..." />
      </div>
    );
  }

  // If user is not logged in, show login screen
  if (!userId || !currentUser) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  // User is logged in, show application
  return (
    <Layout>
      <Header
        style={{
          background: "#fff",
          padding: "0 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={2} style={{ margin: "16px 0" }}>
          Welcome to FileNest!
        </Title>
        <div>
          <span style={{ marginRight: 16 }}>
            Logged in as <strong>{currentUser.profile.name}</strong> (
            {currentUser.role})
          </span>
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </Header>
      <Content style={{ padding: "20px" }}>
        <Users currentUser={currentUser} />
        <Files currentUser={currentUser} />
      </Content>
    </Layout>
  );
};
