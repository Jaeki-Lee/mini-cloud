import { Network, SecurityGroup } from '../types/network';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// 네트워크 목록 조회
export const getNetworks = async (): Promise<Network[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/networks`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`네트워크 목록 조회 실패: ${response.status}`);
    }

    const networks = await response.json();
    console.log('네트워크 목록 조회 성공:', networks);
    return networks;
  } catch (error) {
    console.error('네트워크 목록 조회 오류:', error);
    throw error;
  }
};

// 특정 네트워크 조회
export const getNetwork = async (networkId: string): Promise<Network> => {
  try {
    const response = await fetch(`${API_BASE_URL}/networks/${networkId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`네트워크 조회 실패: ${response.status}`);
    }

    const network = await response.json();
    console.log('네트워크 조회 성공:', network);
    return network;
  } catch (error) {
    console.error('네트워크 조회 오류:', error);
    throw error;
  }
};

// 보안그룹 목록 조회
export const getSecurityGroups = async (): Promise<SecurityGroup[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/security-groups`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`보안그룹 목록 조회 실패: ${response.status}`);
    }

    const securityGroups = await response.json();
    console.log('보안그룹 목록 조회 성공:', securityGroups);
    return securityGroups;
  } catch (error) {
    console.error('보안그룹 목록 조회 오류:', error);
    throw error;
  }
};

// 특정 보안그룹 조회
export const getSecurityGroup = async (securityGroupId: string): Promise<SecurityGroup> => {
  try {
    const response = await fetch(`${API_BASE_URL}/security-groups/${securityGroupId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`보안그룹 조회 실패: ${response.status}`);
    }

    const securityGroup = await response.json();
    console.log('보안그룹 조회 성공:', securityGroup);
    return securityGroup;
  } catch (error) {
    console.error('보안그룹 조회 오류:', error);
    throw error;
  }
};