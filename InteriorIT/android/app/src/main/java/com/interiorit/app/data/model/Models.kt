package com.interiorit.app.data.model

import com.google.gson.annotations.SerializedName

data class AuthResponse(
    val token: String,
    val userId: String,
    val name: String? = null
)

data class AuthRequestLogin(val email: String, val password: String)
data class AuthRequestSignup(val name: String, val email: String, val password: String)

data class Client(
    @SerializedName("_id") val id: String? = null,
    val name: String,
    val mobile: String,
    val address: String
)

data class Item(
    @SerializedName("_id") val id: String? = null,
    val itemName: String,
    val length: Double,
    val width: Double,
    val qty: Int,
    val rate: Double,
    val sqft: Double,
    val amount: Double
)

data class Estimate(
    @SerializedName("_id") val id: String? = null,
    val clientId: Client? = null,
    val totalAmount: Double = 0.0,
    val date: String? = null
)

data class CreateEstimateRequest(
    val client: Client,
    val items: List<Item>,
    val totalAmount: Double
)
