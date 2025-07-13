export interface Network {
  id: string;
  name: string;
  adminStateUp: boolean;
  status: string;
  shared: boolean;
  routerExternal: boolean;
  tenantId: string;
  projectId: string;
  subnets: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SecurityGroupRule {
  id: string;
  direction: 'ingress' | 'egress';
  etherType: 'IPv4' | 'IPv6';
  protocol?: string;
  portRangeMin?: number;
  portRangeMax?: number;
  remoteIpPrefix?: string;
  remoteGroupId?: string;
  securityGroupId: string;
  tenantId: string;
  projectId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SecurityGroup {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  projectId: string;
  securityGroupRules?: SecurityGroupRule[];
  createdAt?: string;
  updatedAt?: string;
}