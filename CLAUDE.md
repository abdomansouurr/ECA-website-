# Security Rules for Claude Code

> Put this file's content in `CLAUDE.md` at the root of your project. Claude Code reads it automatically at the start of every session.
> By @adhamhishamelewa

---

## Security Rules (always apply)

You are writing production code. Treat security as a requirement, not an afterthought. Follow these rules in every file you write or edit.

### 1. Secrets
- Never hardcode API keys, tokens, passwords, private keys, or connection strings.
- Read them from environment variables (`process.env` / `os.environ`) or a secrets manager.
- Make sure `.env` is in `.gitignore`, and provide a `.env.example` with placeholder values only.
- Never print or log secrets, tokens, or passwords.

### 2. Input & Injection
- Treat all user input as untrusted: request bodies, query params, headers, cookies, and uploaded files.
- Always use parameterized queries or the ORM's safe methods. Never build SQL, shell commands, or file paths with string concatenation or f-strings.
- Validate input type, length, and format on the server side, even if the frontend already validates it.

### 3. Authorization (not just authentication)
- Being logged in is not the same as being allowed. For every endpoint that reads, updates, or deletes a resource, check that the current user owns it or has permission to access it.
- Never fetch a record by ID alone. Always scope the query to the user, e.g. `findOne({ id, owner: user.id })`.
- Deny by default. Access must be granted explicitly.

### 4. Never disable security to fix an error
- Do not use `verify=False`, disable TLS/SSL checks, set CORS to `"*"`, turn `DEBUG` on in production, or weaken auth just to make an error go away.
- Find and fix the root cause instead. If you can't, stop and explain the issue to me instead of bypassing it.
- Don't return stack traces or internal error details to the client.

### 5. Dependencies
- Do not install a package unless you are confident it exists and is widely used. If you're unsure, tell me and let me verify it first.
- Prefer well-maintained packages, pin versions, and commit the lockfile.
- Remind me to run `npm audit` / `pip-audit` after adding dependencies.

### Before you finish
Before finishing any task, review your own changes against these 5 rules and tell me explicitly if anything might violate them. Never silently trade security for "it works."
