@echo off
REM This script starts the Python server and opens the application in a web browser.

echo Starting the Civic Engagement Platform...
echo A new window will open for the server, and your browser will open shortly.
echo To stop the application, simply close the new server window.

REM Start the Python Flask server in a new window.
start "Civic Platform Server" cmd /k python app.py

REM Wait for 3 seconds to give the server time to start up.
timeout /t 3 /nobreak > nul

REM Open the default web browser to the application's URL.
start http://127.0.0.1:5000

REM The script will now exit, but the server window will remain open.
exit
