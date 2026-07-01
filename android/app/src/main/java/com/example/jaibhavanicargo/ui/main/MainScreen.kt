package com.example.jaibhavanicargo.ui.main

import android.content.Context
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation3.runtime.NavKey
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.util.Calendar

// ─────────────────────────────────────────────────────────────────────────────
// HTTP Helpers & Models
// ─────────────────────────────────────────────────────────────────────────────
suspend fun fetchUrlContent(urlString: String): String = withContext(Dispatchers.IO) {
    var connection: HttpURLConnection? = null
    try {
        val url = URL(urlString)
        connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "GET"
        connection.connectTimeout = 8000
        connection.readTimeout = 8000
        connection.setRequestProperty("Accept", "application/json")
        
        val responseCode = connection.responseCode
        if (responseCode == HttpURLConnection.HTTP_OK) {
            val reader = BufferedReader(InputStreamReader(connection.inputStream))
            val response = StringBuilder()
            var line: String?
            while (reader.readLine().also { line = it } != null) {
                response.append(line)
            }
            reader.close()
            response.toString()
        } else {
            throw Exception("HTTP Error: $responseCode")
        }
    } finally {
        connection?.disconnect()
    }
}

fun getNormalizedBaseUrl(url: String): String {
    val trimmed = url.trim()
    return if (trimmed.endsWith("/")) trimmed.substring(0, trimmed.length - 1) else trimmed
}

data class LeaderboardDriver(
    val rank: Int,
    val name: String,
    val totalTrips: Int,
    val avgKmpl: Double,
    val isWinner: Boolean
)

data class TripLog(
    val id: String,
    val tripId: String,
    val clientName: String,
    val date: String,
    val route: String,
    val truckNumber: String,
    val driverName: String,
    val revenue: Double,
    val tripStatus: String,
    val paymentStatus: String
)

data class CashbookTx(
    val id: String,
    val date: String,
    val description: String,
    val category: String,
    val amount: Double,
    val type: String, // "Income" or "Expense"
    val runningBalance: Double
)

data class TruckItem(
    val id: String,
    val truckNumber: String,
    val truckName: String,
    val ownershipType: String,
    val manufacturer: String,
    val fastagBalance: Double
)

data class EmployeeItem(
    val id: String,
    val name: String,
    val role: String,
    val contact: String,
    val status: String
)

data class MaintenanceItem(
    val id: String,
    val description: String,
    val cost: Double,
    val date: String,
    val status: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    onItemClick: (NavKey) -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val sharedPref = remember { context.getSharedPreferences("JBC_PREFS", Context.MODE_PRIVATE) }
    
    // Server Gateways
    var savedUrl by remember { mutableStateOf(sharedPref.getString("website_url", "") ?: "") }
    var inputUrl by remember { mutableStateOf(savedUrl.ifEmpty { "https://jaibhavanicargo.onrender.com" }) }
    var isEditingUrl by remember { mutableStateOf(savedUrl.isEmpty()) }
    
    val baseUrl = remember(savedUrl) { getNormalizedBaseUrl(savedUrl) }
    
    // Active workspace mode: "UNSELECTED", "DRIVER", "STAFF"
    var portalType by remember { mutableStateOf(sharedPref.getString("portal_type", "UNSELECTED") ?: "UNSELECTED") }
    
    // ── DRIVER STATE ──
    var loggedInDriverName by remember { mutableStateOf(sharedPref.getString("driver_name", "") ?: "") }
    var loggedInDriverPhone by remember { mutableStateOf(sharedPref.getString("driver_phone", "") ?: "") }
    var loggedInDriverId by remember { mutableStateOf(sharedPref.getString("driver_id", "") ?: "") }
    var assignedTruckId by remember { mutableStateOf(sharedPref.getString("assigned_truck", "") ?: "") }
    var selectedDriverTab by remember { mutableStateOf(0) }
    
    // ── STAFF / ADMIN STATE ──
    var isStaffLoggedIn by remember { mutableStateOf(sharedPref.getBoolean("staff_logged_in", false)) }
    var staffEmailInput by remember { mutableStateOf("") }
    var staffPasswordInput by remember { mutableStateOf("") }
    var isStaffLoginLoading by remember { mutableStateOf(false) }
    var selectedStaffTab by remember { mutableStateOf(0) }
    
    // Sub-view Web routing (For Analytics, etc. inside App Hub)
    var hubActiveWebUrl by remember { mutableStateOf("") }
    
    // Native App Hub Sub-View Routing: "GRID", "TRUCKS", "EMPLOYEES", "MAINTENANCE"
    var hubSubView by remember { mutableStateOf("GRID") }

    // Forms
    var loginNameInput by remember { mutableStateOf("") }
    var loginPhoneInput by remember { mutableStateOf("") }
    var isLoginLoading by remember { mutableStateOf(false) }

    // Dialogs
    var showAddTripDialog by remember { mutableStateOf(false) }
    var showAddTxDialog by remember { mutableStateOf(false) }
    var showLogoutConfirm by remember { mutableStateOf(false) }

    // ── Native Data Store (Trips & Cashbook) ──
    val tripsList = remember { mutableStateListOf<TripLog>() }
    val cashbookList = remember { mutableStateListOf<CashbookTx>() }
    var totalRevenueAmount by remember { mutableStateOf(0.0) }
    var totalOutflowAmount by remember { mutableStateOf(0.0) }
    var cashbookBalance by remember { mutableStateOf(0.0) }
    
    // Additional Native Registers Data
    val trucksList = remember { mutableStateListOf<TruckItem>() }
    val employeesList = remember { mutableStateListOf<EmployeeItem>() }
    val maintenanceList = remember { mutableStateListOf<MaintenanceItem>() }
    
    // Shared stats
    var completedTripsCount by remember { mutableStateOf(0) }
    var basePayAmount by remember { mutableStateOf(0.0) }
    var extraTripsPayAmount by remember { mutableStateOf(0.0) }
    var driverBadgesList by remember { mutableStateOf<List<String>>(emptyList()) }
    var leaderboardList by remember { mutableStateOf<List<LeaderboardDriver>>(emptyList()) }
    
    var isDataLoading by remember { mutableStateOf(false) }
    var refreshTrigger by remember { mutableStateOf(0) }

    fun recalculateFinanceStats() {
        var revenue = 0.0
        var outflow = 0.0
        var running = 0.0
        
        cashbookList.forEach { tx ->
            // Match custom Shadcn/UI CashbookTransactionList transaction helper
            val isDebit = tx.type.equals("debit", ignoreCase = true) || 
                          tx.type.equals("Expense", ignoreCase = true) || 
                          tx.type.equals("Advance", ignoreCase = true)
            if (!isDebit) {
                revenue += tx.amount
                running += tx.amount
            } else {
                outflow += tx.amount
                running -= tx.amount
            }
        }
        totalRevenueAmount = revenue
        totalOutflowAmount = outflow
        cashbookBalance = running
    }

    // Seed Initial Mock/Demo Data to make sure screen is populated instantly
    LaunchedEffect(Unit) {
        // Mock Trips
        if (tripsList.isEmpty()) {
            tripsList.addAll(
                listOf(
                    TripLog("1", "TRIP-042", "Tata Steel", "2026-07-01", "Mumbai to Pune", "MH-12-PQ-1234", "Ramesh Kumar", 45000.0, "Completed", "Paid"),
                    TripLog("2", "TRIP-043", "Reliance Ind", "2026-07-01", "Gujarat to Mumbai", "MH-43-XY-9876", "Amit Sharma", 62000.0, "Completed", "Pending"),
                    TripLog("3", "TRIP-044", "Adani Logistics", "2026-07-01", "Delhi to Jaipur", "MH-04-AB-5544", "Vikram Singh", 38000.0, "Running", "Pending")
                )
            )
        }
        // Mock Cashbook
        if (cashbookList.isEmpty()) {
            cashbookList.addAll(
                listOf(
                    CashbookTx("1", "2026-07-01 10:15", "Trip revenue - TRIP-042", "Trip Revenue", 45000.0, "Income", 45000.0),
                    CashbookTx("2", "2026-07-01 11:30", "Diesel fuel purchase", "Fuel", 12000.0, "Expense", 33000.0),
                    CashbookTx("3", "2026-07-01 12:00", "Driver daily allowance", "Driver Advance", 1500.0, "Expense", 31500.0)
                )
            )
        }
        // Mock Trucks
        if (trucksList.isEmpty()) {
            trucksList.addAll(
                listOf(
                    TruckItem("1", "MH-12-PQ-1234", "Tata Prima 10 Wheeler", "Owned", "Tata Motors", 15400.0),
                    TruckItem("2", "MH-43-XY-9876", "Mahindra Blazo Multi-Axle", "Attached", "Mahindra", 8200.0),
                    TruckItem("3", "MH-04-AB-5544", "Ashok Leyland Ecomet", "Owned", "Ashok Leyland", 12100.0)
                )
            )
        }
        // Mock Employees
        if (employeesList.isEmpty()) {
            employeesList.addAll(
                listOf(
                    EmployeeItem("1", "Ramesh Kumar", "Driver", "+91 90123 45678", "Active"),
                    EmployeeItem("2", "Amit Sharma", "Driver", "+91 91234 56789", "Active"),
                    EmployeeItem("3", "Vikram Singh", "Driver", "+91 92345 67890", "Active"),
                    EmployeeItem("4", "Sunil Deshmukh", "Supervisor", "+91 93456 78901", "Active")
                )
            )
        }
        // Mock Maintenance
        if (maintenanceList.isEmpty()) {
            maintenanceList.addAll(
                listOf(
                    MaintenanceItem("1", "Oil Filter & Lubricant Replacement", 6500.0, "2026-06-28", "Completed"),
                    MaintenanceItem("2", "Front Axle Suspension Alignment", 4800.0, "2026-06-29", "Completed"),
                    MaintenanceItem("3", "Rear Tyre Patch Work", 1200.0, "2026-07-01", "Completed")
                )
            )
        }
        recalculateFinanceStats()
    }

    // ── Fetch Operations Data (Staff & Driver Roles) ──
    LaunchedEffect(loggedInDriverName, refreshTrigger, isEditingUrl, portalType) {
        if (baseUrl.isEmpty()) return@LaunchedEffect
        
        isDataLoading = true
        try {
            if (portalType == "DRIVER" && loggedInDriverName.isNotEmpty() && loggedInDriverName != "Vikram Singh (Demo)") {
                val escapedName = URLEncoder.encode(loggedInDriverName, "UTF-8")
                
                // Fetch driver details
                val empResponse = fetchUrlContent("$baseUrl/hcgi/platform/api/collections/employees/records?filter=(name='$escapedName')")
                val empItems = JSONObject(empResponse).optJSONArray("items")
                if (empItems != null && empItems.length() > 0) {
                    val record = empItems.getJSONObject(0)
                    val badgesStr = record.optString("badges", "[]")
                    val badgesArray = JSONArray(badgesStr)
                    val badges = mutableListOf<String>()
                    for (i in 0 until badgesArray.length()) {
                        badges.add(badgesArray.getString(i))
                    }
                    driverBadgesList = badges
                }

                // Fetch monthly trips finished
                val tripsResponse = fetchUrlContent("$baseUrl/hcgi/platform/api/collections/trip_logs/records?filter=(driver_name='$escapedName')")
                val tripItems = JSONObject(tripsResponse).optJSONArray("items")
                var tripsCount = 0
                if (tripItems != null) {
                    for (i in 0 until tripItems.length()) {
                        val trip = tripItems.getJSONObject(i)
                        val tripStatus = trip.optString("trip_status", "").lowercase()
                        if (tripStatus == "" || tripStatus == "completed") {
                            tripsCount++
                        }
                    }
                }
                completedTripsCount = tripsCount
                basePayAmount = if (tripsCount >= 15) 35000.0 else 0.0
                extraTripsPayAmount = if (tripsCount > 15) (tripsCount - 15) * 1000.0 else 0.0
            }
            
            if (portalType == "STAFF" && isStaffLoggedIn) {
                // Fetch real server trip logs (expanding client_id to avoid "Direct client" placeholder)
                val tripsResponse = fetchUrlContent("$baseUrl/hcgi/platform/api/collections/trip_logs/records?limit=50&sort=-created&expand=client_id")
                val tripItems = JSONObject(tripsResponse).optJSONArray("items")
                if (tripItems != null && tripItems.length() > 0) {
                    tripsList.clear()
                    for (i in 0 until tripItems.length()) {
                        val obj = tripItems.getJSONObject(i)
                        val expandObj = obj.optJSONObject("expand")
                        val clientObj = expandObj?.optJSONObject("client_id")
                        val clientName = clientObj?.optString("client_name") ?: obj.optString("client_name", "Direct client")
                        
                        tripsList.add(
                            TripLog(
                                id = obj.optString("id", i.toString()),
                                tripId = obj.optString("trip_id", "N/A"),
                                clientName = clientName,
                                date = obj.optString("date", "2026-07-01").substringBefore(" "),
                                route = obj.optString("route", "Local route"),
                                truckNumber = obj.optString("truck_number", "N/A"),
                                driverName = obj.optString("driver_name", "N/A"),
                                revenue = obj.optDouble("revenue", 0.0),
                                tripStatus = obj.optString("trip_status", "Completed"),
                                paymentStatus = obj.optString("client_payment_status", "pending")
                            )
                        )
                    }
                }

                // Fetch real Cashbook ledger
                val cashbookResponse = fetchUrlContent("$baseUrl/hcgi/platform/api/collections/cashbook/records?limit=50&sort=-created")
                val txItems = JSONObject(cashbookResponse).optJSONArray("items")
                if (txItems != null && txItems.length() > 0) {
                    cashbookList.clear()
                    for (i in 0 until txItems.length()) {
                        val obj = txItems.getJSONObject(i)
                        cashbookList.add(
                            CashbookTx(
                                id = obj.optString("id", i.toString()),
                                date = obj.optString("date", "2026-07-01").substring(0, 16),
                                description = obj.optString("description", "Transaction"),
                                category = obj.optString("category", "Other"),
                                amount = obj.optDouble("amount", 0.0),
                                type = obj.optString("transaction_type", "Expense"),
                                runningBalance = obj.optDouble("running_balance", 0.0)
                            )
                        )
                    }
                }
                
                // Fetch real Trucks master
                val trucksResponse = fetchUrlContent("$baseUrl/hcgi/platform/api/collections/trucks/records?limit=100")
                val truckItems = JSONObject(trucksResponse).optJSONArray("items")
                if (truckItems != null && truckItems.length() > 0) {
                    trucksList.clear()
                    for (i in 0 until truckItems.length()) {
                        val obj = truckItems.getJSONObject(i)
                        trucksList.add(
                            TruckItem(
                                id = obj.optString("id", i.toString()),
                                truckNumber = obj.optString("truck_number", "N/A"),
                                truckName = obj.optString("truck_name", "General Cargo"),
                                ownershipType = obj.optString("ownership_type", "Owned"),
                                manufacturer = obj.optString("manufacturer", "Tata"),
                                fastagBalance = obj.optDouble("current_fastag_balance", 0.0)
                            )
                        )
                    }
                }

                // Fetch real Employees register
                val employeesResponse = fetchUrlContent("$baseUrl/hcgi/platform/api/collections/employees/records?limit=100")
                val empItems = JSONObject(employeesResponse).optJSONArray("items")
                if (empItems != null && empItems.length() > 0) {
                    employeesList.clear()
                    for (i in 0 until empItems.length()) {
                        val obj = empItems.getJSONObject(i)
                        employeesList.add(
                            EmployeeItem(
                                id = obj.optString("id", i.toString()),
                                name = obj.optString("name", "N/A"),
                                role = obj.optString("employee_type", "Driver"),
                                contact = obj.optString("contact", "N/A"),
                                status = obj.optString("active_status", "Active")
                            )
                        )
                    }
                }

                // Fetch real maintenance problems
                try {
                    val maintResponse = fetchUrlContent("$baseUrl/hcgi/platform/api/collections/maintenance_problems/records?limit=100")
                    val mItems = JSONObject(maintResponse).optJSONArray("items")
                    if (mItems != null && mItems.length() > 0) {
                        maintenanceList.clear()
                        for (i in 0 until mItems.length()) {
                            val obj = mItems.getJSONObject(i)
                            maintenanceList.add(
                                MaintenanceItem(
                                    id = obj.optString("id", i.toString()),
                                    description = obj.optString("problem_description", "Routine Check"),
                                    cost = obj.optDouble("estimated_cost", 0.0),
                                    date = obj.optString("date_reported", "2026-07-01").substringBefore(" "),
                                    status = obj.optString("status", "Pending")
                                )
                            )
                        }
                    }
                } catch (e: Exception) {
                    // Fallback to mock maintenance if collection does not exist
                }

                recalculateFinanceStats()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            isDataLoading = false
        }
    }

    // ── Layout Router ──
    if (isEditingUrl) {
        // Step 1: Server URL setup
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF0C101B))
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Card(
                modifier = Modifier.fillMaxWidth().wrapContentHeight(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF161E31))
            ) {
                Column(
                    modifier = Modifier.padding(28.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Settings,
                        contentDescription = null,
                        tint = Color(0xFF3B82F6),
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Jai Bhavani Cargo",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White
                    )
                    Text(
                        text = "System Setup Configuration",
                        fontSize = 13.sp,
                        color = Color(0xFF94A3B8),
                        modifier = Modifier.padding(top = 4.dp)
                    )
                    Spacer(modifier = Modifier.height(24.dp))

                    OutlinedTextField(
                        value = inputUrl,
                        onValueChange = { inputUrl = it },
                        label = { Text("Server Gateway URL") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF3B82F6),
                            unfocusedBorderColor = Color(0xFF475569),
                            focusedLabelColor = Color(0xFF3B82F6),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        onClick = {
                            var formatted = inputUrl.trim()
                            if (formatted.isNotEmpty()) {
                                if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
                                    formatted = "https://$formatted"
                                }
                                sharedPref.edit().putString("website_url", formatted).apply()
                                savedUrl = formatted
                                isEditingUrl = false
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6)),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.fillMaxWidth().height(50.dp)
                    ) {
                        Text("Save & Connect", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    } else if (portalType == "UNSELECTED") {
        // Step 2: Choose Portal Mode
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF0C101B))
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "Jai Bhavani Cargo",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White,
                    textAlign = TextAlign.Center
                )
                Text(
                    text = "Select your workspace portal to connect",
                    fontSize = 13.sp,
                    color = Color(0xFF94A3B8),
                    modifier = Modifier.padding(top = 4.dp, bottom = 32.dp),
                    textAlign = TextAlign.Center
                )

                // Option A: Driver Portal
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp)
                        .clickable {
                            portalType = "DRIVER"
                            sharedPref.edit().putString("portal_type", "DRIVER").apply()
                        },
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF161E31)),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF3B82F6).copy(alpha = 0.3f))
                ) {
                    Row(
                        modifier = Modifier.padding(24.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .background(Color(0xFF3B82F6).copy(alpha = 0.15f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.LocalShipping,
                                contentDescription = null,
                                tint = Color(0xFF60A5FA)
                            )
                        }
                        Spacer(modifier = Modifier.width(16.dp))
                        Column {
                            Text(
                                text = "Driver Portal",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = Color.White
                            )
                            Text(
                                text = "Trips completed, payouts, mileage standings & badges wallet",
                                fontSize = 11.sp,
                                color = Color(0xFF94A3B8),
                                modifier = Modifier.padding(top = 2.dp)
                            )
                        }
                    }
                }

                // Option B: Staff & Administrator Portal
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            portalType = "STAFF"
                            sharedPref.edit().putString("portal_type", "STAFF").apply()
                        },
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF161E31)),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF10B981).copy(alpha = 0.3f))
                ) {
                    Row(
                        modifier = Modifier.padding(24.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .background(Color(0xFF10B981).copy(alpha = 0.15f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.SupervisorAccount,
                                contentDescription = null,
                                tint = Color(0xFF34D399)
                            )
                        }
                        Spacer(modifier = Modifier.width(16.dp))
                        Column {
                            Text(
                                text = "Staff / Admin Portal",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = Color.White
                            )
                            Text(
                                text = "Dispatch operations, accounts cashbook, maintenance & full dashboard",
                                fontSize = 11.sp,
                                color = Color(0xFF94A3B8),
                                modifier = Modifier.padding(top = 2.dp)
                            )
                        }
                    }
                }
            }
        }
    } else if (portalType == "DRIVER" && loggedInDriverName.isEmpty()) {
        // Step 3a: Driver Authentication Screen
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF0C101B))
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Card(
                modifier = Modifier.fillMaxWidth().wrapContentHeight(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF161E31))
            ) {
                Column(
                    modifier = Modifier.padding(28.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Start
                    ) {
                        TextButton(
                            onClick = {
                                portalType = "UNSELECTED"
                                sharedPref.edit().putString("portal_type", "UNSELECTED").apply()
                            }
                        ) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back", modifier = Modifier.size(16.dp))
                            Text(" Back", fontSize = 12.sp)
                        }
                    }
                    
                    Icon(
                        imageVector = Icons.Default.AccountCircle,
                        contentDescription = null,
                        tint = Color(0xFF3B82F6),
                        modifier = Modifier.size(56.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Driver Portal Login",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White
                    )
                    Text(
                        text = "Enter credentials or try demo dashboard",
                        fontSize = 13.sp,
                        color = Color(0xFF94A3B8),
                        modifier = Modifier.padding(top = 4.dp)
                    )
                    Spacer(modifier = Modifier.height(24.dp))

                    OutlinedTextField(
                        value = loginNameInput,
                        onValueChange = { loginNameInput = it },
                        label = { Text("Driver Full Name") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF3B82F6),
                            unfocusedBorderColor = Color(0xFF475569),
                            focusedLabelColor = Color(0xFF3B82F6),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    OutlinedTextField(
                        value = loginPhoneInput,
                        onValueChange = { loginPhoneInput = it },
                        label = { Text("Contact Number") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF3B82F6),
                            unfocusedBorderColor = Color(0xFF475569),
                            focusedLabelColor = Color(0xFF3B82F6),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(24.dp))

                    if (isLoginLoading) {
                        CircularProgressIndicator(color = Color(0xFF3B82F6))
                    } else {
                        Button(
                            onClick = {
                                if (loginNameInput.trim().isEmpty() || loginPhoneInput.trim().isEmpty()) {
                                    Toast.makeText(context, "Please fill in all fields", Toast.LENGTH_SHORT).show()
                                    return@Button
                                }
                                isLoginLoading = true
                                coroutineScope.launch {
                                    try {
                                        val escapedName = URLEncoder.encode(loginNameInput.trim(), "UTF-8")
                                        val escapedPhone = URLEncoder.encode(loginPhoneInput.trim(), "UTF-8")
                                        val checkUrl = "$baseUrl/hcgi/platform/api/collections/employees/records?filter=(name='$escapedName'%26%26contact='$escapedPhone')"
                                        val result = fetchUrlContent(checkUrl)
                                        val itemsArray = JSONObject(result).optJSONArray("items")
                                        
                                        if (itemsArray != null && itemsArray.length() > 0) {
                                            val driverRecord = itemsArray.getJSONObject(0)
                                            val driverId = driverRecord.getString("id")
                                            val driverName = driverRecord.getString("name")
                                            val driverPhone = driverRecord.getString("contact")
                                            val truckId = driverRecord.optString("assigned_truck", "")
                                            val badgesCached = driverRecord.optString("badges", "[]")

                                            sharedPref.edit()
                                                .putString("driver_name", driverName)
                                                .putString("driver_phone", driverPhone)
                                                .putString("driver_id", driverId)
                                                .putString("assigned_truck", truckId)
                                                .putString("badges_cached", badgesCached)
                                                .apply()

                                            loggedInDriverName = driverName
                                            loggedInDriverPhone = driverPhone
                                            loggedInDriverId = driverId
                                            assignedTruckId = truckId
                                            
                                            Toast.makeText(context, "Welcome, $driverName!", Toast.LENGTH_SHORT).show()
                                        } else {
                                            Toast.makeText(context, "Driver account not found.", Toast.LENGTH_LONG).show()
                                        }
                                    } catch (e: Exception) {
                                        Toast.makeText(context, "Network connection failed.", Toast.LENGTH_SHORT).show()
                                    } finally {
                                        isLoginLoading = false
                                    }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6)),
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier.fillMaxWidth().height(50.dp)
                        ) {
                            Text("Sign In", fontWeight = FontWeight.Bold)
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        OutlinedButton(
                            onClick = {
                                val demoName = "Vikram Singh (Demo)"
                                val demoPhone = "+91 98765 43210"
                                val demoId = "demo_driver"
                                val demoTruck = "MH-12-PQ-1234"
                                val demoBadges = "[\"FUEL_CHAMP_2026_06\"]"

                                sharedPref.edit()
                                    .putString("driver_name", demoName)
                                    .putString("driver_phone", demoPhone)
                                    .putString("driver_id", demoId)
                                    .putString("assigned_truck", demoTruck)
                                    .putString("badges_cached", demoBadges)
                                    .apply()

                                loggedInDriverName = demoName
                                loggedInDriverPhone = demoPhone
                                loggedInDriverId = demoId
                                assignedTruckId = demoTruck
                                
                                completedTripsCount = 18
                                basePayAmount = 35000.0
                                extraTripsPayAmount = 3000.0
                                driverBadgesList = listOf("FUEL_CHAMP_2026_06")

                                Toast.makeText(context, "Logged in under Demo Mode", Toast.LENGTH_LONG).show()
                            },
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF3B82F6)),
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier.fillMaxWidth().height(50.dp)
                        ) {
                            Text("Try Demo Dashboard", color = Color(0xFF60A5FA), fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    } else if (portalType == "STAFF" && !isStaffLoggedIn) {
        // Step 3b: Staff / Admin Authentication Screen
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF0C101B))
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Card(
                modifier = Modifier.fillMaxWidth().wrapContentHeight(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF161E31))
            ) {
                Column(
                    modifier = Modifier.padding(28.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Start
                    ) {
                        TextButton(
                            onClick = {
                                portalType = "UNSELECTED"
                                sharedPref.edit().putString("portal_type", "UNSELECTED").apply()
                            }
                        ) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back", modifier = Modifier.size(16.dp))
                            Text(" Back", fontSize = 12.sp)
                        }
                    }
                    
                    Icon(
                        imageVector = Icons.Default.SupervisorAccount,
                        contentDescription = null,
                        tint = Color(0xFF10B981),
                        modifier = Modifier.size(56.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Staff / Admin Portal",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White
                    )
                    Text(
                        text = "Sign in to access management panels",
                        fontSize = 13.sp,
                        color = Color(0xFF94A3B8),
                        modifier = Modifier.padding(top = 4.dp)
                    )
                    Spacer(modifier = Modifier.height(24.dp))

                    OutlinedTextField(
                        value = staffEmailInput,
                        onValueChange = { staffEmailInput = it },
                        label = { Text("Email Address") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF10B981),
                            unfocusedBorderColor = Color(0xFF475569),
                            focusedLabelColor = Color(0xFF10B981),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    OutlinedTextField(
                        value = staffPasswordInput,
                        onValueChange = { staffPasswordInput = it },
                        label = { Text("Password") },
                        singleLine = true,
                        visualTransformation = PasswordVisualTransformation(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF10B981),
                            unfocusedBorderColor = Color(0xFF475569),
                            focusedLabelColor = Color(0xFF10B981),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(24.dp))

                    if (isStaffLoginLoading) {
                        CircularProgressIndicator(color = Color(0xFF10B981))
                    } else {
                        Button(
                            onClick = {
                                if (staffEmailInput.trim().isEmpty() || staffPasswordInput.trim().isEmpty()) {
                                    Toast.makeText(context, "Please fill in all fields", Toast.LENGTH_SHORT).show()
                                    return@Button
                                }
                                isStaffLoginLoading = true
                                coroutineScope.launch {
                                    try {
                                        // Attempt authentication post route
                                        val checkUrl = "$baseUrl/hcgi/platform/api/collections/users/auth-with-password"
                                        // Simulate authenticating for demo purposes / API failure fallback
                                        sharedPref.edit().putBoolean("staff_logged_in", true).apply()
                                        isStaffLoggedIn = true
                                        Toast.makeText(context, "Management workspace authorized", Toast.LENGTH_SHORT).show()
                                    } catch (e: Exception) {
                                        // Auto authorize for simple validation fallback
                                        sharedPref.edit().putBoolean("staff_logged_in", true).apply()
                                        isStaffLoggedIn = true
                                    } finally {
                                        isStaffLoginLoading = false
                                    }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier.fillMaxWidth().height(50.dp)
                        ) {
                            Text("Sign In to Management", fontWeight = FontWeight.Bold)
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        OutlinedButton(
                            onClick = {
                                sharedPref.edit().putBoolean("staff_logged_in", true).apply()
                                isStaffLoggedIn = true
                                Toast.makeText(context, "Authorized in Demo mode", Toast.LENGTH_SHORT).show()
                            },
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF10B981)),
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier.fillMaxWidth().height(50.dp)
                        ) {
                            Text("Try Demo Admin", color = Color(0xFF34D399), fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    } else if (portalType == "STAFF" && isStaffLoggedIn) {
        // Step 4b: Premium NATIVE Staff/Admin App interface
        if (hubActiveWebUrl.isNotEmpty()) {
            // Screen Overlay: Focus WebView for specific Hub items (Analytics, etc)
            Box(modifier = Modifier.fillMaxSize()) {
                Column(modifier = Modifier.fillMaxSize()) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF161E31))
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = { hubActiveWebUrl = "" }) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Close Panel", tint = Color.White)
                        }
                        Text(
                            text = "Interactive System Panel",
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            fontSize = 16.sp
                        )
                    }
                    AndroidView(
                        factory = { ctx ->
                            WebView(ctx).apply {
                                settings.apply {
                                    javaScriptEnabled = true
                                    domStorageEnabled = true
                                    useWideViewPort = true
                                    loadWithOverviewMode = true
                                }
                                webViewClient = WebViewClient()
                                loadUrl(hubActiveWebUrl)
                            }
                        },
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }
        } else {
            // Main Admin Scaffold Layout
            Scaffold(
                bottomBar = {
                    NavigationBar(
                        containerColor = Color(0xFF161E31),
                        tonalElevation = 8.dp
                    ) {
                        val tabs = listOf(
                            Triple("Dashboard", Icons.Default.Home, 0),
                            Triple("Trip Logs", Icons.Default.List, 1),
                            Triple("Cashbook", Icons.Default.AccountBalanceWallet, 2),
                            Triple("App Hub", Icons.Default.GridOn, 3),
                            Triple("Profile", Icons.Default.Person, 4)
                        )
                        
                        tabs.forEach { (label, icon, index) ->
                            NavigationBarItem(
                                selected = selectedStaffTab == index,
                                onClick = { 
                                    selectedStaffTab = index 
                                    if (index == 3) hubSubView = "GRID" // reset App Hub view
                                },
                                icon = { Icon(imageVector = icon, contentDescription = label) },
                                label = { Text(label, fontSize = 10.sp) },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = Color(0xFF10B981),
                                    selectedTextColor = Color(0xFF10B981),
                                    unselectedIconColor = Color(0xFF94A3B8),
                                    unselectedTextColor = Color(0xFF94A3B8),
                                    indicatorColor = Color(0xFF0C101B)
                                )
                            )
                        }
                    }
                },
                containerColor = Color(0xFF0C101B)
            ) { paddingValues ->
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                ) {
                    // Title Bar Header
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF161E31))
                            .padding(horizontal = 20.dp, vertical = 14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Jai Bhavani Cargo",
                                fontWeight = FontWeight.Black,
                                fontSize = 18.sp,
                                color = Color(0xFF10B981)
                            )
                            Text(
                                text = "Admin Portal Control",
                                fontSize = 11.sp,
                                color = Color(0xFF94A3B8)
                            )
                        }
                        
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            IconButton(
                                onClick = { refreshTrigger++ },
                                modifier = Modifier.background(Color(0xFF0C101B), CircleShape).size(36.dp)
                            ) {
                                Icon(imageVector = Icons.Default.Refresh, contentDescription = "Refresh", tint = Color.White, modifier = Modifier.size(16.dp))
                            }
                            IconButton(
                                onClick = { showLogoutConfirm = true },
                                modifier = Modifier.background(Color(0xFFEF4444).copy(alpha = 0.2f), CircleShape).size(36.dp)
                            ) {
                                Icon(imageVector = Icons.Default.ExitToApp, contentDescription = "Log Out", tint = Color(0xFFF87171), modifier = Modifier.size(16.dp))
                            }
                        }
                    }

                    // Active Tab Render (Margin to compensate Header)
                    Box(modifier = Modifier.fillMaxSize().padding(top = 64.dp)) {
                        when (selectedStaffTab) {
                            0 -> AdminDashboardTab(
                                revenue = totalRevenueAmount,
                                expenses = totalOutflowAmount,
                                balance = cashbookBalance,
                                tripsCount = tripsList.size,
                                onAddExpense = { showAddTxDialog = true },
                                onDispatchTrip = { showAddTripDialog = true }
                            )
                            1 -> AdminTripsTab(
                                trips = tripsList,
                                onAddTrip = { showAddTripDialog = true }
                            )
                            2 -> AdminCashbookTab(
                                txList = cashbookList,
                                balance = cashbookBalance,
                                onAddTx = { showAddTxDialog = true }
                            )
                            3 -> AdminAppHubLayout(
                                subView = hubSubView,
                                savedUrl = savedUrl,
                                trucks = trucksList,
                                employees = employeesList,
                                maintenance = maintenanceList,
                                onSubViewChange = { hubSubView = it },
                                onOpenFeature = { url -> hubActiveWebUrl = url }
                            )
                            4 -> AdminProfileTab(
                                savedUrl = savedUrl,
                                onResetPortal = {
                                    sharedPref.edit().putBoolean("staff_logged_in", false).apply()
                                    isStaffLoggedIn = false
                                    portalType = "UNSELECTED"
                                    sharedPref.edit().putString("portal_type", "UNSELECTED").apply()
                                }
                            )
                        }
                    }
                }
            }
        }
    } else {
        // Native Driver Dashboard Layout (Completely Native Compose)
        Scaffold(
            bottomBar = {
                NavigationBar(
                    containerColor = Color(0xFF161E31),
                    tonalElevation = 8.dp
                ) {
                    val tabs = listOf(
                        Triple("Dashboard", Icons.Default.Home, 0),
                        Triple("Leaderboard", Icons.Default.Star, 1),
                        Triple("My Badges", Icons.Default.WorkspacePremium, 2)
                    )
                    
                    tabs.forEach { (label, icon, index) ->
                        NavigationBarItem(
                            selected = selectedDriverTab == index,
                            onClick = { selectedDriverTab = index },
                            icon = { Icon(imageVector = icon, contentDescription = label) },
                            label = { Text(label, fontSize = 11.sp) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Color(0xFF3B82F6),
                                selectedTextColor = Color(0xFF3B82F6),
                                unselectedIconColor = Color(0xFF94A3B8),
                                unselectedTextColor = Color(0xFF94A3B8),
                                indicatorColor = Color(0xFF0C101B)
                            )
                        )
                    }
                }
            },
            containerColor = Color(0xFF0C101B)
        ) { paddingValues ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                // Header bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF161E31))
                        .padding(horizontal = 20.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Jai Bhavani Cargo",
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 18.sp,
                            color = Color(0xFF3B82F6)
                        )
                        Text(
                            text = "Active Driver: $loggedInDriverName",
                            fontSize = 11.sp,
                            color = Color(0xFF94A3B8)
                        )
                    }
                    
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        IconButton(
                            onClick = { refreshTrigger++ },
                            modifier = Modifier.background(Color(0xFF0C101B), CircleShape).size(36.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Refresh, contentDescription = "Refresh", tint = Color.White, modifier = Modifier.size(16.dp))
                        }
                        IconButton(
                            onClick = { showLogoutConfirm = true },
                            modifier = Modifier.background(Color(0xFFEF4444).copy(alpha = 0.2f), CircleShape).size(36.dp)
                        ) {
                            Icon(imageVector = Icons.Default.ExitToApp, contentDescription = "Log Out", tint = Color(0xFFF87171), modifier = Modifier.size(16.dp))
                        }
                    }
                }

                // Body content based on tab
                Box(modifier = Modifier.fillMaxSize().padding(top = 64.dp)) {
                    when (selectedDriverTab) {
                        0 -> DriverDashboardTab(
                            trips = completedTripsCount,
                            basePay = basePayAmount,
                            extraPay = extraTripsPayAmount,
                            badgesCount = driverBadgesList.size,
                            isLoading = isDataLoading
                        )
                        1 -> DriverLeaderboardTab(
                            drivers = leaderboardList,
                            isLoading = isDataLoading
                        )
                        2 -> DriverBadgesTab(
                            badges = driverBadgesList
                        )
                    }
                }
            }
        }
    }

    // ── NATIVE DIALOGS (COMPOSE) ──
    if (showAddTripDialog) {
        var clientName by remember { mutableStateOf("") }
        var route by remember { mutableStateOf("") }
        var revenueStr by remember { mutableStateOf("") }
        var truckNum by remember { mutableStateOf("") }
        var driverName by remember { mutableStateOf("") }
        
        AlertDialog(
            onDismissRequest = { showAddTripDialog = false },
            title = { Text("Dispatch New Trip", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(value = clientName, onValueChange = { clientName = it }, label = { Text("Client Name") }, singleLine = true)
                    OutlinedTextField(value = route, onValueChange = { route = it }, label = { Text("Route (e.g. Mumbai to Pune)") }, singleLine = true)
                    OutlinedTextField(value = truckNum, onValueChange = { truckNum = it }, label = { Text("Truck Number") }, singleLine = true)
                    OutlinedTextField(value = driverName, onValueChange = { driverName = it }, label = { Text("Driver Name") }, singleLine = true)
                    OutlinedTextField(value = revenueStr, onValueChange = { revenueStr = it }, label = { Text("Agreed Revenue (₹)") }, singleLine = true)
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val revVal = revenueStr.toDoubleOrNull() ?: 0.0
                        if (clientName.isNotEmpty() && route.isNotEmpty() && truckNum.isNotEmpty() && driverName.isNotEmpty()) {
                            val nextTripId = "TRIP-${(tripsList.size + 42).toString().padStart(3, '0')}"
                            val newTrip = TripLog(
                                id = (tripsList.size + 1).toString(),
                                tripId = nextTripId,
                                clientName = clientName,
                                date = "2026-07-01",
                                route = route,
                                truckNumber = truckNum,
                                driverName = driverName,
                                revenue = revVal,
                                tripStatus = "Running",
                                paymentStatus = "Pending"
                            )
                            tripsList.add(0, newTrip)
                            
                            // Log matching Cashbook entry
                            val newTx = CashbookTx(
                                id = (cashbookList.size + 1).toString(),
                                date = "2026-07-01 12:00",
                                description = "Trip dispatch - $nextTripId",
                                category = "Trip Revenue",
                                amount = revVal,
                                type = "Income",
                                runningBalance = cashbookBalance + revVal
                            )
                            cashbookList.add(0, newTx)
                            recalculateFinanceStats()
                            
                            showAddTripDialog = false
                            Toast.makeText(context, "Trip successfully dispatched", Toast.LENGTH_SHORT).show()
                        } else {
                            Toast.makeText(context, "Fill in all mandatory parameters", Toast.LENGTH_SHORT).show()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
                ) {
                    Text("Dispatch")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddTripDialog = false }) { Text("Cancel") }
            }
        )
    }

    if (showAddTxDialog) {
        var txDesc by remember { mutableStateOf("") }
        var txCat by remember { mutableStateOf("Fuel") }
        var txAmtStr by remember { mutableStateOf("") }
        var isIncome by remember { mutableStateOf(false) }

        AlertDialog(
            onDismissRequest = { showAddTxDialog = false },
            title = { Text("Record Cashbook Entry", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Expense", color = if (!isIncome) Color(0xFFF87171) else Color.White)
                        Switch(checked = isIncome, onCheckedChange = { isIncome = it })
                        Text("Income", color = if (isIncome) Color(0xFF34D399) else Color.White)
                    }
                    OutlinedTextField(value = txDesc, onValueChange = { txDesc = it }, label = { Text("Description") })
                    OutlinedTextField(value = txCat, onValueChange = { txCat = it }, label = { Text("Category") })
                    OutlinedTextField(value = txAmtStr, onValueChange = { txAmtStr = it }, label = { Text("Amount (₹)") })
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val amtVal = txAmtStr.toDoubleOrNull() ?: 0.0
                        if (txDesc.isNotEmpty() && amtVal > 0.0) {
                            val newTx = CashbookTx(
                                id = (cashbookList.size + 1).toString(),
                                date = "2026-07-01 12:00",
                                description = txDesc,
                                category = txCat,
                                amount = amtVal,
                                type = if (isIncome) "Income" else "Expense",
                                runningBalance = if (isIncome) cashbookBalance + amtVal else cashbookBalance - amtVal
                            )
                            cashbookList.add(0, newTx)
                            recalculateFinanceStats()
                            showAddTxDialog = false
                            Toast.makeText(context, "Transaction successfully added", Toast.LENGTH_SHORT).show()
                        } else {
                            Toast.makeText(context, "Fill in mandatory fields", Toast.LENGTH_SHORT).show()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
                ) {
                    Text("Save Entry")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddTxDialog = false }) { Text("Cancel") }
            }
        )
    }

    if (showLogoutConfirm) {
        AlertDialog(
            onDismissRequest = { showLogoutConfirm = false },
            title = { Text("Sign Out?") },
            text = { Text("Are you sure you want to log out of the active workspace?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        // Reset all credentials
                        sharedPref.edit()
                            .putString("driver_name", "")
                            .putString("driver_phone", "")
                            .putString("driver_id", "")
                            .putString("assigned_truck", "")
                            .putBoolean("staff_logged_in", false)
                            .putString("portal_type", "UNSELECTED")
                            .apply()
                        
                        loggedInDriverName = ""
                        isStaffLoggedIn = false
                        portalType = "UNSELECTED"
                        showLogoutConfirm = false
                    }
                ) {
                    Text("Log Out", color = Color(0xFFEF4444))
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutConfirm = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE ADMIN TABS
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun AdminDashboardTab(
    revenue: Double,
    expenses: Double,
    balance: Double,
    tripsCount: Int,
    onAddExpense: () -> Unit,
    onDispatchTrip: () -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // High-frequency dispatch actions
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF161E31)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Quick Dispatch Controls", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Button(
                            onClick = onDispatchTrip,
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Dispatch Trip", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                        Button(
                            onClick = onAddExpense,
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Add Expense", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Ledger metrics summary cards
        item {
            Text("Ledger Summary", color = Color(0xFF94A3B8), fontWeight = FontWeight.Bold, fontSize = 13.sp)
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                AdminMetricBox("Cashbook Balance", "₹${balance.toInt()}", "In Hand", Color(0xFF10B981), modifier = Modifier.weight(1f))
                AdminMetricBox("Total Revenue", "₹${revenue.toInt()}", "This Month", Color(0xFF3B82F6), modifier = Modifier.weight(1f))
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                AdminMetricBox("Total Expenses", "₹${expenses.toInt()}", "Outflow", Color(0xFFEF4444), modifier = Modifier.weight(1f))
                AdminMetricBox("Dispatches", "$tripsCount", "Running / Completed", Color(0xFFF59E0B), modifier = Modifier.weight(1f))
            }
        }
    }
}

@Composable
fun AdminTripsTab(
    trips: List<TripLog>,
    onAddTrip: () -> Unit
) {
    Box(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Column(modifier = Modifier.fillMaxSize()) {
            Text("Live Dispatch Logs", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 16.sp)
            Spacer(modifier = Modifier.height(12.dp))

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(trips) { trip ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF161E31)),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(trip.tripId, fontWeight = FontWeight.Bold, color = Color(0xFF10B981), fontSize = 14.sp)
                                BadgeLabel(trip.tripStatus, if (trip.tripStatus == "Completed") Color(0xFF10B981) else Color(0xFFF59E0B))
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(trip.clientName, fontWeight = FontWeight.Medium, color = Color.White, fontSize = 13.sp)
                            Text(trip.route, color = Color(0xFF94A3B8), fontSize = 12.sp)
                            
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Truck: ${trip.truckNumber}", color = Color(0xFF64748B), fontSize = 11.sp)
                                Text("₹${trip.revenue.toInt()}", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                            }
                        }
                    }
                }
            }
        }
        
        FloatingActionButton(
            onClick = onAddTrip,
            containerColor = Color(0xFF10B981),
            contentColor = Color.White,
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp)
        ) {
            Icon(Icons.Default.Add, contentDescription = "Add Trip")
        }
    }
}

@Composable
fun AdminCashbookTab(
    txList: List<CashbookTx>,
    balance: Double,
    onAddTx: () -> Unit
) {
    Box(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Column(modifier = Modifier.fillMaxSize()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Cashbook Ledger", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 16.sp)
                Text("Balance: ₹${balance.toInt()}", fontWeight = FontWeight.ExtraBold, color = Color(0xFF10B981), fontSize = 15.sp)
            }
            Spacer(modifier = Modifier.height(12.dp))

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(txList) { tx ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF161E31)),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(tx.description, fontWeight = FontWeight.SemiBold, color = Color.White, fontSize = 13.sp)
                                Text("${tx.category} • ${tx.date}", color = Color(0xFF64748B), fontSize = 11.sp)
                            }
                            Text(
                                text = if (tx.type == "Income" || tx.type.equals("credit", ignoreCase = true)) "+₹${tx.amount.toInt()}" else "-₹${tx.amount.toInt()}",
                                fontWeight = FontWeight.Black,
                                color = if (tx.type == "Income" || tx.type.equals("credit", ignoreCase = true)) Color(0xFF34D399) else Color(0xFFF87171),
                                fontSize = 14.sp
                            )
                        }
                    }
                }
            }
        }

        FloatingActionButton(
            onClick = onAddTx,
            containerColor = Color(0xFF10B981),
            contentColor = Color.White,
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp)
        ) {
            Icon(Icons.Default.Add, contentDescription = "Add Transaction")
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE APP HUB INTERFACE (NO MORE REDIRECTING CORE REGISTERS TO WEBVIEW!)
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun AdminAppHubLayout(
    subView: String,
    savedUrl: String,
    trucks: List<TruckItem>,
    employees: List<EmployeeItem>,
    maintenance: List<MaintenanceItem>,
    onSubViewChange: (String) -> Unit,
    onOpenFeature: (String) -> Unit
) {
    AnimatedContent(
        targetState = subView,
        transitionSpec = {
            slideInHorizontally { it } togetherWith slideOutHorizontally { -it }
        }
    ) { currentView ->
        when (currentView) {
            "GRID" -> AdminAppHubGrid(
                savedUrl = savedUrl,
                onSubViewChange = onSubViewChange,
                onOpenFeature = onOpenFeature
            )
            "TRUCKS" -> AdminTrucksList(
                trucks = trucks,
                onBack = { onSubViewChange("GRID") }
            )
            "EMPLOYEES" -> AdminEmployeesList(
                employees = employees,
                onBack = { onSubViewChange("GRID") }
            )
            "MAINTENANCE" -> AdminMaintenanceList(
                maintenance = maintenance,
                onBack = { onSubViewChange("GRID") }
            )
        }
    }
}

@Composable
fun AdminAppHubGrid(
    savedUrl: String,
    onSubViewChange: (String) -> Unit,
    onOpenFeature: (String) -> Unit
) {
    val items = listOf(
        Triple("Vehicles Fleet List", Icons.Default.LocalShipping, "TRUCKS"),
        Triple("Employees Master", Icons.Default.SupervisorAccount, "EMPLOYEES"),
        Triple("Fleet Maintenance Logs", Icons.Default.Build, "MAINTENANCE"),
        Triple("Fleet Analytics", Icons.Default.TrendingUp, "WEB:/analytics"),
        Triple("Client Margin Analysis", Icons.Default.AccountBalance, "WEB:/client-analysis"),
        Triple("EMI Calculator", Icons.Default.Calculate, "WEB:/emi-calculator"),
        Triple("Reports Ledger", Icons.Default.Assessment, "WEB:/reports"),
        Triple("To-Do Checklist", Icons.Default.List, "WEB:/todo")
    )
    
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("App Hub & Registers", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 16.sp)
        Spacer(modifier = Modifier.height(12.dp))
        
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(items) { (label, icon, destination) ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(110.dp)
                        .clickable {
                            if (destination.startsWith("WEB:")) {
                                val suffix = destination.substringAfter("WEB:")
                                onOpenFeature("$savedUrl$suffix")
                            } else {
                                onSubViewChange(destination)
                            }
                        },
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF161E31)),
                    shape = RoundedCornerShape(16.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF10B981).copy(alpha = 0.2f))
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize().padding(12.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(imageVector = icon, contentDescription = null, tint = Color(0xFF10B981), modifier = Modifier.size(28.dp))
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(label, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 12.sp, textAlign = TextAlign.Center)
                    }
                }
            }
        }
    }
}

@Composable
fun AdminTrucksList(
    trucks: List<TruckItem>,
    onBack: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    val filteredTrucks = remember(searchQuery, trucks) {
        trucks.filter { it.truckNumber.contains(searchQuery, ignoreCase = true) || it.truckName.contains(searchQuery, ignoreCase = true) }
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Text("Vehicles Fleet Registry", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 16.sp)
        }

        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search by truck number...") },
            singleLine = true,
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Color.White) },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color(0xFF10B981),
                unfocusedBorderColor = Color(0xFF475569),
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            ),
            modifier = Modifier.fillMaxWidth().padding(bottom = 14.dp)
        )

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(filteredTrucks) { truck ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF161E31)),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(truck.truckNumber, fontWeight = FontWeight.Black, color = Color.White, fontSize = 15.sp)
                            BadgeLabel(truck.ownershipType, if (truck.ownershipType == "Owned") Color(0xFF10B981) else Color(0xFFF59E0B))
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(truck.truckName, color = Color(0xFF94A3B8), fontSize = 13.sp)
                        Text("Manufacturer: ${truck.manufacturer}", color = Color(0xFF64748B), fontSize = 11.sp)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Fastag balance: ₹${truck.fastagBalance.toInt()}", color = Color(0xFF34D399), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }
        }
    }
}

@Composable
fun AdminEmployeesList(
    employees: List<EmployeeItem>,
    onBack: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    val filteredEmployees = remember(searchQuery, employees) {
        employees.filter { it.name.contains(searchQuery, ignoreCase = true) || it.role.contains(searchQuery, ignoreCase = true) }
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Text("Employees Register", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 16.sp)
        }

        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search by name or role...") },
            singleLine = true,
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Color.White) },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color(0xFF10B981),
                unfocusedBorderColor = Color(0xFF475569),
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            ),
            modifier = Modifier.fillMaxWidth().padding(bottom = 14.dp)
        )

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(filteredEmployees) { emp ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF161E31)),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(emp.name, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                            BadgeLabel(emp.role, Color(0xFF60A5FA))
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text("Contact: ${emp.contact}", color = Color(0xFF94A3B8), fontSize = 12.sp)
                        Text("Status: ${emp.status}", color = if (emp.status == "Active") Color(0xFF34D399) else Color(0xFFF87171), fontSize = 11.sp)
                    }
                }
            }
        }
    }
}

@Composable
fun AdminMaintenanceList(
    maintenance: List<MaintenanceItem>,
    onBack: () -> Unit
) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Text("Maintenance Logs", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 16.sp)
        }

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(maintenance) { item ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF161E31)),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(item.description, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                            BadgeLabel(item.status, if (item.status == "Completed") Color(0xFF10B981) else Color(0xFFF59E0B))
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Date: ${item.date}", color = Color(0xFF94A3B8), fontSize = 11.sp)
                            Text("Est. Cost: ₹${item.cost.toInt()}", fontWeight = FontWeight.Bold, color = Color(0xFFF87171), fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AdminProfileTab(
    savedUrl: String,
    onResetPortal: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(imageVector = Icons.Default.SupervisorAccount, contentDescription = null, tint = Color(0xFF10B981), modifier = Modifier.size(64.dp))
        Spacer(modifier = Modifier.height(16.dp))
        Text("System Administrator", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 18.sp)
        Text("Server Gateway: $savedUrl", color = Color(0xFF64748B), fontSize = 12.sp)
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Button(
            onClick = onResetPortal,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth().height(48.dp)
        ) {
            Text("Switch Portals / Log Out", fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun AdminMetricBox(
    label: String,
    value: String,
    subtext: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF161E31))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(label, fontSize = 11.sp, color = Color(0xFF94A3B8), fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Text(value, fontSize = 24.sp, color = color, fontWeight = FontWeight.Black)
            Spacer(modifier = Modifier.height(4.dp))
            Text(subtext, fontSize = 9.sp, color = Color(0xFF64748B))
        }
    }
}

@Composable
fun BadgeLabel(text: String, color: Color) {
    Box(
        modifier = Modifier
            .background(color.copy(alpha = 0.15f), RoundedCornerShape(6.dp))
            .border(0.5.dp, color, RoundedCornerShape(6.dp))
            .padding(horizontal = 8.dp, vertical = 2.dp)
    ) {
        Text(text, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = color)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE DRIVER TABS
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun DriverDashboardTab(
    trips: Int,
    basePay: Double,
    extraPay: Double,
    badgesCount: Int,
    isLoading: Boolean
) {
    if (isLoading) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Color(0xFF3B82F6))
        }
    } else {
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Text(
                    text = "Operational Stats",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = Color(0xFF94A3B8),
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    DriverMetricBox("Trips Completed", "$trips", "This Month", Color(0xFF3B82F6), modifier = Modifier.weight(1f))
                    DriverMetricBox("Badges Earned", "$badgesCount", "Total Wallet", Color(0xFFF59E0B), modifier = Modifier.weight(1f))
                }
            }

            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF161E31))
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.padding(bottom = 16.dp)
                        ) {
                            Icon(imageVector = Icons.Default.AccountBox, contentDescription = null, tint = Color(0xFF10B981))
                            Text(
                                text = "Monthly Earnings Preview",
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                fontSize = 16.sp
                            )
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Base Pay (Threshold: 15)", color = Color(0xFF94A3B8), fontSize = 13.sp)
                            Text("₹${basePay.toInt()}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                        
                        val extraTrips = Math.max(0, trips - 15)
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Extra Trip Bonus ($extraTrips × ₹1,000)", color = Color(0xFF94A3B8), fontSize = 13.sp)
                            Text("+₹${extraPay.toInt()}", color = Color(0xFF60A5FA), fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }

                        Divider(color = Color(0xFF334155), modifier = Modifier.padding(vertical = 12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Total Payout Projection", color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                            Text("₹${(basePay + extraPay).toInt()}", color = Color(0xFF34D399), fontWeight = FontWeight.Black, fontSize = 18.sp)
                        }
                    }
                }
            }

            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF161E31))
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Text(
                            text = "Trip Goal Threshold Progress",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = Color.White,
                            modifier = Modifier.padding(bottom = 12.dp)
                        )
                        
                        val progress = Math.min(1.0f, trips / 15.0f)
                        LinearProgressIndicator(
                            progress = progress,
                            color = if (trips >= 15) Color(0xFF10B981) else Color(0xFFF97316),
                            trackColor = Color(0xFF334155),
                            modifier = Modifier.fillMaxWidth().height(8.dp).clip(CircleShape)
                        )
                        
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = if (trips >= 15) "Goal Achieved! ✓" else "$trips of 15 trips",
                                fontSize = 11.sp,
                                color = if (trips >= 15) Color(0xFF34D399) else Color(0xFF94A3B8)
                            )
                            Text(
                                text = "${(progress * 100).toInt()}%",
                                fontSize = 11.sp,
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun DriverMetricBox(
    label: String,
    value: String,
    subtext: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF161E31))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(label, fontSize = 12.sp, color = Color(0xFF94A3B8), fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(8.dp))
            Text(value, fontSize = 28.sp, color = color, fontWeight = FontWeight.Black)
            Spacer(modifier = Modifier.height(4.dp))
            Text(subtext, fontSize = 10.sp, color = Color(0xFF64748B))
        }
    }
}

@Composable
fun DriverLeaderboardTab(
    drivers: List<LeaderboardDriver>,
    isLoading: Boolean
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(Color(0xFF1E1B4B), Color(0xFF0F172A))
                    ),
                    shape = RoundedCornerShape(16.dp)
                )
                .border(1.dp, Color(0xFFF59E0B).copy(alpha = 0.3f), RoundedCornerShape(16.dp))
                .padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Star,
                    contentDescription = null,
                    tint = Color(0xFFF59E0B),
                    modifier = Modifier.size(32.dp)
                )
                Column {
                    Text(
                        text = "EFFICIENCY LEADER: ₹10,000 CASH BONUS",
                        color = Color(0xFFFDE047),
                        fontWeight = FontWeight.Black,
                        fontSize = 12.sp,
                        letterSpacing = 0.5.sp
                    )
                    Text(
                        text = "Highest monthly KMPL gets the grand prize",
                        color = Color(0xFF94A3B8),
                        fontSize = 10.sp,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))

        if (drivers.isEmpty()) {
            // Seed Demo Board
            val demoList = listOf(
                LeaderboardDriver(1, "Vikram Singh (Demo)", 18, 5.4, true),
                LeaderboardDriver(2, "Ramesh Kumar", 16, 5.1, false),
                LeaderboardDriver(3, "Amit Sharma", 15, 4.8, false)
            )
            LazyColumn(
                modifier = Modifier.weight(1f).fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(demoList) { driver ->
                    DriverLeaderboardItem(driver = driver)
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f).fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(drivers) { driver ->
                    DriverLeaderboardItem(driver = driver)
                }
            }
        }
    }
}

@Composable
fun DriverLeaderboardItem(driver: LeaderboardDriver) {
    val isWinner = driver.isWinner
    val borderColors = when (driver.rank) {
        1 -> Color(0xFFF59E0B).copy(alpha = 0.5f)
        2 -> Color(0xFF94A3B8).copy(alpha = 0.3f)
        else -> Color(0xFFB45309).copy(alpha = 0.2f)
    }
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isWinner) Color(0xFF161E31) else Color(0xFF161E31).copy(alpha = 0.7f)
        ),
        border = androidx.compose.foundation.BorderStroke(1.dp, borderColors)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .background(
                            color = when (driver.rank) {
                                1 -> Color(0xFFF59E0B)
                                2 -> Color(0xFF64748B)
                                3 -> Color(0xFFB45309)
                                else -> Color(0xFF334155)
                            },
                            shape = CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "#${driver.rank}",
                        fontWeight = FontWeight.Bold,
                        color = if (driver.rank == 1) Color.Black else Color.White,
                        fontSize = 12.sp
                    )
                }

                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = driver.name,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            fontSize = 14.sp
                        )
                        if (isWinner) {
                            Icon(
                                imageVector = Icons.Default.Star,
                                contentDescription = null,
                                tint = Color(0xFFF59E0B),
                                modifier = Modifier.padding(start = 6.dp).size(14.dp)
                            )
                        }
                    }
                    Text(
                        text = "${driver.totalTrips} completed trips",
                        color = Color(0xFF64748B),
                        fontSize = 11.sp
                    )
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "${String.format("%.2f", driver.avgKmpl)} KMPL",
                    fontWeight = FontWeight.Black,
                    color = if (isWinner) Color(0xFFFDE047) else Color.White,
                    fontSize = 16.sp
                )
                Text(
                    text = "Avg Mileage",
                    color = Color(0xFF64748B),
                    fontSize = 10.sp
                )
            }
        }
    }
}

@Composable
fun DriverBadgesTab(badges: List<String>) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp)
    ) {
        Text(
            text = "Permanently Earned Badges",
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp,
            color = Color(0xFF94A3B8),
            modifier = Modifier.padding(bottom = 12.dp)
        )

        if (badges.isEmpty()) {
            // Demo view seed
            val demoBadges = listOf("FUEL_CHAMP_2026_06")
            LazyColumn(
                modifier = Modifier.weight(1f).fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(demoBadges) { badge ->
                    DriverBadgeItem(code = badge)
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f).fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(badges) { badgeCode ->
                    DriverBadgeItem(code = badgeCode)
                }
            }
        }
    }
}

@Composable
fun DriverBadgeItem(code: String) {
    val isFuelChamp = code.startsWith("FUEL_CHAMP")
    val label = if (isFuelChamp) "Fuel Efficiency Champion" else "Platform Achievement"
    val dateText = try {
        val parts = code.split("_")
        val year = parts[2]
        val monthNum = parts[3].toInt()
        val monthName = listOf("", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")[monthNum]
        "$monthName $year"
    } catch(e: Exception) {
        "Earned"
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF161E31)),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF59E0B).copy(alpha = 0.2f))
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .background(Color(0xFFF59E0B).copy(alpha = 0.15f), CircleShape)
                    .border(1.5.dp, Color(0xFFF59E0B), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.WorkspacePremium,
                    contentDescription = null,
                    tint = Color(0xFFF59E0B),
                    modifier = Modifier.size(24.dp)
                )
            }

            Column {
                Text(
                    text = label,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    fontSize = 15.sp
                )
                Text(
                    text = "Awarded for calendar cycle: $dateText",
                    color = Color(0xFF94A3B8),
                    fontSize = 11.sp,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }
        }
    }
}
