package com.minicloud.service

import com.minicloud.model.request.CreateInstanceRequest
import com.minicloud.model.request.InstanceAction
import com.minicloud.model.response.*
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody
import org.springframework.web.reactive.function.client.awaitExchange

@Service
class NovaClient(
    private val webClient: WebClient.Builder
) {
    
    @Value("\${openstack.services.nova}")
    private lateinit var novaUrl: String
    
    suspend fun getInstances(token: String, projectId: String): InstanceListResponse {
        return webClient.build()
            .get()
            .uri("$novaUrl/v2.1/$projectId/servers/detail")
            .header("X-Auth-Token", token)
            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .awaitExchange { response ->
                if (response.statusCode().is2xxSuccessful) {
                    val body = response.awaitBody<Map<String, Any>>()
                    parseInstanceList(body)
                } else {
                    throw RuntimeException("Failed to get instances: ${response.statusCode()}")
                }
            }
    }
    
    suspend fun getInstance(token: String, projectId: String, instanceId: String): InstanceResponse {
        return webClient.build()
            .get()
            .uri("$novaUrl/v2.1/$projectId/servers/$instanceId")
            .header("X-Auth-Token", token)
            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .awaitExchange { response ->
                if (response.statusCode().is2xxSuccessful) {
                    val body = response.awaitBody<Map<String, Any>>()
                    parseInstance(body)
                } else {
                    throw RuntimeException("Failed to get instance: ${response.statusCode()}")
                }
            }
    }
    
    suspend fun createInstance(token: String, projectId: String, request: CreateInstanceRequest): InstanceResponse {
        val body = buildCreateInstanceRequest(request)
        
        return webClient.build()
            .post()
            .uri("$novaUrl/v2.1/$projectId/servers")
            .header("X-Auth-Token", token)
            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .bodyValue(body)
            .awaitExchange { response ->
                if (response.statusCode().is2xxSuccessful) {
                    val responseBody = response.awaitBody<Map<String, Any>>()
                    parseInstance(responseBody)
                } else {
                    val errorBody = try {
                        response.awaitBody<String>()
                    } catch (e: Exception) {
                        "Unable to read error response"
                    }
                    throw RuntimeException("Failed to create instance: ${response.statusCode()} - $errorBody")
                }
            }
    }
    
    suspend fun performInstanceAction(token: String, projectId: String, instanceId: String, action: InstanceAction, force: Boolean = false): Boolean {
        val actionBody = when (action) {
            InstanceAction.START -> mapOf("os-start" to null)
            InstanceAction.STOP -> mapOf("os-stop" to null)
            InstanceAction.RESTART -> mapOf("reboot" to mapOf("type" to "SOFT"))
            InstanceAction.PAUSE -> mapOf("pause" to null)
            InstanceAction.UNPAUSE -> mapOf("unpause" to null)
            InstanceAction.SUSPEND -> mapOf("suspend" to null)
            InstanceAction.RESUME -> mapOf("resume" to null)
            InstanceAction.DELETE -> return deleteInstance(token, projectId, instanceId)
        }
        
        return webClient.build()
            .post()
            .uri("$novaUrl/v2.1/$projectId/servers/$instanceId/action")
            .header("X-Auth-Token", token)
            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .bodyValue(actionBody)
            .awaitExchange { response ->
                response.statusCode().is2xxSuccessful
            }
    }
    
    private suspend fun deleteInstance(token: String, projectId: String, instanceId: String): Boolean {
        return webClient.build()
            .delete()
            .uri("$novaUrl/v2.1/$projectId/servers/$instanceId")
            .header("X-Auth-Token", token)
            .awaitExchange { response ->
                response.statusCode().is2xxSuccessful
            }
    }
    
    suspend fun getFlavors(token: String): List<FlavorResponse> {
        return webClient.build()
            .get()
            .uri("$novaUrl/v2.1/flavors/detail")
            .header("X-Auth-Token", token)
            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .awaitExchange { response ->
                if (response.statusCode().is2xxSuccessful) {
                    val body = response.awaitBody<Map<String, Any>>()
                    parseFlavors(body)
                } else {
                    throw RuntimeException("Failed to get flavors: ${response.statusCode()}")
                }
            }
    }
    
    private fun buildCreateInstanceRequest(request: CreateInstanceRequest): Map<String, Any> {
        val server = mutableMapOf<String, Any>(
            "name" to request.name,
            "imageRef" to request.imageId,
            "flavorRef" to request.flavorId
        )
        
        if (request.networkIds.isNotEmpty()) {
            server["networks"] = request.networkIds.map { mapOf("uuid" to it) }
        }
        
        if (request.keyName != null) {
            server["key_name"] = request.keyName
        }
        
        if (request.securityGroups.isNotEmpty()) {
            server["security_groups"] = request.securityGroups.map { mapOf("name" to it) }
        }
        
        if (request.userData != null) {
            server["user_data"] = request.userData
        }
        
        return mapOf("server" to server)
    }
    
    private fun parseInstanceList(body: Map<String, Any>): InstanceListResponse {
        val servers = body["servers"] as? List<Map<String, Any>> ?: emptyList()
        val instances = servers.map { parseInstanceSummary(it) }
        return InstanceListResponse(instances, instances.size)
    }
    
    private fun parseInstance(body: Map<String, Any>): InstanceResponse {
        val server = body["server"] as Map<String, Any>
        return parseInstanceFromServer(server)
    }
    
    private fun parseInstanceSummary(server: Map<String, Any>): InstanceSummary {
        return InstanceSummary(
            id = server["id"] as String,
            name = server["name"] as String,
            status = server["status"] as String,
            powerState = (server["OS-EXT-STS:power_state"] as? Number)?.toString() ?: "unknown",
            imageId = (server["image"] as? Map<String, Any>)?.get("id") as? String,
            flavorId = (server["flavor"] as Map<String, Any>)["id"] as String,
            createdAt = java.time.LocalDateTime.parse((server["created"] as String).replace("Z", "")),
            networks = parseNetworks(server["addresses"] as? Map<String, Any> ?: emptyMap())
        )
    }
    
    private fun parseInstanceFromServer(server: Map<String, Any>): InstanceResponse {
        return InstanceResponse(
            id = server["id"] as String,
            name = server["name"] as String,
            status = server["status"] as String,
            powerState = (server["OS-EXT-STS:power_state"] as? Number)?.toString() ?: "unknown",
            vmState = server["OS-EXT-STS:vm_state"] as? String ?: "unknown",
            taskState = server["OS-EXT-STS:task_state"] as? String,
            imageId = (server["image"] as? Map<String, Any>)?.get("id") as? String,
            flavorId = (server["flavor"] as Map<String, Any>)["id"] as String,
            createdAt = java.time.LocalDateTime.parse((server["created"] as String).replace("Z", "")),
            updatedAt = java.time.LocalDateTime.parse((server["updated"] as String).replace("Z", "")),
            networks = parseNetworks(server["addresses"] as? Map<String, Any> ?: emptyMap()),
            securityGroups = parseSecurityGroups(server["security_groups"] as? List<Map<String, Any>> ?: emptyList()),
            keyName = server["key_name"] as? String,
            availabilityZone = server["OS-EXT-AZ:availability_zone"] as? String ?: "unknown",
            hostId = server["hostId"] as? String,
            hypervisorHostname = server["OS-EXT-SRV-ATTR:hypervisor_hostname"] as? String
        )
    }
    
    private fun parseNetworks(addresses: Map<String, Any>): Map<String, List<String>> {
        return addresses.mapValues { (_, value) ->
            (value as List<Map<String, Any>>).map { it["addr"] as String }
        }
    }
    
    private fun parseSecurityGroups(groups: List<Map<String, Any>>): List<SecurityGroup> {
        return groups.map { 
            SecurityGroup(
                name = it["name"] as String,
                description = it["description"] as? String
            )
        }
    }
    
    private fun parseFlavors(body: Map<String, Any>): List<FlavorResponse> {
        val flavors = body["flavors"] as? List<Map<String, Any>> ?: emptyList()
        return flavors.map { flavor ->
            FlavorResponse(
                id = flavor["id"] as String,
                name = flavor["name"] as String,
                vcpus = flavor["vcpus"] as Int,
                ram = flavor["ram"] as Int,
                disk = flavor["disk"] as Int,
                isPublic = flavor["os-flavor-access:is_public"] as? Boolean ?: true
            )
        }
    }
}