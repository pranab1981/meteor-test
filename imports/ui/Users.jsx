import React from 'react';
import { useFind, useSubscribe } from 'meteor/react-meteor-data';
import { UsersCollection } from '../api/users';
import { Collapse, Card, Typography, Spin } from 'antd';

import { useRole } from '/imports/context/RoleContext';
import { canViewUserDetails } from '/imports/utils/rolePermissions';

const { Panel } = Collapse;
const { Text, Title } = Typography;

export const Users = () => {
  const role = useRole();
  const allowDetails = canViewUserDetails(role);

  const isLoading = useSubscribe('users');
  const users = useFind(() => UsersCollection.find());

  if (isLoading()) {
    return <Spin size="large" />;
  }

  return (
    <Card style={{ marginBottom: '20px' }}>
      <Title level={3}>Users</Title>
      <Collapse>
        {users.map(user => (
          <Panel header={user.profile.name} key={user._id}>
            <Card type="inner">
              {allowDetails ? (
                <>
                  <p><Text strong>Email:</Text> {user.email}</p>
                  <p><Text strong>Created At:</Text> {user.createdAt.toLocaleDateString()}</p>
                  <p>
                    <Text strong>Color:</Text>{' '}
                    <span 
                      style={{ 
                        display: 'inline-block',
                        width: '20px',
                        height: '20px',
                        backgroundColor: user.profile.color,
                        verticalAlign: 'middle',
                        marginLeft: '8px',
                        borderRadius: '4px'
                      }}
                    />
                  </p>
                </>
              ) : (
                <Text type="secondary">User details restricted</Text>
              )}
            </Card>
          </Panel>
        ))}
      </Collapse>
    </Card>
  );
}; 