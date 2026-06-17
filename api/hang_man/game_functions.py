"""
TODO: Convert to functions that return JSON for API calls
"""

import word_list
import uuid

def game_id():
    id = str(uuid.uuid4().hex[:8])
    return id

def new_game(difficulty):
    word = word_list.random_word(difficulty)
    display = ["_"] * len(word)
    lives = 6
    return word, display, lives




def main():
    
    print("Pick you difficulty: \n Type: 1 for a hard word \n Type: 2 for an easy word \n")
    while True:
        try:
            difficulty = int(input("> "))
        except ValueError:
            print("Chose between 1 or 2.")
            continue
        if difficulty > 2:
            print("Chose between 1 or 2.")
            continue
        else:
            break
    
    # generate a word from either wordlists in word_list.py
    word_to_guess = word_list.random_word(difficulty)
   
    # make the brackets to display the length of the word and any found letters
    user_word = ["_"] * len(word_to_guess)


    user_lives = 6
    already_guessed_letters = []


    word_to_guess_letters = list(word_to_guess)

    while True: 

        print(" ".join(user_word) + "\n")
        user_input_letter = (input("Type a single letter: ")).lower()

        # Validate user input as a single letter
        if not user_input_letter.isalpha() or not len(user_input_letter) == 1:
            print("I said a single letter!")
        elif user_input_letter in already_guessed_letters:
            print(f"You already tried {user_input_letter}\n")
        elif not user_input_letter in word_to_guess_letters:
            already_guessed_letters.append(user_input_letter)
            user_lives -= 1
            if user_lives > 1:
                print(f"Guess again! You have {user_lives} tries left!\n")
                continue
            elif user_lives == 1:
                print(f"Guess again! You have {user_lives} try left!\n")
                continue            
            else:
                print(f"You died! The word was {word_to_guess.upper()}!\n")
                break   
        else:
            already_guessed_letters.append(user_input_letter)
            for counter, i in enumerate(word_to_guess_letters):
                if i == user_input_letter: 
                    user_word[counter] = user_input_letter

        # Compare the list of successfully guessed letters with the list containing the letters of the target word
        if user_word == word_to_guess_letters:
            print(f'You successfully guessed the word: {word_to_guess.upper()}. You WIN!')
            break

if __name__ == "__main__":
    main()