from flask import Flask, jsonify, request, render_template, redirect
from flask_cors import CORS
import subprocess
import os
import signal

app = Flask(__name__)
CORS(app)

# Start the Node.js server
node_process = None

def start_node_server():
    global node_process
    node_process = subprocess.Popen(['node', 'server.js'])

def stop_node_server():
    global node_process
    if node_process:
        os.kill(node_process.pid, signal.SIGTERM)
        node_process = None

# Check if the Node.js server is running
def node_server_running():
    try:
        response = subprocess.check_output(['curl', 'http://localhost:3000'])
        return True
    except subprocess.CalledProcessError:
        return False

# Initialize function to start Node.js server if not already running
def initialize():
    if not node_server_running():
        start_node_server()

# Dummy database for storing URLs
urlDatabase = {}

# Route to display login and password details
@app.route('/credentials')
def display_credentials():
    login = "example_login"
    password = "example_password"
    return f'Login: {login}, Password: {password}'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    original_url = data['url']
    id = str(len(urlDatabase) + 1)  # Generate a simple ID
    urlDatabase[id] = original_url
    return jsonify({'trackingLink': f'http://localhost:5000/track/{id}'})

@app.route('/track/<id>', methods=['GET'])
def track(id):
    if id in urlDatabase:
        original_url = urlDatabase[id]
        return redirect(original_url)
    else:
        return jsonify({'error': 'URL not found'})

if __name__ == '__main__':
    try:
        initialize()
        app.run(debug=True, host='0.0.0.0')
    finally:
        stop_node_server()
