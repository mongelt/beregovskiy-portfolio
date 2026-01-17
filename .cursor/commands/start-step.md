Files: `docs\website-development\website-roadmap.md` `docs\website-development\dev-phases-docs\editorjs-update.md` `docs\website-development\logs\development-logs\editorjs-update-dev-log.md`
Step: user will specify current step or stage in the chat, if the user didn't specify current step or stage, read documentation and find planning notes for this step
Mode: Explore and edit 
Task: Find specific lines of the planning/running doc or roadmap doc that describe this step. User will specify. Search for this step number across the document to see what addresses this step and can be useful. 
Action: Explore thoroughly first. Then, plan this step in stages, where each stage is one message, assuming no bugs need fixes. Update `docs\portfolio-tab-dev-docs\portfolio-planning.md`, add the planned stages where user specifies. Make sure each stage equals one message.

Expected output from user:
Step: *number of step from documentation* 
Lines: *main lines of documentation that describe this step, read first* 
Supporting (if exists): *lines of documentation that address this step and can be useful, read second, search for more if user missed something*
Add: *number of line where AI needs to start writing planned stage of executing this step*

If the user didn't provide expected output, read documentation first, if unclear, request this expected output form. If the user didn't provide supporting lines of documentation, assume they don't exists.