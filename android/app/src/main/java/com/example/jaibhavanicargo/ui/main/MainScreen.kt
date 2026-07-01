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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.WorkspacePremium
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.SupervisorAccount
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
// HTTP Request Helper
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

// Data models for Compose
data class LeaderboardDriver(
    val rank: Int,
    val name: String,
    val totalTrips: Int,
    val avgKmpl: Double,
    val isWinner: Boolean
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
    
    // Server & Connection State
    var savedUrl by remember { mutableStateOf(sharedPref.getString("website_url", "") ?: "") }
    var inputUrl by remember { mutableStateOf(savedUrl.ifEmpty { "https://jaibhavanicargo.onrender.com" }) }
    var isEditingUrl by remember { mutableStateOf(savedUrl.isEmpty()) }
    
    // Active Portal Workspace Mode: "UNSELECTED", "DRIVER", "STAFF"
    var portalType by remember { mutableStateOf(sharedPref.getString("portal_type", "UNSELECTED") ?: "UNSELECTED") }
    
    // Auth State (Drivers only)
    var loggedInDriverName by remember { mutableStateOf(sharedPref.getString("driver_name", "") ?: "") }
    var loggedInDriverPhone by remember { mutableStateOf(sharedPref.getString("driver_phone", "") ?: "") }
    var loggedInDriverId by remember { mutableStateOf(sharedPref.getString("driver_id", "") ?: "") }
    var assignedTruckId by remember { mutableStateOf(sharedPref.getString("assigned_truck", "") ?: "") }
    
    // Navigation State for Native UI
    var selectedTab by remember { mutableStateOf(0) }
    
    // Form Inputs
    var loginNameInput by remember { mutableStateOf("") }
    var loginPhoneInput by remember { mutableStateOf("") }
    var isLoginLoading by remember { mutableStateOf(false) }

    // Dashboard Data States
    var completedTripsCount by remember { mutableStateOf(0) }
    var basePayAmount by remember { mutableStateOf(0.0) }
    var extraTripsPayAmount by remember { mutableStateOf(0.0) }
    var driverBadgesList by remember { mutableStateOf<List<String>>(emptyList()) }
    var isDashboardLoading by remember { mutableStateOf(false) }
    
    // Leaderboard Data States
    var leaderboardList by remember { mutableStateOf<List<LeaderboardDriver>>(emptyList()) }
    var isLeaderboardLoading by remember { mutableStateOf(false) }
    
    // Auto-refresh triggers
    var refreshTrigger by remember { mutableStateOf(0) }

    // Settings State
    var showLogoutConfirm by remember { mutableStateOf(false) }

    // ── Fetch Dashboard Stats ──
    LaunchedEffect(loggedInDriverName, refreshTrigger, isEditingUrl) {
        if (loggedInDriverName.isNotEmpty() && savedUrl.isNotEmpty() && portalType == "DRIVER") {
            isDashboardLoading = true
            try {
                // 1. Fetch employee record to get latest badges and details
                val escapedName = URLEncoder.encode(loggedInDriverName, "UTF-8")
                val employeeUrl = "$savedUrl/hcgi/platform/api/collections/employees/records?filter=(name='$escapedName')"
                val empResponse = fetchUrlContent(employeeUrl)
                val empJson = JSONObject(empResponse)
                val items = empJson.optJSONArray("items")
                if (items != null && items.length() > 0) {
                    val record = items.getJSONObject(0)
                    val badgesStr = record.optString("badges", "[]")
                    val badgesArray = try { JSONArray(badgesStr) } catch(e: Exception) { JSONArray() }
                    val badges = mutableListOf<String>()
                    for (i in 0 until badgesArray.length()) {
                        badges.add(badgesArray.getString(i))
                    }
                    driverBadgesList = badges
                    assignedTruckId = record.optString("assigned_truck", "")
                    
                    // Save latest stats locally
                    sharedPref.edit()
                        .putString("assigned_truck", assignedTruckId)
                        .putString("badges_cached", badgesStr)
                        .apply()
                }

                // 2. Fetch completed trips matching the current calendar month
                val calendar = Calendar.getInstance()
                val currentYear = calendar.get(Calendar.YEAR)
                val currentMonth = calendar.get(Calendar.MONTH) + 1
                val monthPrefix = String.format("%04d-%02d", currentYear, currentMonth)
                
                val tripsUrl = "$savedUrl/hcgi/platform/api/collections/trip_logs/records?filter=(driver_name='$escapedName')"
                val tripsResponse = fetchUrlContent(tripsUrl)
                val tripsJson = JSONObject(tripsResponse)
                val tripItems = tripsJson.optJSONArray("items")
                
                var tripsCount = 0
                if (tripItems != null) {
                    for (i in 0 until tripItems.length()) {
                        val trip = tripItems.getJSONObject(i)
                        val tripDate = trip.optString("date", "")
                        val tripStatus = trip.optString("trip_status", "").lowercase()
                        val isCompleted = tripStatus.isEmpty() || tripStatus == "completed"
                        
                        if (tripDate.startsWith(monthPrefix) && isCompleted) {
                            tripsCount++
                        }
                    }
                }
                
                completedTripsCount = tripsCount
                basePayAmount = if (tripsCount >= 15) 35000.0 else 0.0
                extraTripsPayAmount = if (tripsCount > 15) (tripsCount - 15) * 1000.0 else 0.0

            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                isDashboardLoading = false
            }
        }
    }

    // ── Fetch Leaderboard Standings ──
    LaunchedEffect(selectedTab, refreshTrigger, isEditingUrl) {
        if (selectedTab == 1 && savedUrl.isNotEmpty() && portalType == "DRIVER") {
            isLeaderboardLoading = true
            try {
                val calendar = Calendar.getInstance()
                val currentMonth = calendar.get(Calendar.MONTH) + 1
                val currentYear = calendar.get(Calendar.YEAR)
                
                val leaderboardUrl = "$savedUrl/leaderboard?month=$currentMonth&year=$currentYear"
                val response = fetchUrlContent(leaderboardUrl)
                val json = JSONObject(response)
                val top3Array = json.optJSONArray("top3")
                
                val drivers = mutableListOf<LeaderboardDriver>()
                if (top3Array != null) {
                    for (i in 0 until top3Array.length()) {
                        val obj = top3Array.getJSONObject(i)
                        drivers.add(
                            LeaderboardDriver(
                                rank = obj.optInt("rank", i + 1),
                                name = obj.optString("driver_name", "Unknown"),
                                totalTrips = obj.optInt("total_trips", 0),
                                avgKmpl = obj.optDouble("avg_kmpl", 0.0),
                                isWinner = obj.optBoolean("is_winner", i == 0)
                            )
                        )
                    }
                }
                leaderboardList = drivers
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                isLeaderboardLoading = false
            }
        }
    }

    // ── Layout Controller ──
    if (isEditingUrl) {
        // Step 1: Server Config
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF0F172A))
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Card(
                modifier = Modifier.fillMaxWidth().wrapContentHeight(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
            ) {
                Column(
                    modifier = Modifier.padding(28.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Settings,
                        contentDescription = null,
                        tint = Color(0xFFF97316),
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
                            focusedBorderColor = Color(0xFFF97316),
                            unfocusedBorderColor = Color(0xFF475569),
                            focusedLabelColor = Color(0xFFF97316),
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
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF97316)),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.fillMaxWidth().height(50.dp)
                    ) {
                        Text("Save & Connect", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    } else if (portalType == "UNSELECTED") {
        // Step 2: Welcome Workspace Selector Screen
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF0F172A))
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

                // Option A: Driver Workspace Card
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp)
                        .clickable {
                            portalType = "DRIVER"
                            sharedPref.edit().putString("portal_type", "DRIVER").apply()
                        },
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
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
                                imageVector = Icons.Filled.LocalShipping,
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

                // Option B: Staff / Admin Workspace Card
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            portalType = "STAFF"
                            sharedPref.edit().putString("portal_type", "STAFF").apply()
                        },
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF97316).copy(alpha = 0.3f))
                ) {
                    Row(
                        modifier = Modifier.padding(24.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .background(Color(0xFFF97316).copy(alpha = 0.15f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Filled.SupervisorAccount,
                                contentDescription = null,
                                tint = Color(0xFFFDBA74)
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
        // Step 3: Driver Authentication Screen
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF0F172A))
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Card(
                modifier = Modifier.fillMaxWidth().wrapContentHeight(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
            ) {
                Column(
                    modifier = Modifier.padding(28.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Back to Selector
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
                        text = "Driver Workspace Portal",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White
                    )
                    Text(
                        text = "Enter credentials matching your employee log",
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
                        label = { Text("Registered Contact Number") },
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
                                        
                                        val checkUrl = "$savedUrl/hcgi/platform/api/collections/employees/records?filter=(name='$escapedName'%26%26contact='$escapedPhone')"
                                        val result = fetchUrlContent(checkUrl)
                                        val jsonObj = JSONObject(result)
                                        val itemsArray = jsonObj.optJSONArray("items")
                                        
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
                                            Toast.makeText(context, "Driver account not found. Verify credentials.", Toast.LENGTH_LONG).show()
                                        }
                                    } catch (e: Exception) {
                                        Toast.makeText(context, "Network connection failed.", Toast.LENGTH_SHORT).show()
                                        e.printStackTrace()
                                    } finally {
                                        isLoginLoading = false
                                    }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6)),
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier.fillMaxWidth().height(50.dp)
                        ) {
                            Text("Sign In to Portal", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    } else if (portalType == "STAFF") {
        // Staff/Admin Portal: Full Web App shell inside WebView
        Box(modifier = Modifier.fillMaxSize()) {
            AndroidView(
                factory = { ctx ->
                    WebView(ctx).apply {
                        settings.apply {
                            javaScriptEnabled = true
                            domStorageEnabled = true
                            loadWithOverviewMode = true
                            useWideViewPort = true
                            builtInZoomControls = false
                            displayZoomControls = false
                            cacheMode = WebSettings.LOAD_DEFAULT
                        }
                        webViewClient = WebViewClient()
                        loadUrl(savedUrl)
                    }
                },
                modifier = Modifier.fillMaxSize()
            )

            // Portal reset Floating button to switch views
            FloatingActionButton(
                onClick = {
                    portalType = "UNSELECTED"
                    sharedPref.edit().putString("portal_type", "UNSELECTED").apply()
                },
                containerColor = Color(0xFF1E293B),
                contentColor = Color.White,
                modifier = Modifier.align(Alignment.BottomEnd).padding(20.dp)
            ) {
                Icon(imageVector = Icons.Default.Home, contentDescription = "Portal Menu")
            }
        }
    } else {
        // Native Driver Dashboard Layout
        Scaffold(
            bottomBar = {
                NavigationBar(
                    containerColor = Color(0xFF1E293B),
                    tonalElevation = 8.dp
                ) {
                    val tabs = listOf(
                        Triple("Dashboard", Icons.Default.Home, 0),
                        Triple("Leaderboard", Icons.Default.Star, 1),
                        Triple("My Badges", Icons.Filled.WorkspacePremium, 2)
                    )
                    
                    tabs.forEach { (label, icon, index) ->
                        NavigationBarItem(
                            selected = selectedTab == index,
                            onClick = { selectedTab = index },
                            icon = { Icon(imageVector = icon, contentDescription = label) },
                            label = { Text(label, fontSize = 11.sp) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Color(0xFFF97316),
                                selectedTextColor = Color(0xFFF97316),
                                unselectedIconColor = Color(0xFF94A3B8),
                                unselectedTextColor = Color(0xFF94A3B8),
                                indicatorColor = Color(0xFF0F172A)
                            )
                        )
                    }
                }
            },
            containerColor = Color(0xFF0F172A)
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
                        .background(Color(0xFF1E293B))
                        .padding(horizontal = 20.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Jai Bhavani Cargo",
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 18.sp,
                            color = Color(0xFFF97316)
                        )
                        Text(
                            text = "Active: $loggedInDriverName",
                            fontSize = 11.sp,
                            color = Color(0xFF94A3B8)
                        )
                    }
                    
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        IconButton(
                            onClick = { refreshTrigger++ },
                            modifier = Modifier.background(Color(0xFF0F172A), CircleShape).size(36.dp)
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
                    when (selectedTab) {
                        0 -> DashboardTab(
                            trips = completedTripsCount,
                            basePay = basePayAmount,
                            extraPay = extraTripsPayAmount,
                            badgesCount = driverBadgesList.size,
                            isLoading = isDashboardLoading
                        )
                        1 -> LeaderboardTab(
                            drivers = leaderboardList,
                            isLoading = isLeaderboardLoading
                        )
                        2 -> BadgesTab(
                            badges = driverBadgesList
                        )
                    }
                }
            }
        }
    }

    // ── Dialogs ──
    if (showLogoutConfirm) {
        AlertDialog(
            onDismissRequest = { showLogoutConfirm = false },
            title = { Text("Sign Out?") },
            text = { Text("Are you sure you want to log out of the Driver Workspace Portal?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        sharedPref.edit()
                            .putString("driver_name", "")
                            .putString("driver_phone", "")
                            .putString("driver_id", "")
                            .putString("assigned_truck", "")
                            .putString("badges_cached", "[]")
                            .putString("portal_type", "UNSELECTED")
                            .apply()
                        loggedInDriverName = ""
                        loggedInDriverPhone = ""
                        loggedInDriverId = ""
                        assignedTruckId = ""
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
// UI TAB 1: Driver Dashboard
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun DashboardTab(
    trips: Int,
    basePay: Double,
    extraPay: Double,
    badgesCount: Int,
    isLoading: Boolean
) {
    if (isLoading) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Color(0xFFF97316))
        }
    } else {
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Metrics Summary Grid
            item {
                Text(
                    text = "Operational Metrics",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = Color(0xFF94A3B8),
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    MetricBox(
                        label = "Trips Finished",
                        value = "$trips",
                        subtext = "This month",
                        color = Color(0xFF3B82F6),
                        modifier = Modifier.weight(1f)
                    )
                    MetricBox(
                        label = "Badges Earned",
                        value = "$badgesCount",
                        subtext = "Total wallet",
                        color = Color(0xFFF59E0B),
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Financial Payout Estimation
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
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
                                fontSize = 16.sp,
                                color = Color.White
                            )
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth().padding(vertical = 10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Base Pay (Threshold: 15)", color = Color(0xFF94A3B8), fontSize = 13.sp)
                            Text("₹${basePay.toInt()}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                        
                        val extraTrips = Math.max(0, trips - 15)
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(vertical = 10.dp),
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
                            Text("Total payout estimate", color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                            Text("₹${(basePay + extraPay).toInt()}", color = Color(0xFF34D399), fontWeight = FontWeight.Black, fontSize = 18.sp)
                        }
                    }
                }
            }

            // Target Progress Indicator
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
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
fun MetricBox(
    label: String,
    value: String,
    subtext: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(label, fontSize = 12.sp, color = Color(0xFF94A3B8), fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(8.dp))
            Text(value, fontSize = 28.sp, color = color, fontWeight = FontWeight.Black)
            Spacer(modifier = Modifier.height(4.dp))
            Text(subtext, fontSize = 10.sp, color = Color(0xFF475569))
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// UI TAB 2: Fuel Leaderboard
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun LeaderboardTab(
    drivers: List<LeaderboardDriver>,
    isLoading: Boolean
) {
    if (isLoading) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Color(0xFFF97316))
        }
    } else {
        Column(
            modifier = Modifier.fillMaxSize().padding(16.dp)
        ) {
            // Cash incentive highlight banner
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        brush = Brush.horizontalGradient(
                            colors = listOf(Color(0xFF312E81), Color(0xFF1E1B4B))
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
                        imageVector = Icons.Filled.EmojiEvents,
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
                Box(
                    modifier = Modifier.weight(1f).fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No qualifying drivers on the board yet.\n(Minimum 15 trips required)",
                        color = Color(0xFF64748B),
                        fontSize = 13.sp,
                        textAlign = TextAlign.Center,
                        lineHeight = 18.sp
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.weight(1f).fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(drivers) { driver ->
                        LeaderboardItem(driver = driver)
                    }
                }
            }
        }
    }
}

@Composable
fun LeaderboardItem(driver: LeaderboardDriver) {
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
            containerColor = if (isWinner) Color(0xFF1E293B) else Color(0xFF1E293B).copy(alpha = 0.7f)
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
                // Rank Circle
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

                // Driver details
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
                                imageVector = Icons.Filled.EmojiEvents,
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

            // Mileage tracker
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "${String.format("%.2f", driver.avgKmpl)} KMPL",
                    fontWeight = FontWeight.Black,
                    color = if (isWinner) Color(0xFFFDE047) else Color.White,
                    fontSize = 16.sp
                )
                Text(
                    text = "Fuel Economy",
                    color = Color(0xFF64748B),
                    fontSize = 10.sp
                )
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// UI TAB 3: Badges Wallet / Locker
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun BadgesTab(badges: List<String>) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp)
    ) {
        Text(
            text = "Permanently Earned Achievements",
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp,
            color = Color(0xFF94A3B8),
            modifier = Modifier.padding(bottom = 12.dp)
        )

        if (badges.isEmpty()) {
            Box(
                modifier = Modifier.weight(1f).fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Filled.WorkspacePremium,
                        contentDescription = null,
                        tint = Color(0xFF334155),
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "No achievement badges in your wallet yet.",
                        color = Color(0xFF64748B),
                        fontSize = 13.sp
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f).fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(badges) { badgeCode ->
                    BadgeItem(code = badgeCode)
                }
            }
        }
    }
}

@Composable
fun BadgeItem(code: String) {
    val isFuelChamp = code.startsWith("FUEL_CHAMP")
    val label = if (isFuelChamp) "Fuel Economy Champion" else "Platform Achievement"
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
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF59E0B).copy(alpha = 0.2f))
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Gold badge circle
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .background(Color(0xFFF59E0B).copy(alpha = 0.15f), CircleShape)
                    .border(1.5.dp, Color(0xFFF59E0B), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Filled.WorkspacePremium,
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
