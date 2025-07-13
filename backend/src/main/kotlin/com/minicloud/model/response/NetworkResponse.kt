package com.minicloud.model.response

// 프론트엔드로 보낼 camelCase DTO
data class NetworkResponse(
    val id: String,
    val name: String,
    val adminStateUp: Boolean,
    val status: String,
    val shared: Boolean,
    val routerExternal: Boolean,
    val tenantId: String,
    val projectId: String,
    val subnets: List<String>,
    val description: String? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null
)

data class SecurityGroupRuleResponse(
    val id: String,
    val direction: String, // ingress or egress
    val etherType: String, // IPv4 or IPv6
    val protocol: String?, // tcp, udp, icmp, null
    val portRangeMin: Int?,
    val portRangeMax: Int?,
    val remoteIpPrefix: String?,
    val remoteGroupId: String?,
    val securityGroupId: String,
    val tenantId: String,
    val projectId: String,
    val createdAt: String? = null,
    val updatedAt: String? = null
)

data class SecurityGroupResponse(
    val id: String,
    val name: String,
    val description: String?,
    val tenantId: String,
    val projectId: String,
    val securityGroupRules: List<SecurityGroupRuleResponse>,
    val createdAt: String? = null,
    val updatedAt: String? = null
)