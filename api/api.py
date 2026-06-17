from flask import Flask, request, jsonify
import ssh_auth
from hang_man import game_logic
import store
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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

@app.route('/api/new_game', methods=['POST'])
def new_game():
    data = request.get_json()
    
    id = game_logic.game_id()

    game = game_logic.create_game(data["difficulty"])
    game["game_id"] = id
    store.games[id] = game
    
    return jsonify({
        "game_id": store.games[id]["game_id"],
        "display": store.games[id]["display"],
        "lives": store.games[id]["lives"],
        "status": store.games[id]["status"],
        "guessed_letters": store.games[id]["guessed_letters"]
    }), 200


@app.route('/api/guess', methods=['POST'])
def guess():
    data = request.get_json()
    id = data["game_id"]

    result = game_logic.user_guess(id, data["letter"])
    
    if result in ["error", "wrong_input", "already_guessed"]:
        return jsonify({"message": result}), 400
    elif result in ["won", "lost"]:
        return jsonify({
            "status": store.games[id]["status"],
            "word": store.games[id]["word"]
        }), 200
    else:
        return jsonify({
        "display": store.games[id]["display"],
        "lives": store.games[id]["lives"],
        "status": store.games[id]["status"],
        "guessed_letters": store.games[id]["guessed_letters"]
        }), 200

