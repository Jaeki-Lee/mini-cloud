package com.minicloud.service

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody

@Service
class GlanceClient(
    @Value("\${openstack.services.glance}")
    private val glanceUrl: String
) {
    
    private val webClient = WebClient.builder()
        .baseUrl(glanceUrl)
        .build()

    // 이미지 목록 조회
    suspend fun getImages(token: String): List<GlanceImage> {
        return try {
            println("GlanceClient: 토큰으로 이미지 요청 중: ${token.take(20)}...")
            
            val response = webClient.get()
                .uri("/v2/images")
                .header("X-Auth-Token", token)
                .header("Accept", "application/json")
                .retrieve()
                .awaitBody<GlanceImageListResponse>()
            
            println("GlanceClient: ${response.images.size}개 이미지 조회 성공")
            response.images
        } catch (e: Exception) {
            println("GlanceClient error: ${e.message}")
            e.printStackTrace()
            emptyList()
        }
    }
}

@JsonIgnoreProperties(ignoreUnknown = true)
data class GlanceImageListResponse(
    val images: List<GlanceImage>
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class GlanceImage(
    val id: String,
    val name: String,
    val status: String,
    val visibility: String,
    val size: Long? = null,
    @JsonProperty("disk_format")
    val diskFormat: String? = null,
    @JsonProperty("container_format")
    val containerFormat: String? = null,
    @JsonProperty("created_at")
    val createdAt: String,
    @JsonProperty("updated_at")
    val updatedAt: String
)