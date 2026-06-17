from flask import Flask, request, jsonify
import ssh_auth
from hang_man import *
import store

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
    
    id = game_logic.game_id()

    # return word, display, lives, status, guessed_letters
    game = game_logic.create_game(data["difficulty"])

    store.games[id] = {
        "game_id": id,
        "word": game[0],
        "display": game[1],
        "lives": game[2],
        "status": game[3],
        "guessed_letters": game[4]
    }
    
    return jsonify({
        "game_id": store.games[id]["game_id"],
        "display": store.games[id]["display"],
        "lives": store.games[id]["lives"],
        "status": store.games[id]["status"],
        "guessed_letters": store.games[id]["guessed_letters"]
    }),


@app.route('/api/guess')
def guess():
    data = request.get_json()