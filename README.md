# AI Powered Code Reviewer - Project Documentation

## Project Overview
This project is a code analysis tool designed for students and developers. It provides a mobile-first experience for reviewing code snippets using AI and AST parsing.

## Key Features
- **Auto Language Detection**: Automatically identifies the programming language of the pasted code (Python, Java, C++, JavaScript).
- **Deep AST Analysis**: Uses Python's `ast` module for rigorous structural analysis of Python code.
- **AI-Powered Feedback**: Leverages Gemini 3.1 Pro for senior-level architectural reviews and complexity estimation.
- **Mobile-First Design**: A polished, responsive UI built with Jetpack Compose (Android) and React (Web).

## Folder Structure
- `/backend`: Python FastAPI backend source code.
- `/src`: Web-based simulation of the Android app (for demonstration).
- `server.ts`: Express server that proxies requests to Gemini AI.

## Setup Instructions

### 1. Backend (Python FastAPI)
1. Navigate to the `backend` folder.
2. Install dependencies:
   ```bash
   pip install fastapi uvicorn pydantic
   ```
3. Run the server:
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:3000`.


### 3. Web Preview (Live Demo)
1. This environment runs a web-based version of the app.
2. It uses the Gemini API to provide high-quality "Senior Developer" feedback.
3. You can interact with it directly in the preview window.

## Example Input/Output

### Input (Python)
```python
def find_sum(n):
    total = 0
    for i in range(n):
        for j in range(n):
            total += i + j
    return total
```

### Output
- **Score**: 6/10
- **Complexity**: O(n^2)
- **Issues**: Nested loops detected on line 4.
- **Suggestions**: Consider if the logic can be simplified to O(n) or O(1) using mathematical formulas.
