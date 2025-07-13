package com.minicloud.model.response

import java.time.LocalDateTime

data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val message: String? = null,
    val timestamp: LocalDateTime = LocalDateTime.now()
)

fun <T> success(data: T? = null, message: String? = null): ApiResponse<T> {
    return ApiResponse(success = true, data = data, message = message)
}

fun <T> error(message: String): ApiResponse<T> {
    return ApiResponse(success = false, message = message)
}