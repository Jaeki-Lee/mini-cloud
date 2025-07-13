package com.minicloud.api

import com.minicloud.model.request.CreateInstanceRequest
import com.minicloud.model.request.InstanceAction
import com.minicloud.model.request.InstanceActionRequest
import com.minicloud.model.response.*
import com.minicloud.service.InstanceService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/instances")
@Tag(name = "Instances", description = "가상머신 인스턴스 관리 API")
class InstanceController(
    private val instanceService: InstanceService
) {
    
    @GetMapping
    @Operation(summary = "인스턴스 목록 조회", description = "현재 프로젝트의 모든 인스턴스 조회")
    suspend fun getInstances(request: HttpServletRequest): ResponseEntity<InstanceListResponse> {
        val token = getTokenFromSession(request)
            ?: return ResponseEntity.status(401).build()
        
        return try {
            val instances = instanceService.getInstances(token)
            ResponseEntity.ok(instances)
        } catch (e: Exception) {
            ResponseEntity.status(500).build()
        }
    }
    
    @GetMapping("/{instanceId}")
    @Operation(summary = "인스턴스 상세 조회", description = "특정 인스턴스의 상세 정보 조회")
    suspend fun getInstance(
        @PathVariable instanceId: String,
        request: HttpServletRequest
    ): ResponseEntity<InstanceResponse> {
        val token = getTokenFromSession(request)
            ?: return ResponseEntity.status(401).build()
        
        return try {
            val instance = instanceService.getInstance(token, instanceId)
            ResponseEntity.ok(instance)
        } catch (e: Exception) {
            ResponseEntity.status(500).build()
        }
    }
    
    @PostMapping
    @Operation(summary = "인스턴스 생성", description = "새로운 가상머신 인스턴스 생성")
    suspend fun createInstance(
        @Valid @RequestBody createRequest: CreateInstanceRequest,
        request: HttpServletRequest
    ): ResponseEntity<InstanceResponse> {
        val token = getTokenFromSession(request)
            ?: return ResponseEntity.status(401).build()
        
        return try {
            val instance = instanceService.createInstance(token, createRequest)
            ResponseEntity.ok(instance)
        } catch (e: Exception) {
            ResponseEntity.status(500).build()
        }
    }
    
    @PostMapping("/{instanceId}/action")
    @Operation(summary = "인스턴스 액션 수행", description = "인스턴스 시작/중지/재시작 등의 액션 수행")
    suspend fun performInstanceAction(
        @PathVariable instanceId: String,
        @Valid @RequestBody actionRequest: InstanceActionRequest,
        request: HttpServletRequest
    ): ResponseEntity<Map<String, Any>> {
        val token = getTokenFromSession(request)
            ?: return ResponseEntity.status(401).body(mapOf("error" to "Unauthorized" as Any))
        
        return try {
            val success = instanceService.performInstanceAction(
                token, 
                instanceId, 
                actionRequest.action, 
                actionRequest.force
            )
            
            if (success) {
                ResponseEntity.ok(mapOf("success" to true as Any, "message" to "Action ${actionRequest.action} performed successfully" as Any))
            } else {
                ResponseEntity.status(500).body(mapOf("success" to false as Any, "message" to "Failed to perform action" as Any))
            }
        } catch (e: Exception) {
            ResponseEntity.status(500).body(mapOf("success" to false as Any, "message" to (e.message ?: "Unknown error") as Any))
        }
    }
    
    @DeleteMapping("/{instanceId}")
    @Operation(summary = "인스턴스 삭제", description = "인스턴스 삭제")
    suspend fun deleteInstance(
        @PathVariable instanceId: String,
        request: HttpServletRequest
    ): ResponseEntity<Map<String, Any>> {
        val token = getTokenFromSession(request)
            ?: return ResponseEntity.status(401).body(mapOf("error" to "Unauthorized" as Any))
        
        return try {
            val success = instanceService.performInstanceAction(token, instanceId, InstanceAction.DELETE)
            
            if (success) {
                ResponseEntity.ok(mapOf("success" to true as Any, "message" to "Instance deleted successfully" as Any))
            } else {
                ResponseEntity.status(500).body(mapOf("success" to false as Any, "message" to "Failed to delete instance" as Any))
            }
        } catch (e: Exception) {
            ResponseEntity.status(500).body(mapOf("success" to false as Any, "message" to (e.message ?: "Unknown error") as Any))
        }
    }
    
    private fun getTokenFromSession(request: HttpServletRequest): String? {
        val session = request.getSession(false) ?: return null
        return if (session.getAttribute("authenticated") == true) {
            session.getAttribute("token") as? String
        } else null
    }
}