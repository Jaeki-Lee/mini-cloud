package com.minicloud.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig {
    
    private val allowedOrigins = listOf(
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://localhost:3001"
    )
    
    private val allowedMethods = listOf(
        "GET", "POST", "PUT", "DELETE", "OPTIONS"
    )
    
    private val allowedHeaders = "*"
    private val allowCredentials = true
    
    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        return http
            .cors { it.configurationSource(corsConfigurationSource()) }
            .csrf { it.disable() }
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers("/api/auth/login").permitAll()
                    .requestMatchers("/api/auth/status").permitAll()
                    .requestMatchers("/api/auth/me").permitAll()
                    .requestMatchers("/api/auth/logout").permitAll()
                    .requestMatchers("/api/health/**").permitAll()
                    .requestMatchers("/swagger-ui/**").permitAll()
                    .requestMatchers("/api-docs/**").permitAll()
                    .requestMatchers("/actuator/**").permitAll()
                    .requestMatchers("/api/instances/**").permitAll()
                    .requestMatchers("/api/flavors/**").permitAll()
                    .requestMatchers("/api/images/**").permitAll()
                    .requestMatchers("/api/stats/**").permitAll()
                    .anyRequest().authenticated()
            }
            .sessionManagement { session ->
                session.maximumSessions(1)
                    .sessionRegistry(sessionRegistry())
            }
            .build()
    }
    
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        configuration.allowedOrigins = allowedOrigins
        configuration.allowedMethods = allowedMethods
        configuration.allowedHeaders = listOf(allowedHeaders)
        configuration.allowCredentials = allowCredentials
        
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }
    
    @Bean
    fun sessionRegistry(): org.springframework.security.core.session.SessionRegistry {
        return org.springframework.security.core.session.SessionRegistryImpl()
    }
}