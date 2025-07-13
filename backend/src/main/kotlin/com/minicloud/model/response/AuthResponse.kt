package com.minicloud.model.response

import java.time.LocalDateTime

data class AuthResponse(
    val success: Boolean,
    val message: String,
    val user: UserInfo? = null
)

data class UserInfo(
    val id: String,
    val name: String,
    val domain: String,
    val project: ProjectInfo?,
    val roles: List<String>
)

data class ProjectInfo(
    val id: String,
    val name: String,
    val domain: String
)