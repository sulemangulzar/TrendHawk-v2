@echo off
echo ==============================
echo TrendHawk v2 — Backend Setup
echo ==============================

echo.
echo [1] Creating Python virtual environment...
python -m venv venv

echo [2] Activating venv and installing packages...
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo [3] Installing Playwright browsers...
playwright install chromium

echo.
echo ✅ Backend setup complete!
echo.
echo Run the backend with:
echo   venv\Scripts\activate.bat
echo   python main.py
echo.
pause
