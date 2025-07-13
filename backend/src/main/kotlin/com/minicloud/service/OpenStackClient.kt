package com.minicloud.service

import com.minicloud.auth.OpenStackAuthRequest
import com.minicloud.auth.OpenStackAuthResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody
import org.springframework.web.reactive.function.client.awaitExchange

@Service
class OpenStackClient(
    private val webClient: WebClient.Builder
) {
    
    @Value("\${openstack.auth.url}")
    private lateinit var authUrl: String
    
    suspend fun authenticate(authRequest: OpenStackAuthRequest): Pair<String, OpenStackAuthResponse> {
        return webClient.build()
            .post()
            .uri("$authUrl/auth/tokens")
            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .bodyValue(authRequest)
            .awaitExchange { response ->
                if (response.statusCode().is2xxSuccessful) {
                    val token = response.headers().asHttpHeaders().getFirst("X-Subject-Token")
                        ?: throw RuntimeException("No token in response")
                    
                    val body = response.awaitBody<OpenStackAuthResponse>()
                    Pair(token, body)
                } else {
                    val errorBody = try {
                        response.awaitBody<String>()
                    } catch (e: Exception) {
                        "Unable to read error response"
                    }
                    throw RuntimeException("Authentication failed: ${response.statusCode()} - $errorBody")
                }
            }
    }
    
    suspend fun validateToken(token: String): Boolean {
        return try {
            webClient.build()
                .get()
                .uri("$authUrl/auth/tokens")
                .header("X-Auth-Token", token)
                .header("X-Subject-Token", token)
                .awaitExchange { response ->
                    response.statusCode().is2xxSuccessful
                }
        } catch (e: Exception) {
            false
        }
    }
}