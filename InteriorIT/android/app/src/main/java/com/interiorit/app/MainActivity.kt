package com.interiorit.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.interiorit.app.data.local.TokenManager
import com.interiorit.app.ui.auth.LoginScreen
import com.interiorit.app.ui.auth.SignupScreen
import com.interiorit.app.ui.dashboard.DashboardScreen
import com.interiorit.app.ui.estimate.CreateEstimateScreen
import com.interiorit.app.ui.theme.InteriorITTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val tokenManager = TokenManager(this)
        
        setContent {
            InteriorITTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color.White
                ) {
                    InteriorITApp(tokenManager)
                }
            }
        }
    }
}

@Composable
fun InteriorITApp(tokenManager: TokenManager) {
    val navController = rememberNavController()
    
    val startDestination = if (tokenManager.getToken() != null) "dashboard" else "login"

    NavHost(navController = navController, startDestination = startDestination) {
        composable("login") {
            LoginScreen(
                tokenManager = tokenManager,
                onLoginSuccess = {
                    navController.navigate("dashboard") {
                        popUpTo("login") { inclusive = true }
                    }
                },
                onNavigateSignup = { navController.navigate("signup") }
            )
        }
        
        composable("signup") {
            SignupScreen(
                tokenManager = tokenManager,
                onSignupSuccess = {
                    navController.navigate("dashboard") {
                        popUpTo("signup") { inclusive = true }
                    }
                },
                onNavigateLogin = { navController.navigate("login") { popUpTo("login") { inclusive = true } } }
            )
        }
        
        composable("dashboard") {
            DashboardScreen(
                tokenManager = tokenManager,
                onCreateNew = { navController.navigate("create_estimate") },
                onLogout = {
                    navController.navigate("login") {
                        popUpTo("dashboard") { inclusive = true }
                    }
                }
            )
        }
        
        composable("create_estimate") {
            CreateEstimateScreen(
                tokenManager = tokenManager,
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
