package com.minicloud.service

import com.minicloud.model.response.NetworkResponse
import com.minicloud.model.response.SecurityGroupResponse
import com.minicloud.model.response.SecurityGroupRuleResponse

// NeutronNetwork를 NetworkResponse로 변환
fun NeutronNetwork.toResponse(): NetworkResponse {
    return NetworkResponse(
        id = this.id,
        name = this.name,
        adminStateUp = this.adminStateUp,
        status = this.status,
        shared = this.shared,
        routerExternal = this.routerExternal,
        tenantId = this.tenantId,
        projectId = this.projectId,
        subnets = this.subnets,
        description = this.description,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
}

// SecurityGroupRule을 SecurityGroupRuleResponse로 변환
fun SecurityGroupRule.toResponse(): SecurityGroupRuleResponse {
    return SecurityGroupRuleResponse(
        id = this.id,
        direction = this.direction,
        etherType = this.etherType,
        protocol = this.protocol,
        portRangeMin = this.portRangeMin,
        portRangeMax = this.portRangeMax,
        remoteIpPrefix = this.remoteIpPrefix,
        remoteGroupId = this.remoteGroupId,
        securityGroupId = this.securityGroupId,
        tenantId = this.tenantId,
        projectId = this.projectId,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
}

// NeutronSecurityGroup을 SecurityGroupResponse로 변환
fun NeutronSecurityGroup.toResponse(): SecurityGroupResponse {
    return SecurityGroupResponse(
        id = this.id,
        name = this.name,
        description = this.description,
        tenantId = this.tenantId,
        projectId = this.projectId,
        securityGroupRules = this.securityGroupRules.map { it.toResponse() },
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
}