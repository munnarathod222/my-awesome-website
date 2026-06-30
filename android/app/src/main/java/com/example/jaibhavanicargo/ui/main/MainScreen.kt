package com.example.jaibhavanicargo.ui.main

import android.content.Context
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation3.runtime.NavKey

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    onItemClick: (NavKey) -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val sharedPref = remember { context.getSharedPreferences("JBC_PREFS", Context.MODE_PRIVATE) }
    
    var savedUrl by remember { mutableStateOf(sharedPref.getString("website_url", "") ?: "") }
    var inputUrl by remember { mutableStateOf(savedUrl.ifEmpty { "https://jaibhavanicargo.onrender.com" }) }
    var isEditingUrl by remember { mutableStateOf(savedUrl.isEmpty()) }
    
    var showResetConfirm by remember { mutableStateOf(false) }

    if (isEditingUrl) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF111827))
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .wrapContentHeight(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1F2937))
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Jai Bhavani Cargo",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color(0xFFF97316)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Connect Mobile App to Server",
                        fontSize = 14.sp,
                        color = Color(0xFF9CA3AF)
                    )
                    Spacer(modifier = Modifier.height(24.dp))

                    OutlinedTextField(
                        value = inputUrl,
                        onValueChange = { inputUrl = it },
                        label = { Text("Server Website URL") },
                        placeholder = { Text("https://example.com") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFFF97316),
                            unfocusedBorderColor = Color(0xFF4B5563),
                            focusedLabelColor = Color(0xFFF97316),
                            unfocusedLabelColor = Color(0xFF9CA3AF),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(24.dp))

                    Button(
                        onClick = {
                            var formattedUrl = inputUrl.trim()
                            if (formattedUrl.isNotEmpty()) {
                                if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
                                    formattedUrl = "https://$formattedUrl"
                                }
                                sharedPref.edit().putString("website_url", formattedUrl).apply()
                                savedUrl = formattedUrl
                                isEditingUrl = false
                                Toast.makeText(context, "Connected successfully!", Toast.LENGTH_SHORT).show()
                            } else {
                                Toast.makeText(context, "Please enter a valid URL", Toast.LENGTH_SHORT).show()
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF97316)),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                    ) {
                        Text("Connect Dashboard", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color.White)
                    }
                }
            }
        }
    } else {
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

            Button(
                onClick = { showResetConfirm = true },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0x991F2937)),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(16.dp)
            ) {
                Text("Settings", color = Color.White, fontSize = 12.sp)
            }
        }
    }

    if (showResetConfirm) {
        AlertDialog(
            onDismissRequest = { showResetConfirm = false },
            title = { Text("Change Connection URL?") },
            text = { Text("Do you want to disconnect from the current server and connect to a different URL (like your custom domain)?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        sharedPref.edit().putString("website_url", "").apply()
                        savedUrl = ""
                        isEditingUrl = true
                        showResetConfirm = false
                    }
                ) {
                    Text("Yes, Disconnect", color = MaterialTheme.colorScheme.error)
                }
            },
            dismissButton = {
                TextButton(onClick = { showResetConfirm = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
