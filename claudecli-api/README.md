# Claude CLI API

A minimal FastAPI wrapper around `claude --print`.

## Setup

```bash
cd claudecli-api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --port 8100
```

## Usage

```bash
# Simple message
curl -X POST http://localhost:8100/message \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 2+2?"}'

# With system prompt
curl -X POST http://localhost:8100/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "system_prompt": "You are a pirate."}'

# Resume a session
curl -X POST http://localhost:8100/message \
  -H "Content-Type: application/json" \
  -d '{"message": "What did I just ask?", "session_id": "<session_id from previous response>"}'
```
