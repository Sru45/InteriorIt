package com.interiorit.app.ui.estimate

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.interiorit.app.data.local.TokenManager
import com.interiorit.app.data.model.Client
import com.interiorit.app.data.model.CreateEstimateRequest
import com.interiorit.app.data.model.Item
import com.interiorit.app.data.remote.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class CreateEstimateViewModel : ViewModel() {
    private val _isSubmitting = MutableStateFlow(false)
    val isSubmitting: StateFlow<Boolean> = _isSubmitting

    private val _submissionSuccess = MutableStateFlow(false)
    val submissionSuccess: StateFlow<Boolean> = _submissionSuccess

    fun submitEstimate(
        tokenManager: TokenManager,
        clientName: String, clientMobile: String, clientAddress: String,
        items: List<Item>, totalAmount: Double
    ) {
        viewModelScope.launch {
            _isSubmitting.value = true
            try {
                val token = tokenManager.getToken()
                val api = RetrofitClient.create(token)
                val request = CreateEstimateRequest(
                    client = Client(name = clientName, mobile = clientMobile, address = clientAddress),
                    items = items,
                    totalAmount = totalAmount
                )
                api.createEstimate(request)
                _submissionSuccess.value = true
            } catch (e: Exception) {
                // handle error
            } finally {
                _isSubmitting.value = false
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateEstimateScreen(
    tokenManager: TokenManager,
    onNavigateBack: () -> Unit,
    viewModel: CreateEstimateViewModel = viewModel()
) {
    var clientName by remember { mutableStateOf("") }
    var clientMobile by remember { mutableStateOf("") }
    var clientAddress by remember { mutableStateOf("") }

    var items by remember { mutableStateOf(listOf<Item>()) }
    
    val isSubmitting by viewModel.isSubmitting.collectAsState()
    val success by viewModel.submissionSuccess.collectAsState()

    LaunchedEffect(success) {
        if (success) onNavigateBack()
    }

    val totalAmount = items.sumOf { it.amount }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Create Estimate", color = MaterialTheme.colorScheme.onPrimary) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.primary)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // Owner Fixed Details
            Card(modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Owner Details (FIXED)", fontWeight = FontWeight.Bold)
                    Text("Name: Babu Suthar")
                    Text("Phone: +91 97234 65421, +91 94275 15584")
                    Text("Address: Vasad-396001 Gujarat")
                    Text("Email: rit.suthar35@gmail.com")
                }
            }

            // Client Input
            Text("Client Details", style = MaterialTheme.typography.titleMedium)
            OutlinedTextField(value = clientName, onValueChange = { clientName = it }, label = { Text("Client Name") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = clientMobile, onValueChange = { clientMobile = it }, label = { Text("Mobile Number") }, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone))
            OutlinedTextField(value = clientAddress, onValueChange = { clientAddress = it }, label = { Text("Address") }, modifier = Modifier.fillMaxWidth())
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Items Table
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Estimate Items", style = MaterialTheme.typography.titleMedium)
                Button(onClick = { 
                    items = items + Item(itemName = "", length = 0.0, width = 0.0, qty = 1, rate = 0.0, sqft = 0.0, amount = 0.0)
                }) {
                    Text("Add Row")
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            items.forEachIndexed { index, item ->
                ItemRow(
                    item = item,
                    onItemChange = { updatedItem ->
                        val newList = items.toMutableList()
                        newList[index] = updatedItem
                        items = newList
                    },
                    onDelete = {
                        val newList = items.toMutableList()
                        newList.removeAt(index)
                        items = newList
                    }
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Preview & Submit
            Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = Color(0xFFEEEEEE))) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Preview & Total", style = MaterialTheme.typography.titleMedium)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Total Amount:", fontWeight = FontWeight.Bold)
                        Text("₹${String.format("%.2f", totalAmount)}", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
            
            Button(
                onClick = { viewModel.submitEstimate(tokenManager, clientName, clientMobile, clientAddress, items, totalAmount) },
                modifier = Modifier.fillMaxWidth().height(50.dp),
                enabled = clientName.isNotBlank() && items.isNotEmpty() && !isSubmitting
            ) {
                if(isSubmitting) CircularProgressIndicator(color=Color.White)
                else Text("Save Estimate")
            }
        }
    }
}

@Composable
fun ItemRow(item: Item, onItemChange: (Item) -> Unit, onDelete: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), elevation = CardDefaults.cardElevation(2.dp)) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                OutlinedTextField(
                    value = item.itemName, 
                    onValueChange = { onItemChange(item.copy(itemName = it)) }, 
                    label = { Text("Item Name") },
                    modifier = Modifier.weight(1f)
                )
                IconButton(onClick = onDelete) {
                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error)
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = if(item.length == 0.0) "" else item.length.toString(), 
                    onValueChange = { 
                        val l = it.toDoubleOrNull() ?: 0.0
                        val sqft = (l * item.width * item.qty) / 144.0
                        val amount = sqft * item.rate
                        onItemChange(item.copy(length = l, sqft = sqft, amount = amount)) 
                    }, 
                    label = { Text("Length (in)") },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                OutlinedTextField(
                    value = if(item.width == 0.0) "" else item.width.toString(), 
                    onValueChange = { 
                        val w = it.toDoubleOrNull() ?: 0.0
                        val sqft = (item.length * w * item.qty) / 144.0
                        val amount = sqft * item.rate
                        onItemChange(item.copy(width = w, sqft = sqft, amount = amount)) 
                    }, 
                    label = { Text("Width (in)") },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = item.qty.toString(), 
                    onValueChange = { 
                        val q = it.toIntOrNull() ?: 0
                        val sqft = (item.length * item.width * q) / 144.0
                        val amount = sqft * item.rate
                        onItemChange(item.copy(qty = q, sqft = sqft, amount = amount)) 
                    }, 
                    label = { Text("Qty") },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                OutlinedTextField(
                    value = if(item.rate == 0.0) "" else item.rate.toString(), 
                    onValueChange = { 
                        val r = it.toDoubleOrNull() ?: 0.0
                        val amount = item.sqft * r
                        onItemChange(item.copy(rate = r, amount = amount)) 
                    }, 
                    label = { Text("Rate") },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Sqft: ${String.format("%.2f", item.sqft)}", style = MaterialTheme.typography.bodyMedium)
                Text("Amount: ₹${String.format("%.2f", item.amount)}", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
            }
        }
    }
}
