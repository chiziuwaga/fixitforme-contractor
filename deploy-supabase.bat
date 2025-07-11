@echo off
echo 🚀 FixItForMe Contractor - Automated Supabase Deployment
echo ========================================================

echo.
echo 📊 Checking Migration Status...
call npm run supabase:status

echo.
echo 🛠️  Deploying Schema Changes...
call npm run supabase:push

echo.
echo 📊 Verifying Deployment...
call npm run supabase:status

echo.
echo ✅ Deployment Complete!
echo.
echo 📝 To manually seed Felix data:
echo    1. Go to Supabase Dashboard > SQL Editor
echo    2. Copy contents from: deploy-felix-data.sql
echo    3. Run the SQL script
echo.
pause
