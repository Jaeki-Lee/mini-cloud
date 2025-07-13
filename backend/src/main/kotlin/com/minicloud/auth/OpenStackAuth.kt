package com.minicloud.auth

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.LocalDateTime

data class OpenStackAuthRequest(
    val auth: Auth
) {
    data class Auth(
        val identity: Identity,
        val scope: Scope? = null
    )

    data class Identity(
        val methods: List<String> = listOf("password"),
        val password: Password
    )

    data class Password(
        val user: User
    )

    data class User(
        val name: String,
        val domain: Domain,
        val password: String
    )

    data class Domain(
        val name: String
    )

    data class Scope(
        val project: Project
    )

    data class Project(
        val name: String,
        val domain: Domain
    )
}

data class OpenStackAuthResponse(
    val token: Token
) {
    data class Token(
        val methods: List<String>,
        val user: User,
        val project: Project?,
        val roles: List<Role>,
        @JsonProperty("expires_at")
        val expiresAt: String,
        @JsonProperty("issued_at")
        val issuedAt: String
    )

    data class User(
        val id: String,
        val name: String,
        val domain: Domain
    )

    data class Project(
        val id: String,
        val name: String,
        val domain: Domain
    )

    data class Role(
        val id: String,
        val name: String
    )

    data class Domain(
        val id: String,
        val name: String
    )
}

data class OpenStackSession(
    val token: String,
    val userId: String,
    val userName: String,
    val projectId: String?,
    val projectName: String?,
    val roles: List<String>,
    val expiresAt: LocalDateTime,
    val serviceCatalog: Map<String, String> = emptyMap()
)