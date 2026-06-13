import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, Button, Descriptions, Image, Spin, message, Tag, Radio } from 'antd';
import { getWorkOrderDetail } from '../api/workOrder';
import { getPestTypes } from '../api/pestType';
import { createDiagnosis } from '../api/diagnosis';
import dayjs from 'dayjs';

const severityMap = { mild: { color: 'green', text: '轻度' }, moderate: { color: 'orange', text: '中度' }, severe: { color: 'red', text: '重度' } };

const TechnicianDiagnose = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [pestTypes, setPestTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [orderRes, pestRes] = await Promise.all([getWorkOrderDetail(id), getPestTypes()]);
      setOrder(orderRes.data);
      setPestTypes(pestRes.data);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const selectedPest = pestTypes.find(p => p.id === values.pest_type_id);
      await createDiagnosis({
        work_order_id: order.id,
        ...values,
        pest_name: selectedPest ? selectedPest.name : values.pest_name
      });
      message.success('诊断成功');
      navigate('/technician');
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><Spin size="large" /></div>;
  if (!order) return <div>工单不存在</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>🩺 诊断工单 {order.order_no}</h2>

      <Card style={{ marginBottom: 16, borderRadius: 8 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="大棚">{order.greenhouse?.name}</Descriptions.Item>
          <Descriptions.Item label="作物">{order.greenhouse?.crop_type}</Descriptions.Item>
          <Descriptions.Item label="地址">{order.greenhouse?.address}</Descriptions.Item>
          <Descriptions.Item label="农户">{order.farmer?.real_name} ({order.farmer?.phone})</Descriptions.Item>
          <Descriptions.Item label="上报时间">{dayjs(order.created_at).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
        </Descriptions>
        <div style={{ marginTop: 12 }}>
          <strong>问题描述：</strong>
          <p style={{ margin: '4px 0' }}>{order.description}</p>
        </div>
        <div style={{ marginTop: 12 }}>
          <strong>现场照片：</strong>
          <Image.PreviewGroup style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            {(order.images || []).map((img, idx) => (
              <Image key={idx} src={img.image_url} width={120} height={120} style={{ borderRadius: 8, objectFit: 'cover' }} />
            ))}
          </Image.PreviewGroup>
        </div>
      </Card>

      <Card title="诊断处置" style={{ borderRadius: 8 }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="pest_type_id" label="病虫害类型" rules={[{ required: true, message: '请选择病虫害类型' }]}>
            <Select placeholder="请选择病虫害类型" showSearch optionFilterProp="children">
              {pestTypes.map(p => (
                <Select.Option key={p.id} value={p.id}>
                  <Tag color={p.category === 'disease' ? 'blue' : 'orange'}>{p.category === 'disease' ? '病害' : '虫害'}</Tag>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="severity" label="严重程度" initialValue="moderate">
            <Radio.Group>
              {Object.entries(severityMap).map(([k, v]) => (
                <Radio.Button key={k} value={k}><Tag color={v.color}>{v.text}</Tag></Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>

          <Form.Item name="diagnosis_result" label="诊断结论" rules={[{ required: true, message: '请填写诊断结论' }]}>
            <Input.TextArea rows={2} placeholder="请填写诊断结论" maxLength={500} showCount />
          </Form.Item>

          <Form.Item name="treatment_plan" label="处置方案" rules={[{ required: true, message: '请填写处置方案' }]}>
            <Input.TextArea rows={3} placeholder="请填写详细的处置方案，如农药使用方法、喷施频率等" maxLength={1000} showCount />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item name="pesticide" label="建议农药">
              <Input placeholder="如：吡虫啉、三唑酮" />
            </Form.Item>
            <Form.Item name="dosage" label="使用剂量">
              <Input placeholder="如：1000倍液、每亩50克" />
            </Form.Item>
            <Form.Item name="frequency" label="使用频次">
              <Input placeholder="如：每隔7天喷一次，连续2-3次" />
            </Form.Item>
          </div>

          <Form.Item name="precautions" label="注意事项">
            <Input.TextArea rows={2} placeholder="如：避免高温时段喷药、注意个人防护等" maxLength={500} showCount />
          </Form.Item>

          <Form.Item name="remarks" label="备注">
            <Input.TextArea rows={1} placeholder="其他需要说明的事项" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} size="large" style={{ marginRight: 12 }}>
              提交诊断
            </Button>
            <Button onClick={() => navigate('/technician')} size="large">返回</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TechnicianDiagnose;
