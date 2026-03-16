import re
import ast
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

class CodeReviewRequest(BaseModel):
    code: str
    language: str

class Issue(BaseModel):
    type: str
    description: str
    line: int
    severity: str

class ReviewResponse(BaseModel):
    detectedIssues: List[Issue]
    timeComplexity: str
    optimizationSuggestions: List[str]
    codeQualityScore: int
    seniorFeedback: str
    detectedLanguage: str

class CodeAnalyzer(ast.NodeVisitor):
    def __init__(self):
        self.issues = []
        self.loop_depth = 0
        self.max_loop_depth = 0

    def visit_For(self, node):
        self.loop_depth += 1
        self.max_loop_depth = max(self.max_loop_depth, self.loop_depth)
        if self.loop_depth > 2:
            self.issues.append(Issue(
                type="performance",
                description="Deeply nested loops detected. Consider optimizing or using a different data structure.",
                line=node.lineno,
                severity="medium"
            ))
        self.generic_visit(node)
        self.loop_depth -= 1

    def visit_While(self, node):
        self.loop_depth += 1
        self.max_loop_depth = max(self.max_loop_depth, self.loop_depth)
        self.generic_visit(node)
        self.loop_depth -= 1

    def visit_Call(self, node):
        # Check for risky functions
        if isinstance(node.func, ast.Name):
            if node.func.id == 'eval':
                self.issues.append(Issue(
                    type="security",
                    description="Use of 'eval()' is highly discouraged due to security risks.",
                    line=node.lineno,
                    severity="high"
                ))
        self.generic_visit(node)

def detect_language(code: str) -> str:
    code = code.strip()
    if not code:
        return "unknown"
    
    # Python patterns
    if re.search(r'^\s*(def|class|import|from)\b', code, re.MULTILINE) or \
       re.search(r'if __name__ == ["\']__main__["\']:', code) or \
       re.search(r'#.*coding[:=]\s*utf-8', code):
        return "python"
    
    # Java patterns
    if re.search(r'\b(public|private|protected)\s+(class|interface|enum)\s+\w+', code) or \
       re.search(r'System\.out\.print(ln)?\(', code) or \
       re.search(r'public\s+static\s+void\s+main\s*\(String', code) or \
       re.search(r'@Override', code):
        return "java"
    
    # C++ patterns
    if re.search(r'#include\s*[<"](iostream|vector|string|map|set|algorithm|cstdio)[>"]', code) or \
       re.search(r'\bstd::\w+', code) or \
       re.search(r'\bcout\s*<<', code) or \
       re.search(r'int\s+main\s*\(\s*(int\s+argc|void)?\s*\)', code):
        return "cpp"
    
    # JavaScript patterns
    if re.search(r'\b(const|let|var)\s+\w+\s*=', code) or \
       re.search(r'\bfunction\s+\w*\s*\(', code) or \
       re.search(r'console\.log\(', code) or \
       re.search(r'=>\s*{', code) or \
       re.search(r'export\s+(default\s+)?(class|function|const|let|var)', code):
        return "javascript"
    
    # Default to python for AST parsing if it looks like python
    try:
        ast.parse(code)
        return "python"
    except:
        pass
        
    return "unknown"

@app.post("/analyze", response_model=ReviewResponse)
async def analyze_code(request: CodeReviewRequest):
    lang = request.language.lower()
    if lang == "auto":
        lang = detect_language(request.code)
    
    if lang != "python":
        # For non-python, we simulate or return a generic response
        return ReviewResponse(
            detectedIssues=[Issue(type="info", description=f"AST parsing currently only supported for Python. Detected: {lang}", line=1, severity="low")],
            timeComplexity="O(?)",
            optimizationSuggestions=["Ensure proper memory management."],
            codeQualityScore=7,
            seniorFeedback=f"Code looks like {lang}. Deep AST analysis is limited to Python in this backend demo.",
            detectedLanguage=lang
        )

    try:
        tree = ast.parse(request.code)
        analyzer = CodeAnalyzer()
        analyzer.visit(tree)

        # Basic Complexity Estimation
        complexity = "O(1)"
        if analyzer.max_loop_depth == 1:
            complexity = "O(n)"
        elif analyzer.max_loop_depth == 2:
            complexity = "O(n^2)"
        elif analyzer.max_loop_depth > 2:
            complexity = f"O(n^{analyzer.max_loop_depth})"

        # Scoring logic
        score = 10 - len(analyzer.issues)
        score = max(1, min(10, score))

        suggestions = []
        if analyzer.max_loop_depth > 1:
            suggestions.append("Try to reduce nested loops to improve performance.")
        if not analyzer.issues:
            suggestions.append("Code follows basic best practices.")

        return ReviewResponse(
            detectedIssues=analyzer.issues,
            timeComplexity=complexity,
            optimizationSuggestions=suggestions,
            codeQualityScore=score,
            seniorFeedback="Automated AST analysis completed. Review the detected patterns.",
            detectedLanguage=lang
        )

    except SyntaxError as e:
        raise HTTPException(status_code=400, detail=f"Syntax error in code: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
