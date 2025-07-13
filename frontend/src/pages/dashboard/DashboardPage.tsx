import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Divider, message, Spin } from 'antd';
import {
  DesktopOutlined,
  HddOutlined,
  GlobalOutlined,
  PictureOutlined,
  CloudServerOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { statsService, DashboardStats } from '../../services/statsApi';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // 통계 데이터 로드
  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await statsService.getDashboardStats();
      setStats(statsData);
    } catch (error: any) {
      console.error('통계 로딩 오류:', error);
      // 오류 시 기본값 사용 (디버깅용)
      setStats({
        totalInstances: 0,
        runningInstances: 0,
        totalImages: 0,
        activeImages: 0,
        publicImages: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Dashboard</Title>
        <Text type="secondary">
          Welcome back, {user?.name}! Here's an overview of your OpenStack resources.
        </Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Spin spinning={loading}>
              <Statistic
                title="총 인스턴스"
                value={stats?.totalInstances || 0}
                prefix={<DesktopOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Spin>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Spin spinning={loading}>
              <Statistic
                title="실행 중인 인스턴스"
                value={stats?.runningInstances || 0}
                prefix={<DesktopOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Spin>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Spin spinning={loading}>
              <Statistic
                title="총 이미지"
                value={stats?.totalImages || 0}
                prefix={<PictureOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Spin>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Spin spinning={loading}>
              <Statistic
                title="활성 이미지"
                value={stats?.activeImages || 0}
                prefix={<PictureOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Spin>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Project Information" extra={<CloudServerOutlined />}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>Project Name:</Text>
                <br />
                <Text>{user?.project?.name || 'Default'}</Text>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div>
                <Text strong>Project ID:</Text>
                <br />
                <Text code>{user?.project?.id}</Text>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div>
                <Text strong>Domain:</Text>
                <br />
                <Text>{user?.project?.domain}</Text>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="User Information" extra={<UserOutlined />}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>Username:</Text>
                <br />
                <Text>{user?.name}</Text>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div>
                <Text strong>User ID:</Text>
                <br />
                <Text code>{user?.id}</Text>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div>
                <Text strong>Roles:</Text>
                <br />
                <Space wrap>
                  {user?.roles?.map((role) => (
                    <Text key={role} code>{role}</Text>
                  ))}
                </Space>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card 
        title="Quick Actions" 
        style={{ marginTop: 16 }}
        extra={<Text type="secondary">Coming Soon</Text>}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card 
              hoverable 
              style={{ textAlign: 'center' }}
              bodyStyle={{ padding: '20px' }}
            >
              <DesktopOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }} />
              <div>
                <Text strong>Launch Instance</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Create a new virtual machine
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card 
              hoverable 
              style={{ textAlign: 'center' }}
              bodyStyle={{ padding: '20px' }}
            >
              <HddOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '8px' }} />
              <div>
                <Text strong>Create Volume</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Add persistent storage
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card 
              hoverable 
              style={{ textAlign: 'center' }}
              bodyStyle={{ padding: '20px' }}
            >
              <GlobalOutlined style={{ fontSize: '32px', color: '#722ed1', marginBottom: '8px' }} />
              <div>
                <Text strong>Create Network</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Set up networking
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card 
              hoverable 
              style={{ textAlign: 'center' }}
              bodyStyle={{ padding: '20px' }}
            >
              <PictureOutlined style={{ fontSize: '32px', color: '#fa8c16', marginBottom: '8px' }} />
              <div>
                <Text strong>Upload Image</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Add custom images
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default DashboardPage;