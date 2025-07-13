import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Space, 
  Button, 
  Typography, 
  message,
  Tooltip,
  Row,
  Col,
  Statistic,
  Modal,
  Descriptions
} from 'antd';
import { 
  PictureOutlined,
  ReloadOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons';
import { imageService } from '../../services/imageApi';
import { Image } from '../../types/image';

const { Title } = Typography;

const ImageListPage: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // 이미지 목록 로드
  const loadImages = async () => {
    try {
      setLoading(true);
      const imageData = await imageService.getImages();
      setImages(imageData);
    } catch (error: any) {
      console.error('이미지 목록 로딩 오류:', error);
      // 오류 시 현재 페이지에 머무르도록 수정 (디버깅용)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  // 파일 크기를 읽기 쉬운 형태로 변환
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // 날짜 포맷
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  // 상태에 따른 태그 색상
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active': return 'green';
      case 'saving': return 'blue';
      case 'queued': return 'orange';
      case 'killed': return 'red';
      case 'pending_delete': return 'red';
      case 'deleted': return 'default';
      default: return 'default';
    }
  };

  // 가시성에 따른 태그 색상
  const getVisibilityColor = (visibility: string): string => {
    switch (visibility.toLowerCase()) {
      case 'public': return 'blue';
      case 'private': return 'orange';
      case 'shared': return 'green';
      case 'community': return 'purple';
      default: return 'default';
    }
  };

  // 이미지 상세 정보 표시
  const showImageDetail = (image: Image) => {
    setSelectedImage(image);
    setDetailModalVisible(true);
  };

  // 이미지 상세 모달 닫기
  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedImage(null);
  };

  const columns = [
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Image) => (
        <Space>
          <PictureOutlined />
          <span style={{ fontWeight: 500 }}>{name}</span>
        </Space>
      ),
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: '가시성',
      dataIndex: 'visibility',
      key: 'visibility',
      render: (visibility: string) => (
        <Tag color={getVisibilityColor(visibility)}>
          {visibility.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: '크기',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => formatFileSize(size),
    },
    {
      title: '디스크 형식',
      dataIndex: 'diskFormat',
      key: 'diskFormat',
      render: (format: string) => format ? format.toUpperCase() : '-',
    },
    {
      title: '컨테이너 형식',
      dataIndex: 'containerFormat',
      key: 'containerFormat',
      render: (format: string) => format ? format.toUpperCase() : '-',
    },
    {
      title: '생성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: '작업',
      key: 'actions',
      render: (_, record: Image) => (
        <Space>
          <Tooltip title="상세 정보">
            <Button 
              type="text" 
              icon={<InfoCircleOutlined />}
              onClick={() => showImageDetail(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 헤더 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <PictureOutlined style={{ marginRight: '8px' }} />
            이미지 관리
          </Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={loadImages}
          >
            새로고침
          </Button>
        </Col>
      </Row>

      {/* 통계 카드 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="전체 이미지"
              value={images.length}
              prefix={<PictureOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="활성 이미지"
              value={images.filter(img => img.status === 'active').length}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="공개 이미지"
              value={images.filter(img => img.visibility === 'public').length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="총 크기"
              value={formatFileSize(images.reduce((total, img) => total + (img.size || 0), 0))}
            />
          </Card>
        </Col>
      </Row>

      {/* 이미지 목록 테이블 */}
      <Card>
        <Table
          columns={columns}
          dataSource={images}
          rowKey="id"
          loading={loading}
          pagination={{
            total: images.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} / 총 ${total}개`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* 이미지 상세 정보 모달 */}
      <Modal
        title={
          <Space>
            <PictureOutlined />
            이미지 상세 정보
          </Space>
        }
        open={detailModalVisible}
        onCancel={closeDetailModal}
        footer={[
          <Button key="close" onClick={closeDetailModal}>
            닫기
          </Button>
        ]}
        width={800}
      >
        {selectedImage && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="이름" span={2}>
              {selectedImage.name}
            </Descriptions.Item>
            <Descriptions.Item label="ID" span={2}>
              <Typography.Text code>{selectedImage.id}</Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="상태">
              <Tag color={getStatusColor(selectedImage.status)}>
                {selectedImage.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="가시성">
              <Tag color={getVisibilityColor(selectedImage.visibility)}>
                {selectedImage.visibility.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="크기">
              {formatFileSize(selectedImage.size)}
            </Descriptions.Item>
            <Descriptions.Item label="디스크 형식">
              {selectedImage.diskFormat ? selectedImage.diskFormat.toUpperCase() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="컨테이너 형식">
              {selectedImage.containerFormat ? selectedImage.containerFormat.toUpperCase() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="생성일">
              {formatDate(selectedImage.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="수정일" span={2}>
              {formatDate(selectedImage.updatedAt)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ImageListPage;