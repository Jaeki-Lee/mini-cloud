import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Space,
  Button,
  Descriptions,
  Tag,
  Row,
  Col,
  Dropdown,
  Modal,
  message,
  Spin,
  Alert,
  Timeline,
  Divider
} from 'antd';
import {
  ArrowLeftOutlined,
  DatabaseOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  StopOutlined,
  DeleteOutlined,
  MoreOutlined,
  SyncOutlined,
  CloudOutlined,
  SecurityScanOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Instance,
  InstanceAction,
  getStatusColor,
  getStatusText,
  getActionText,
  InstanceStatus
} from '../../types/instance';
import { instanceService } from '../../services/instanceApi';

const { Title, Text } = Typography;
const { confirm } = Modal;

const InstanceDetailPage: React.FC = () => {
  const { instanceId } = useParams<{ instanceId: string }>();
  const [instance, setInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (instanceId) {
      loadInstance();
    }
  }, [instanceId]);

  const loadInstance = async () => {
    if (!instanceId) return;
    
    try {
      setLoading(true);
      const instanceData = await instanceService.getInstance(instanceId);
      setInstance(instanceData);
    } catch (error: any) {
      message.error(`인스턴스 정보를 불러오는데 실패했습니다: ${error.message}`);
      navigate('/instances');
    } finally {
      setLoading(false);
    }
  };

  const handleInstanceAction = async (action: InstanceAction) => {
    if (!instance) return;

    if (action === InstanceAction.DELETE) {
      confirm({
        title: '인스턴스 삭제',
        content: '정말로 이 인스턴스를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
        okText: '삭제',
        okType: 'danger',
        cancelText: '취소',
        onOk: () => performAction(action),
      });
    } else {
      performAction(action);
    }
  };

  const performAction = async (action: InstanceAction) => {
    if (!instance) return;

    try {
      setActionLoading(true);
      await instanceService.performInstanceAction(instance.id, { action });
      message.success(`${getActionText(action)} 작업이 시작되었습니다.`);
      
      if (action === InstanceAction.DELETE) {
        navigate('/instances');
      } else {
        // Reload instance after action
        setTimeout(() => {
          loadInstance();
        }, 1000);
      }
    } catch (error: any) {
      message.error(`${getActionText(action)} 실패: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getAvailableActions = () => {
    if (!instance) return [];
    
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

  const getNetworkInfo = () => {
    if (!instance) return [];
    
    return Object.entries(instance.networks).map(([networkName, addresses]) => ({
      networkName,
      addresses
    }));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>인스턴스 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (!instance) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="인스턴스를 찾을 수 없습니다"
          type="error"
          showIcon
        />
      </div>
    );
  }

  const actions = getAvailableActions();
  const networkInfo = getNetworkInfo();

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/instances')}
          style={{ marginBottom: '16px' }}
        >
          인스턴스 목록으로
        </Button>
        
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              <DatabaseOutlined style={{ marginRight: 8 }} />
              {instance.name}
            </Title>
            <Space style={{ marginTop: 8 }}>
              <Tag color={getStatusColor(instance.status)} style={{ fontSize: '14px' }}>
                {getStatusText(instance.status)}
              </Tag>
              <Text type="secondary">ID: {instance.id}</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<SyncOutlined />}
                onClick={loadInstance}
                loading={loading}
              >
                새로고침
              </Button>
              {actions.length > 0 && (
                <Dropdown
                  menu={{
                    items: actions.map(action => ({
                      ...action,
                      onClick: action.key ? () => handleInstanceAction(action.key as InstanceAction) : undefined,
                    }))
                  }}
                  trigger={['click']}
                  disabled={actionLoading}
                >
                  <Button
                    type="primary"
                    icon={actionLoading ? <SyncOutlined spin /> : <MoreOutlined />}
                  >
                    작업
                  </Button>
                </Dropdown>
              )}
            </Space>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          {/* Basic Information */}
          <Card title="기본 정보" style={{ marginBottom: '16px' }}>
            <Descriptions column={1} size="middle">
              <Descriptions.Item label="이름">{instance.name}</Descriptions.Item>
              <Descriptions.Item label="상태">
                <Tag color={getStatusColor(instance.status)}>
                  {getStatusText(instance.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="VM 상태">{instance.vmState}</Descriptions.Item>
              {instance.taskState && (
                <Descriptions.Item label="작업 상태">{instance.taskState}</Descriptions.Item>
              )}
              <Descriptions.Item label="가용 영역">{instance.availabilityZone}</Descriptions.Item>
              {instance.hypervisorHostname && (
                <Descriptions.Item label="하이퍼바이저">{instance.hypervisorHostname}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Compute Information */}
          <Card title="컴퓨팅 정보" style={{ marginBottom: '16px' }}>
            <Descriptions column={1} size="middle">
              <Descriptions.Item label="Flavor ID">{instance.flavorId}</Descriptions.Item>
              {instance.imageId && (
                <Descriptions.Item label="Image ID">{instance.imageId}</Descriptions.Item>
              )}
              {instance.keyName && (
                <Descriptions.Item label="키 페어">{instance.keyName}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Time Information */}
          <Card title="시간 정보">
            <Descriptions column={1} size="middle">
              <Descriptions.Item label="생성일">
                <Space>
                  <ClockCircleOutlined />
                  {new Date(instance.createdAt).toLocaleString('ko-KR')}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="수정일">
                <Space>
                  <ClockCircleOutlined />
                  {new Date(instance.updatedAt).toLocaleString('ko-KR')}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          {/* Network Information */}
          <Card title="네트워크 정보" style={{ marginBottom: '16px' }}>
            {networkInfo.length > 0 ? (
              <div>
                {networkInfo.map(({ networkName, addresses }, index) => (
                  <div key={index} style={{ marginBottom: '16px' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text strong>
                        <CloudOutlined style={{ marginRight: 4 }} />
                        {networkName}
                      </Text>
                      <div style={{ paddingLeft: '20px' }}>
                        {addresses.map((address, addrIndex) => (
                          <Tag key={addrIndex} color="blue" style={{ marginBottom: '4px' }}>
                            {address}
                          </Tag>
                        ))}
                      </div>
                    </Space>
                  </div>
                ))}
              </div>
            ) : (
              <Text type="secondary">네트워크 정보가 없습니다.</Text>
            )}
          </Card>

          {/* Security Groups */}
          <Card title="보안 그룹" style={{ marginBottom: '16px' }}>
            {instance.securityGroups.length > 0 ? (
              <Space wrap>
                {instance.securityGroups.map((sg, index) => (
                  <Tag key={index} icon={<SecurityScanOutlined />} color="orange">
                    {sg.name}
                  </Tag>
                ))}
              </Space>
            ) : (
              <Text type="secondary">보안 그룹이 없습니다.</Text>
            )}
          </Card>

          {/* Additional Information */}
          <Card title="추가 정보">
            <Descriptions column={1} size="middle">
              <Descriptions.Item label="전원 상태">{instance.powerState}</Descriptions.Item>
              {instance.hostId && (
                <Descriptions.Item label="Host ID">
                  <Text code style={{ fontSize: '12px' }}>
                    {instance.hostId}
                  </Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InstanceDetailPage;