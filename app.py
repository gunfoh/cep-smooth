import sys
import os
from flask import Flask, jsonify, request, render_template
import json
import webbrowser
from threading import Timer

# --- Helper function to find asset folders ---
# This is crucial for PyInstaller to find the templates and static folders
# when the app is bundled into a single .exe file.
def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)

# --- Initialize Flask with the correct paths ---
# We now use our helper function to define the paths.
app = Flask(
    __name__,
    template_folder=resource_path('templates'),
    static_folder=resource_path('static')
)

DATA_FILE = "civic_issues.json"

# --- Data handling functions (unchanged) ---
def load_data():
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'w') as f:
            json.dump([], f)
        return []
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)

# --- API Endpoints (unchanged) ---
@app.route('/api/issues', methods=['GET'])
def get_issues():
    issues = load_data()
    return jsonify(issues)

@app.route('/api/report', methods=['POST'])
def add_issue():
    new_report = request.json
    if not new_report:
        return jsonify({"error": "Invalid data"}), 400
    
    database = load_data()
    database.append(new_report)
    save_data(database)
    
    return jsonify({"success": True, "report": new_report}), 201

# --- Frontend Serving (unchanged) ---
@app.route('/')
def index():
    return render_template('index.html')

# --- Auto-open browser function ---
def open_browser():
      webbrowser.open_new("http://127.0.0.1:5000")

if __name__ == '__main__':
    # When the script is run, schedule the browser to open after 1 second
    Timer(1, open_browser).start()
    # Run the Flask app without debug mode for distribution
    app.run(host='127.0.0.1', port=5000)
