export interface Instance {
  id: string;
  name: string;
  status: string;
  powerState: string;
  vmState: string;
  taskState?: string;
  imageId?: string;
  flavorId: string;
  createdAt: string;
  updatedAt: string;
  networks: Record<string, string[]>;
  securityGroups: SecurityGroup[];
  keyName?: string;
  availabilityZone: string;
  hostId?: string;
  hypervisorHostname?: string;
}

export interface InstanceSummary {
  id: string;
  name: string;
  status: string;
  powerState: string;
  imageId?: string;
  flavorId: string;
  createdAt: string;
  networks: Record<string, string[]>;
}

export interface InstanceListResponse {
  instances: InstanceSummary[];
  totalCount: number;
}

export interface SecurityGroup {
  name: string;
  description?: string;
}

export interface Flavor {
  id: string;
  name: string;
  vcpus: number;
  ram: number;
  disk: number;
  isPublic: boolean;
}

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

export interface CreateInstanceRequest {
  name: string;
  imageId: string;
  flavorId: string;
  networkIds?: string[];
  keyName?: string;
  securityGroups?: string[];
  userData?: string;
}

export interface InstanceActionRequest {
  action: InstanceAction;
  force?: boolean;
}

export enum InstanceAction {
  START = 'START',
  STOP = 'STOP',
  RESTART = 'RESTART',
  PAUSE = 'PAUSE',
  UNPAUSE = 'UNPAUSE',
  SUSPEND = 'SUSPEND',
  RESUME = 'RESUME',
  DELETE = 'DELETE'
}

export interface InstanceActionResponse {
  success: boolean;
  message: string;
}

// Instance status helpers
export const InstanceStatus = {
  ACTIVE: 'ACTIVE',
  BUILD: 'BUILD',
  DELETED: 'DELETED',
  ERROR: 'ERROR',
  HARD_REBOOT: 'HARD_REBOOT',
  PASSWORD: 'PASSWORD',
  PAUSED: 'PAUSED',
  REBOOT: 'REBOOT',
  REBUILD: 'REBUILD',
  RESCUE: 'RESCUE',
  RESIZE: 'RESIZE',
  REVERT_RESIZE: 'REVERT_RESIZE',
  SHELVED: 'SHELVED',
  SHELVED_OFFLOADED: 'SHELVED_OFFLOADED',
  SHUTOFF: 'SHUTOFF',
  SOFT_DELETED: 'SOFT_DELETED',
  SUSPENDED: 'SUSPENDED',
  UNKNOWN: 'UNKNOWN',
  VERIFY_RESIZE: 'VERIFY_RESIZE'
} as const;

export const PowerState = {
  NO_STATE: '0',
  RUNNING: '1',
  BLOCKED: '2',
  PAUSED: '3',
  SHUTDOWN: '4',
  SHUTOFF: '5',
  CRASHED: '6',
  SUSPENDED: '7'
} as const;

// Status badge colors
export const getStatusColor = (status: string): string => {
  switch (status) {
    case InstanceStatus.ACTIVE:
      return 'success';
    case InstanceStatus.BUILD:
      return 'processing';
    case InstanceStatus.ERROR:
      return 'error';
    case InstanceStatus.PAUSED:
    case InstanceStatus.SUSPENDED:
      return 'warning';
    case InstanceStatus.SHUTOFF:
    case InstanceStatus.DELETED:
      return 'default';
    default:
      return 'default';
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case InstanceStatus.ACTIVE:
      return '실행 중';
    case InstanceStatus.BUILD:
      return '생성 중';
    case InstanceStatus.ERROR:
      return '오류';
    case InstanceStatus.PAUSED:
      return '일시정지';
    case InstanceStatus.SUSPENDED:
      return '중단됨';
    case InstanceStatus.SHUTOFF:
      return '종료됨';
    case InstanceStatus.DELETED:
      return '삭제됨';
    case InstanceStatus.REBOOT:
      return '재시작 중';
    default:
      return status;
  }
};

export const getActionText = (action: InstanceAction): string => {
  switch (action) {
    case InstanceAction.START:
      return '시작';
    case InstanceAction.STOP:
      return '중지';
    case InstanceAction.RESTART:
      return '재시작';
    case InstanceAction.PAUSE:
      return '일시정지';
    case InstanceAction.UNPAUSE:
      return '재개';
    case InstanceAction.SUSPEND:
      return '중단';
    case InstanceAction.RESUME:
      return '복구';
    case InstanceAction.DELETE:
      return '삭제';
    default:
      return action;
  }
};