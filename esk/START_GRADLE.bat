@echo off
cls
echo =========================================
echo ORGANIK TARIM - SISTEM BASLATMA
echo =========================================
echo.

REM Java'yi durdur
echo [1/4] Eski surecler durduruluyor...
taskkill /F /IM java.exe 2>nul
timeout /t 3 /nobreak >nul

REM Backend baslat
echo.
echo [2/4] BACKEND BASLATILIYOR...
echo =========================================
cd /d "C:\Users\musta\OneDrive\Masaüstü\ACİLLAZIM.COM\organik tarım\backend"

if not exist ".\gradlew.bat" (
    echo HATA: gradlew.bat bulunamadi!
    pause
    exit /b 1
)

start "BACKEND" cmd /k "echo === BACKEND === && .\gradlew.bat bootRun"

echo Backend baslatildi (yeni pencerede calisiyor)...
echo Lutfen 50 saniye bekleyin (Spring Boot aciliyor)...
timeout /t 50 /nobreak >nul

REM Frontend baslat
echo.
echo [3/4] FRONTEND BASLATILIYOR...
echo =========================================
cd /d "C:\Users\musta\OneDrive\Masaüstü\ACİLLAZIM.COM\organik tarım\app"

if not exist "package.json" (
    echo HATA: package.json bulunamadi!
    pause
    exit /b 1
)

start "FRONTEND" cmd /k "echo === FRONTEND === && npm run dev"

echo Frontend baslatildi (yeni pencerede calisiyor)...
echo Lutfen 10 saniye bekleyin (Vite aciliyor)...
timeout /t 10 /nobreak >nul

REM Bilgiler
echo.
echo =========================================
echo [4/4] SISTEM HAZIR!
echo =========================================
echo.
echo [URL'ler]
echo - Admin Panel: http://localhost:5173/admin/login
echo - API: http://localhost:8081/api
echo.
echo [Giris Bilgileri]
echo - E-posta: mustafakeksin@gmail.com
echo - Sifre: 123456
echo.
echo [Yeni Ozellik]
echo - JwtAuthenticationFilter role yetkilendirme duzeltildi
echo.
echo 3 pencere acik:
echo 1. Bu pencere (ANA)
echo 2. BACKEND penceresi (Spring Boot)
echo 3. FRONTEND penceresi (Vite/npm)
echo.
echo KAPATMAK ICIN BURAYA TIKLAYIP ENTER'A BASIN...
pause >nul
