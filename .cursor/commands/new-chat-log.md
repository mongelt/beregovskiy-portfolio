User wants AI to start a new section in `docs\website-development\logs\chat-log.md` as rules for new sections defined in this doc direct AI to do. In the text that comes along with this command in the same message, the user identifies the end goal of the entire chat, not just one message. Document this end goal and stick to it. 
Separately in the same message, the user defines the desired action and output for AI's next message.
AI's actions when this command is received:
1. Start a new section in `docs\website-development\logs\chat-log.md` using the template from the doc
2. Investigate the files that are provided by the user
3. As an output, report that AI created a new section, and report findings from investigating the files that the user provided that fit the scope of the end goal defined by the user for this chat