import os
import sys
import random

def random_word(difficulty):
    if getattr(sys, "frozen", False):
        # PyInstaller bundle: data files are unpacked under _MEIPASS/hang_man
        base = os.path.join(sys._MEIPASS, "hang_man")
    else:
        base = os.path.dirname(os.path.abspath(__file__))

    hard_path = os.path.join(base, "hardwords.txt")
    medium_path = os.path.join(base, "mediumwords.txt")
    easy_path = os.path.join(base, "easywords.txt")

    match difficulty:
        case "hard":
            f = open(hard_path, "r", encoding="utf-8")
        case "medium":
            f = open(medium_path, "r", encoding="utf-8")
        case _:
            f = open(easy_path, "r", encoding="utf-8")

    word_list = f.read().splitlines()
    random_word = random.randint(0, len(word_list) - 1)
    f.close()
    return word_list[random_word]