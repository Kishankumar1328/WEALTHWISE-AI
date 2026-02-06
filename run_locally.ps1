$env:RAZORPAY_KEY_ID = "rzp_test_SClOLR2beT6kWl"
$env:RAZORPAY_KEY_SECRET = "VQGNWdwYpn2V8Nkee220XRAS"
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://wealthwise_user:LexgAp3Ex9xLbTblSlS8vbdzF3zstX3W@dpg-d62o03koud1c73d2p5c0-a.singapore-postgres.render.com:5432/wealthwise_db?ssl=true&sslmode=require"
$env:SPRING_DATASOURCE_USERNAME = "wealthwise_user"
$env:SPRING_DATASOURCE_PASSWORD = "LexgAp3Ex9xLbTblSlS8vbdzF3zstX3W"
$env:SPRING_CACHE_TYPE = "none" 

Write-Host "Starting Backend (using mvnw wrapper)..."
# Use .\mvnw.cmd instead of system mvn
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\mvnw.cmd spring-boot:run"

Write-Host "Starting Frontend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; $env:VITE_API_BASE_URL='http://localhost:5000/api/v1'; npm run dev"

Write-Host "Attempting startup..."
