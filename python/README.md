# Python AI helpers

This is an optional local companion for the static AIOU Coaching site. It adds Python-based assignment structure checks and revision-question drafting without requiring a paid API.

## Requirements
- Python 3.10+
- No third-party packages for offline commands
- Optional: [Ollama](https://ollama.com/) running locally for local-model generation

## Commands
From the repository root:

```bash
python -m unittest discover -s python -p 'test_*.py' -v
python python/aiou_ai.py audit path/to/your-draft.txt
python python/aiou_ai.py practice path/to/course-outline.txt --count 12
```

Optional local AI (no hosted API key):

```bash
ollama pull qwen2.5:3b
ollama serve
python python/aiou_ai.py ask-local "Explain opportunity cost in simple Urdu and English."
```

## Scope and limitations
- Offline audit checks headings, paragraphs, references-heading presence and unresolved placeholders. It does not certify originality, factual correctness, citation validity or AIOU compliance.
- Practice questions are revision prompts derived from text the student supplies. They are not actual, leaked or predicted exam questions.
- Local model quality and hardware requirements vary. Keep student names, roll numbers and private records out of prompts unless the student deliberately chooses a trusted local setup.
- Existing browser AI Studio continues using its configured Cloudflare Worker. This Python companion is a local/offline tool and is not automatically deployed as a Python web service on Netlify's static hosting.
