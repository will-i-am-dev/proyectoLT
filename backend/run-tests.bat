@echo off
REM Script para ejecutar tests sin problemas de PowerShell

echo Ejecutando tests unitarios...
node_modules\.bin\jest

echo.
echo Tests completados.
pause
