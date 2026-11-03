@echo off
title Brique Pro - Gestao de Briques e Lucro
echo ======================================================
echo    INICIANDO O SISTEMA BRIQUE PRO...
echo ======================================================
echo.

cd /d "%~dp0"

:: Abre o navegador em background apos 1.5s
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

:: Roda o servidor Node
node server.js

pause
