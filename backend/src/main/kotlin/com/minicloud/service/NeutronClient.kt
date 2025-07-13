package com.minicloud.service

import com.fasterxml.jackson.annotation.JsonProperty
import kotlinx.coroutines.reactor.awaitSingle
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody

data class NeutronNetwork(
    val id: String,
    val name: String,
    @JsonProperty("admin_state_up")
    val adminStateUp: Boolean,
    val status: String,
    val shared: Boolean,
    @JsonProperty("router:external")
    val routerExternal: Boolean,
    @JsonProperty("tenant_id")
    val tenantId: String,
    @JsonProperty("project_id")
    val projectId: String,
    val subnets: List<String>,
    val description: String? = null,
    @JsonProperty("created_at")
    val createdAt: String? = null,
    @JsonProperty("updated_at")
    val updatedAt: String? = null
)

data class NeutronNetworkListResponse(
    val networks: List<NeutronNetwork>
)

data class NeutronSecurityGroup(
    val id: String,
    val name: String,
    val description: String?,
    @JsonProperty("tenant_id")
    val tenantId: String,
    @JsonProperty("project_id")
    val projectId: String,
    @JsonProperty("security_group_rules")
    val securityGroupRules: List<SecurityGroupRule>,
    @JsonProperty("created_at")
    val createdAt: String? = null,
    @JsonProperty("updated_at")
    val updatedAt: String? = null
)

data class SecurityGroupRule(
    val id: String,
    val direction: String, // ingress or egress
    @JsonProperty("ethertype")
    val etherType: String, // IPv4 or IPv6
    val protocol: String?, // tcp, udp, icmp, null
    @JsonProperty("port_range_min")
    val portRangeMin: Int?,
    @JsonProperty("port_range_max")
    val portRangeMax: Int?,
    @JsonProperty("remote_ip_prefix")
    val remoteIpPrefix: String?,
    @JsonProperty("remote_group_id")
    val remoteGroupId: String?,
    @JsonProperty("security_group_id")
    val securityGroupId: String,
    @JsonProperty("tenant_id")
    val tenantId: String,
    @JsonProperty("project_id")
    val projectId: String,
    @JsonProperty("created_at")
    val createdAt: String? = null,
    @JsonProperty("updated_at")
    val updatedAt: String? = null
)

data class NeutronSecurityGroupListResponse(
    @JsonProperty("security_groups")
    val securityGroups: List<NeutronSecurityGroup>
)

@Service
class NeutronClient(
    @Value("\${openstack.neutron.url:http://neutron.openstack.svc.cluster.local}")
    private val neutronUrl: String
) {
    private val webClient = WebClient.builder()
        .baseUrl(neutronUrl)
        .build()

    // 네트워크 목록 조회
    suspend fun getNetworks(token: String, projectId: String? = null): List<NeutronNetwork> {
        return try {
            println("NeutronClient: 토큰으로 네트워크 목록 요청 중: ${token.take(20)}...")
            
            val uri = if (projectId != null) {
                "/v2.0/networks?project_id=$projectId"
            } else {
                "/v2.0/networks"
            }
            
            val response = webClient.get()
                .uri(uri)
                .header("X-Auth-Token", token)
                .header("Accept", "application/json")
                .retrieve()
                .awaitBody<NeutronNetworkListResponse>()
            
            println("NeutronClient: ${response.networks.size}개 네트워크 조회 성공")
            response.networks
        } catch (e: Exception) {
            println("NeutronClient 네트워크 조회 오류: ${e.message}")
            e.printStackTrace()
            emptyList()
        }
    }

    // 보안그룹 목록 조회
    suspend fun getSecurityGroups(token: String, projectId: String? = null): List<NeutronSecurityGroup> {
        return try {
            println("NeutronClient: 토큰으로 보안그룹 목록 요청 중: ${token.take(20)}...")
            
            val uri = if (projectId != null) {
                "/v2.0/security-groups?project_id=$projectId"
            } else {
                "/v2.0/security-groups"
            }
            
            val response = webClient.get()
                .uri(uri)
                .header("X-Auth-Token", token)
                .header("Accept", "application/json")
                .retrieve()
                .awaitBody<NeutronSecurityGroupListResponse>()
            
            println("NeutronClient: ${response.securityGroups.size}개 보안그룹 조회 성공")
            response.securityGroups
        } catch (e: Exception) {
            println("NeutronClient 보안그룹 조회 오류: ${e.message}")
            e.printStackTrace()
            emptyList()
        }
    }

    // 특정 네트워크 조회
    suspend fun getNetwork(token: String, networkId: String): NeutronNetwork? {
        return try {
            println("NeutronClient: 네트워크 상세 조회 중: $networkId")
            
            val response = webClient.get()
                .uri("/v2.0/networks/$networkId")
                .header("X-Auth-Token", token)
                .header("Accept", "application/json")
                .retrieve()
                .awaitBody<Map<String, NeutronNetwork>>()
            
            println("NeutronClient: 네트워크 상세 조회 성공")
            response["network"]
        } catch (e: Exception) {
            println("NeutronClient 네트워크 상세 조회 오류: ${e.message}")
            e.printStackTrace()
            null
        }
    }

    // 특정 보안그룹 조회
    suspend fun getSecurityGroup(token: String, securityGroupId: String): NeutronSecurityGroup? {
        return try {
            println("NeutronClient: 보안그룹 상세 조회 중: $securityGroupId")
            
            val response = webClient.get()
                .uri("/v2.0/security-groups/$securityGroupId")
                .header("X-Auth-Token", token)
                .header("Accept", "application/json")
                .retrieve()
                .awaitBody<Map<String, NeutronSecurityGroup>>()
            
            println("NeutronClient: 보안그룹 상세 조회 성공")
            response["security_group"]
        } catch (e: Exception) {
            println("NeutronClient 보안그룹 상세 조회 오류: ${e.message}")
            e.printStackTrace()
            null
        }
    }
}