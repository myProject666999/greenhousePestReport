import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, List, Tag, Empty, Spin, Select, Image } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { getWorkOrders } from '../api/workOrder';
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

const FarmerOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadOrders();
  }, [status, page]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getWorkOrders({ status: status || undefined, page, pageSize: 10 });
      setOrders(res.data.list);
      setTotal(res.data.total);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>
      <Card title="📋 我的工单" style={{ borderRadius: 12 }} extra={
        <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }} style={{ width: 100 }} allowClear placeholder="状态">
          <Select.Option value="">全部</Select.Option>
          <Select.Option value="pending">待认领</Select.Option>
          <Select.Option value="diagnosed">已诊断</Select.Option>
          <Select.Option value="feedback_pending">待反馈</Select.Option>
          <Select.Option value="completed">已完成</Select.Option>
        </Select>
      }>
        {loading ? <Spin /> : orders.length === 0 ? (
          <Empty description="暂无工单" />
        ) : (
          <List
            dataSource={orders}
            pagination={{ current: page, total, pageSize: 10, onChange: setPage, size: 'small' }}
            renderItem={item => (
              <List.Item onClick={() => navigate(`/farmer/orders/${item.id}`)} style={{ cursor: 'pointer' }}>
                <List.Item.Meta
                  avatar={
                    item.images?.[0] ? (
                      <Image src={item.images[0].image_url} width={60} height={60} style={{ borderRadius: 8, objectFit: 'cover' }} preview={false} />
                    ) : (
                      <div style={{ width: 60, height: 60, background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📸</div>
                    )
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{item.order_no}</span>
                      <Tag color={statusMap[item.status]?.color}>{statusMap[item.status]?.text}</Tag>
                    </div>
                  }
                  description={
                    <div>
                      <div>{item.description?.substring(0, 40)}{item.description?.length > 40 ? '...' : ''}</div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{dayjs(item.created_at).format('YYYY-MM-DD HH:mm')} · {item.greenhouse?.name}</div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default FarmerOrders;
