# ralph-once.ps1 — Run one Haven integration task (human-in-the-loop)
# Usage: .\ralph-once.ps1
# You watch, review the commit, then run again when ready for the next task.

Set-Location "C:\Users\lydia\Documents\Claude\haven"

claude --permission-mode acceptEdits "@PRD.md @progress.txt 1. Read the PRD and progress file. 2. Find the next incomplete task. 3. Read the integration guide referenced in that task. 4. Follow the integration guide exactly to wire the feature into index.html. 5. Verify the game loads without console errors. 6. Commit your changes with a descriptive message. 7. Update progress.txt with what you did and the date. ONLY DO ONE TASK AT A TIME."
