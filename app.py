from flask import Flask, jsonify, request, render_template
import json
import os

# Initialize the Flask application
app = Flask(__name__, template_folder='templates', static_folder='static')

# Define the path for our data file
DATA_FILE = "civic_issues.json"

def load_data():
    """Loads issue data from the JSON file."""
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

def save_data(data):
    """Saves issue data to the JSON file."""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)

# --- API Endpoints ---

@app.route('/api/issues', methods=['GET'])
def get_issues():
    """API endpoint to get all issues."""
    issues = load_data()
    return jsonify(issues)

@app.route('/api/report', methods=['POST'])
def add_issue():
    """API endpoint to add a new issue."""
    new_report = request.json
    if not new_report:
        return jsonify({"error": "Invalid data"}), 400
    
    database = load_data()
    database.append(new_report)
    save_data(database)
    
    return jsonify({"success": True, "report": new_report}), 201

# --- Frontend Serving ---

@app.route('/')
def index():
    """Serves the main HTML page for the React application."""
    return render_template('index.html')

if __name__ == '__main__':
    # Runs the Flask development server
    app.run(debug=True)
