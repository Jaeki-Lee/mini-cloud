package com.minicloud.api

import com.minicloud.service.GlanceClient
import com.minicloud.service.GlanceImage
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/images")
@Tag(name = "Images", description = "이미지 관리 API")
class ImageController(
    private val glanceClient: GlanceClient
) {
    
    @GetMapping
    @Operation(summary = "이미지 목록 조회", description = "사용 가능한 모든 이미지 조회")
    suspend fun getImages(request: HttpServletRequest): ResponseEntity<List<GlanceImage>> {
        val token = getTokenFromSession(request)
            ?: return ResponseEntity.status(401).build()
        
        return try {
            val images = glanceClient.getImages(token)
            println("ImageController: Retrieved ${images.size} images")
            ResponseEntity.ok(images)
        } catch (e: Exception) {
            println("ImageController error: ${e.message}")
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
}