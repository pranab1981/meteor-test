import React, { useState } from "react";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { UsersCollection } from "../api/users";
import { Roles, RolePermissions } from "../api/roles";
import {
  Collapse,
  Card,
  Typography,
  Spin,
  Select,
  Button,
  message,
  Tag,
  Modal,
} from "antd";

const { Panel } = Collapse;
const { Text, Title } = Typography;
const { Option } = Select;

export const Users = ({ currentUser }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  // Load all users
  const isLoadingUsers = useSubscribe("users");
  const users = useFind(() => UsersCollection.find());

  if (isLoadingUsers()) {
    return <Spin size="large" />;
  }

  // Get current user's role
  const currentUserRole = currentUser?.role || Roles.GUEST;

  // Check permissions based on role
  const canViewUsers = RolePermissions[currentUserRole]?.canViewUsers;
  const canEditUsers = RolePermissions[currentUserRole]?.canEditUsers;

  // Handle role change
  const showRoleModal = (userId, currentRole) => {
    setSelectedUserId(userId);
    setSelectedRole(currentRole);
    setRoleModalVisible(true);
  };

  const handleRoleChange = async () => {
    try {
      setIsLoading(true);
      // Call server method to update role
      await Meteor.callAsync("users.updateRole", selectedUserId, selectedRole);
      message.success(`User role updated to ${selectedRole}`);
      setRoleModalVisible(false);
    } catch (error) {
      message.error("Failed to update user role: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserRoleTag = (role) => {
    const roleColors = {
      [Roles.ADMIN]: "red",
      [Roles.VIEWER]: "green",
      [Roles.GUEST]: "blue",
    };

    return <Tag color={roleColors[role] || "default"}>{role || "guest"}</Tag>;
  };

  if (!canViewUsers) {
    return (
      <Card>
        <Title level={3}>Users</Title>
        <Text type="warning">You don't have permission to view users.</Text>
      </Card>
    );
  }

  return (
    <Card style={{ marginBottom: "20px" }}>
      <Title level={3}>Users</Title>

      <Collapse>
        {users.map((user) => (
          <Panel
            header={
              <div style={{ display: "flex", alignItems: "center" }}>
                <span>{user.profile.name}</span>
                <span style={{ marginLeft: "16px" }}>
                  {getUserRoleTag(user.role)}
                </span>
              </div>
            }
            key={user._id}
          >
            <Card type="inner">
              <p>
                <Text strong>Email:</Text> {user.email}
              </p>
              <p>
                <Text strong>Created At:</Text>{" "}
                {user.createdAt.toLocaleDateString()}
              </p>
              <p>
                <Text strong>Color:</Text>{" "}
                <span
                  style={{
                    display: "inline-block",
                    width: "20px",
                    height: "20px",
                    backgroundColor: user.profile.color,
                    verticalAlign: "middle",
                    marginLeft: "8px",
                    borderRadius: "4px",
                  }}
                />
              </p>
              {canEditUsers && user._id !== currentUser._id && (
                <div style={{ marginTop: "16px" }}>
                  <Text strong>Role:</Text>{" "}
                  <Button
                    type="primary"
                    size="small"
                    onClick={() =>
                      showRoleModal(user._id, user.role || Roles.GUEST)
                    }
                    style={{ marginLeft: "8px" }}
                  >
                    Change Role
                  </Button>
                </div>
              )}
            </Card>
          </Panel>
        ))}
      </Collapse>

      {/* Role change modal */}
      <Modal
        title="Change User Role"
        open={roleModalVisible}
        onOk={handleRoleChange}
        onCancel={() => setRoleModalVisible(false)}
        confirmLoading={isLoading}
      >
        <p>Select a new role for this user:</p>
        <Select
          style={{ width: "100%" }}
          value={selectedRole}
          onChange={setSelectedRole}
        >
          {Object.values(Roles).map((role) => (
            <Option key={role} value={role}>
              {role}
            </Option>
          ))}
        </Select>
      </Modal>
    </Card>
  );
};
