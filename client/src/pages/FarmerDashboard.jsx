import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, List, Tag, Empty, Badge, Spin } from 'antd';
import { PlusOutlined, FileTextOutlined, BellOutlined } from '@ant-design/icons';
import { getWorkOrders } from '../api/workOrder';
import { getFarmerGreenhouses } from '../api/greenhouse';
import { getNotifications, getUnreadCount, markAllRead } from '../api/notification';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

const statusMap = {
  pending: { color: 'orange', text: '待认领' },
  assigned: { color: 'blue', text: '已认领' },
  diagnosed: { color: 'green', text: '已诊断' },
  feedback_pending: { color: 'purple', text: '待反馈' },
  completed: { color: 'default', text: '已完成' },
  closed: { color: 'default', text: '已关闭' }
};

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [greenhouses, setGreenhouses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, ghRes, notiRes, unreadRes] = await Promise.all([
        getWorkOrders({ page: 1, pageSize: 5 }),
        getFarmerGreenhouses(user.id),
        getNotifications({ page: 1, pageSize: 5 }),
        getUnreadCount()
      ]);
      setOrders(ordersRes.data.list);
      setGreenhouses(ghRes.data);
      setNotifications(notiRes.data.list);
      setUnreadCount(unreadRes.data.count);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    } catch {
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>
      <Card style={{ borderRadius: 12, marginBottom: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ color: 'white' }}>
          <h2 style={{ color: 'white', marginBottom: 8 }}>👋 {user?.real_name}，您好！</h2>
          <p style={{ opacity: 0.9, marginBottom: 16 }}>发现病虫害，拍照上报让农技员帮您看看</p>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/farmer/report')} size="large" style={{ borderRadius: 8 }}>
            上报病虫害
          </Button>
        </div>
      </Card>

      <Card title={<span><BellOutlined /> 消息通知 <Badge count={unreadCount} /></span>} style={{ borderRadius: 12, marginBottom: 16 }}
        extra={unreadCount > 0 ? <Button size="small" type="link" onClick={handleMarkAllRead}>全部已读</Button> : null}>
        {notifications.length === 0 ? (
          <Empty description="暂无通知" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List size="small" dataSource={notifications} renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={<span style={{ fontWeight: item.is_read ? 'normal' : 'bold' }}>{item.title}</span>}
                description={item.content}
              />
              <span style={{ fontSize: 12, color: '#999' }}>{dayjs(item.created_at).format('MM/DD HH:mm')}</span>
            </List.Item>
          )} />
        )}
      </Card>

      <Card title={<span><FileTextOutlined /> 我的工单</span>} style={{ borderRadius: 12, marginBottom: 16 }}
        extra={<Button size="small" type="link" onClick={() => navigate('/farmer/orders')}>查看全部</Button>}>
        {loading ? <Spin /> : orders.length === 0 ? (
          <Empty description="暂无工单" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List size="small" dataSource={orders} renderItem={item => (
            <List.Item onClick={() => navigate(`/farmer/orders/${item.id}`)} style={{ cursor: 'pointer' }}>
              <List.Item.Meta
                title={<span>{item.order_no}</span>}
                description={item.description?.substring(0, 30) + (item.description?.length > 30 ? '...' : '')}
              />
              <Tag color={statusMap[item.status]?.color}>{statusMap[item.status]?.text}</Tag>
            </List.Item>
          )} />
        )}
      </Card>

      <Card title="🏠 我的大棚" style={{ borderRadius: 12 }} extra={<Button size="small" type="link" onClick={() => navigate('/farmer/greenhouses')}>管理</Button>}>
        {greenhouses.length === 0 ? (
          <Empty description="暂无大棚" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List size="small" dataSource={greenhouses} renderItem={item => (
            <List.Item>
              <List.Item.Meta title={item.name} description={`${item.crop_type || '未设置'} · ${item.area || '-'}㎡`} />
            </List.Item>
          )} />
        )}
      </Card>
    </div>
  );
};

export default FarmerDashboard;
