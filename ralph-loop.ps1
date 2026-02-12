# ralph-loop.ps1 - Run Haven pre-launch sprint autonomously
# Usage: .\ralph-loop.ps1              (default 25 iterations)
#        .\ralph-loop.ps1 -Iterations 5  (custom count)
#
# Safeguards: exit code check, commit verification, stuck detection,
# timestamped log file, consecutive failure bail-out, summary report.

param([int]$Iterations = 25)

Set-Location 'C:\Users\lydia\Documents\Claude\haven'

$logFile = 'ralph-log.txt'
$consecutiveFailures = 0
$maxFailures = 3
$completedTasks = 0
$startTime = Get-Date

# Read the prompt from file to avoid PowerShell string escaping issues
$promptFile = 'ralph-prompt.txt'

function Log {
    param([string]$msg)
    $ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $line = "[$ts] $msg"
    Write-Host $line
    Add-Content -Path $logFile -Value $line
}

# Capture starting commit
$startCommit = git rev-parse HEAD 2>$null
$lastProgressSize = 0
if (Test-Path 'progress.txt') {
    $lastProgressSize = (Get-Item 'progress.txt').Length
}

Log '=== Ralph Loop started ==='
Log "Iterations planned: $Iterations"
Log "Starting commit: $startCommit"
Log ''

for ($i = 1; $i -le $Iterations; $i++) {
    Write-Host ''
    Write-Host '========================================' -ForegroundColor Cyan
    Write-Host "  Ralph iteration $i of $Iterations" -ForegroundColor Cyan
    Write-Host '========================================' -ForegroundColor Cyan
    Write-Host ''

    $preCommit = git rev-parse HEAD 2>$null

    # Run Claude with prompt from file
    $prompt = Get-Content -Path $promptFile -Raw
    $result = claude -p --permission-mode bypassPermissions $prompt
    $exitCode = $LASTEXITCODE

    Write-Host $result

    # Check 1: All tasks complete
    if ($result -match 'RALPH_COMPLETE') {
        Log "ALL TASKS COMPLETE after $i iterations!"
        Write-Host ''
        Write-Host 'All automatable PRD tasks complete!' -ForegroundColor Green
        break
    }

    # Check 2: Claude exit code
    if ($exitCode -and $exitCode -ne 0) {
        Log "WARNING: Claude exit code $exitCode on iteration $i"
        $consecutiveFailures++
    }

    # Check 3: Did a commit happen?
    $postCommit = git rev-parse HEAD 2>$null
    if ($postCommit -eq $preCommit) {
        Log "WARNING: No new commit on iteration $i"
        $consecutiveFailures++
    } else {
        $commitMsg = git log -1 --pretty=format:'%s' 2>$null
        Log "OK: Committed - $commitMsg"
        $consecutiveFailures = 0
        $completedTasks++
    }

    # Check 4: Did progress.txt grow?
    if (Test-Path 'progress.txt') {
        $currentSize = (Get-Item 'progress.txt').Length
        if ($currentSize -le $lastProgressSize) {
            Log "WARNING: progress.txt did not grow on iteration $i"
        }
        $lastProgressSize = $currentSize
    }

    # Check 5: Bail out on consecutive failures
    if ($consecutiveFailures -ge $maxFailures) {
        Log "STOPPING: $maxFailures consecutive failures. Something is stuck."
        Write-Host ''
        Write-Host "Stopped: $maxFailures consecutive failures." -ForegroundColor Red
        Write-Host 'Check ralph-log.txt and progress.txt.' -ForegroundColor Red
        break
    }

    Write-Host ''
    Write-Host "Iteration $i done. Pausing 10 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

# Summary
$endCommit = git rev-parse HEAD 2>$null
$elapsed = (Get-Date) - $startTime
$elapsedStr = '{0:hh\:mm\:ss}' -f $elapsed

Log ''
Log '=== Ralph Loop Summary ==='
Log "Iterations run: $i"
Log "Tasks completed: $completedTasks"
Log "Time elapsed: $elapsedStr"
Log "Final commit: $endCommit"
Log '==========================='

Write-Host ''
Write-Host '=== SUMMARY ===' -ForegroundColor Green
Write-Host "Tasks completed: $completedTasks" -ForegroundColor Green
Write-Host "Time elapsed: $elapsedStr" -ForegroundColor Green
Write-Host 'Log: ralph-log.txt' -ForegroundColor Green
