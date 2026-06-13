import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

import Login from './pages/Login';
import ScanReport from './pages/ScanReport';
import FarmerDashboard from './pages/FarmerDashboard';
import FarmerOrders from './pages/FarmerOrders';
import FarmerReport from './pages/FarmerReport';
import WorkOrderDetail from './pages/WorkOrderDetail';
import TechnicianDashboard from './pages/TechnicianDashboard';
import TechnicianDiagnose from './pages/TechnicianDiagnose';
import StatsDashboard from './pages/StatsDashboard';
import AdminGreenhouses from './pages/AdminGreenhouses';
import AdminPestTypes from './pages/AdminPestTypes';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/scan" element={<ScanReport />} />

            <Route path="/farmer" element={<ProtectedRoute allowedRoles={['farmer']}><MainLayout /></ProtectedRoute>}>
              <Route index element={<FarmerDashboard />} />
              <Route path="report" element={<FarmerReport />} />
              <Route path="orders" element={<FarmerOrders />} />
              <Route path="orders/:id" element={<WorkOrderDetail />} />
            </Route>

            <Route path="/technician" element={<ProtectedRoute allowedRoles={['technician', 'admin']}><MainLayout /></ProtectedRoute>}>
              <Route index element={<TechnicianDashboard />} />
              <Route path="orders/:id" element={<WorkOrderDetail />} />
              <Route path="diagnose/:id" element={<TechnicianDiagnose />} />
            </Route>

            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout /></ProtectedRoute>}>
              <Route index element={<TechnicianDashboard />} />
              <Route path="orders/:id" element={<WorkOrderDetail />} />
              <Route path="diagnose/:id" element={<TechnicianDiagnose />} />
              <Route path="greenhouses" element={<AdminGreenhouses />} />
              <Route path="pest-types" element={<AdminPestTypes />} />
            </Route>

            <Route path="/stats" element={<ProtectedRoute allowedRoles={['technician', 'admin']}><MainLayout /></ProtectedRoute>}>
              <Route index element={<StatsDashboard />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
