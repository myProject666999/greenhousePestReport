import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Tag, message, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getPestTypes, createPestType, updatePestType, deletePestType } from '../api/pestType';
import dayjs from 'dayjs';

const AdminPestTypes = () => {
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
      const res = await getPestTypes();
      setData(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await updatePestType(editing.id, values);
        message.success('更新成功');
      } else {
        await createPestType(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      loadData();
      form.resetFields();
    } catch {
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePestType(id);
      message.success('删除成功');
      loadData();
    } catch {
    }
  };

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name', width: 120 },
    {
      title: '类型', dataIndex: 'category', key: 'category', width: 80,
      render: v => <Tag color={v === 'disease' ? 'blue' : 'orange'}>{v === 'disease' ? '病害' : '虫害'}</Tag>
    },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '症状', dataIndex: 'symptoms', key: 'symptoms', ellipsis: true },
    { title: '预防措施', dataIndex: 'prevention', key: 'prevention', ellipsis: true },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 160, render: t => dayjs(t).format('YYYY-MM-DD HH:mm') },
    {
      title: '操作', key: 'action', width: 140,
      render: (_, record) => (
        <>
          <Button type="link" icon={<EditOutlined />} onClick={() => { setEditing(record); form.setFieldsValue(record); setModalOpen(true); }} size="small">
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} size="small">
            删除
          </Button>
        </>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="🦠 病虫害库管理"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
        新增
      </Button>}
        style={{ borderRadius: 8 }}
      >
        <Table rowKey="id" columns={columns} dataSource={data} loading={loading} />
      </Card>

      <Modal
        title={editing ? '编辑病虫害' : '新增病虫害'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="name" label="病虫害名称" rules={[{ required: true }]}>
              <Input placeholder="如：白粉病" />
            </Form.Item>
            <Form.Item name="category" label="类型" initialValue="disease" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="disease">病害</Select.Option>
                <Select.Option value="pest">虫害</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="description" label="病虫害描述">
            <Input.TextArea rows={2} placeholder="病虫害基本介绍" />
          </Form.Item>
          <Form.Item name="symptoms" label="典型症状">
            <Input.TextArea rows={2} placeholder="病虫害的典型症状描述" />
          </Form.Item>
          <Form.Item name="prevention" label="预防措施">
            <Input.TextArea rows={2} placeholder="预防和治疗措施" />
          </Form.Item>
          <Form.Item name="image_url" label="示例图片URL">
            <Input placeholder="示例图片链接" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPestTypes;
