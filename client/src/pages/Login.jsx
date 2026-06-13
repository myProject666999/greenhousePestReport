import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Radio } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { login, register } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();
  const { loginSuccess } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const api = isRegister ? register : login;
      const res = await api(values);
      if (!isRegister) {
        loginSuccess(res.data);
        message.success('登录成功');
        const role = res.data.user.role;
        if (role === 'farmer') navigate('/farmer');
        else if (role === 'technician') navigate('/technician');
        else navigate('/admin');
      } else {
        message.success('注册成功，请登录');
        setIsRegister(false);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Card style={{ width: 400, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, color: '#333', marginBottom: 4 }}>🌿 大棚病虫害上报系统</h1>
          <p style={{ color: '#999', fontSize: 14 }}>拍张照，让农技员帮您看看</p>
        </div>

        <Radio.Group value={isRegister} onChange={(e) => setIsRegister(e.target.value)} style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
          <Radio.Button value={false}>登录</Radio.Button>
          <Radio.Button value={true}>注册</Radio.Button>
        </Radio.Group>

        <Form onFinish={onFinish} size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          {isRegister && (
            <>
              <Form.Item name="real_name" rules={[{ required: true, message: '请输入姓名' }]}>
                <Input prefix={<UserOutlined />} placeholder="真实姓名" />
              </Form.Item>
              <Form.Item name="phone" rules={[{ required: true, message: '请输入手机号' }]}>
                <Input prefix={<PhoneOutlined />} placeholder="手机号" />
              </Form.Item>
              <Form.Item name="role" initialValue="farmer">
                <Radio.Group>
                  <Radio value="farmer">农户</Radio>
                  <Radio value="technician">农技员</Radio>
                </Radio.Group>
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block style={{ borderRadius: 8, height: 44 }}>
              {isRegister ? '注册' : '登录'}
            </Button>
          </Form.Item>
        </Form>

        {!isRegister && (
          <div style={{ textAlign: 'center' }}>
            <Link to="/scan" style={{ color: '#667eea' }}>📱 扫码直接上报</Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Login;
