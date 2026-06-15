import random, os

def random_word(difficulty):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    hard_path = os.path.join(script_dir, "hangmanwords.txt")
    easy_path = os.path.join(script_dir, "easywords.txt")
    match difficulty:
        case 1:
            f = open(hard_path)
        case _:
            f = open(easy_path) 
            
    word_list = []
    for word in f.readlines():
        word_list.append(word.strip())
    random_word = random.randint(0, len(word_list) -1)
    f.close()
    return(word_list[random_word])

