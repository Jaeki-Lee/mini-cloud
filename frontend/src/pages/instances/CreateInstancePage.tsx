import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Typography,
  Space,
  Divider,
  Row,
  Col,
  Alert,
  Spin,
  message,
  InputNumber,
  Descriptions
} from 'antd';
import {
  ArrowLeftOutlined,
  DatabaseOutlined,
  CloudOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { CreateInstanceRequest, Flavor } from '../../types/instance';
import { instanceService } from '../../services/instanceApi';
import { imageService, Image } from '../../services/imageApi';
import { getNetworks, getSecurityGroups } from '../../services/networkApi';
import { Network, SecurityGroup } from '../../types/network';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateInstancePage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [flavorsLoading, setFlavorsLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [networksLoading, setNetworksLoading] = useState(true);
  const [securityGroupsLoading, setSecurityGroupsLoading] = useState(true);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [securityGroups, setSecurityGroups] = useState<SecurityGroup[]>([]);
  const [selectedFlavor, setSelectedFlavor] = useState<Flavor | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadFlavors();
    loadImages();
    loadNetworks();
    loadSecurityGroups();
  }, []);

  const loadFlavors = async () => {
    try {
      setFlavorsLoading(true);
      const flavorData = await instanceService.getFlavors();
      setFlavors(flavorData);
    } catch (error: any) {
      message.error(`Flavor 정보를 불러오는데 실패했습니다: ${error.message}`);
    } finally {
      setFlavorsLoading(false);
    }
  };

  const loadImages = async () => {
    try {
      setImagesLoading(true);
      const imageData = await imageService.getImages();
      setImages(imageData);
    } catch (error: any) {
      message.error(`이미지 정보를 불러오는데 실패했습니다: ${error.message}`);
    } finally {
      setImagesLoading(false);
    }
  };

  const loadNetworks = async () => {
    try {
      setNetworksLoading(true);
      const networkData = await getNetworks();
      setNetworks(networkData);
      
      // 기본 네트워크 설정 (첫 번째 네트워크를 기본값으로)
      if (networkData.length > 0) {
        form.setFieldsValue({ networkIds: [networkData[0].id] });
      }
    } catch (error: any) {
      message.error(`네트워크 정보를 불러오는데 실패했습니다: ${error.message}`);
    } finally {
      setNetworksLoading(false);
    }
  };

  const loadSecurityGroups = async () => {
    try {
      setSecurityGroupsLoading(true);
      const securityGroupData = await getSecurityGroups();
      setSecurityGroups(securityGroupData);
      
      // 기본 보안그룹 설정 (default 그룹 찾기)
      const defaultGroup = securityGroupData.find(sg => sg.name === 'default');
      if (defaultGroup) {
        form.setFieldsValue({ securityGroups: [defaultGroup.id] });
      }
    } catch (error: any) {
      message.error(`보안그룹 정보를 불러오는데 실패했습니다: ${error.message}`);
    } finally {
      setSecurityGroupsLoading(false);
    }
  };

  const handleFlavorChange = (flavorId: string) => {
    const flavor = flavors.find(f => f.id === flavorId);
    setSelectedFlavor(flavor || null);
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      const request: CreateInstanceRequest = {
        name: values.name,
        imageId: values.imageId,
        flavorId: values.flavorId,
        networkIds: values.networkIds || [],
        keyName: values.keyName || undefined,
        securityGroups: values.securityGroups || ['default'],
        userData: values.userData || undefined,
      };

      await instanceService.createInstance(request);
      message.success('인스턴스 생성이 시작되었습니다.');
      navigate('/instances');
    } catch (error: any) {
      message.error(`인스턴스 생성 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/instances')}
          style={{ marginBottom: '16px' }}
        >
          뒤로가기
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          <DatabaseOutlined style={{ marginRight: 8 }} />
          새 인스턴스 생성
        </Title>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="인스턴스 정보" loading={flavorsLoading || imagesLoading || networksLoading || securityGroupsLoading}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                networkIds: [],
                securityGroups: []
              }}
            >
              {/* Basic Information */}
              <Divider orientation="left">
                <Space>
                  <SettingOutlined />
                  기본 정보
                </Space>
              </Divider>

              <Form.Item
                label="인스턴스 이름"
                name="name"
                rules={[
                  { required: true, message: '인스턴스 이름을 입력해주세요.' },
                  { min: 2, message: '이름은 2자 이상이어야 합니다.' },
                  { max: 50, message: '이름은 50자 이하여야 합니다.' }
                ]}
              >
                <Input placeholder="예: my-web-server" />
              </Form.Item>

              {/* Image Selection */}
              <Form.Item
                label="이미지"
                name="imageId"
                rules={[{ required: true, message: '이미지를 선택해주세요.' }]}
              >
                <Select 
                  placeholder="이미지를 선택하세요"
                  loading={imagesLoading}
                >
                  {images.map(image => (
                    <Option key={image.id} value={image.id}>
                      {image.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Flavor Selection */}
              <Form.Item
                label="인스턴스 타입 (Flavor)"
                name="flavorId"
                rules={[{ required: true, message: '인스턴스 타입을 선택해주세요.' }]}
              >
                <Select
                  placeholder="인스턴스 타입을 선택하세요"
                  onChange={handleFlavorChange}
                  loading={flavorsLoading}
                >
                  {flavors.map(flavor => (
                    <Option key={flavor.id} value={flavor.id}>
                      {flavor.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Network Configuration */}
              <Divider orientation="left">
                <Space>
                  <CloudOutlined />
                  네트워크 설정
                </Space>
              </Divider>

              <Form.Item
                label="네트워크"
                name="networkIds"
                rules={[{ required: true, message: '최소 하나의 네트워크를 선택해주세요.' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="네트워크를 선택하세요"
                  loading={networksLoading}
                >
                  {networks.map(network => (
                    <Option key={network.id} value={network.id}>
                      <div>
                        <strong>{network.name}</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          상태: {network.status} | 
                          {network.shared ? ' 공유됨' : ' 비공유'} |
                          {network.routerExternal ? ' 외부' : ' 내부'}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="보안 그룹"
                name="securityGroups"
                rules={[{ required: true, message: '최소 하나의 보안 그룹을 선택해주세요.' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="보안 그룹을 선택하세요"
                  loading={securityGroupsLoading}
                >
                  {securityGroups.map(sg => (
                    <Option key={sg.id} value={sg.id}>
                      <div>
                        <strong>{sg.name}</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {sg.description || '설명 없음'} | 
                          규칙 개수: {sg.securityGroupRules?.length || 0}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Advanced Settings */}
              <Divider orientation="left">고급 설정</Divider>

              <Form.Item
                label="키 페어"
                name="keyName"
              >
                <Select
                  placeholder="SSH 키 페어를 선택하세요 (선택사항)"
                  allowClear
                >
                  {/* Mock key pairs - 실제로는 Nova API에서 가져와야 함 */}
                  <Option value="my-key">my-key</Option>
                  <Option value="server-key">server-key</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="사용자 데이터 (User Data)"
                name="userData"
              >
                <TextArea
                  rows={4}
                  placeholder="인스턴스 부팅 시 실행할 스크립트를 입력하세요 (선택사항)"
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                  >
                    인스턴스 생성
                  </Button>
                  <Button
                    onClick={() => navigate('/instances')}
                    size="large"
                  >
                    취소
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Selected Flavor Information */}
          {selectedFlavor && (
            <Card title="선택된 인스턴스 타입" style={{ marginBottom: '16px' }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="이름">{selectedFlavor.name}</Descriptions.Item>
                <Descriptions.Item label="vCPU">{selectedFlavor.vcpus} 코어</Descriptions.Item>
                <Descriptions.Item label="메모리">
                  {formatBytes(selectedFlavor.ram * 1024 * 1024)}
                </Descriptions.Item>
                <Descriptions.Item label="디스크">{selectedFlavor.disk} GB</Descriptions.Item>
                <Descriptions.Item label="공개">
                  {selectedFlavor.isPublic ? '예' : '아니오'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* Information Card */}
          <Card title="참고사항">
            <Alert
              message="인스턴스 생성 안내"
              description={
                <div>
                  <p>• 인스턴스 생성에는 몇 분이 소요될 수 있습니다.</p>
                  <p>• 생성 후 인스턴스 목록에서 상태를 확인할 수 있습니다.</p>
                  <p>• SSH 접속을 위해서는 키 페어 설정이 필요합니다.</p>
                  <p>• 보안 그룹을 통해 네트워크 접근을 제어할 수 있습니다.</p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateInstancePage;