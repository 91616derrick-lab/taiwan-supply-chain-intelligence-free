# Windows Local AI Optional Enhancement

This project does not require local AI. The default updater and website are fully rule-based and work without OpenAI API, Supabase, paid APIs, Apple workflows, or server-side secrets.

## A. Ollama for Windows

1. Install Ollama for Windows from the official Ollama website.
2. Download a small instruct model, for example:

```powershell
ollama pull qwen2.5:7b
ollama pull llama3.1:8b
```

3. Test that Ollama is available:

```powershell
ollama run qwen2.5:7b
```

4. Ollama's local API usually runs at:

```text
http://localhost:11434
```

5. Configure optional enhancement before running the updater:

```powershell
$env:LOCAL_AI_ENABLED="true"
$env:OLLAMA_BASE_URL="http://localhost:11434"
$env:LOCAL_AI_MODEL="qwen2.5:7b"
pnpm update:intelligence
```

If Ollama is unavailable, the updater records the failure in `data/system/status.json` and falls back to the rule-based manager view.

## B. LM Studio for Windows

1. Install LM Studio for Windows.
2. Download an instruct model that your machine can run.
3. Start the LM Studio local server.
4. Configure the local base URL:

```powershell
$env:LOCAL_AI_ENABLED="true"
$env:LOCAL_AI_BASE_URL="http://localhost:1234"
```

The current updater is optimized for Ollama enhancement and records LM Studio configuration status for diagnostics. If the local server is not running, the system falls back to the rule-based manager view.

## C. Notes

- Local AI does not create OpenAI API charges.
- Local AI uses your own CPU/GPU.
- Laptops may be slower.
- Small instruct models can run without a discrete GPU, but response time may be slower.
- Local AI is an enhancement, not a dependency.
- The website remains fully usable without Ollama or LM Studio.
