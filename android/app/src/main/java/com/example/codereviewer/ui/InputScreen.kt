package com.example.codereviewer.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

@Composable
fun InputScreen(navController: NavController, onAnalyze: (String, String) -> Unit) {
    var code by remember { mutableStateOf("") }
    var language by remember { mutableStateOf("python") }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Select Language", style = MaterialTheme.typography.titleMedium)
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("python", "java", "cpp").forEach { lang ->
                FilterChip(
                    selected = language == lang,
                    onClick = { language = lang },
                    label = { Text(lang.uppercase()) }
                )
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        OutlinedTextField(
            value = code,
            onValueChange = { code = it },
            modifier = Modifier.fillMaxWidth().weight(1f),
            label = { Text("Paste Code Here") },
            placeholder = { Text("Enter your code snippet...") }
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Button(
            onClick = { onAnalyze(code, language) },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            enabled = code.isNotBlank()
        ) {
            Text("Analyze Code")
        }
    }
}
