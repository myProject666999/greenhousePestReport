import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, Input, Upload, message, Descriptions, Spin } from 'antd';
import { CameraOutlined, SendOutlined } from '@ant-design/icons';
import { getGreenhouseByQr } from '../api/greenhouse';
import { createWorkOrder } from '../api/workOrder';
import { useAuth } from '../contexts/AuthContext';

const ScanReport = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [greenhouse, setGreenhouse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    const qr_code = searchParams.get('q');
    if (qr_code) {
      loadGreenhouse(qr_code);
    }
  }, [searchParams]);

  const loadGreenhouse = async (qr_code) => {
    setLoading(true);
    try {
      const res = await getGreenhouseByQr(qr_code);
      setGreenhouse(res.data);
    } catch {
      message.error('大棚信息获取失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      message.warning('请描述一下病虫害情况');
      return;
    }
    if (fileList.length === 0) {
      message.warning('请至少上传1张照片');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('greenhouse_id', greenhouse.id);
      formData.append('description', description);
      fileList.forEach((file) => {
        formData.append('images', file.originFileObj || file);
      });

      const res = await createWorkOrder(formData);
      message.success('上报成功！农技员会尽快给您回复');
      navigate('/farmer/orders');
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><Spin size="large" tip="加载中..." /></div>;
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>
      {greenhouse ? (
        <>
          <Card style={{ marginBottom: 16, borderRadius: 12 }}>
            <Descriptions title="🏠 大棚信息" column={1} size="small">
              <Descriptions.Item label="名称">{greenhouse.name}</Descriptions.Item>
              <Descriptions.Item label="地址">{greenhouse.address}</Descriptions.Item>
              <Descriptions.Item label="作物">{greenhouse.crop_type}</Descriptions.Item>
              <Descriptions.Item label="面积">{greenhouse.area}㎡</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="📸 拍照上报" style={{ marginBottom: 16, borderRadius: 12 }}>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              beforeUpload={() => false}
              maxCount={3}
              accept="image/*"
              capture="environment"
            >
              {fileList.length < 3 && (
                <div>
                  <CameraOutlined style={{ fontSize: 24, color: '#667eea' }} />
                  <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>拍照/选图</div>
                </div>
              )}
            </Upload>
            <p style={{ color: '#999', fontSize: 12, marginTop: 4 }}>上传1-3张病虫害照片</p>

            <Input.TextArea
              rows={3}
              placeholder="一句话描述：叶子怎么了、虫子长啥样..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              showCount
              style={{ marginTop: 12 }}
            />

            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={submitting}
              onClick={handleSubmit}
              block
              size="large"
              style={{ marginTop: 16, borderRadius: 8, height: 48, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              提交上报
            </Button>
          </Card>
        </>
      ) : (
        <Card style={{ textAlign: 'center', padding: 40, borderRadius: 12 }}>
          <p style={{ fontSize: 48 }}>📷</p>
          <h3>请扫描大棚二维码</h3>
          <p style={{ color: '#999' }}>扫大棚门口的二维码，即可快速上报病虫害</p>
          <Button type="primary" onClick={() => navigate('/login')} style={{ marginTop: 16 }}>
            先登录
          </Button>
        </Card>
      )}
    </div>
  );
};

export default ScanReport;
