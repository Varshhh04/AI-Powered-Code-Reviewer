package com.example.codereviewer.api

import retrofit2.http.Body
import retrofit2.http.POST

data class AnalyzeRequest(
    val code: String,
    val language: String
)

data class Issue(
    val type: String,
    val description: String,
    val line: Int,
    val severity: String
)

data class AnalyzeResponse(
    val detectedIssues: List<Issue>,
    val timeComplexity: String,
    val optimizationSuggestions: List<string>,
    val codeQualityScore: Int,
    val seniorFeedback: String
)

interface CodeReviewApi {
    @POST("analyze")
    suspend fun analyzeCode(@Body request: AnalyzeRequest): AnalyzeResponse
}
