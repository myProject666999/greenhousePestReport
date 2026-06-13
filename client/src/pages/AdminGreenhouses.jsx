import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, message, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, QrcodeOutlined } from '@ant-design/icons';
import { getGreenhouses, createGreenhouse, updateGreenhouse } from '../api/greenhouse';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

const AdminGreenhouses = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getGreenhouses({ pageSize: 100 });
      setData(res.data.list);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await updateGreenhouse(editing.id, values);
        message.success('更新成功');
      } else {
        await createGreenhouse({ ...values, farmer_id: user.id });
        message.success('创建成功');
      }
      setModalOpen(false);
      loadData();
      form.resetFields();
    } catch {
    }
  };

  const handleEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const columns = [
    { title: '二维码', dataIndex: 'qr_code', key: 'qr_code', width: 140, render: (v) => (
      <span><QrcodeOutlined style={{ marginRight: 4 }} />{v}</span>
    )},
    { title: '大棚名称', dataIndex: 'name', key: 'name' },
    { title: '地址', dataIndex: 'address', key: 'address' },
    { title: '作物', dataIndex: 'crop_type', key: 'crop_type' },
    { title: '面积(㎡)', dataIndex: 'area', key: 'area' },
    { title: '位置', key: 'location', render: (_, r) => `${r.province || ''} ${r.city || ''} ${r.district || ''}` },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 160, render: t => dayjs(t).format('YYYY-MM-DD HH:mm') },
    {
      title: '操作', key: 'action', width: 120,
      render: (_, record) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small">
          编辑
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="🏠 大棚管理"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
        新增大棚
      </Button>}
        style={{ borderRadius: 8 }}
      >
        <Table rowKey="id" columns={columns} dataSource={data} loading={loading} />
      </Card>

      <Modal
        title={editing ? '编辑大棚' : '新增大棚'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="大棚名称" rules={[{ required: true }]}>
            <Input placeholder="如：王家草莓1号棚" />
          </Form.Item>
          <Form.Item name="address" label="大棚地址" rules={[{ required: true }]}>
            <Input placeholder="详细地址" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="crop_type" label="作物类型">
              <Input placeholder="如：草莓、番茄" />
            </Form.Item>
            <Form.Item name="area" label="面积(㎡)">
              <Input type="number" />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Form.Item name="province" label="省">
              <Input placeholder="山东省" />
            </Form.Item>
            <Form.Item name="city" label="市">
              <Input placeholder="济南市" />
            </Form.Item>
            <Form.Item name="district" label="区/县">
              <Input placeholder="历城区" />
            </Form.Item>
          </div>
          <Form.Item name="qr_code" label="二维码标识">
            <Input placeholder="如：GH20260001" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminGreenhouses;
