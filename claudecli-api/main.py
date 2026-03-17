import asyncio
import base64
import json
import os
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Claude CLI API")


CLAUDE_BIN = os.environ.get("CLAUDE_BIN", "claude")

BLOCKED_ENV_VARS = [
    "CLAUDECODE",
    "CLAUDE_CODE_ENTRYPOINT",
    "CLAUDE_CODE_ENABLE_SDK_FILE_CHECKPOINTING",
]


class Attachment(BaseModel):
    name: str
    file_path: str
    mime_type: str


class MessageRequest(BaseModel):
    message: str
    system_prompt: Optional[str] = None
    session_id: Optional[str] = None
    attachments: Optional[list[Attachment]] = None


class ConverseMessage(BaseModel):
    role: str
    content: str


class ConverseRequest(BaseModel):
    system: str
    messages: list[ConverseMessage]
    session_id: Optional[str] = None
    attachments: Optional[list[Attachment]] = None


class MessageResponse(BaseModel):
    result: str
    session_id: str


def _clean_env() -> dict[str, str]:
    return {k: v for k, v in os.environ.items() if k not in BLOCKED_ENV_VARS}


def validate_attachments(attachments: list[Attachment]) -> None:
    for att in attachments:
        if not os.path.isfile(att.file_path):
            raise HTTPException(status_code=400, detail=f"Attachment file not found: {att.file_path}")


def build_image_block(att: Attachment) -> str:
    with open(att.file_path, "rb") as f:
        data = f.read()
    b64 = base64.b64encode(data).decode("ascii")
    size_kb = len(data) / 1024
    print(f"  [attach] {att.name} ({att.mime_type}, {size_kb:.1f}KB) → base64 inline ({len(b64)} chars)")
    return f"[Image: {att.name}]\ndata:{att.mime_type};base64,{b64}"


def append_attachment_refs(prompt: str, attachments: list[Attachment]) -> str:
    blocks = "\n\n".join(build_image_block(att) for att in attachments)
    return f"{prompt}\n\nThe user has attached the following images. Analyze them as part of your response.\n\n{blocks}"


async def run_claude(args: list[str]) -> dict:
    cmd_display = [CLAUDE_BIN] + [
        f"{a[:80]}...({len(a)} chars)" if len(a) > 200 else a
        for a in args
    ]
    print(f"  [claude] cmd: {' '.join(cmd_display)}")

    proc = await asyncio.create_subprocess_exec(
        CLAUDE_BIN,
        *args,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        env=_clean_env(),
    )
    stdout, stderr = await proc.communicate()

    print(f"  [claude] exit={proc.returncode} stdout={len(stdout)}B stderr={len(stderr)}B")

    if proc.returncode != 0:
        err = stderr.decode()
        print(f"  [claude] ERROR: {err[:500]}")
        if "rate limit" in (err + stdout.decode()).lower():
            raise HTTPException(status_code=429, detail="Rate limited by Claude CLI")
        raise HTTPException(status_code=502, detail=f"Claude CLI error: {err}")

    try:
        envelope = json.loads(stdout.decode())
    except json.JSONDecodeError as e:
        print(f"  [claude] JSON error: {e}")
        print(f"  [claude] raw: {stdout.decode()[:500]}")
        raise HTTPException(status_code=502, detail=f"Invalid JSON from CLI: {e}")

    print(f"  [claude] result={len(envelope['result'])} chars session={envelope['session_id']}")
    return {"result": envelope["result"], "session_id": envelope["session_id"]}


@app.post("/message", response_model=MessageResponse)
async def send_message(req: MessageRequest):
    print(f"\n[message] len={len(req.message)} system={'yes' if req.system_prompt else 'no'} session={req.session_id} attachments={len(req.attachments) if req.attachments else 0}")

    args = ["--print", "--output-format", "json"]

    if req.session_id:
        args.extend(["--resume", req.session_id])
    elif req.system_prompt:
        args.extend(["--system-prompt", req.system_prompt])

    prompt = req.message
    if req.attachments:
        validate_attachments(req.attachments)
        prompt = append_attachment_refs(prompt, req.attachments)

    args.append(prompt)
    print(f"  [message] prompt length: {len(prompt)} chars")
    return await run_claude(args)


@app.post("/converse", response_model=MessageResponse)
async def converse(req: ConverseRequest):
    print(f"\n[converse] msgs={len(req.messages)} attachments={len(req.attachments) if req.attachments else 0} session={req.session_id}")

    if req.attachments:
        validate_attachments(req.attachments)

    args = ["--print", "--output-format", "json"]

    if req.session_id:
        last_msg = req.messages[-1]
        prompt = last_msg.content
        if req.attachments:
            prompt = append_attachment_refs(prompt, req.attachments)
        args.extend(["--resume", req.session_id, prompt])
    else:
        args.extend(["--system-prompt", req.system])
        turns = "\n\n".join(
            f"[{'User' if m.role == 'user' else 'Assistant'}]: {m.content}"
            for m in req.messages
        )
        if req.attachments:
            turns = append_attachment_refs(turns, req.attachments)
        args.append(turns)

    print(f"  [converse] prompt length: {len(args[-1])} chars")
    return await run_claude(args)


@app.get("/status")
async def status():
    proc = await asyncio.create_subprocess_exec(
        CLAUDE_BIN, "auth", "status", "--json",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        env=_clean_env(),
    )
    stdout, stderr = await proc.communicate()

    if proc.returncode != 0:
        raise HTTPException(status_code=502, detail=f"Failed to get status: {stderr.decode()}")

    try:
        auth_info = json.loads(stdout.decode())
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="Invalid JSON from auth status")

    return {
        "authenticated": auth_info.get("loggedIn", False),
        "email": auth_info.get("email"),
        "org": auth_info.get("orgName"),
        "subscription": auth_info.get("subscriptionType"),
        "auth_method": auth_info.get("authMethod"),
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
