from flask import Flask, request, jsonify
import ssh_auth
from hang_man import *

app = Flask(__name__)

@app.route('/api/connect', methods=['POST'])
def connect():
    data = request.get_json()
    
    success =  ssh_auth.server_connect(
        data["ip"],
        data["username"],
        data["password"]
    )

    if success:
        return jsonify({
            "sessionToken": "placeholder"
        }), 200

    return jsonify({
        "error": "Authentication failed"
    }), 401

@app.route('/api/new_game')
def new_game():
    data = request.get_json()
    
    
    word = word_list.random_word(data["difficulty"])
    
    return jsonify({
        "word": word,

    }),