package com.interiorit.app.data.remote

import com.interiorit.app.data.model.*
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*

interface ApiService {
    @POST("auth/login")
    suspend fun login(@Body request: AuthRequestLogin): AuthResponse

    @POST("auth/signup")
    suspend fun signup(@Body request: AuthRequestSignup): AuthResponse

    @GET("estimate/all")
    suspend fun getEstimates(): List<Estimate>

    @POST("estimate/create")
    suspend fun createEstimate(@Body request: CreateEstimateRequest): Any
}

object RetrofitClient {
    private const val BASE_URL = "http://10.0.2.2:5000/"

    fun create(token: String?): ApiService {
        val client = OkHttpClient.Builder().apply {
            if (!token.isNullOrEmpty()) {
                addInterceptor { chain ->
                    val newRequest = chain.request().newBuilder()
                        .addHeader("Authorization", "Bearer $token")
                        .build()
                    chain.proceed(newRequest)
                }
            }
        }.build()

        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
