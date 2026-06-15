from flask import Flask
import paramiko
import ssh_auth
from hang_man import *

app = Flask(__name__)

@app.route('/api/connect')
def connect():
    return ssh_auth.server_connect()

@app.route('/api/new_word')
def new_word():
    difficulty = ""
    return word_list.random_word(difficulty)