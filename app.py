import sys
import os
from flask import Flask, jsonify, request, render_template
import json
import webbrowser
import time
from waitress import serve
import multiprocessing

# --- NEW: Simple logging function ---
# This will write messages to a file so we can debug the shutdown process.
def log_message(message):
    """Appends a timestamped message to a log file."""
    with open("shutdown_log.txt", "a") as f:
        f.write(f"{time.ctime()}: {message}\n")

# --- Shared Memory for Heartbeat ---
last_heartbeat = multiprocessing.Value('d', time.time())

# --- Flask App Setup ---
def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

app = Flask(
    __name__,
    template_folder=resource_path('templates'),
    static_folder=resource_path('static')
)
DATA_FILE = "civic_issues.json"

# --- Data handling functions ---
def load_data():
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'w') as f: json.dump([], f)
        return []
    try:
        with open(DATA_FILE, 'r') as f: return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError): return []

def save_data(data):
    with open(DATA_FILE, 'w') as f: json.dump(data, f, indent=4)

# --- API Endpoints ---
@app.route('/api/issues', methods=['GET'])
def get_issues():
    return jsonify(load_data())

@app.route('/api/report', methods=['POST'])
def add_issue():
    new_report = request.json
    if not new_report: return jsonify({"error": "Invalid data"}), 400
    database = load_data()
    database.append(new_report)
    save_data(database)
    return jsonify({"success": True, "report": new_report}), 201

@app.route('/api/heartbeat', methods=['POST'])
def heartbeat():
    """Updates the last_heartbeat shared value."""
    last_heartbeat.value = time.time()
    return jsonify(success=True)

@app.route('/')
def index():
    return render_template('index.html')

# --- Server runner function ---
def run_server():
    """Function to run the waitress server."""
    serve(app, host='127.0.0.1', port=8080)

def open_browser():
    webbrowser.open_new("http://127.0.0.1:8080")

if __name__ == '__main__':
    multiprocessing.freeze_support()
    log_message("Application starting.")

    server_process = multiprocessing.Process(target=run_server)
    server_process.start()
    log_message("Server process started.")
    
    time.sleep(1)
    open_browser()

    # The main process now monitors for shutdown conditions
    try:
        while True:
            if time.time() - last_heartbeat.value > 5:
                log_message("No heartbeat detected. Initiating shutdown.")
                server_process.terminate()
                log_message("Server process terminated.")
                server_process.join()
                log_message("Server process joined.")
                break # Exit the loop to shut down
            time.sleep(1)
    except (KeyboardInterrupt, SystemExit):
        log_message("Shutdown requested via KeyboardInterrupt/SystemExit.")
        server_process.terminate()
        server_process.join()

    log_message("Main process exiting.")
    sys.exit(0)
