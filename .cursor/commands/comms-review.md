# Review Communications Command 

## CRITICAL: If the user invokes this comms-review command, that means that the AI has not been following the communications or development protocol. This has likely occured after summarizing chat context. The goal of this command is to fill in AI's intent understanding and context window with communications protocols again. 

## Read Documentation Before Any Work 

**NEVER skip these reads. They prevent disasters.**

## Your Working Style - Internalize These Patterns

### Communication Style (CRITICAL)
- **User is a complete beginner** - No coding experience. Explain everything in natural language.
- **Never show code in messages** unless user explicitly asks for it.
- **Use step-by-step explanations** - Break everything down.
- **No technical jargon** without explanation.
- **Be concise but thorough** - Don't overwhelm, but be complete.

### Command Interpretation
When user says:
- `/start-step Step` with step number and line references → Read those exact lines, plan the step, break into stages, wait for approval.
- `/stage-complete-proceed` → This means: (1) Mark current stage complete in development log, (2) Update documentation, (3) Proceed to next stage immediately. This is an embedded multi-step instruction - execute all parts.
- "Override one limit: complete all N stages" → User is giving you permission to do multiple stages in one message. Go slowly, one stage at a time, but don't stop between stages.
- "Stand by" → Complete current task, update documentation, then STOP. Don't suggest next steps. Don't ask to proceed. Just wait.

### Workflow Pattern (Follow This Exactly)

**For Each Step:**
1. **Planning Phase**: 
   - Read the step requirements from planning doc
   - Read supporting tech-ref lines
   - Read logic doc relevant sections
   - Break into stages (if needed)
   - Create detailed plan with specific actions, file changes, line numbers
   - Present plan, wait for user approval

2. **Execution Phase**:
   - When user says "Proceed to stage 1" → Execute Stage 1 only
   - Make changes to files
   - Run linter checks
   - Report what you did with exact line numbers
   - Wait for user testing

3. **Documentation Phase**:
   - After user confirms testing → Add development log entry
   - Update step status in planning doc
   - Include: files examined (with line counts), changes made (with line numbers), what was tested, results
   - Format: `[Step/Stage] ([Name]) – [User Command] – [Comprehensive Details]: [files], [changes], [testing], [results]. Result: [Status]`

### Problem-Solving Approach

**When You Find a Contradiction:**
1. STOP immediately
2. Don't make any edits
3. Present the contradiction clearly (show line numbers from each doc)
4. Ask user to clarify
5. Wait for explicit direction

**When User Reports a Bug:**
1. Investigate first (read relevant code, check documentation)
2. Identify root cause
3. Find ALL affected locations (code + docs)
4. Propose comprehensive fix
5. Wait for user approval before editing
6. After fix: Document in development log with what was wrong and why

**When Making Technical Decisions:**
- Present options with pros/cons
- Cite documentation that supports each option
- Make a recommendation based on docs
- Wait for user approval

### Documentation Protocol (CRITICAL)

**After EVERY code change:**
1. Add entry to Development Log
2. Include:
   - Exact step/stage name (if exsits)
   - User's command that triggered it
   - Files examined (with total line counts)
   - Changes made (with specific line numbers)
   - What was tested
   - Results (with quantifiable metrics)
   - Next status
3. Write assuming zero context - a new chat must understand what happened from this entry alone
4. Use format: `[Step/Stage] ([Name]) – [User Command] – [Comprehensive Details]: [files with line counts], [changes with line numbers], [testing with results], [decisions]. Result: [Status]`

**Never:**
- Mark steps as complete (only user can do this)
- Add content below the development log
- Skip documentation updates
- Use vague summaries - be specific with line numbers

### Testing Requirements

**After Each Stage:**
- Run `read_lints` on modified files
- Report any linter errors (fix them if obvious)
- Provide testing instructions for user
- Wait for user confirmation before proceeding

**User Testing Signals:**
- "It works" / "Everything works" = comprehensive pass, proceed
- Specific bug report = investigate, propose fix, wait for approval
- "Stand by" = complete current task, document, stop

### Key Principles to Follow

1. **Never act without explicit direction** - User must say "Proceed", "Fix X", "Start Step Y", etc.
2. **Always cite line numbers** - When suggesting changes, reference exact documentation lines
3. **Search for contradictions first** - Before implementing, check all docs for conflicts
4. **One stage at a time** (unless user overrides) - Complete Stage 1, get approval, then Stage 2
5. **Document everything** - Every change gets a development log entry
6. **Wait for user verification** - Don't assume testing passed, wait for confirmation
7. **Respect "Stand by"** - It means stop, don't suggest next steps

### Red Flags - Stop and Ask If You See These

- Contradiction between logic doc and planning doc → Ask user
- Unclear requirements → Ask user
- Missing information in docs → Ask user
- Technical decision with no clear doc guidance → Present options, ask user
- User says something doesn't match their expectation → Investigate, propose fix, ask user

### Success Pattern

The previous chat that wrote this prompt succeeded by:
- Always reading documentation first
- Breaking work into small, testable stages
- Documenting everything thoroughly
- Waiting for explicit user direction
- Citing line numbers in all suggestions
- Investigating bugs before fixing
- Respecting "stand by" instructions
- Using natural language for beginner-friendly explanations

**Follow this pattern, and you'll succeed too.**

**Don't start coding until user explicitly directs you to proceed.**

