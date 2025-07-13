import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, CloudOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const { Title, Text } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
  project?: string;
}

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const onFinish = async (values: LoginFormValues) => {
    setError('');
    try {
      await login(values.username, values.password, values.project);
      // 로그인 성공 후 약간의 지연을 두고 리다이렉트
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <CloudOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={2} style={{ margin: 0, color: '#262626' }}>
            Mini Cloud
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            OpenStack Educational Dashboard
          </Text>
        </div>

        <Divider style={{ marginBottom: '32px' }} />

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Please input your username!' },
              { min: 2, message: 'Username must be at least 2 characters' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your OpenStack username"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 4, message: 'Password must be at least 4 characters' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item
            label="Project (Optional)"
            name="project"
          >
            <Input
              placeholder="Leave empty for default project"
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              style={{
                height: '48px',
                fontSize: '16px',
                borderRadius: '8px'
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '32px 0 16px' }} />
        
        <div style={{ textAlign: 'center' }}>
          <Space direction="vertical" size="small">
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Connect with your OpenStack credentials
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Powered by Keystone Authentication
            </Text>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;