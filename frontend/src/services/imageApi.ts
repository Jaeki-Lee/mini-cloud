import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// 이미지 인터페이스 정의
export interface Image {
  id: string;
  name: string;
  status: string;
  visibility: string;
  size?: number;
  diskFormat?: string;
  containerFormat?: string;
  createdAt: string;
  updatedAt: string;
}

// axios 인스턴스 생성
const imageApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // 세션 관리를 위한 쿠키 포함
  headers: {
    'Content-Type': 'application/json',
  },
});

export const imageService = {
  // 이미지 목록 조회
  async getImages(): Promise<Image[]> {
    const response = await imageApi.get<Image[]>('/images');
    return response.data;
  }
};

// 응답 인터셉터로 오류 처리
imageApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('Image API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    // 임시로 리다이렉트 비활성화 - 디버깅 목적
    // if (error.response?.status === 401) {
    //   // 인증 실패 시 로그인 페이지로 리다이렉트
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);