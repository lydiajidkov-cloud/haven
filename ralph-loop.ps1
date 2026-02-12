# ralph-loop.ps1 — Run Haven integrations autonomously
# Usage: .\ralph-loop.ps1              (default: 9 iterations)
#        .\ralph-loop.ps1 -Iterations 3  (custom count)
#
# Each iteration picks one task from the PRD, integrates it, commits, and moves on.
# Stop early with Ctrl+C if needed.

param([int]$Iterations = 9)

Set-Location "C:\Users\lydia\Documents\Claude\haven"

for ($i = 1; $i -le $Iterations; $i++) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  Ralph iteration $i of $Iterations" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan

    $result = claude -p --permission-mode acceptEdits "@PRD.md @progress.txt 1. Read the PRD and progress file. 2. Find the next incomplete task. 3. Read the integration guide referenced in that task. 4. Follow the integration guide exactly to wire the feature into index.html. 5. Verify the game loads without console errors. 6. Commit your changes with a descriptive message. 7. Update progress.txt with what you did and the date. 8. Mark the task as done in PRD.md (change [ ] to [x]). ONLY WORK ON A SINGLE TASK. If ALL tasks in the PRD are complete, output RALPH_COMPLETE."

    Write-Host $result

    if ($result -match "RALPH_COMPLETE") {
        Write-Host "`nAll PRD tasks complete after $i iterations!" -ForegroundColor Green
        exit 0
    }

    Write-Host "`nIteration $i done. Pausing 5 seconds before next...`n" -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

Write-Host "`nFinished $Iterations iterations. Check progress.txt for status." -ForegroundColor Yellow
