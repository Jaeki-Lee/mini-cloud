import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import LoginPage from './pages/auth/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import InstanceListPage from './pages/instances/InstanceListPage';
import CreateInstancePage from './pages/instances/CreateInstancePage';
import InstanceDetailPage from './pages/instances/InstanceDetailPage';
import ImageListPage from './pages/images/ImageListPage';
import AuthGuard from './components/layout/AuthGuard';

// 테마 설정
const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 8,
  },
};

function App() {
  return (
    <ConfigProvider theme={theme}>
      <Router>
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* 보호된 라우트 */}
          <Route path="/" element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="instances" element={<InstanceListPage />} />
            <Route path="instances/create" element={<CreateInstancePage />} />
            <Route path="instances/:instanceId" element={<InstanceDetailPage />} />
            <Route path="volumes" element={<div>Volumes Page (Coming Soon)</div>} />
            <Route path="networks" element={<div>Networks Page (Coming Soon)</div>} />
            <Route path="images" element={<ImageListPage />} />
          </Route>
          
          {/* 모든 경로 - 대시보드로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;