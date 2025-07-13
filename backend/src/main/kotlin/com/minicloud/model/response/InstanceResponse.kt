package com.minicloud.model.response

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.LocalDateTime

data class InstanceResponse(
    val id: String,
    val name: String,
    val status: String,
    val powerState: String,
    val vmState: String,
    val taskState: String?,
    val imageId: String?,
    val flavorId: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val networks: Map<String, List<String>>,
    val securityGroups: List<SecurityGroup>,
    val keyName: String?,
    val availabilityZone: String,
    val hostId: String?,
    val hypervisorHostname: String?
)

data class InstanceListResponse(
    val instances: List<InstanceSummary>,
    val totalCount: Int
)

data class InstanceSummary(
    val id: String,
    val name: String,
    val status: String,
    val powerState: String,
    val imageId: String?,
    val flavorId: String,
    val createdAt: LocalDateTime,
    val networks: Map<String, List<String>>
)

data class SecurityGroup(
    val name: String,
    val description: String?
)

data class FlavorResponse(
    val id: String,
    val name: String,
    val vcpus: Int,
    val ram: Int,
    val disk: Int,
    val isPublic: Boolean
)

data class ImageResponse(
    val id: String,
    val name: String,
    val status: String,
    val visibility: String,
    val size: Long?,
    val diskFormat: String?,
    val containerFormat: String?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)