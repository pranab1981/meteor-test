import React, { useState } from "react";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { FilesCollection, FileTypes } from "../api/files";
import { RolePermissions } from "../api/roles";
import {
  Tabs,
  Card,
  Typography,
  Image,
  Button,
  Spin,
  Tag,
  message,
  Modal,
  Input,
} from "antd";
import {
  FileImageOutlined,
  FilePdfOutlined,
  LinkOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const FileCard = ({ file, currentUserRole, onDelete }) => {
  const canDeleteFiles = RolePermissions[currentUserRole]?.canDeleteFiles;

  const renderFileContent = () => {
    switch (file.type) {
      case FileTypes.IMAGE:
        return (
          <div>
            <Image
              src={file.url}
              alt={file.name}
              style={{ maxHeight: "200px", objectFit: "cover" }}
            />
            <div style={{ marginTop: "8px" }}>
              <Tag color="blue">{file.metadata.format.toUpperCase()}</Tag>
              <Text type="secondary">
                {(file.metadata.size / (1024 * 1024)).toFixed(2)} MB
              </Text>
            </div>
          </div>
        );
      case FileTypes.PDF:
        return (
          <div>
            <FilePdfOutlined style={{ fontSize: "48px", color: "#ff4d4f" }} />
            <div style={{ marginTop: "8px" }}>
              <Tag color="red">PDF</Tag>
              <Text type="secondary">
                {(file.metadata.size / (1024 * 1024)).toFixed(2)} MB
              </Text>
            </div>
          </div>
        );
      case FileTypes.URL:
        return (
          <div>
            <LinkOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
            <div style={{ marginTop: "8px" }}>
              <Tag color="green">URL</Tag>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      title={file.name}
      style={{ marginBottom: "16px" }}
      extra={
        <div>
          <Button type="link" href={file.url} target="_blank">
            Open
          </Button>
          {canDeleteFiles && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(file._id)}
            />
          )}
        </div>
      }
    >
      {renderFileContent()}
      <div style={{ marginTop: "16px" }}>
        <Text type="secondary">{file.metadata.description}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: "12px" }}>
          Created: {file.createdAt.toLocaleDateString()}
        </Text>
      </div>
    </Card>
  );
};

export const Files = ({ currentUser }) => {
  const [addFileModalVisible, setAddFileModalVisible] = useState(false);
  const [addFileType, setAddFileType] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const isLoadingFiles = useSubscribe("files");
  const files = useFind(() => FilesCollection.find());

  if (isLoadingFiles()) {
    return <Spin size="large" />;
  }

  const currentUserRole = currentUser?.role;
  const canAddFiles = RolePermissions[currentUserRole]?.canAddFiles;
  const canDeleteFiles = RolePermissions[currentUserRole]?.canDeleteFiles;

  const filesByType = {
    [FileTypes.IMAGE]: files.filter((file) => file.type === FileTypes.IMAGE),
    [FileTypes.PDF]: files.filter((file) => file.type === FileTypes.PDF),
    [FileTypes.URL]: files.filter((file) => file.type === FileTypes.URL),
  };

  const handleAddFile = (fileType) => {
    setAddFileType(fileType);
    setAddFileModalVisible(true);
    setFormData({
      name: "",
      url: "",
      description: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddFileSubmit = async () => {
    try {
      setIsLoading(true);

      // Validate form
      if (!formData.name || !formData.url) {
        message.error("Name and URL are required");
        return;
      }

      // For demo purposes, we'll just show a success message
      // In a real app, you would call a server method to add the file
      await Meteor.callAsync("files.add", {
        name: formData.name,
        type: addFileType,
        url: formData.url,
        metadata: {
          size: Math.floor(Math.random() * 5 * 1024 * 1024), // Random size for demo
          format: addFileType === FileTypes.IMAGE ? "jpg" : "pdf",
          description: formData.description,
        },
      });

      message.success(`${addFileType} added successfully`);
      setAddFileModalVisible(false);
    } catch (error) {
      message.error("Failed to add file: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      if (!canDeleteFiles) {
        message.error("You do not have permission to delete files");
        return;
      }

      await Meteor.callAsync("files.delete", fileId);
      message.success("File deleted successfully");
    } catch (error) {
      message.error("Failed to delete file: " + error.message);
    }
  };

  return (
    <Card style={{ marginBottom: "20px" }}>
      <Title level={3}>Files</Title>

      <Tabs defaultActiveKey={FileTypes.IMAGE}>
        <TabPane
          tab={
            <span>
              <FileImageOutlined />
              Images ({filesByType[FileTypes.IMAGE].length})
            </span>
          }
          key={FileTypes.IMAGE}
        >
          {canAddFiles && (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => handleAddFile(FileTypes.IMAGE)}
              style={{ marginBottom: "16px", width: "100%" }}
            >
              Add Image
            </Button>
          )}
          {filesByType[FileTypes.IMAGE].map((file) => (
            <FileCard
              key={file._id}
              file={file}
              currentUserRole={currentUserRole}
              onDelete={handleDeleteFile}
            />
          ))}
        </TabPane>

        <TabPane
          tab={
            <span>
              <FilePdfOutlined />
              PDFs ({filesByType[FileTypes.PDF].length})
            </span>
          }
          key={FileTypes.PDF}
        >
          {canAddFiles && (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => handleAddFile(FileTypes.PDF)}
              style={{ marginBottom: "16px", width: "100%" }}
            >
              Add PDF
            </Button>
          )}
          {filesByType[FileTypes.PDF].map((file) => (
            <FileCard
              key={file._id}
              file={file}
              currentUserRole={currentUserRole}
              onDelete={handleDeleteFile}
            />
          ))}
        </TabPane>

        <TabPane
          tab={
            <span>
              <LinkOutlined />
              URLs ({filesByType[FileTypes.URL].length})
            </span>
          }
          key={FileTypes.URL}
        >
          {canAddFiles && (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => handleAddFile(FileTypes.URL)}
              style={{ marginBottom: "16px", width: "100%" }}
            >
              Add URL
            </Button>
          )}
          {filesByType[FileTypes.URL].map((file) => (
            <FileCard
              key={file._id}
              file={file}
              currentUserRole={currentUserRole}
              onDelete={handleDeleteFile}
            />
          ))}
        </TabPane>
      </Tabs>

      {/* Add File Modal */}
      <Modal
        title={`Add New ${addFileType}`}
        open={addFileModalVisible}
        onOk={handleAddFileSubmit}
        onCancel={() => setAddFileModalVisible(false)}
        confirmLoading={isLoading}
      >
        <div style={{ marginBottom: 16 }}>
          <label>Name:</label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter file name"
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>URL:</label>
          <Input
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            placeholder={
              addFileType === FileTypes.URL
                ? "Enter website URL"
                : "Enter file URL"
            }
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Description:</label>
          <TextArea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter a description"
            rows={3}
          />
        </div>
      </Modal>
    </Card>
  );
};
