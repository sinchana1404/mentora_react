package com.mentora.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.mentora.security.JwtAuthenticationFilter;

@Configuration
public class AppConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

    	CorsConfiguration config = new CorsConfiguration();

    	config.setAllowedOrigins(List.of(
    	    "http://localhost:5173",
    	    "http://localhost:3000"
    	));

    	config.setAllowedMethods(List.of(
    	    "GET",
    	    "POST",
    	    "PUT",
    	    "PATCH",
    	    "DELETE",
    	    "OPTIONS"
    	));

    	config.setAllowedHeaders(List.of(
    	    "Authorization",
    	    "Content-Type",
    	    "Accept",
    	    "X-Requested-With"
    	));

    	config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .cors(cors ->
                cors.configurationSource(corsConfigurationSource())
            )
            .csrf(csrf -> csrf.disable())
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )
            .authorizeHttpRequests(auth -> auth

                // Handle CORS preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public authentication endpoints
                .requestMatchers(
                    "/auth/register",
                    "/auth/login",
                    "/ws/**"
                ).permitAll()

                // Protected authentication endpoints
                .requestMatchers("/auth/**").authenticated()

                // Categories and skills require a valid login
                .requestMatchers(
                    "/categories",
                    "/categories/**",
                    "/skills",
                    "/skills/**"
                ).authenticated()

                // All remaining endpoints require authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter>
            disableJwtFilterRegistration(
                JwtAuthenticationFilter filter) {

        FilterRegistrationBean<JwtAuthenticationFilter> registration =
            new FilterRegistrationBean<>(filter);

        registration.setEnabled(false);

        return registration;
    }
}