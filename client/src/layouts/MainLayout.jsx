import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Badge, Space, Button } from 'antd';
import {
  HomeOutlined, CameraOutlined, FileTextOutlined,
  DashboardOutlined, BarChartOutlined, SettingOutlined,
  LogoutOutlined, NotificationOutlined, AppstoreOutlined
} from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUnreadCount } from '../api/notification';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedKey, setSelectedKey] = useState(window.location.pathname);

  useEffect(() => {
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);
    loadUnreadCount();
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.count);
    } catch {
    }
  };

  const farmerMenu = [
    { key: '/farmer', icon: <HomeOutlined />, label: '首页', onClick: () => navigate('/farmer') },
    { key: '/farmer/report', icon: <CameraOutlined />, label: '上报病虫害', onClick: () => navigate('/farmer/report') },
    { key: '/farmer/orders', icon: <FileTextOutlined />, label: '我的工单', onClick: () => navigate('/farmer/orders') }
  ];

  const techMenu = [
    { key: '/technician', icon: <DashboardOutlined />, label: '工作台', onClick: () => navigate('/technician') },
    { key: '/stats', icon: <BarChartOutlined />, label: '数据统计', onClick: () => navigate('/stats') }
  ];

  const adminMenu = [
    { key: '/admin', icon: <DashboardOutlined />, label: '工作台', onClick: () => navigate('/admin') },
    { key: '/stats', icon: <BarChartOutlined />, label: '数据统计', onClick: () => navigate('/stats') },
    { key: '/admin/greenhouses', icon: <AppstoreOutlined />, label: '大棚管理', onClick: () => navigate('/admin/greenhouses') },
    { key: '/admin/pest-types', icon: <SettingOutlined />, label: '病虫害库', onClick: () => navigate('/admin/pest-types') }
  ];

  const menuItems = user?.role === 'farmer' ? farmerMenu : user?.role === 'technician' ? techMenu : adminMenu;

  const handleProfileClick = () => {
    const basePath = user?.role === 'farmer' ? '/farmer' : user?.role === 'technician' ? '/technician' : '/admin';
    navigate(`${basePath}/profile`);
  };

  const userMenu = [
    { key: 'profile', icon: <SettingOutlined />, label: '个人中心', onClick: handleProfileClick },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: logout }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="dark">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: collapsed ? 12 : 18, fontWeight: 'bold' }}>
          🌿 {collapsed ? '大棚' : '大棚病虫害系统'}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} items={menuItems} onClick={({ key }) => setSelectedKey(key)} />
      </Sider>
      <Layout>
        <Header style={{ background: 'white', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
          <div style={{ fontSize: 18, fontWeight: 'bold' }}>
            {user?.role === 'farmer' ? '农户端' : user?.role === 'technician' ? '农技员工作台' : '管理后台'}
          </div>
          <Space size={24}>
            <Badge count={unreadCount}>
              <Button type="text" icon={<NotificationOutlined style={{ fontSize: 18 }} />} onClick={() => navigate(user?.role === 'farmer' ? '/farmer' : '/technician')} />
            </Badge>
            <Dropdown menu={{ items: userMenu }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#667eea' }}>{user?.real_name?.[0] || 'U'}</Avatar>
                <span>{user?.real_name}</span>
                <span style={{ color: '#999', fontSize: 12 }}>
                  {user?.role === 'farmer' ? '农户' : user?.role === 'technician' ? '农技员' : '管理员'}
                </span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ background: '#f0f2f5', overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
