package com.minicloud.api

import com.minicloud.model.request.AuthRequest
import com.minicloud.model.response.AuthResponse
import com.minicloud.service.AuthService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "사용자 인증 관련 API")
class AuthController(
    private val authService: AuthService
) {
    
    @PostMapping("/login")
    @Operation(summary = "로그인", description = "OpenStack 계정으로 로그인")
    suspend fun login(
        @Valid @RequestBody authRequest: AuthRequest,
        request: HttpServletRequest
    ): ResponseEntity<AuthResponse> {
        val (token, authResponse) = authService.login(authRequest)
        
        if (authResponse.success && token != null) {
            val session = request.getSession(true)
            session.setAttribute("user", authResponse.user)
            session.setAttribute("authenticated", true)
            session.setAttribute("token", token) // 실제 OpenStack 토큰 저장
            session.setAttribute("projectId", authResponse.user?.project?.id) // projectId 저장
        }
        
        return ResponseEntity.ok(authResponse)
    }
    
    @PostMapping("/logout")
    @Operation(summary = "로그아웃", description = "현재 세션 종료")
    fun logout(request: HttpServletRequest): ResponseEntity<Map<String, String>> {
        val session = request.getSession(false)
        session?.invalidate()
        
        return ResponseEntity.ok(mapOf("message" to "Logout successful"))
    }
    
    @GetMapping("/me")
    @Operation(summary = "현재 사용자 정보", description = "로그인한 사용자의 정보 조회")
    fun getCurrentUser(request: HttpServletRequest): ResponseEntity<Any> {
        val session = request.getSession(false)
        
        return if (session?.getAttribute("authenticated") == true) {
            val user = session.getAttribute("user")
            ResponseEntity.ok(user)
        } else {
            ResponseEntity.status(401).body(mapOf("message" to "Not authenticated"))
        }
    }
    
    @GetMapping("/status")
    @Operation(summary = "인증 상태 확인", description = "현재 로그인 상태 확인")
    fun getAuthStatus(request: HttpServletRequest): ResponseEntity<Map<String, Any>> {
        val session = request.getSession(false)
        val isAuthenticated = session?.getAttribute("authenticated") == true
        
        return ResponseEntity.ok(mapOf(
            "authenticated" to isAuthenticated,
            "sessionId" to (session?.id ?: "none")
        ))
    }
}