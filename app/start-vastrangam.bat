@echo off
REM =====================================================================
REM   Vastrangam AI Engine
REM
REM   Double-click this file. That is the whole instruction.
REM
REM   The first time it runs it downloads what the app needs, which takes
REM   a few minutes and only ever happens once. Every time after that it
REM   starts in a couple of seconds.
REM =====================================================================

title Vastrangam AI Engine
cd /d "%~dp0"

echo.
echo   Vastrangam AI Engine
echo   ----------------------------------------------------------
echo.

REM ---- 1. Is Node installed? -----------------------------------------
where node >nul 2>nul
if errorlevel 1 goto NONODE

for /f "tokens=*" %%v in ('node -v') do set NODEV=%%v
echo   Node        %NODEV%

REM ---- 2. First run? Install. ----------------------------------------
if exist "node_modules\express\package.json" goto HAVEDEPS

echo.
echo   First run - setting up. This takes a few minutes, once.
echo   Leave this window open.
echo.
call npm install
if errorlevel 1 goto INSTALLFAILED
echo.
echo   Setup finished.
echo.

:HAVEDEPS

REM ---- 3. Make sure there is a .env to hold the key -------------------
if not exist ".env" (
  if exist ".env.example" (
    copy /y ".env.example" ".env" >nul
    echo   Made a .env file for your settings.
  )
)

REM ---- 4. Open the browser once the server is answering ---------------
if "%PORT%"=="" set PORT=3000
start "" cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:%PORT%"

echo   Opening      http://localhost:%PORT%
echo.
echo   Keep this window open while you work.
echo   Close it, or press Ctrl+C, to stop the app.
echo   ----------------------------------------------------------
echo.

call npm start
goto END

REM ---- problems, explained rather than just failing -------------------
:NONODE
echo   Node is not installed on this computer, and the app needs it.
echo.
echo   1. Go to   https://nodejs.org
echo   2. Download the big green "LTS" button.
echo   3. Install it, clicking Next through every screen.
echo   4. Come back and double-click this file again.
echo.
pause
goto END

:INSTALLFAILED
echo.
echo   Setup did not finish.
echo.
echo   Almost always this is the internet connection. Check you are
echo   online and double-click this file again - it picks up where it
echo   stopped and does not start over.
echo.
pause
goto END

:END
echo.
echo   The app has stopped. Your work is saved.
echo.
pause
