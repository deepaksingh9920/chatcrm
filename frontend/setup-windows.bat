@echo off
title ChatCRM Frontend
color 0B
echo ==========================================
echo  ChatCRM - Frontend Setup
echo ==========================================
echo.

REM Check Node.js
node --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found!
    echo Please install from: https://nodejs.org
    pause
    exit
)

IF NOT EXIST .env (
    copy .env.example .env
)

echo [1/2] Installing dependencies (this takes 2-3 minutes first time)...
call npm install --legacy-peer-deps
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed
    pause
    exit
)

echo.
echo [2/2] Starting ChatCRM...
echo.
echo ==========================================
echo  Press W  =^> Open in Web Browser
echo  Scan QR  =^> Open on Mobile (Expo Go app)
echo ==========================================
echo.
call npx expo start
