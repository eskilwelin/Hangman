import secrets
from . import store
from flask import request, jsonify

def new_token():
    token = secrets.token_urlsafe()
    return token

def check_token():
    if "sessionToken" in request.headers:
        token = request.headers["sessionToken"]
    else:
        return jsonify({'message': 'Token is missing'}), 401
    
    if token not in store.sessions:
        return jsonify({'message': 'Token is invalid'}), 401