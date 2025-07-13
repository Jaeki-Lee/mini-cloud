import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Card,
  Typography,
  Tooltip,
  Dropdown,
  Modal,
  message,
  Row,
  Col,
  Statistic,
  Spin,
  Alert
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  StopOutlined,
  DeleteOutlined,
  MoreOutlined,
  PlusOutlined,
  DatabaseOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  InstanceSummary,
  InstanceAction,
  getStatusColor,
  getStatusText,
  getActionText,
  InstanceStatus
} from '../../types/instance';
import { instanceService } from '../../services/instanceApi';

const { Title } = Typography;
const { confirm } = Modal;

const InstanceListPage: React.FC = () => {
  const [instances, setInstances] = useState<InstanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    try {
      setLoading(true);
      const response = await instanceService.getInstances();
      setInstances(response.instances);
    } catch (error: any) {
      message.error(`인스턴스 목록을 불러오는데 실패했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInstanceAction = async (instanceId: string, action: InstanceAction) => {
    if (action === InstanceAction.DELETE) {
      confirm({
        title: '인스턴스 삭제',
        content: '정말로 이 인스턴스를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
        okText: '삭제',
        okType: 'danger',
        cancelText: '취소',
        onOk: () => performAction(instanceId, action),
      });
    } else {
      performAction(instanceId, action);
    }
  };

  const performAction = async (instanceId: string, action: InstanceAction) => {
    try {
      setActionLoading(instanceId);
      await instanceService.performInstanceAction(instanceId, { action });
      message.success(`${getActionText(action)} 작업이 시작되었습니다.`);
      
      // Reload instances after action
      setTimeout(() => {
        loadInstances();
      }, 1000);
    } catch (error: any) {
      message.error(`${getActionText(action)} 실패: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getAvailableActions = (instance: InstanceSummary) => {
    const actions = [];
    
    switch (instance.status) {
      case InstanceStatus.ACTIVE:
        actions.push(
          { key: InstanceAction.STOP, icon: <StopOutlined />, label: '중지' },
          { key: InstanceAction.RESTART, icon: <ReloadOutlined />, label: '재시작' },
          { key: InstanceAction.PAUSE, icon: <PauseCircleOutlined />, label: '일시정지' }
        );
        break;
      case InstanceStatus.SHUTOFF:
        actions.push(
          { key: InstanceAction.START, icon: <PlayCircleOutlined />, label: '시작' }
        );
        break;
      case InstanceStatus.PAUSED:
        actions.push(
          { key: InstanceAction.UNPAUSE, icon: <PlayCircleOutlined />, label: '재개' }
        );
        break;
      case InstanceStatus.SUSPENDED:
        actions.push(
          { key: InstanceAction.RESUME, icon: <PlayCircleOutlined />, label: '복구' }
        );
        break;
    }

    if (instance.status !== InstanceStatus.DELETED) {
      actions.push(
        { type: 'divider' },
        { key: InstanceAction.DELETE, icon: <DeleteOutlined />, label: '삭제', danger: true }
      );
    }

    return actions;
  };

  const getNetworkAddresses = (networks: Record<string, string[]>) => {
    const addresses = Object.values(networks).flat();
    return addresses.length > 0 ? addresses.join(', ') : 'N/A';
  };

  const columns = [
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: InstanceSummary) => (
        <Button
          type="link"
          onClick={() => navigate(`/instances/${record.id}`)}
          style={{ padding: 0, height: 'auto' }}
        >
          <Space>
            <DatabaseOutlined />
            {name}
          </Space>
        </Button>
      ),
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'IP 주소',
      dataIndex: 'networks',
      key: 'networks',
      render: (networks: Record<string, string[]>) => (
        <span>{getNetworkAddresses(networks)}</span>
      ),
    },
    {
      title: '생성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => new Date(createdAt).toLocaleString('ko-KR'),
    },
    {
      title: '작업',
      key: 'actions',
      render: (_, record: InstanceSummary) => {
        const actions = getAvailableActions(record);
        
        if (actions.length === 0) return null;

        return (
          <Dropdown
            menu={{
              items: actions.map(action => ({
                ...action,
                onClick: action.key ? () => handleInstanceAction(record.id, action.key as InstanceAction) : undefined,
              }))
            }}
            trigger={['click']}
            disabled={actionLoading === record.id}
          >
            <Button
              type="text"
              icon={actionLoading === record.id ? <SyncOutlined spin /> : <MoreOutlined />}
              size="small"
            />
          </Dropdown>
        );
      },
    },
  ];

  const getInstanceCounts = () => {
    const counts = {
      total: instances.length,
      active: instances.filter(i => i.status === InstanceStatus.ACTIVE).length,
      stopped: instances.filter(i => i.status === InstanceStatus.SHUTOFF).length,
      error: instances.filter(i => i.status === InstanceStatus.ERROR).length,
    };
    return counts;
  };

  const counts = getInstanceCounts();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>인스턴스 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              <DatabaseOutlined style={{ marginRight: 8 }} />
              인스턴스
            </Title>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<SyncOutlined />}
                onClick={loadInstances}
                loading={loading}
              >
                새로고침
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/instances/create')}
              >
                인스턴스 생성
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="전체"
              value={counts.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="실행 중"
              value={counts.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="중지됨"
              value={counts.stopped}
              valueStyle={{ color: '#d9d9d9' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="오류"
              value={counts.error}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Instances Table */}
      <Card>
        {instances.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Alert
              message="인스턴스가 없습니다"
              description="새로운 인스턴스를 생성해보세요."
              type="info"
              showIcon
              action={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/instances/create')}
                >
                  인스턴스 생성
                </Button>
              }
            />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={instances}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} / 총 ${total}개`,
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default InstanceListPage;