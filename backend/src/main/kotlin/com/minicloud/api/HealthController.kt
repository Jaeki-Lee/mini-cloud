package com.minicloud.api

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health Check", description = "시스템 상태 확인 API")
class HealthController {
    
    @Value("\${spring.application.name}")
    private lateinit var applicationName: String
    
    @Value("\${openstack.auth.url}")
    private lateinit var openstackAuthUrl: String
    
    @GetMapping
    @Operation(summary = "기본 헬스체크", description = "서버 기동 상태 확인")
    fun health(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(mapOf(
            "status" to "UP",
            "application" to applicationName,
            "timestamp" to LocalDateTime.now(),
            "version" to "1.0.0"
        ))
    }
    
    @GetMapping("/config")
    @Operation(summary = "설정 정보 확인", description = "OpenStack 연결 설정 등 기본 구성 확인")
    fun config(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(mapOf(
            "openstack" to mapOf(
                "authUrl" to openstackAuthUrl
            ),
            "environment" to "development"
        ))
    }
}