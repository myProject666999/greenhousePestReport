import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Badge, Statistic, Row, Col, Spin, message } from 'antd';
import { ToTopOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getWorkOrders, claimWorkOrder, getPendingCount } from '../api/workOrder';
import { getOverview } from '../api/stats';
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

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [activeTab, page]);

  const loadOverview = async () => {
    try {
      const [res, pendingRes] = await Promise.all([getOverview(), getPendingCount()]);
      setOverview(res.data);
      setPendingCount(pendingRes.data.count);
    } catch {
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getWorkOrders({ status: activeTab, page, pageSize: 10 });
      setOrders(res.data.list);
      setTotal(res.data.total);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (id) => {
    try {
      await claimWorkOrder(id);
      message.success('认领成功');
      loadOrders();
      loadOverview();
    } catch (error) {
      const errMsg = error.response?.data?.message || '认领失败，请刷新页面重试';
      message.error(errMsg);
      loadOrders();
    }
  };

  const columns = [
    { title: '工单编号', dataIndex: 'order_no', key: 'order_no', width: 160 },
    {
      title: '图片', dataIndex: 'images', key: 'images', width: 80, render: (images) =>
        images?.[0] ? <img src={images[0].image_url} alt="" style={{ width: 50, height: 50, borderRadius: 4, objectFit: 'cover' }} /> : '-'
    },
    { title: '问题描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '大棚', dataIndex: ['greenhouse', 'name'], key: 'greenhouse', width: 120 },
    { title: '农户', dataIndex: ['farmer', 'real_name'], key: 'farmer', width: 80 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (status) => <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
    },
    { title: '上报时间', dataIndex: 'created_at', key: 'created_at', width: 160, render: (t) => dayjs(t).format('YYYY-MM-DD HH:mm') },
    {
      title: '操作', key: 'action', width: 150,
      render: (_, record) => {
        if (activeTab === 'pending') {
          return <Button type="primary" size="small" onClick={() => handleClaim(record.id)}>认领</Button>;
        }
        if (activeTab === 'assigned') {
          return <Button type="primary" size="small" onClick={() => navigate(`/technician/diagnose/${record.id}`)}>诊断</Button>;
        }
        return <Button size="small" onClick={() => navigate(`/technician/orders/${record.id}`)}>查看</Button>;
      }
    }
  ];

  const tabList = [
    { key: 'pending', tab: <span>待认领 <Badge count={pendingCount} /></span> },
    { key: 'assigned', tab: '已认领' },
    { key: 'diagnosed', tab: '已诊断' },
    { key: 'completed', tab: '已完成' }
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>👨‍🌾 农技员工作台</h2>

      {overview && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic title="待认领工单" value={pendingCount} prefix={<ToTopOutlined />} valueStyle={{ color: '#fa8c16' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="处理中" value={overview.assigned} prefix={<FileTextOutlined />} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="已诊断" value={overview.diagnosed} prefix={<FileTextOutlined />} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="已完成" value={overview.completed} prefix={<CheckCircleOutlined />} />
            </Card>
          </Col>
        </Row>
      )}

      <Card
        tabList={tabList}
        activeTabKey={activeTab}
        onTabChange={(key) => { setActiveTab(key); setPage(1); }}
        style={{ borderRadius: 8 }}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={orders}
          loading={loading}
          pagination={{
            current: page,
            total,
            pageSize: 10,
            onChange: setPage,
            showSizeChanger: false,
            showQuickJumper: true
          }}
        />
      </Card>
    </div>
  );
};

export default TechnicianDashboard;
