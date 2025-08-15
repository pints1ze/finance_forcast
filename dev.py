#!/usr/bin/env python3
"""
Development script to run both Tailwind CSS build process and Flask app
"""
import subprocess
import sys
import os
import time
from threading import Thread

def run_tailwind():
    """Run Tailwind CSS in watch mode"""
    cmd = ["npx", "@tailwindcss/cli", "-i", "./src/input.css", "-o", "./static/css/output.css", "--watch"]
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Tailwind build failed: {e}")
    except KeyboardInterrupt:
        print("Tailwind build stopped")

def run_flask():
    """Run Flask development server"""
    try:
        subprocess.run([sys.executable, "app.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Flask failed: {e}")
    except KeyboardInterrupt:
        print("Flask stopped")

if __name__ == "__main__":
    print("🚀 Starting development environment...")
    print("📦 Building CSS with Tailwind...")
    print("🌶️  Starting Flask server...")
    print("📋 Visit http://127.0.0.1:5000 to see your app")
    print("⏹️  Press Ctrl+C to stop both processes")
    
    # Start Tailwind in background
    tailwind_thread = Thread(target=run_tailwind, daemon=True)
    tailwind_thread.start()
    
    # Give Tailwind a moment to build initial CSS
    time.sleep(2)
    
    # Run Flask in main thread
    try:
        run_flask()
    except KeyboardInterrupt:
        print("\n👋 Development environment stopped")
        sys.exit(0)
