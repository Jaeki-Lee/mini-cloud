package com.minicloud.api

import com.minicloud.model.response.FlavorResponse
import com.minicloud.service.InstanceService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/flavors")
@Tag(name = "Flavors", description = "인스턴스 타입(Flavor) 관리 API")
class FlavorController(
    private val instanceService: InstanceService
) {
    
    @GetMapping
    @Operation(summary = "Flavor 목록 조회", description = "사용 가능한 인스턴스 타입 목록 조회")
    suspend fun getFlavors(request: HttpServletRequest): ResponseEntity<List<FlavorResponse>> {
        val token = getTokenFromSession(request)
            ?: return ResponseEntity.status(401).build()
        
        return try {
            val flavors = instanceService.getFlavors(token)
            ResponseEntity.ok(flavors)
        } catch (e: Exception) {
            ResponseEntity.status(500).build()
        }
    }
    
    private fun getTokenFromSession(request: HttpServletRequest): String? {
        val session = request.getSession(false) ?: return null
        return if (session.getAttribute("authenticated") == true) {
            session.getAttribute("token") as? String
        } else null
    }
}