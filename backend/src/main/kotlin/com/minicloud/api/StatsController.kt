package com.minicloud.api

import com.minicloud.service.NovaClient
import com.minicloud.service.GlanceClient
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/stats")
@Tag(name = "Stats", description = "통계 정보 API")
class StatsController(
    private val novaClient: NovaClient,
    private val glanceClient: GlanceClient
) {
    
    @GetMapping
    @Operation(summary = "대시보드 통계 조회", description = "인스턴스, 이미지 등의 통계 정보 조회")
    suspend fun getStats(request: HttpServletRequest): ResponseEntity<DashboardStats> {
        val token = getTokenFromSession(request)
            ?: return ResponseEntity.status(401).build()
        
        val projectId = getProjectIdFromSession(request)
            ?: return ResponseEntity.status(401).build()
        
        return try {
            // 인스턴스 목록 조회
            val instanceResponse = novaClient.getInstances(token, projectId)
            
            // 이미지 목록 조회
            val images = glanceClient.getImages(token)
            
            // 통계 계산
            val stats = DashboardStats(
                totalInstances = instanceResponse.instances.size,
                runningInstances = instanceResponse.instances.count { it.status.equals("ACTIVE", ignoreCase = true) },
                totalImages = images.size,
                activeImages = images.count { it.status.equals("active", ignoreCase = true) },
                publicImages = images.count { it.visibility.equals("public", ignoreCase = true) }
            )
            
            println("StatsController: 통계 조회 성공 - 인스턴스: ${stats.totalInstances}, 이미지: ${stats.totalImages}")
            ResponseEntity.ok(stats)
        } catch (e: Exception) {
            println("StatsController error: ${e.message}")
            e.printStackTrace()
            ResponseEntity.status(500).build()
        }
    }
    
    private fun getTokenFromSession(request: HttpServletRequest): String? {
        val session = request.getSession(false) ?: return null
        return if (session.getAttribute("authenticated") == true) {
            session.getAttribute("token") as? String
        } else null
    }
    
    private fun getProjectIdFromSession(request: HttpServletRequest): String? {
        val session = request.getSession(false) ?: return null
        return if (session.getAttribute("authenticated") == true) {
            session.getAttribute("projectId") as? String
        } else null
    }
}

data class DashboardStats(
    val totalInstances: Int,
    val runningInstances: Int,
    val totalImages: Int,
    val activeImages: Int,
    val publicImages: Int
)