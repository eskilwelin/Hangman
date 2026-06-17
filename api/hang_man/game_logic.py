import uuid

from . import word_list
from . import store

def game_id():
    id = str(uuid.uuid4().hex[:8])
    return id

def create_game(difficulty):
    word = word_list.random_word(difficulty)
    new_game = {
        "word" : word,
        "display" : ["_"] * len(word),
        "lives" : 6,
        "status" : "ongoing",
        "guessed_letters" : [],
    }
    return new_game

def user_guess(game_id, letter):
    if store.games[game_id]["status"] != "ongoing":
        return "error"
    
    letters_in_word = list(store.games[game_id]["word"])

    if not letter.isalpha() or not len(letter) == 1:
        return "wrong_input"
    
    elif letter in store.games[game_id]["guessed_letters"]:
        return "already_guessed"
    
    elif not letter in store.games[game_id]["word"]:
        store.games[game_id]["guessed_letters"].append(letter)
        store.games[game_id]["lives"] -= 1
        
        if store.games[game_id]["lives"] > 0:
            return "ongoing"
        else:
            store.games[game_id]["status"] = "lost"
            return store.games[game_id]["status"]
    
    else:
        store.games[game_id]["guessed_letters"].append(letter)
        for counter, i in enumerate(letters_in_word):
            if i == letter: 
                store.games[game_id]["display"][counter] = letter
        
        if store.games[game_id]["display"] == letters_in_word:
            store.games[game_id]["status"] = "won"
            return store.games[game_id]["status"] 
        else:
            return "ongoing"

