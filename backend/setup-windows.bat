@echo off
title ChatCRM Backend Setup
color 0A
echo ==========================================
echo  ChatCRM - Windows Setup (No Docker)
echo ==========================================
echo.

REM Check Node.js
node --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found!
    echo Please install from: https://nodejs.org
    echo Download the LTS version and run setup again.
    pause
    exit
)
echo [OK] Node.js found: 
node --version

REM Check if .env exists
IF NOT EXIST .env (
    echo.
    echo [SETUP] Creating .env file...
    copy .env.windows .env
    echo [OK] .env created
)

REM Install dependencies
echo.
echo [1/3] Installing backend dependencies...
call npm install
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed
    pause
    exit
)
echo [OK] Dependencies installed

REM Generate Prisma client
echo.
echo [2/3] Setting up database...
call npx prisma db push
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Database connection failed!
    echo.
    echo Make sure PostgreSQL is running and .env has correct DATABASE_URL
    echo Edit the .env file and set your PostgreSQL password, then run again.
    pause
    exit
)
echo [OK] Database ready

REM Seed demo data
echo.
echo [3/3] Loading demo data...
call node prisma/seed.js
echo [OK] Demo data loaded

echo.
echo ==========================================
echo  Backend setup complete!
echo  Starting server on http://localhost:5000
echo ==========================================
echo.
echo Demo login: owner@chatcrm.com / password123
echo.
call npm run dev
