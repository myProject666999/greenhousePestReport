import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Upload, Input, Select, message, Spin } from 'antd';
import { CameraOutlined, SendOutlined } from '@ant-design/icons';
import { getFarmerGreenhouses } from '../api/greenhouse';
import { createWorkOrder } from '../api/workOrder';
import { useAuth } from '../contexts/AuthContext';

const FarmerReport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [greenhouses, setGreenhouses] = useState([]);
  const [selectedGh, setSelectedGh] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGreenhouses();
  }, []);

  const loadGreenhouses = async () => {
    try {
      const res = await getFarmerGreenhouses(user.id);
      setGreenhouses(res.data);
      if (res.data.length > 0) setSelectedGh(res.data[0].id);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedGh) { message.warning('请选择大棚'); return; }
    if (!description.trim()) { message.warning('请描述病虫害情况'); return; }
    if (fileList.length === 0) { message.warning('请至少上传1张照片'); return; }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('greenhouse_id', selectedGh);
      formData.append('description', description);
      fileList.forEach((file) => {
        formData.append('images', file.originFileObj || file);
      });
      await createWorkOrder(formData);
      message.success('上报成功！');
      navigate('/farmer/orders');
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><Spin /></div>;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>
      <Card title="📸 上报病虫害" style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>选择大棚</label>
          <Select value={selectedGh} onChange={setSelectedGh} style={{ width: '100%' }} placeholder="请选择大棚">
            {greenhouses.map(gh => (
              <Select.Option key={gh.id} value={gh.id}>{gh.name} ({gh.crop_type})</Select.Option>
            ))}
          </Select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>拍照上传（1-3张）</label>
          <Upload listType="picture-card" fileList={fileList} onChange={({ fileList: nl }) => setFileList(nl)} beforeUpload={() => false} maxCount={3} accept="image/*" capture="environment">
            {fileList.length < 3 && (
              <div><CameraOutlined style={{ fontSize: 24, color: '#667eea' }} /><div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>拍照/选图</div></div>
            )}
          </Upload>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>一句话描述</label>
          <Input.TextArea rows={3} placeholder="叶子怎么了、虫子长啥样..." value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} showCount />
        </div>

        <Button type="primary" icon={<SendOutlined />} loading={submitting} onClick={handleSubmit} block size="large"
          style={{ borderRadius: 8, height: 48, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          提交上报
        </Button>
      </Card>
    </div>
  );
};

export default FarmerReport;
