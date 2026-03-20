package com.interiorit.app.ui.dashboard

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.interiorit.app.data.local.TokenManager
import com.interiorit.app.data.model.Estimate
import com.interiorit.app.data.remote.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class DashboardViewModel : ViewModel() {
    private val _estimates = MutableStateFlow<List<Estimate>>(emptyList())
    val estimates: StateFlow<List<Estimate>> = _estimates

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    fun loadEstimates(tokenManager: TokenManager) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val token = tokenManager.getToken()
                val api = RetrofitClient.create(token)
                _estimates.value = api.getEstimates()
            } catch (e: Exception) {
                // handle error
            } finally {
                _isLoading.value = false
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    tokenManager: TokenManager,
    onCreateNew: () -> Unit,
    onLogout: () -> Unit,
    viewModel: DashboardViewModel = viewModel()
) {
    val estimates by viewModel.estimates.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadEstimates(tokenManager)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Interior IT Estimates", color = MaterialTheme.colorScheme.onPrimary) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.primary),
                actions = {
                    TextButton(onClick = {
                        tokenManager.clearToken()
                        onLogout()
                    }) {
                        Text("Logout", color = MaterialTheme.colorScheme.onPrimary)
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onCreateNew, containerColor = MaterialTheme.colorScheme.primary) {
                Icon(Icons.Default.Add, contentDescription = "New Estimate", tint = MaterialTheme.colorScheme.onPrimary)
            }
        }
    ) { padding ->
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else if (estimates.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("No estimates found. Create a new one!")
            }
        } else {
            LazyColumn(modifier = Modifier.fillMaxSize().padding(padding)) {
                items(estimates) { estimate ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(8.dp)
                            .clickable { /* View details later */ },
                        elevation = CardDefaults.cardElevation(4.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("Client: ${estimate.clientId?.name ?: "Unknown"}", style = MaterialTheme.typography.titleMedium)
                            Text("Total: ₹${estimate.totalAmount}", color = MaterialTheme.colorScheme.primary)
                            Text("Date: ${estimate.date?.take(10) ?: ""}", style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
        }
    }
}
