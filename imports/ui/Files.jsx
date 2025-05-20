import React from 'react';
import { useFind, useSubscribe } from 'meteor/react-meteor-data';
import { FilesCollection, FileTypes } from '../api/files';
import { Tabs, Card, Typography, Image, Button, Spin, Tag } from 'antd';
import { FileImageOutlined, FilePdfOutlined, LinkOutlined } from '@ant-design/icons';

import { useRole } from '/imports/context/RoleContext';
import { canViewFiles, canOpenFiles } from '/imports/utils/rolePermissions';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const FileCard = ({ file, canClick }) => {
  const renderFileContent = () => {
    switch (file.type) {
      case FileTypes.IMAGE:
        return (
          <div>
            <Image
              src={file.url}
              alt={file.name}
              style={{ maxHeight: '200px', objectFit: 'cover', opacity: canClick ? 1 : 0.5 }}
              preview={canClick}
            />
            <div style={{ marginTop: '8px' }}>
              <Tag color="blue">{file.metadata.format.toUpperCase()}</Tag>
              <Text type="secondary">{(file.metadata.size / (1024 * 1024)).toFixed(2)} MB</Text>
            </div>
          </div>
        );
      case FileTypes.PDF:
        return (
          <div>
            <FilePdfOutlined style={{ fontSize: '48px', color: '#ff4d4f', opacity: canClick ? 1 : 0.5 }} />
            <div style={{ marginTop: '8px' }}>
              <Tag color="red">PDF</Tag>
              <Text type="secondary">{(file.metadata.size / (1024 * 1024)).toFixed(2)} MB</Text>
            </div>
          </div>
        );
      case FileTypes.URL:
        return (
          <div>
            <LinkOutlined style={{ fontSize: '48px', color: '#1890ff', opacity: canClick ? 1 : 0.5 }} />
            <div style={{ marginTop: '8px' }}>
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
      style={{ marginBottom: '16px' }}
      extra={
        canClick && (
          <Button type="link" href={file.url} target="_blank" rel="noopener noreferrer">
            Open
          </Button>
        )
      }
    >
      {renderFileContent()}
      <div style={{ marginTop: '16px' }}>
        <Text type="secondary">{file.metadata.description}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Created: {file.createdAt.toLocaleDateString()}
        </Text>
      </div>
    </Card>
  );
};

export const Files = () => {
  const role = useRole();
  const isLoading = useSubscribe('files');
  const files = useFind(() => FilesCollection.find());

  const showFiles = canViewFiles(role);
  const canClickFiles = canOpenFiles(role);

  if (!showFiles) {
    return null; // viewer can't see Files section at all
  }

  if (isLoading()) {
    return <Spin size="large" />;
  }

  const filesByType = {
    [FileTypes.IMAGE]: files.filter(file => file.type === FileTypes.IMAGE),
    [FileTypes.PDF]: files.filter(file => file.type === FileTypes.PDF),
    [FileTypes.URL]: files.filter(file => file.type === FileTypes.URL),
  };

  return (
    <Card style={{ marginBottom: '20px' }}>
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
          {filesByType[FileTypes.IMAGE].map(file => (
            <FileCard key={file._id} file={file} canClick={canClickFiles} />
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
          {filesByType[FileTypes.PDF].map(file => (
            <FileCard key={file._id} file={file} canClick={canClickFiles} />
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
          {filesByType[FileTypes.URL].map(file => (
            <FileCard key={file._id} file={file} canClick={canClickFiles} />
          ))}
        </TabPane>
      </Tabs>
    </Card>
  );
};