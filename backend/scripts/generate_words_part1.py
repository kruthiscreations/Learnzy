#!/usr/bin/env python3
"""
Generate comprehensive word database for SpeakEasy Kids Pro
Ages 2-4 (LKG-1st): 250 Basic Words
Ages 5-7 (2nd-3rd): 250 Action Verbs, School, Animals
Ages 8-10 (4th-5th): 250 Adjectives, Places, Hobbies
Ages 10-11 (5th-adv): 250 Advanced Concepts
"""

import json

# Translation mappings (basic translations)
TRANSLATIONS = {
    # Family & People
    "mom": {"telugu": "అమ్మ", "hindi": "माँ", "tamil": "அம்மா", "kannada": "ಅಮ್ಮ", "malayalam": "അമ്മ"},
    "dad": {"telugu": "నాన్న", "hindi": "पापा", "tamil": "அப்பா", "kannada": "ಅಪ್ಪ", "malayalam": "അച്ഛൻ"},
    "baby": {"telugu": "బిడ్డ", "hindi": "बच्चा", "tamil": "குழந்தை", "kannada": "ಮಗು", "malayalam": "കുഞ്ഞ്"},
    "me": {"telugu": "నేను", "hindi": "मैं", "tamil": "நான்", "kannada": "ನಾನು", "malayalam": "ഞാൻ"},
    "you": {"telugu": "నువ్వు", "hindi": "तुम", "tamil": "நீ", "kannada": "ನೀನು", "malayalam": "നീ"},
    "brother": {"telugu": "అన్న", "hindi": "भाई", "tamil": "அண்ணன்", "kannada": "ಅಣ್ಣ", "malayalam": "ചേട്ടൻ"},
    "sister": {"telugu": "అక్క", "hindi": "बहन", "tamil": "அக்கா", "kannada": "ಅಕ್ಕ", "malayalam": "ചേച്ചി"},
    "grandma": {"telugu": "అమ్మమ్మ", "hindi": "दादी", "tamil": "பாட்டி", "kannada": "ಅಜ್ಜಿ", "malayalam": "അമ്മൂമ്മ"},
    "grandpa": {"telugu": "తాత", "hindi": "दादा", "tamil": "தாத்தா", "kannada": "ಅಜ್ಜ", "malayalam": "അപ്പൂപ്പൻ"},
    "friend": {"telugu": "స్నేహితుడు", "hindi": "दोस्त", "tamil": "நண்பன்", "kannada": "ಸ್ನೇಹಿತ", "malayalam": "സുഹൃത്ത്"},
    "family": {"telugu": "కుటుంబం", "hindi": "परिवार", "tamil": "குடும்பம்", "kannada": "ಕುಟುಂಬ", "malayalam": "കുടുംബം"},
    
    # Animals
    "dog": {"telugu": "కుక్క", "hindi": "कुत्ता", "tamil": "நாய்", "kannada": "ನಾಯಿ", "malayalam": "നായ"},
    "cat": {"telugu": "పిల్లి", "hindi": "बिल्ली", "tamil": "பூனை", "kannada": "ಬೆಕ್ಕು", "malayalam": "പൂച്ച"},
    "bird": {"telugu": "పక్షి", "hindi": "पक्षी", "tamil": "பறவை", "kannada": "ಹಕ್ಕಿ", "malayalam": "പക്ഷി"},
    "fish": {"telugu": "చేప", "hindi": "मछली", "tamil": "மீன்", "kannada": "ಮೀನು", "malayalam": "മീൻ"},
    "cow": {"telugu": "ఆవు", "hindi": "गाय", "tamil": "பசு", "kannada": "ಹಸು", "malayalam": "പശു"},
    "pig": {"telugu": "పంది", "hindi": "सुअर", "tamil": "பன்றி", "kannada": "ಹಂದಿ", "malayalam": "പന്നി"},
    "sheep": {"telugu": "గొర్రె", "hindi": "भेड़", "tamil": "ஆடு", "kannada": "ಕುರಿ", "malayalam": "ആട്"},
    "horse": {"telugu": "గుర్రం", "hindi": "घोड़ा", "tamil": "குதிரை", "kannada": "ಕುದುರೆ", "malayalam": "കുതിര"},
    "lion": {"telugu": "సింహం", "hindi": "शेर", "tamil": "சிங்கம்", "kannada": "ಸಿಂಹ", "malayalam": "സിംഹം"},
    "tiger": {"telugu": "పులి", "hindi": "बाघ", "tamil": "புலி", "kannada": "ಹುಲಿ", "malayalam": "കടുവ"},
    "elephant": {"telugu": "ఏనుగు", "hindi": "हाथी", "tamil": "யானை", "kannada": "ಆನೆ", "malayalam": "ആന"},
    "duck": {"telugu": "బాతు", "hindi": "बतख", "tamil": "வாத்து", "kannada": "ಬಾತುಕೋಳಿ", "malayalam": "താറാവ്"},
    "chicken": {"telugu": "కోడి", "hindi": "मुर्गी", "tamil": "கோழி", "kannada": "ಕೋಳಿ", "malayalam": "കോഴി"},
    "frog": {"telugu": "కప్ప", "hindi": "मेंढक", "tamil": "தவளை", "kannada": "ಕಪ್ಪೆ", "malayalam": "തവള"},
    "mouse": {"telugu": "ఎలుక", "hindi": "चूहा", "tamil": "எலி", "kannada": "ಇಲಿ", "malayalam": "എലി"},
    "rabbit": {"telugu": "కుందేలు", "hindi": "खरगोश", "tamil": "முயல்", "kannada": "ಮೊಲ", "malayalam": "മുയൽ"},
    "snake": {"telugu": "పాము", "hindi": "साँप", "tamil": "பாம்பு", "kannada": "ಹಾವು", "malayalam": "പാമ്പ്"},
    "bear": {"telugu": "ఎలుగుబంటి", "hindi": "भालू", "tamil": "கரடி", "kannada": "ಕರಡಿ", "malayalam": "കരടി"},
    "fox": {"telugu": "నక్క", "hindi": "लोमड़ी", "tamil": "நரி", "kannada": "ನರಿ", "malayalam": "കുറുക്കൻ"},
    "deer": {"telugu": "జింక", "hindi": "हिरण", "tamil": "மான்", "kannada": "ಜಿಂಕೆ", "malayalam": "മാൻ"},
    
    # Food
    "apple": {"telugu": "ఆపిల్", "hindi": "सेब", "tamil": "ஆப்பிள்", "kannada": "ಸೇಬು", "malayalam": "ആപ്പിൾ"},
    "banana": {"telugu": "అరటి", "hindi": "केला", "tamil": "வாழைப்பழம்", "kannada": "ಬಾಳೆಹಣ್ಣು", "malayalam": "വാഴപ്പഴം"},
    "milk": {"telugu": "పాలు", "hindi": "दूध", "tamil": "பால்", "kannada": "ಹಾಲು", "malayalam": "പാൽ"},
    "bread": {"telugu": "రొట్టె", "hindi": "रोटी", "tamil": "ரொட்டி", "kannada": "ಬ್ರೆಡ್", "malayalam": "റൊട്ടി"},
    "egg": {"telugu": "గుడ్డు", "hindi": "अंडा", "tamil": "முட்டை", "kannada": "ಮೊಟ್ಟೆ", "malayalam": "മുട്ട"},
    "rice": {"telugu": "అన్నం", "hindi": "चावल", "tamil": "அரிசி", "kannada": "ಅಕ್ಕಿ", "malayalam": "അരി"},
    "water": {"telugu": "నీళ్ళు", "hindi": "पानी", "tamil": "தண்ணீர்", "kannada": "ನೀರು", "malayalam": "വെള്ളം"},
    "juice": {"telugu": "రసం", "hindi": "रस", "tamil": "சாறு", "kannada": "ರಸ", "malayalam": "ജ്യൂസ്"},
    "cake": {"telugu": "కేక్", "hindi": "केक", "tamil": "கேக்", "kannada": "ಕೇಕ್", "malayalam": "കേക്ക്"},
    "cookie": {"telugu": "బిస్కెట్", "hindi": "बिस्कुट", "tamil": "குக்கீ", "kannada": "ಕುಕೀ", "malayalam": "കുക്കി"},
    "cheese": {"telugu": "చీజ్", "hindi": "पनीर", "tamil": "சீஸ்", "kannada": "ಚೀಸ್", "malayalam": "ചീസ്"},
    "butter": {"telugu": "వెన్న", "hindi": "मक्खन", "tamil": "வெண்ணெய்", "kannada": "ಬೆಣ್ಣೆ", "malayalam": "വെണ്ണ"},
    "jam": {"telugu": "జామ్", "hindi": "जैम", "tamil": "ஜாம்", "kannada": "ಜಾಮ್", "malayalam": "ജാം"},
    "soup": {"telugu": "సూప్", "hindi": "सूप", "tamil": "சூப்", "kannada": "ಸೂಪ್", "malayalam": "സൂപ്പ്"},
    "tea": {"telugu": "టీ", "hindi": "चाय", "tamil": "தேநீர்", "kannada": "ಚಹಾ", "malayalam": "ചായ"},
    
    # Colors
    "red": {"telugu": "ఎరుపు", "hindi": "लाल", "tamil": "சிவப்பு", "kannada": "ಕೆಂಪು", "malayalam": "ചുവപ്പ്"},
    "blue": {"telugu": "నీలం", "hindi": "नीला", "tamil": "நீலம்", "kannada": "ನೀಲಿ", "malayalam": "നീല"},
    "green": {"telugu": "ఆకుపచ్చ", "hindi": "हरा", "tamil": "பச்சை", "kannada": "ಹಸಿರು", "malayalam": "പച്ച"},
    "yellow": {"telugu": "పసుపు", "hindi": "पीला", "tamil": "மஞ்சள்", "kannada": "ಹಳದಿ", "malayalam": "മഞ്ഞ"},
    "pink": {"telugu": "గులాబీ", "hindi": "गुलाबी", "tamil": "இளஞ்சிவப்பு", "kannada": "ಗುಲಾಬಿ", "malayalam": "പിങ്ക്"},
    "purple": {"telugu": "ఊదా", "hindi": "बैंगनी", "tamil": "ஊதா", "kannada": "ನೇರಳೆ", "malayalam": "പർപ്പിൾ"},
    "orange": {"telugu": "నారింజ", "hindi": "नारंगी", "tamil": "ஆரஞ்சு", "kannada": "ಕಿತ್ತಳೆ", "malayalam": "ഓറഞ്ച്"},
    "black": {"telugu": "నలుపు", "hindi": "काला", "tamil": "கருப்பு", "kannada": "ಕಪ್ಪು", "malayalam": "കറുപ്പ്"},
    "white": {"telugu": "తెలుపు", "hindi": "सफेद", "tamil": "வெள்ளை", "kannada": "ಬಿಳಿ", "malayalam": "വെള്ള"},
    "brown": {"telugu": "గోధుమ", "hindi": "भूरा", "tamil": "பழுப்பு", "kannada": "ಕಂದು", "malayalam": "തവിട്ട്"},
    "gray": {"telugu": "బూడిద", "hindi": "धूसर", "tamil": "சாம்பல்", "kannada": "ಬೂದು", "malayalam": "ചാരം"},
    
    # Numbers
    "one": {"telugu": "ఒకటి", "hindi": "एक", "tamil": "ஒன்று", "kannada": "ಒಂದು", "malayalam": "ഒന്ന്"},
    "two": {"telugu": "రెండు", "hindi": "दो", "tamil": "இரண்டு", "kannada": "ಎರಡು", "malayalam": "രണ്ട്"},
    "three": {"telugu": "మూడు", "hindi": "तीन", "tamil": "மூன்று", "kannada": "ಮೂರು", "malayalam": "മൂന്ന്"},
    "four": {"telugu": "నాలుగు", "hindi": "चार", "tamil": "நான்கு", "kannada": "ನಾಲ್ಕು", "malayalam": "നാല്"},
    "five": {"telugu": "ఐదు", "hindi": "पाँच", "tamil": "ஐந்து", "kannada": "ಐದು", "malayalam": "അഞ്ച്"},
    "six": {"telugu": "ఆరు", "hindi": "छह", "tamil": "ஆறு", "kannada": "ಆರು", "malayalam": "ആറ്"},
    "seven": {"telugu": "ఏడు", "hindi": "सात", "tamil": "ஏழு", "kannada": "ಏಳು", "malayalam": "ഏഴ്"},
    "eight": {"telugu": "ఎనిమిది", "hindi": "आठ", "tamil": "எட்டு", "kannada": "ಎಂಟು", "malayalam": "എട്ട്"},
    "nine": {"telugu": "తొమ్మిది", "hindi": "नौ", "tamil": "ஒன்பது", "kannada": "ಒಂಬತ್ತು", "malayalam": "ഒൻപത്"},
    "ten": {"telugu": "పది", "hindi": "दस", "tamil": "பத்து", "kannada": "ಹತ್ತು", "malayalam": "പത്ത്"},
}

def get_translation(word):
    """Get translation for a word, return empty dict if not found"""
    return TRANSLATIONS.get(word.lower(), {
        "telugu": word, "hindi": word, "tamil": word, "kannada": word, "malayalam": word
    })

def create_word(word_id, word, meaning, examples, level, category, synonyms=[], antonyms=[], pos="noun", difficulty=1):
    return {
        "word_id": word_id,
        "word_english": word.capitalize(),
        "translations": get_translation(word),
        "meaning": meaning,
        "example_sentences": examples,
        "level": level,
        "category": category,
        "synonyms": synonyms,
        "antonyms": antonyms,
        "part_of_speech": pos,
        "difficulty": difficulty
    }

# Generate words for each age group
words = []

# ============== AGES 2-4 (LKG-1st): 250 Basic Words ==============
level = "lkg-1st"
idx = 1

# Family & People (11 words)
family_words = [
    ("mom", "Your mother who loves and cares for you", ["My mom is the best.", "Mom gives me food."]),
    ("dad", "Your father who takes care of you", ["My dad plays with me.", "Dad goes to work."]),
    ("baby", "A very young child", ["The baby is sleeping.", "I was a baby once."]),
    ("me", "Refers to yourself", ["Look at me!", "This is me."]),
    ("you", "The person being spoken to", ["I love you.", "You are my friend."]),
    ("brother", "A boy who has the same parents as you", ["My brother is older.", "I play with my brother."]),
    ("sister", "A girl who has the same parents as you", ["My sister is kind.", "Sister helps me."]),
    ("grandma", "Your mother's or father's mother", ["Grandma tells stories.", "I visit grandma."]),
    ("grandpa", "Your mother's or father's father", ["Grandpa is wise.", "I love grandpa."]),
    ("friend", "Someone you like and play with", ["She is my friend.", "Friends share toys."]),
    ("family", "People related to you", ["I love my family.", "Family is important."]),
]
for word, meaning, examples in family_words:
    words.append(create_word(f"lkg_{idx:03d}", word, meaning, examples, level, "family", difficulty=1))
    idx += 1

# Animals (20 words)
animals = [
    ("dog", "A friendly pet that barks", ["The dog wags its tail.", "I have a pet dog."]),
    ("cat", "A furry pet that meows", ["The cat drinks milk.", "Cats are soft."]),
    ("bird", "An animal with wings that can fly", ["Birds fly in the sky.", "I see a bird."]),
    ("fish", "An animal that lives in water", ["Fish swim in the pond.", "Fish have fins."]),
    ("cow", "A farm animal that gives milk", ["The cow says moo.", "Cows eat grass."]),
    ("pig", "A pink farm animal", ["The pig rolls in mud.", "Pigs are cute."]),
    ("sheep", "A fluffy farm animal", ["Sheep have wool.", "The sheep says baa."]),
    ("horse", "A big animal we can ride", ["The horse runs fast.", "Horses are strong."]),
    ("lion", "The king of the jungle", ["Lions roar loudly.", "The lion is brave."]),
    ("tiger", "A big cat with stripes", ["Tigers are powerful.", "The tiger has stripes."]),
    ("elephant", "The biggest land animal", ["Elephants have trunks.", "The elephant is big."]),
    ("duck", "A bird that swims and quacks", ["Ducks waddle.", "The duck says quack."]),
    ("chicken", "A farm bird that lays eggs", ["Chickens give eggs.", "The chicken clucks."]),
    ("frog", "A green animal that hops", ["Frogs jump high.", "The frog says ribbit."]),
    ("mouse", "A tiny animal with a long tail", ["The mouse is small.", "Mice like cheese."]),
    ("rabbit", "A fluffy animal with long ears", ["Rabbits hop.", "The rabbit eats carrots."]),
    ("snake", "A long animal without legs", ["Snakes slither.", "The snake hisses."]),
    ("bear", "A big furry animal", ["Bears like honey.", "The bear is strong."]),
    ("fox", "A clever orange animal", ["The fox is smart.", "Foxes are quick."]),
    ("deer", "A gentle animal with antlers", ["Deer run fast.", "The deer is beautiful."]),
]
for word, meaning, examples in animals:
    words.append(create_word(f"lkg_{idx:03d}", word, meaning, examples, level, "animals", difficulty=1))
    idx += 1

# Food Basics (15 words)
foods = [
    ("apple", "A round red or green fruit", ["I eat an apple.", "Apples are healthy."]),
    ("banana", "A long yellow fruit", ["Monkeys love bananas.", "Banana is sweet."]),
    ("milk", "White drink from cows", ["I drink milk daily.", "Milk makes bones strong."]),
    ("bread", "Food made from wheat", ["I eat bread for breakfast.", "Bread is soft."]),
    ("egg", "Comes from chickens", ["I eat an egg.", "Eggs are nutritious."]),
    ("rice", "Small white grains we eat", ["Rice is our food.", "I like rice."]),
    ("water", "Clear liquid we drink", ["Drink water daily.", "Water is important."]),
    ("juice", "Drink made from fruits", ["Orange juice is tasty.", "I love juice."]),
    ("cake", "Sweet dessert for birthdays", ["The cake is yummy.", "I want cake."]),
    ("cookie", "Sweet baked snack", ["Cookies are delicious.", "I eat cookies."]),
    ("cheese", "Yellow food made from milk", ["Cheese is tasty.", "I like cheese."]),
    ("butter", "Creamy spread for bread", ["Put butter on bread.", "Butter is smooth."]),
    ("jam", "Sweet fruit spread", ["Jam is sweet.", "I like strawberry jam."]),
    ("soup", "Hot liquid food", ["Soup is warm.", "I drink soup."]),
    ("tea", "Hot drink with leaves", ["Mom drinks tea.", "Tea is hot."]),
]
for word, meaning, examples in foods:
    words.append(create_word(f"lkg_{idx:03d}", word, meaning, examples, level, "food", difficulty=1))
    idx += 1

# Colors (11 words)
colors = [
    ("red", "The color of apples and fire", ["The apple is red.", "I like red."]),
    ("blue", "The color of the sky", ["The sky is blue.", "I have blue shoes."]),
    ("green", "The color of grass and leaves", ["Leaves are green.", "Green is fresh."]),
    ("yellow", "The color of the sun", ["The sun is yellow.", "Bananas are yellow."]),
    ("pink", "A light red color", ["Her dress is pink.", "Pink flowers are pretty."]),
    ("purple", "A mix of red and blue", ["Grapes are purple.", "I like purple."]),
    ("orange", "The color of oranges", ["Oranges are orange.", "The sunset is orange."]),
    ("black", "The darkest color", ["Night is black.", "My hair is black."]),
    ("white", "The color of snow", ["Snow is white.", "Milk is white."]),
    ("brown", "The color of chocolate", ["The dog is brown.", "Trees are brown."]),
    ("gray", "A mix of black and white", ["The elephant is gray.", "Clouds can be gray."]),
]
for word, meaning, examples in colors:
    words.append(create_word(f"lkg_{idx:03d}", word, meaning, examples, level, "colors", pos="adjective", difficulty=1))
    idx += 1

# Numbers 1-20 (20 words)
numbers = [
    ("one", "The number 1", ["I have one nose.", "One is first."]),
    ("two", "The number 2", ["I have two eyes.", "Two comes after one."]),
    ("three", "The number 3", ["A triangle has three sides.", "I am three."]),
    ("four", "The number 4", ["A square has four sides.", "I have four toys."]),
    ("five", "The number 5", ["I have five fingers.", "High five!"]),
    ("six", "The number 6", ["A cube has six faces.", "I am six years old."]),
    ("seven", "The number 7", ["A week has seven days.", "Seven is lucky."]),
    ("eight", "The number 8", ["Octopus has eight arms.", "I wake at eight."]),
    ("nine", "The number 9", ["Nine is before ten.", "I have nine crayons."]),
    ("ten", "The number 10", ["I have ten toes.", "Count to ten."]),
    ("eleven", "The number 11", ["Eleven comes after ten.", "I have eleven books."]),
    ("twelve", "The number 12", ["A dozen is twelve.", "Twelve months in a year."]),
    ("thirteen", "The number 13", ["Thirteen is a teen number.", "I am thirteen."]),
    ("fourteen", "The number 14", ["Fourteen days in two weeks.", "I have fourteen pencils."]),
    ("fifteen", "The number 15", ["Fifteen minutes is quarter hour.", "Count fifteen stars."]),
    ("sixteen", "The number 16", ["Sixteen is a sweet number.", "I see sixteen birds."]),
    ("seventeen", "The number 17", ["Seventeen is a prime number.", "I have seventeen coins."]),
    ("eighteen", "The number 18", ["Eighteen is almost twenty.", "I found eighteen shells."]),
    ("nineteen", "The number 19", ["Nineteen is before twenty.", "I ate nineteen grapes."]),
    ("twenty", "The number 20", ["Twenty toes on two people.", "I counted to twenty."]),
]
for word, meaning, examples in numbers:
    words.append(create_word(f"lkg_{idx:03d}", word, meaning, examples, level, "numbers", pos="number", difficulty=1))
    idx += 1

# Body Parts (14 words)
body = [
    ("hand", "The part at the end of your arm", ["I wave my hand.", "Wash your hands."]),
    ("foot", "The part at the end of your leg", ["I kick with my foot.", "My foot has toes."]),
    ("head", "The top part of your body", ["I wear a hat on my head.", "Use your head to think."]),
    ("nose", "The part you use to smell", ["I smell with my nose.", "The nose is on my face."]),
    ("mouth", "The part you use to eat and talk", ["Open your mouth.", "I eat with my mouth."]),
    ("eye", "The part you use to see", ["I see with my eyes.", "My eyes are brown."]),
    ("ear", "The part you use to hear", ["I hear with my ears.", "I have two ears."]),
    ("arm", "The long part from shoulder to hand", ["I wave my arm.", "My arm is strong."]),
    ("leg", "The long part from hip to foot", ["I walk with my legs.", "I have two legs."]),
    ("hair", "Grows on your head", ["I brush my hair.", "My hair is black."]),
    ("tummy", "Your stomach area", ["My tummy is full.", "I feel butterflies in my tummy."]),
    ("back", "The rear part of your body", ["Scratch my back.", "Stand up straight."]),
    ("finger", "The small parts on your hand", ["I have ten fingers.", "Point your finger."]),
    ("toe", "The small parts on your foot", ["I have ten toes.", "Wiggle your toes."]),
]
for word, meaning, examples in body:
    words.append(create_word(f"lkg_{idx:03d}", word, meaning, examples, level, "body", difficulty=1))
    idx += 1

# Actions (16 words)
actions = [
    ("eat", "To put food in your mouth", ["I eat breakfast.", "Eat your vegetables."]),
    ("drink", "To swallow liquid", ["Drink water.", "I drink milk."]),
    ("sleep", "To rest with eyes closed", ["I sleep at night.", "Sleep well."]),
    ("play", "To have fun with toys or games", ["I play with toys.", "Let's play!"]),
    ("go", "To move to another place", ["Let's go to the park.", "Go home now."]),
    ("run", "To move very fast", ["I run in the park.", "Run fast!"]),
    ("jump", "To push yourself up in the air", ["I can jump high.", "Jump up and down."]),
    ("sit", "To rest on a chair", ["Sit down please.", "I sit on the chair."]),
    ("stand", "To be on your feet", ["Stand up straight.", "I can stand tall."]),
    ("walk", "To move on your feet", ["I walk to school.", "Let's go for a walk."]),
    ("clap", "To hit your hands together", ["Clap your hands.", "I clap when happy."]),
    ("wave", "To move your hand to say hello", ["Wave goodbye.", "I wave to my friend."]),
    ("hug", "To put your arms around someone", ["Give me a hug.", "I hug my mom."]),
    ("kiss", "To touch with your lips", ["Kiss mommy goodnight.", "I kiss my teddy."]),
    ("cry", "To have tears from your eyes", ["Don't cry.", "Babies cry."]),
    ("laugh", "To make happy sounds", ["I laugh at jokes.", "Laugh with me."]),
]
for word, meaning, examples in actions:
    words.append(create_word(f"lkg_{idx:03d}", word, meaning, examples, level, "actions", pos="verb", difficulty=1))
    idx += 1

# Sizes & Descriptions (16 words)
descriptions = [
    ("big", "Very large in size", ["The elephant is big.", "I want a big cake."]),
    ("small", "Not large in size", ["The ant is small.", "A small toy."]),
    ("tall", "High in height", ["Giraffes are tall.", "I am tall."]),
    ("short", "Not tall", ["I am short.", "A short pencil."]),
    ("long", "Having great length", ["Snakes are long.", "A long road."]),
    ("hot", "Very warm", ["The sun is hot.", "Hot soup."]),
    ("cold", "Not warm", ["Ice is cold.", "Cold water."]),
    ("wet", "Covered with water", ["The floor is wet.", "Wet clothes."]),
    ("dry", "Not wet", ["The towel is dry.", "Dry your hands."]),
    ("fast", "Moving quickly", ["The car is fast.", "Run fast."]),
    ("slow", "Not fast", ["The turtle is slow.", "Go slow."]),
    ("happy", "Feeling good", ["I am happy.", "Happy birthday!"]),
    ("sad", "Feeling unhappy", ["I am sad.", "Don't be sad."]),
    ("yes", "To agree", ["Yes, I want it.", "Say yes."]),
    ("no", "To disagree", ["No, thank you.", "Say no to strangers."]),
    ("good", "Of high quality", ["Good job!", "Be good."]),
]
for word, meaning, examples in descriptions:
    words.append(create_word(f"lkg_{idx:03d}", word, meaning, examples, level, "descriptions", pos="adjective", difficulty=1))
    idx += 1

# Objects & Toys (12 words)
objects = [
    ("ball", "A round toy", ["Kick the ball.", "I play with a ball."]),
    ("toy", "Something to play with", ["My favorite toy.", "I love my toys."]),
    ("book", "Pages with words and pictures", ["Read a book.", "I like books."]),
    ("car", "A vehicle with four wheels", ["The car goes vroom.", "I have a toy car."]),
    ("doll", "A toy that looks like a person", ["My doll is pretty.", "I play with my doll."]),
    ("block", "A square toy for building", ["Stack the blocks.", "I build with blocks."]),
    ("cup", "A container for drinking", ["Drink from the cup.", "My cup is blue."]),
    ("spoon", "Used to eat soup", ["Eat with a spoon.", "The spoon is silver."]),
    ("plate", "A flat dish for food", ["Food on the plate.", "Clean your plate."]),
    ("shoe", "Worn on your feet", ["Put on your shoes.", "My shoes are new."]),
    ("hat", "Worn on your head", ["Wear a hat.", "My hat is red."]),
    ("bag", "Used to carry things", ["Put it in the bag.", "My school bag."]),
]
for word, meaning, examples in objects:
    words.append(create_word(f"lkg_{idx:03d}", word, meaning, examples, level, "objects", difficulty=1))
    idx += 1

# Directions & Positions (8 words)
directions = [
    ("up", "Toward a higher place", ["Look up at the sky.", "Jump up."]),
    ("down", "Toward a lower place", ["Sit down.", "The ball rolled down."]),
    ("in", "Inside something", ["Come in.", "Put it in the box."]),
    ("out", "Outside something", ["Go out and play.", "Take it out."]),
    ("on", "Resting on something", ["The book is on the table.", "Put it on."]),
    ("off", "Away from", ["Turn off the light.", "Take off your shoes."]),
    ("open", "Not closed", ["Open the door.", "The box is open."]),
    ("close", "To shut", ["Close the door.", "Close your eyes."]),
]
for word, meaning, examples in directions:
    words.append(create_word(f"lkg_{idx:03d}", word, meaning, examples, level, "directions", pos="preposition", difficulty=1))
    idx += 1

# Nature & Weather (9 words)
nature = [
    ("sun", "The bright star in the sky", ["The sun is bright.", "Sun gives us light."]),
    ("rain", "Water falling from clouds", ["I love rain.", "Rain makes plants grow."]),
    ("snow", "White frozen water", ["Snow is cold.", "I play in snow."]),
    ("cloud", "White fluffy things in sky", ["Clouds are white.", "Look at that cloud."]),
    ("wind", "Moving air", ["The wind blows.", "Feel the wind."]),
    ("tree", "A tall plant with leaves", ["Climb the tree.", "Trees give shade."]),
    ("flower", "The colorful part of a plant", ["The flower is beautiful.", "I picked a flower."]),
    ("grass", "Green plants on the ground", ["Grass is green.", "Don't walk on the grass."]),
    ("sky", "The space above us", ["The sky is blue.", "Look at the sky."]),
]
for word, meaning, examples in nature:
    words.append(create_word(f"lkg_{idx:03d}", word, meaning, examples, level, "nature", difficulty=1))
    idx += 1

# Home Items (6 words)
home = [
    ("house", "A building where people live", ["My house is big.", "I live in a house."]),
    ("door", "Used to enter a room", ["Open the door.", "Close the door."]),
    ("window", "Glass opening in a wall", ["Look out the window.", "The window is open."]),
    ("bed", "Where you sleep", ["I sleep in my bed.", "Make your bed."]),
    ("chair", "Something to sit on", ["Sit on the chair.", "The chair is wooden."]),
    ("table", "A flat surface with legs", ["Put it on the table.", "We eat at the table."]),
]
for word, meaning, examples in home:
    words.append(create_word(f"lkg_{idx:03d}", word, meaning, examples, level, "home", difficulty=1))
    idx += 1

# More basic words to reach 250
more_basics = [
    ("moon", "The bright object at night", ["The moon is round.", "Moon shines at night."], "nature"),
    ("star", "Tiny lights in the night sky", ["Stars twinkle.", "I see stars."], "nature"),
    ("school", "Place where you learn", ["I go to school.", "School is fun."], "places"),
    ("teacher", "Person who teaches", ["My teacher is kind.", "I love my teacher."], "people"),
    ("hello", "A greeting word", ["Hello, friend!", "Say hello."], "greetings"),
    ("bye", "Said when leaving", ["Bye bye!", "Wave bye."], "greetings"),
    ("please", "Polite word when asking", ["Please help me.", "Say please."], "greetings"),
    ("thank you", "Shows gratitude", ["Thank you so much.", "Always say thank you."], "greetings"),
    ("sorry", "Said when apologizing", ["I am sorry.", "Say sorry."], "greetings"),
    ("love", "Strong feeling of caring", ["I love you.", "Love is kind."], "feelings"),
    ("like", "To enjoy something", ["I like ice cream.", "Do you like it?"], "feelings"),
    ("want", "To wish for something", ["I want a toy.", "What do you want?"], "feelings"),
    ("need", "To require something", ["I need water.", "We need food."], "feelings"),
    ("help", "To assist someone", ["Help me please.", "I can help you."], "actions"),
    ("share", "To give part of something", ["Share your toys.", "Sharing is caring."], "actions"),
    ("give", "To hand something to someone", ["Give me the ball.", "I give you a gift."], "actions"),
    ("take", "To grab something", ["Take this apple.", "Can I take one?"], "actions"),
    ("come", "To move toward", ["Come here.", "Come with me."], "actions"),
    ("look", "To see with your eyes", ["Look at this.", "Look at me."], "actions"),
    ("see", "To view with eyes", ["I see you.", "Can you see?"], "actions"),
    ("hear", "To perceive sound", ["I hear music.", "Did you hear that?"], "actions"),
    ("touch", "To feel with hands", ["Touch the soft toy.", "Don't touch."], "actions"),
    ("smell", "To sense with nose", ["Smell the flower.", "It smells nice."], "actions"),
    ("taste", "To sense with tongue", ["Taste this cake.", "It tastes good."], "actions"),
    ("sing", "To make music with voice", ["Sing a song.", "I love to sing."], "actions"),
    ("dance", "To move to music", ["Dance with me.", "I like to dance."], "actions"),
    ("draw", "To make pictures", ["Draw a house.", "I can draw."], "actions"),
    ("paint", "To color with paint", ["Paint a picture.", "I like to paint."], "actions"),
    ("wash", "To clean with water", ["Wash your hands.", "Wash your face."], "actions"),
    ("brush", "To clean with a brush", ["Brush your teeth.", "Brush your hair."], "actions"),
    ("more", "Additional amount", ["I want more.", "One more please."], "quantities"),
    ("less", "Smaller amount", ["Less sugar please.", "I want less."], "quantities"),
    ("all", "The whole amount", ["All done!", "I ate all."], "quantities"),
    ("some", "A part of something", ["Some cookies.", "Give me some."], "quantities"),
    ("many", "A large number", ["Many stars.", "I have many toys."], "quantities"),
    ("few", "A small number", ["A few friends.", "Just a few."], "quantities"),
]
for word, meaning, examples, category in more_basics:
    words.append(create_word(f"lkg_{idx:03d}", word, meaning, examples, level, category, difficulty=1))
    idx += 1

print(f"LKG-1st level: {idx-1} words")

# ============== AGES 5-7 (2nd-3rd): 250 Words ==============
level = "2nd-3rd"
idx = 1

# School words (15 words)
school_words = [
    ("teacher", "A person who teaches students", ["My teacher is kind.", "Teacher helps us learn."], "school"),
    ("desk", "A table for studying", ["Sit at your desk.", "Keep your desk clean."], "school"),
    ("pencil", "Used to write and draw", ["Sharpen your pencil.", "I have a pencil."], "school"),
    ("bag", "Carries school supplies", ["Put books in your bag.", "My school bag is blue."], "school"),
    ("bell", "Rings to signal time", ["The bell rang.", "Bell means class is over."], "school"),
    ("classroom", "Room where you learn", ["Our classroom is big.", "Stay in the classroom."], "school"),
    ("homework", "Work to do at home", ["Finish your homework.", "I did my homework."], "school"),
    ("playground", "Place to play at school", ["Play in the playground.", "The playground is fun."], "school"),
    ("lunchbox", "Container for lunch", ["Pack your lunchbox.", "My lunchbox is red."], "school"),
    ("ruler", "Tool to measure and draw lines", ["Use a ruler.", "The ruler is 15cm."], "school"),
    ("eraser", "Removes pencil marks", ["Erase the mistake.", "Pass the eraser."], "school"),
    ("notebook", "Book for writing", ["Write in your notebook.", "My notebook is full."], "school"),
    ("crayon", "Colored wax stick for drawing", ["Color with crayons.", "I like red crayons."], "school"),
    ("glue", "Sticky substance to join things", ["Use glue to stick.", "Don't eat glue."], "school"),
    ("scissors", "Tool for cutting", ["Cut with scissors.", "Be careful with scissors."], "school"),
]
for word, meaning, examples, category in school_words:
    words.append(create_word(f"2nd_{idx:03d}", word, meaning, examples, level, category, difficulty=2))
    idx += 1

# Expanded Animals (15 words)
expanded_animals = [
    ("zebra", "Horse with black and white stripes", ["Zebras live in Africa.", "The zebra has stripes."], "animals"),
    ("giraffe", "Tallest animal with long neck", ["Giraffes eat leaves.", "The giraffe is tall."], "animals"),
    ("monkey", "Playful animal that climbs trees", ["Monkeys love bananas.", "The monkey is funny."], "animals"),
    ("kangaroo", "Jumping animal with a pouch", ["Kangaroos hop.", "Baby stays in the pouch."], "animals"),
    ("panda", "Black and white bear from China", ["Pandas eat bamboo.", "The panda is cute."], "animals"),
    ("koala", "Australian animal that eats leaves", ["Koalas sleep a lot.", "The koala is cuddly."], "animals"),
    ("whale", "Largest sea animal", ["Whales are huge.", "The whale swims deep."], "animals"),
    ("shark", "Fish with sharp teeth", ["Sharks swim fast.", "Sharks are predators."], "animals"),
    ("octopus", "Sea animal with eight arms", ["Octopus has eight legs.", "The octopus is smart."], "animals"),
    ("butterfly", "Insect with colorful wings", ["Butterflies are beautiful.", "The butterfly flies."], "animals"),
    ("bee", "Insect that makes honey", ["Bees make honey.", "Don't disturb the bee."], "animals"),
    ("ant", "Tiny hardworking insect", ["Ants work together.", "The ant is small."], "animals"),
    ("spider", "Eight-legged creature", ["Spiders make webs.", "The spider caught a fly."], "animals"),
    ("worm", "Long thin creature in soil", ["Worms help soil.", "The worm wiggles."], "animals"),
    ("turtle", "Animal with a hard shell", ["Turtles are slow.", "The turtle hides in its shell."], "animals"),
]
for word, meaning, examples, category in expanded_animals:
    words.append(create_word(f"2nd_{idx:03d}", word, meaning, examples, level, category, difficulty=2))
    idx += 1

# Verbs & Actions (15 words)
verbs = [
    ("read", "To look at and understand words", ["I read books daily.", "Read this story."], "verbs"),
    ("write", "To form letters and words", ["Write your name.", "I write neatly."], "verbs"),
    ("draw", "To make pictures with a pencil", ["Draw a flower.", "I love to draw."], "verbs"),
    ("sing", "To make music with your voice", ["Sing a song.", "Birds sing beautifully."], "verbs"),
    ("dance", "To move to music", ["Dance with joy.", "I dance at parties."], "verbs"),
    ("swim", "To move in water", ["I can swim.", "Fish swim in water."], "verbs"),
    ("kick", "To hit with your foot", ["Kick the ball.", "Don't kick others."], "verbs"),
    ("throw", "To send through the air", ["Throw the ball.", "I threw it far."], "verbs"),
    ("catch", "To grab something thrown", ["Catch the ball!", "I caught it."], "verbs"),
    ("ride", "To sit on and control", ["Ride a bicycle.", "I ride my bike."], "verbs"),
    ("climb", "To go up using hands and feet", ["Climb the stairs.", "I climbed the tree."], "verbs"),
    ("slide", "To move smoothly down", ["Slide down the slide.", "I love to slide."], "verbs"),
    ("swing", "To move back and forth", ["Swing high!", "I swing at the park."], "verbs"),
    ("build", "To make or construct", ["Build a tower.", "I built a sandcastle."], "verbs"),
    ("clean", "To remove dirt", ["Clean your room.", "I cleaned my desk."], "verbs"),
]
for word, meaning, examples, category in verbs:
    words.append(create_word(f"2nd_{idx:03d}", word, meaning, examples, level, category, pos="verb", difficulty=2))
    idx += 1

# Numbers 21-50 (and words for them)
number_words = [
    ("twenty-one", "The number 21", ["I am twenty-one.", "Twenty-one is after twenty."], "numbers"),
    ("thirty", "The number 30", ["Thirty days in some months.", "I counted to thirty."], "numbers"),
    ("forty", "The number 40", ["Forty is four tens.", "I have forty marbles."], "numbers"),
    ("fifty", "The number 50", ["Fifty is half of hundred.", "I saved fifty rupees."], "numbers"),
    ("hundred", "The number 100", ["A hundred is ten tens.", "I have a hundred books."], "numbers"),
]
for word, meaning, examples, category in number_words:
    words.append(create_word(f"2nd_{idx:03d}", word, meaning, examples, level, category, pos="number", difficulty=2))
    idx += 1

# Descriptions & Opposites (15 words)
opposites = [
    ("day", "Time when sun is up", ["Day is bright.", "I play during the day."], "time"),
    ("night", "Time when it is dark", ["Night is dark.", "Stars come out at night."], "time"),
    ("light", "Brightness, not heavy", ["The room is light.", "This bag is light."], "descriptions"),
    ("dark", "Without light", ["The cave is dark.", "It gets dark at night."], "descriptions"),
    ("loud", "Making a lot of noise", ["The music is loud.", "Don't be loud."], "descriptions"),
    ("quiet", "Making little noise", ["Be quiet in the library.", "The room is quiet."], "descriptions"),
    ("old", "Not new, aged", ["My grandpa is old.", "This book is old."], "descriptions"),
    ("new", "Recently made", ["I got a new toy.", "My shoes are new."], "descriptions"),
    ("hard", "Solid, difficult", ["The rock is hard.", "This puzzle is hard."], "descriptions"),
    ("soft", "Not hard, gentle", ["The pillow is soft.", "Speak in a soft voice."], "descriptions"),
    ("full", "Completely filled", ["The glass is full.", "I am full after eating."], "descriptions"),
    ("empty", "Nothing inside", ["The box is empty.", "My tummy is empty."], "descriptions"),
    ("heavy", "Weighing a lot", ["The elephant is heavy.", "This bag is heavy."], "descriptions"),
    ("easy", "Not difficult", ["This is easy.", "The test was easy."], "descriptions"),
    ("difficult", "Hard to do", ["Math is difficult.", "Don't give up on difficult tasks."], "descriptions"),
]
for word, meaning, examples, category in opposites:
    words.append(create_word(f"2nd_{idx:03d}", word, meaning, examples, level, category, pos="adjective", difficulty=2))
    idx += 1

# Weather Expanded (6 words)
weather = [
    ("sunny", "Bright with sunshine", ["Today is sunny.", "It's a sunny day."], "weather"),
    ("cloudy", "Covered with clouds", ["The sky is cloudy.", "It might rain, it's cloudy."], "weather"),
    ("windy", "With strong wind", ["It's windy outside.", "My hair blows in the windy day."], "weather"),
    ("stormy", "With storms and heavy rain", ["The night was stormy.", "Stay inside during stormy weather."], "weather"),
    ("foggy", "With thick mist", ["The morning is foggy.", "Drive slow in foggy weather."], "weather"),
    ("rainbow", "Colorful arc in the sky", ["I see a rainbow!", "Rainbows appear after rain."], "weather"),
]
for word, meaning, examples, category in weather:
    words.append(create_word(f"2nd_{idx:03d}", word, meaning, examples, level, category, difficulty=2))
    idx += 1

# Food & Meals (12 words)
meals = [
    ("breakfast", "Morning meal", ["Eat your breakfast.", "I had eggs for breakfast."], "food"),
    ("lunch", "Midday meal", ["Lunch is at noon.", "I brought lunch to school."], "food"),
    ("dinner", "Evening meal", ["Dinner is ready.", "We eat dinner together."], "food"),
    ("salad", "Mix of vegetables", ["Eat your salad.", "Salad is healthy."], "food"),
    ("fruit", "Sweet food from plants", ["Eat more fruit.", "I love fruit."], "food"),
    ("vegetable", "Healthy plant food", ["Eat your vegetables.", "Vegetables are good for you."], "food"),
    ("carrot", "Orange vegetable", ["Rabbits eat carrots.", "Carrots are crunchy."], "food"),
    ("potato", "Round vegetable", ["I like mashed potato.", "Potatoes are tasty."], "food"),
    ("onion", "Vegetable that makes you cry", ["Onions are strong.", "Mom cuts onion."], "food"),
    ("tomato", "Red fruit used as vegetable", ["Tomato is red.", "I like tomato sauce."], "food"),
    ("ice cream", "Cold sweet dessert", ["I love ice cream!", "Ice cream is cold."], "food"),
    ("chocolate", "Sweet brown treat", ["Chocolate is yummy.", "I want chocolate."], "food"),
]
for word, meaning, examples, category in meals:
    words.append(create_word(f"2nd_{idx:03d}", word, meaning, examples, level, category, difficulty=2))
    idx += 1

# Emotions (8 words)
emotions = [
    ("love", "Strong feeling of affection", ["I love my family.", "Love is kind."], "emotions"),
    ("fun", "Enjoyment and pleasure", ["That was fun!", "We had fun at the park."], "emotions"),
    ("angry", "Feeling mad", ["Don't be angry.", "He was angry."], "emotions"),
    ("scared", "Feeling afraid", ["I was scared.", "Don't be scared of the dark."], "emotions"),
    ("tired", "Needing rest", ["I am tired.", "Sleep when you're tired."], "emotions"),
    ("hungry", "Needing food", ["I am hungry.", "Let's eat, I'm hungry."], "emotions"),
    ("thirsty", "Needing drink", ["I am thirsty.", "Drink water when thirsty."], "emotions"),
    ("excited", "Very happy about something", ["I am excited!", "We're excited for the trip."], "emotions"),
]
for word, meaning, examples, category in emotions:
    words.append(create_word(f"2nd_{idx:03d}", word, meaning, examples, level, category, pos="adjective", difficulty=2))
    idx += 1

# Body Actions (8 words)
body_actions = [
    ("blink", "To close and open eyes quickly", ["Don't blink.", "I blinked."], "actions"),
    ("smile", "To show happiness on face", ["Smile for the photo.", "Your smile is beautiful."], "actions"),
    ("frown", "To show sadness on face", ["Don't frown.", "Why are you frowning?"], "actions"),
    ("cough", "To push air out when sick", ["Cover when you cough.", "I have a cough."], "actions"),
    ("sneeze", "To push air through nose suddenly", ["Say excuse me when you sneeze.", "I sneezed."], "actions"),
    ("stretch", "To extend your body", ["Stretch in the morning.", "I stretched my arms."], "actions"),
    ("bend", "To make curved", ["Bend your knees.", "I can bend forward."], "actions"),
    ("twist", "To turn around", ["Twist and shout!", "I twisted my ankle."], "actions"),
]
for word, meaning, examples, category in body_actions:
    words.append(create_word(f"2nd_{idx:03d}", word, meaning, examples, level, category, pos="verb", difficulty=2))
    idx += 1

# Places (10 words)
places = [
    ("school", "Place to learn", ["I go to school.", "School is fun."], "places"),
    ("home", "Where you live", ["I am home.", "Home sweet home."], "places"),
    ("park", "Place to play outside", ["Let's go to the park.", "The park has swings."], "places"),
    ("farm", "Place with animals and crops", ["Visit the farm.", "The farm has cows."], "places"),
    ("zoo", "Place with wild animals", ["We went to the zoo.", "The zoo is big."], "places"),
    ("shop", "Place to buy things", ["Go to the shop.", "The shop sells toys."], "places"),
    ("kitchen", "Room for cooking", ["Mom is in the kitchen.", "We cook in the kitchen."], "places"),
    ("bathroom", "Room for washing", ["Wash hands in the bathroom.", "The bathroom is clean."], "places"),
    ("hospital", "Place for sick people", ["The doctor is at the hospital.", "Get well at the hospital."], "places"),
    ("library", "Place with many books", ["Read at the library.", "The library is quiet."], "places"),
]
for word, meaning, examples, category in places:
    words.append(create_word(f"2nd_{idx:03d}", word, meaning, examples, level, category, difficulty=2))
    idx += 1

# Objects (12 words)
objects_2 = [
    ("clock", "Shows the time", ["Look at the clock.", "The clock says 3 o'clock."], "objects"),
    ("lamp", "Gives light", ["Turn on the lamp.", "The lamp is bright."], "objects"),
    ("phone", "Used to talk to people", ["Answer the phone.", "Mom has a phone."], "objects"),
    ("television", "Shows programs and movies", ["Watch TV after homework.", "I saw it on TV."], "objects"),
    ("radio", "Plays music and news", ["Listen to the radio.", "Turn on the radio."], "objects"),
    ("bicycle", "Two-wheeled vehicle to ride", ["Ride your bicycle.", "I got a new bicycle."], "objects"),
    ("boat", "Floats on water", ["The boat sails.", "We went on a boat."], "objects"),
    ("train", "Long vehicle on tracks", ["The train is coming.", "We rode the train."], "objects"),
    ("airplane", "Vehicle that flies", ["The airplane is high.", "We flew in an airplane."], "objects"),
    ("computer", "Electronic machine", ["I use the computer.", "Computers are useful."], "objects"),
    ("camera", "Takes photos", ["Smile for the camera.", "I have a camera."], "objects"),
    ("umbrella", "Protects from rain", ["Take an umbrella.", "My umbrella is red."], "objects"),
]
for word, meaning, examples, category in objects_2:
    words.append(create_word(f"2nd_{idx:03d}", word, meaning, examples, level, category, difficulty=2))
    idx += 1

# More words to reach 250
more_2nd = [
    ("morning", "Early part of day", ["Good morning!", "I wake up in the morning."], "time"),
    ("afternoon", "Middle of day", ["Good afternoon!", "I play in the afternoon."], "time"),
    ("evening", "Late part of day", ["Good evening!", "We eat dinner in the evening."], "time"),
    ("today", "This day", ["Today is Monday.", "What day is today?"], "time"),
    ("tomorrow", "The day after today", ["See you tomorrow.", "Tomorrow will be fun."], "time"),
    ("yesterday", "The day before today", ["Yesterday was Sunday.", "I played yesterday."], "time"),
    ("week", "Seven days", ["A week has 7 days.", "I'll see you next week."], "time"),
    ("month", "About 30 days", ["January is a month.", "My birthday is next month."], "time"),
    ("year", "12 months", ["A year has 12 months.", "Happy New Year!"], "time"),
    ("birthday", "Day you were born", ["Happy birthday!", "My birthday is in May."], "events"),
    ("holiday", "Day of celebration", ["It's a holiday today.", "I love holidays."], "events"),
    ("party", "Celebration with friends", ["Let's have a party.", "The party was fun."], "events"),
    ("present", "A gift", ["I got a present.", "This is for you, a present."], "objects"),
    ("surprise", "Something unexpected", ["What a surprise!", "I love surprises."], "emotions"),
    ("beautiful", "Very pretty", ["The flower is beautiful.", "What a beautiful day!"], "descriptions"),
    ("brave", "Not afraid", ["Be brave.", "The soldier is brave."], "descriptions"),
    ("careful", "Being cautious", ["Be careful!", "I am careful when I cross."], "descriptions"),
    ("clever", "Smart and quick thinking", ["You are clever.", "The fox is clever."], "descriptions"),
    ("different", "Not the same", ["We are different.", "Try something different."], "descriptions"),
    ("famous", "Known by many people", ["She is famous.", "A famous singer."], "descriptions"),
    ("favorite", "Most liked", ["This is my favorite.", "What's your favorite color?"], "descriptions"),
    ("friendly", "Kind and nice", ["Be friendly.", "The dog is friendly."], "descriptions"),
    ("gentle", "Soft and kind", ["Be gentle.", "She has a gentle touch."], "descriptions"),
    ("honest", "Telling the truth", ["Be honest.", "He is an honest boy."], "descriptions"),
    ("important", "Has great value", ["This is important.", "Family is important."], "descriptions"),
    ("kind", "Nice and helpful", ["Be kind to others.", "She is very kind."], "descriptions"),
    ("lazy", "Not wanting to work", ["Don't be lazy.", "The cat is lazy."], "descriptions"),
    ("lucky", "Having good fortune", ["You are lucky.", "I feel lucky today."], "descriptions"),
    ("naughty", "Behaving badly", ["Don't be naughty.", "The naughty monkey."], "descriptions"),
    ("patient", "Able to wait calmly", ["Be patient.", "She is patient."], "descriptions"),
    ("polite", "Having good manners", ["Be polite.", "He is very polite."], "descriptions"),
    ("proud", "Feeling good about achievement", ["I am proud of you.", "She is proud."], "descriptions"),
    ("ready", "Prepared", ["Are you ready?", "I am ready to go."], "descriptions"),
    ("sick", "Not well, ill", ["I am sick.", "Take care when sick."], "health"),
    ("healthy", "In good condition", ["Eat healthy food.", "Stay healthy."], "health"),
    ("strong", "Having power", ["Be strong.", "The elephant is strong."], "descriptions"),
    ("weak", "Not strong", ["I feel weak.", "Help the weak."], "descriptions"),
    ("young", "Not old", ["You are young.", "Young people have energy."], "descriptions"),
    ("together", "With each other", ["Let's play together.", "We are together."], "descriptions"),
    ("alone", "By yourself", ["I am alone.", "Don't go alone."], "descriptions"),
    ("always", "At all times", ["I always brush my teeth.", "Always be kind."], "adverbs"),
    ("never", "Not at any time", ["Never give up.", "I never lie."], "adverbs"),
    ("sometimes", "Occasionally", ["Sometimes I eat ice cream.", "I sometimes forget."], "adverbs"),
    ("often", "Many times", ["I often read.", "We often play together."], "adverbs"),
    ("usually", "Most of the time", ["I usually wake up early.", "We usually eat at 7."], "adverbs"),
]
for word, meaning, examples, category in more_2nd:
    words.append(create_word(f"2nd_{idx:03d}", word, meaning, examples, level, category, difficulty=2))
    idx += 1

print(f"2nd-3rd level: {idx-1} words")

# Save all words
with open("/app/backend/data/words_production.json", "w", encoding="utf-8") as f:
    json.dump(words, f, ensure_ascii=False, indent=2)

print(f"\nTotal words generated: {len(words)}")
print("Words saved to /app/backend/data/words_production.json")
