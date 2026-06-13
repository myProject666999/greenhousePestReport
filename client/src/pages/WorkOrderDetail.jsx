import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Image, Button, Spin, Empty, Timeline, Modal, Radio, Input, message } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getWorkOrderDetail } from '../api/workOrder';
import { createFeedback } from '../api/feedback';
import dayjs from 'dayjs';

const severityMap = { mild: { color: 'green', text: '轻度' }, moderate: { color: 'orange', text: '中度' }, severe: { color: 'red', text: '重度' } };
const statusMap = {
  pending: { color: 'orange', text: '待认领' },
  assigned: { color: 'blue', text: '已认领' },
  diagnosed: { color: 'green', text: '已诊断' },
  feedback_pending: { color: 'purple', text: '待反馈' },
  completed: { color: 'default', text: '已完成' },
  closed: { color: 'default', text: '已关闭' }
};

const WorkOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('day3');
  const [feedbackResult, setFeedbackResult] = useState('');
  const [feedbackDesc, setFeedbackDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const res = await getWorkOrderDetail(id);
      setOrder(res.data);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async () => {
    if (!feedbackResult) {
      message.warning('请选择效果');
      return;
    }
    setSubmitting(true);
    try {
      await createFeedback({
        work_order_id: order.id,
        feedback_type: feedbackType,
        result: feedbackResult,
        description: feedbackDesc
      });
      message.success('反馈提交成功');
      setFeedbackModal(false);
      loadDetail();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><Spin size="large" /></div>;
  if (!order) return <Empty description="工单不存在" />;

  const diagnosis = order.diagnosis;
  const feedbacks = order.feedbacks || [];
  const hasDay3Feedback = feedbacks.some(f => f.feedback_type === 'day3');
  const hasDay7Feedback = feedbacks.some(f => f.feedback_type === 'day7');
  const diagnosedAt = order.diagnosed_at ? dayjs(order.diagnosed_at) : null;
  const daysSinceDiagnosis = diagnosedAt ? dayjs().diff(diagnosedAt, 'day') : 0;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>{order.order_no}</h3>
          <Tag color={statusMap[order.status]?.color}>{statusMap[order.status]?.text}</Tag>
        </div>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="大棚">{order.greenhouse?.name}</Descriptions.Item>
          <Descriptions.Item label="作物">{order.greenhouse?.crop_type}</Descriptions.Item>
          <Descriptions.Item label="地址">{order.greenhouse?.address}</Descriptions.Item>
          <Descriptions.Item label="上报时间">{dayjs(order.created_at).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
          {order.technician && <Descriptions.Item label="农技员">{order.technician.real_name}</Descriptions.Item>}
        </Descriptions>
        <div style={{ marginTop: 12 }}>
          <strong>问题描述：</strong>
          <p style={{ margin: '4px 0' }}>{order.description}</p>
        </div>
      </Card>

      <Card title="📸 现场照片" style={{ borderRadius: 12, marginBottom: 16 }}>
        <Image.PreviewGroup>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(order.images || []).map((img, idx) => (
              <Image key={idx} src={img.image_url} width={100} height={100} style={{ borderRadius: 8, objectFit: 'cover' }} />
            ))}
          </div>
        </Image.PreviewGroup>
      </Card>

      {diagnosis && (
        <Card title="🩺 诊断结果" style={{ borderRadius: 12, marginBottom: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <Tag color={severityMap[diagnosis.severity]?.color}>{severityMap[diagnosis.severity]?.text}</Tag>
            <span style={{ fontWeight: 'bold', marginLeft: 8 }}>{diagnosis.pest_name}</span>
          </div>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="诊断结论">{diagnosis.diagnosis_result}</Descriptions.Item>
            <Descriptions.Item label="处置方案">{diagnosis.treatment_plan}</Descriptions.Item>
            {diagnosis.pesticide && <Descriptions.Item label="建议农药">{diagnosis.pesticide}</Descriptions.Item>}
            {diagnosis.dosage && <Descriptions.Item label="使用剂量">{diagnosis.dosage}</Descriptions.Item>}
            {diagnosis.frequency && <Descriptions.Item label="使用频次">{diagnosis.frequency}</Descriptions.Item>}
            {diagnosis.precautions && <Descriptions.Item label="注意事项">{diagnosis.precautions}</Descriptions.Item>}
          </Descriptions>
        </Card>
      )}

      {feedbacks.length > 0 && (
        <Card title="📝 反馈记录" style={{ borderRadius: 12, marginBottom: 16 }}>
          <Timeline items={feedbacks.map(f => ({
            color: f.result === 'recovered' ? 'green' : f.result === 'worse' ? 'red' : 'orange',
            children: (
              <div>
                <Tag>{f.feedback_type === 'day3' ? '3天反馈' : '7天反馈'}</Tag>
                <Tag color={f.result === 'recovered' ? 'green' : f.result === 'worse' ? 'red' : 'orange'}>
                  {f.result === 'recovered' ? '好了' : f.result === 'no_change' ? '没好' : '更差了'}
                </Tag>
                <div style={{ color: '#999', fontSize: 12 }}>{dayjs(f.created_at).format('YYYY-MM-DD HH:mm')}</div>
                {f.description && <p style={{ margin: '4px 0' }}>{f.description}</p>}
              </div>
            )
          }))} />
        </Card>
      )}

      {diagnosis && order.status !== 'completed' && order.status !== 'closed' && (
        <div style={{ display: 'flex', gap: 8 }}>
          {!hasDay3Feedback && daysSinceDiagnosis >= 3 && (
            <Button type="primary" block onClick={() => { setFeedbackType('day3'); setFeedbackModal(true); }} style={{ borderRadius: 8 }}>
              3天效果反馈
            </Button>
          )}
          {!hasDay7Feedback && daysSinceDiagnosis >= 7 && (
            <Button type="primary" block onClick={() => { setFeedbackType('day7'); setFeedbackModal(true); }} style={{ borderRadius: 8 }}>
              7天效果反馈
            </Button>
          )}
          {daysSinceDiagnosis < 3 && (
            <Button block disabled style={{ borderRadius: 8 }}>
              <ClockCircleOutlined /> 3天后可反馈效果
            </Button>
          )}
        </div>
      )}

      <Modal title={`${feedbackType === 'day3' ? '3天' : '7天'}效果反馈`} open={feedbackModal} onCancel={() => setFeedbackModal(false)} onOk={handleFeedback} confirmLoading={submitting}>
        <div style={{ marginBottom: 16 }}>
          <p>治疗效果如何？</p>
          <Radio.Group value={feedbackResult} onChange={(e) => setFeedbackResult(e.target.value)}>
            <Radio.Button value="recovered">✅ 好了</Radio.Button>
            <Radio.Button value="no_change">😐 没好</Radio.Button>
            <Radio.Button value="worse">❌ 更差了</Radio.Button>
          </Radio.Group>
        </div>
        <Input.TextArea rows={3} placeholder="补充说明（选填）" value={feedbackDesc} onChange={(e) => setFeedbackDesc(e.target.value)} />
      </Modal>
    </div>
  );
};

export default WorkOrderDetail;
