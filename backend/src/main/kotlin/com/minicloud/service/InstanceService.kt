package com.minicloud.service

import com.minicloud.model.request.CreateInstanceRequest
import com.minicloud.model.request.InstanceAction
import com.minicloud.model.response.*
import org.springframework.stereotype.Service

@Service
class InstanceService(
    private val novaClient: NovaClient,
    private val authService: AuthService
) {
    
    suspend fun getInstances(token: String): InstanceListResponse {
        val session = authService.getSession(token)
            ?: throw RuntimeException("Invalid session")
        
        val projectId = session.projectId 
            ?: throw RuntimeException("No project associated with session")
        
        return novaClient.getInstances(token, projectId)
    }
    
    suspend fun getInstance(token: String, instanceId: String): InstanceResponse {
        val session = authService.getSession(token)
            ?: throw RuntimeException("Invalid session")
        
        val projectId = session.projectId 
            ?: throw RuntimeException("No project associated with session")
        
        return novaClient.getInstance(token, projectId, instanceId)
    }
    
    suspend fun createInstance(token: String, request: CreateInstanceRequest): InstanceResponse {
        val session = authService.getSession(token)
            ?: throw RuntimeException("Invalid session")
        
        val projectId = session.projectId 
            ?: throw RuntimeException("No project associated with session")
        
        return novaClient.createInstance(token, projectId, request)
    }
    
    suspend fun performInstanceAction(token: String, instanceId: String, action: InstanceAction, force: Boolean = false): Boolean {
        val session = authService.getSession(token)
            ?: throw RuntimeException("Invalid session")
        
        val projectId = session.projectId 
            ?: throw RuntimeException("No project associated with session")
        
        return novaClient.performInstanceAction(token, projectId, instanceId, action, force)
    }
    
    suspend fun getFlavors(token: String): List<FlavorResponse> {
        val session = authService.getSession(token)
            ?: throw RuntimeException("Invalid session")
        
        return novaClient.getFlavors(token)
    }
}