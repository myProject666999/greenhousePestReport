import { useState, useEffect } from 'react';
import { Card, Descriptions, Form, Input, Button, message, Spin, Avatar, Tag } from 'antd';
import { UserOutlined, PhoneOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { getProfile } from '../api/auth';

const roleMap = { farmer: { color: 'green', text: '农户' }, technician: { color: 'blue', text: '农技员' }, admin: { color: 'red', text: '管理员' } };

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getProfile();
      setProfile(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><Spin size="large" /></div>;

  const displayUser = profile || user;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>👤 个人中心</h2>

      <Card style={{ borderRadius: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
          <Avatar size={80} style={{ backgroundColor: '#667eea', fontSize: 36 }}>
            {displayUser?.real_name?.[0] || 'U'}
          </Avatar>
          <div>
            <h3 style={{ margin: 0, fontSize: 22 }}>{displayUser?.real_name}</h3>
            <Tag color={roleMap[displayUser?.role]?.color} style={{ marginTop: 8 }}>
              {roleMap[displayUser?.role]?.text}
            </Tag>
          </div>
        </div>
      </Card>

      <Card title="基本信息" style={{ borderRadius: 8 }}>
        <Descriptions column={1} bordered size="middle">
          <Descriptions.Item label="用户名">{displayUser?.username}</Descriptions.Item>
          <Descriptions.Item label="姓名">{displayUser?.real_name}</Descriptions.Item>
          <Descriptions.Item label="手机号">{displayUser?.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="角色">
            <Tag color={roleMap[displayUser?.role]?.color}>{roleMap[displayUser?.role]?.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="注册时间">{displayUser?.created_at ? new Date(displayUser.created_at).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default Profile;
