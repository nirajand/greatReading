Write-Host "Starting GreatReading Backend..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "python" -ArgumentList "run.py" -WorkingDirectory "backend"
Start-Sleep -Seconds 2

Write-Host "Starting GreatReading Frontend..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "frontend"

Write-Host "`nGreatReading is running!" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop both servers" -ForegroundColor Yellow
