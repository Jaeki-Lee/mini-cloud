package com.minicloud.service

import com.minicloud.auth.OpenStackAuthRequest
import com.minicloud.auth.OpenStackSession
import com.minicloud.model.request.AuthRequest
import com.minicloud.model.response.AuthResponse
import com.minicloud.model.response.ProjectInfo
import com.minicloud.model.response.UserInfo
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.concurrent.ConcurrentHashMap

@Service
class AuthService(
    private val openStackClient: OpenStackClient
) {
    
    private val sessions = ConcurrentHashMap<String, OpenStackSession>()
    
    suspend fun login(authRequest: AuthRequest): Pair<String?, AuthResponse> {
        return try {
            val openStackAuthRequest = buildOpenStackAuthRequest(authRequest)
            val (actualToken, authResponse) = openStackClient.authenticate(openStackAuthRequest)
            
            val token = authResponse.token
            val session = OpenStackSession(
                token = actualToken,
                userId = token.user.id,
                userName = token.user.name,
                projectId = token.project?.id,
                projectName = token.project?.name,
                roles = token.roles.map { it.name },
                expiresAt = LocalDateTime.parse(token.expiresAt, DateTimeFormatter.ISO_OFFSET_DATE_TIME)
            )
            
            sessions[actualToken] = session
            
            Pair(actualToken, AuthResponse(
                success = true,
                message = "Login successful",
                user = UserInfo(
                    id = token.user.id,
                    name = token.user.name,
                    domain = token.user.domain.name,
                    project = token.project?.let { 
                        ProjectInfo(it.id, it.name, it.domain.name) 
                    },
                    roles = token.roles.map { it.name }
                )
            ))
        } catch (e: Exception) {
            Pair(null, AuthResponse(
                success = false,
                message = "Authentication failed: ${e.message}"
            ))
        }
    }
    
    fun getSession(token: String): OpenStackSession? {
        val session = sessions[token]
        return if (session != null && session.expiresAt.isAfter(LocalDateTime.now())) {
            session
        } else {
            sessions.remove(token)
            null
        }
    }
    
    fun logout(token: String) {
        sessions.remove(token)
    }
    
    private fun buildOpenStackAuthRequest(authRequest: AuthRequest): OpenStackAuthRequest {
        // 도메인 처리: OpenStack의 기본 도메인 ID는 "default", 이름은 "Default"  
        // AuthRequest의 domain 필드는 기본값 "default"를 가지므로 "Default"로 매핑
        val domainName = if (authRequest.domain == "default") "Default" else authRequest.domain
        val domain = OpenStackAuthRequest.Domain(domainName)
        val user = OpenStackAuthRequest.User(
            name = authRequest.username,
            domain = domain,
            password = authRequest.password
        )
        val password = OpenStackAuthRequest.Password(user)
        val identity = OpenStackAuthRequest.Identity(password = password)
        
        // 프로젝트 처리: 
        // - 비어있거나 "default"인 경우 → "admin" 프로젝트 사용 (관리자 기본 프로젝트)
        // - 그 외에는 입력된 프로젝트명 사용
        val projectName = when {
            authRequest.project.isNullOrBlank() -> "admin"
            authRequest.project == "default" -> "admin"
            else -> authRequest.project
        }
        val project = OpenStackAuthRequest.Project(projectName, domain)
        val scope = OpenStackAuthRequest.Scope(project)
        
        val auth = OpenStackAuthRequest.Auth(identity, scope)
        return OpenStackAuthRequest(auth)
    }
    
}