#!/usr/bin/env python3
"""Offline-first AIOU study helper with an optional local Ollama model.

No paid API is required. Deterministic checks always work; Ollama is optional.
This tool does not claim to predict actual AIOU exam questions.
"""
from __future__ import annotations

import argparse
import json
import re
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


def word_count(text: str) -> int:
    return len(re.findall(r"\b[\w'-]+\b", text, flags=re.UNICODE))


def audit_assignment(text: str) -> dict[str, Any]:
    """Return transparent, rule-based feedback; never invent a quality score."""
    cleaned = text.strip()
    headings = re.findall(r"(?m)^\s{0,3}#{1,3}\s+.+|(?m)^\s*[A-Z][^\n]{2,70}:\s*$", cleaned)
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", cleaned) if p.strip()]
    checks = [
        {"id": "has_content", "ok": bool(cleaned), "message": "Draft contains text." if cleaned else "Add your own draft before checking."},
        {"id": "has_headings", "ok": len(headings) >= 2, "message": "Use clear headings for each major answer/section." if len(headings) < 2 else f"Found {len(headings)} possible headings."},
        {"id": "paragraphs", "ok": len(paragraphs) >= 2, "message": "Split long text into readable paragraphs." if len(paragraphs) < 2 else f"Found {len(paragraphs)} paragraphs."},
        {"id": "references", "ok": bool(re.search(r"(?i)\b(references|bibliography|sources)\b", cleaned)), "message": "Add a references section and verify every source." if not re.search(r"(?i)\b(references|bibliography|sources)\b", cleaned) else "A references heading is present; verify source details."},
        {"id": "placeholder", "ok": not bool(re.search(r"(?i)\[(?:add|insert|write|todo|verify)[^\]]*\]", cleaned)), "message": "Resolve remaining bracketed placeholders." if re.search(r"(?i)\[(?:add|insert|write|todo|verify)[^\]]*\]", cleaned) else "No common draft placeholders detected."},
    ]
    return {"kind": "assignment_audit", "word_count": word_count(cleaned), "paragraph_count": len(paragraphs), "heading_count": len(headings), "checks": checks, "notice": "Rule-based writing checks only; they do not verify facts, originality, citations, or AIOU requirements."}


def build_practice_set(source: str, count: int = 10) -> dict[str, Any]:
    """Create revision prompts from supplied text, not purported exam predictions."""
    count = max(1, min(int(count), 30))
    terms = []
    for line in source.splitlines():
        line = re.sub(r"^\s*(?:[-*#\d.)]+\s*)", "", line).strip()
        if len(line) >= 4 and line.lower() not in {x.lower() for x in terms}:
            terms.append(line[:180])
    questions = []
    for i in range(count):
        topic = terms[i % len(terms)] if terms else "the supplied course topic"
        templates = [
            f"Explain the key ideas in: {topic}",
            f"Discuss the importance and practical applications of: {topic}",
            f"Compare the main concepts related to: {topic}",
            f"Give an example that demonstrates: {topic}",
            f"Identify possible challenges or limitations concerning: {topic}",
        ]
        questions.append({"number": i + 1, "type": "revision", "question": templates[i % len(templates)]})
    return {"kind": "practice_questions", "questions": questions, "notice": "Generated from user-supplied topics for revision only; not actual, leaked, or predicted AIOU exam questions."}


def ollama_generate(prompt: str, model: str, host: str = "http://127.0.0.1:11434") -> str:
    payload = json.dumps({"model": model, "prompt": prompt, "stream": False}).encode()
    request = urllib.request.Request(host.rstrip("/") + "/api/generate", data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(request, timeout=120) as response:
        data = json.loads(response.read().decode("utf-8"))
    return str(data.get("response", "")).strip()


def main() -> int:
    parser = argparse.ArgumentParser(description="Offline-first AIOU assignment and revision helper")
    sub = parser.add_subparsers(dest="command", required=True)
    audit = sub.add_parser("audit", help="Check assignment structure")
    audit.add_argument("file", type=Path)
    practice = sub.add_parser("practice", help="Create revision questions from supplied topic text")
    practice.add_argument("file", type=Path)
    practice.add_argument("--count", type=int, default=10)
    ai = sub.add_parser("ask-local", help="Ask an optional local Ollama model")
    ai.add_argument("prompt")
    ai.add_argument("--model", default="qwen2.5:3b")
    ai.add_argument("--host", default="http://127.0.0.1:11434")
    args = parser.parse_args()

    if args.command == "audit":
        result = audit_assignment(args.file.read_text(encoding="utf-8"))
    elif args.command == "practice":
        result = build_practice_set(args.file.read_text(encoding="utf-8"), args.count)
    else:
        try:
            result = {"kind": "local_ai_response", "model": args.model, "text": ollama_generate(args.prompt, args.model, args.host), "notice": "Local model output may be inaccurate; verify facts and references."}
        except (OSError, urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            result = {"kind": "error", "error": str(exc), "hint": "Install/start Ollama and pull the selected model, or use the offline audit/practice commands."}
            print(json.dumps(result, ensure_ascii=False, indent=2))
            return 2
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
