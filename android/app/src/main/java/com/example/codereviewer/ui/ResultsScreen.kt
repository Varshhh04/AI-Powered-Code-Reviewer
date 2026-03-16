package com.example.codereviewer.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.codereviewer.api.AnalyzeResponse

@Composable
fun ResultsScreen(result: AnalyzeResponse) {
    LazyColumn(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        item {
            Card(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Quality Score: ${result.codeQualityScore}/10", style = MaterialTheme.typography.headlineSmall)
                    Text("Complexity: ${result.timeComplexity}", style = MaterialTheme.typography.bodyLarge)
                }
            }
        }
        
        item {
            Text("Detected Issues", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(vertical = 8.dp))
        }
        
        items(result.detectedIssues) { issue ->
            Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text("${issue.type.uppercase()} - Line ${issue.line}", style = MaterialTheme.typography.labelSmall)
                    Text(issue.description, style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
        
        item {
            Text("Suggestions", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(vertical = 8.dp))
        }
        
        items(result.optimizationSuggestions) { suggestion ->
            Text("• $suggestion", modifier = Modifier.padding(vertical = 4.dp))
        }
    }
}
