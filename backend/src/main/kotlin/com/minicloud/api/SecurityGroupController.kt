package com.minicloud.api

import com.minicloud.model.response.SecurityGroupResponse
import com.minicloud.service.NeutronClient
import com.minicloud.service.NeutronSecurityGroup
import com.minicloud.service.toResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/security-groups")
@Tag(name = "Security Group", description = "보안그룹 관리 API")
class SecurityGroupController(
    private val neutronClient: NeutronClient
) {

    @GetMapping
    @Operation(summary = "보안그룹 목록 조회", description = "프로젝트의 모든 보안그룹 목록을 조회합니다.")
    suspend fun getSecurityGroups(request: HttpServletRequest): ResponseEntity<List<SecurityGroupResponse>> {
        val token = getTokenFromSession(request)
            ?: return ResponseEntity.status(401).build()

        val projectId = getProjectIdFromSession(request)

        return try {
            val securityGroups = neutronClient.getSecurityGroups(token, projectId)
            val securityGroupResponses = securityGroups.map { it.toResponse() }
            println("SecurityGroupController: ${securityGroupResponses.size}개 보안그룹 조회 성공")
            ResponseEntity.ok(securityGroupResponses)
        } catch (e: Exception) {
            println("SecurityGroupController 오류: ${e.message}")
            e.printStackTrace()
            ResponseEntity.status(500).build()
        }
    }

    @GetMapping("/{securityGroupId}")
    @Operation(summary = "보안그룹 상세 조회", description = "특정 보안그룹의 상세 정보를 조회합니다.")
    suspend fun getSecurityGroup(
        @PathVariable securityGroupId: String,
        request: HttpServletRequest
    ): ResponseEntity<SecurityGroupResponse> {
        val token = getTokenFromSession(request)
            ?: return ResponseEntity.status(401).build()

        return try {
            val securityGroup = neutronClient.getSecurityGroup(token, securityGroupId)
                ?: return ResponseEntity.notFound().build()
            
            val securityGroupResponse = securityGroup.toResponse()
            println("SecurityGroupController: 보안그룹 $securityGroupId 상세 조회 성공")
            ResponseEntity.ok(securityGroupResponse)
        } catch (e: Exception) {
            println("SecurityGroupController 상세 조회 오류: ${e.message}")
            e.printStackTrace()
            ResponseEntity.status(500).build()
        }
    }

    // 세션에서 토큰 추출
    private fun getTokenFromSession(request: HttpServletRequest): String? {
        val session = request.getSession(false) ?: return null
        return if (session.getAttribute("authenticated") == true) {
            session.getAttribute("token") as? String
        } else null
    }

    // 세션에서 프로젝트 ID 추출
    private fun getProjectIdFromSession(request: HttpServletRequest): String? {
        val session = request.getSession(false)
        return session?.getAttribute("projectId") as? String
    }
}