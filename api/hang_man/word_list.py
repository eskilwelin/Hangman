import os
import random

def random_word(difficulty):
    directory = os.path.dirname(os.path.abspath(__file__))
    hard_path = os.path.join(directory, "hangmanwords.txt")
    easy_path = os.path.join(directory, "easywords.txt")
    
    match difficulty:
        case 1:
            f = open(hard_path)
        case _:
            f = open(easy_path) 
            
    word_list = f.read().splitlines()
    random_word = random.randint(0, len(word_list) -1)
    f.close()
    return(word_list[random_word])
