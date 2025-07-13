package com.minicloud.api

import com.minicloud.model.response.NetworkResponse
import com.minicloud.service.NeutronClient
import com.minicloud.service.toResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/networks")
@Tag(name = "Network", description = "네트워크 관리 API")
class NetworkController(
    private val neutronClient: NeutronClient
) {

    @GetMapping
    @Operation(summary = "네트워크 목록 조회", description = "프로젝트의 모든 네트워크 목록을 조회합니다.")
    suspend fun getNetworks(request: HttpServletRequest): ResponseEntity<List<NetworkResponse>> {
        val token = getTokenFromSession(request)
            ?: return ResponseEntity.status(401).build()

        val projectId = getProjectIdFromSession(request)

        return try {
            val networks = neutronClient.getNetworks(token, projectId)
            val networkResponses = networks.map { it.toResponse() }
            println("NetworkController: ${networkResponses.size}개 네트워크 조회 성공")
            ResponseEntity.ok(networkResponses)
        } catch (e: Exception) {
            println("NetworkController 오류: ${e.message}")
            e.printStackTrace()
            ResponseEntity.status(500).build()
        }
    }

    @GetMapping("/{networkId}")
    @Operation(summary = "네트워크 상세 조회", description = "특정 네트워크의 상세 정보를 조회합니다.")
    suspend fun getNetwork(
        @PathVariable networkId: String,
        request: HttpServletRequest
    ): ResponseEntity<NetworkResponse> {
        val token = getTokenFromSession(request)
            ?: return ResponseEntity.status(401).build()

        return try {
            val network = neutronClient.getNetwork(token, networkId)
                ?: return ResponseEntity.notFound().build()
            
            val networkResponse = network.toResponse()
            println("NetworkController: 네트워크 $networkId 상세 조회 성공")
            ResponseEntity.ok(networkResponse)
        } catch (e: Exception) {
            println("NetworkController 상세 조회 오류: ${e.message}")
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