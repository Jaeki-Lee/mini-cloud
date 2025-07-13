package com.minicloud.model.request

data class CreateInstanceRequest(
    val name: String,
    val imageId: String,
    val flavorId: String,
    val networkIds: List<String> = emptyList(),
    val keyName: String? = null,
    val securityGroups: List<String> = listOf("default"),
    val userData: String? = null
)

data class InstanceActionRequest(
    val action: InstanceAction,
    val force: Boolean = false
)

enum class InstanceAction {
    START, STOP, RESTART, PAUSE, UNPAUSE, SUSPEND, RESUME, DELETE
}