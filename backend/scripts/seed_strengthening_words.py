"""
Seed 350 Strengthening Vocabulary Words
Ages 2-4: 50 Core Connectors & Blends -> lkg-1st
Ages 5-7: 75 Descriptive Synonyms & Opposites -> 2nd-3rd
Ages 8-10: 100 Multi-Meaning & Idioms -> 4th-5th
Ages 10-11: 125 Academic & Abstract -> 5th-adv
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# Ages 2-4: 50 Core Connectors & Blends (lkg-1st)
LKG_1ST_WORDS = [
    # Blend words (10)
    {"word": "Stop", "meaning": "To not move or end an action", "category": "blends", "examples": ["Stop the car!", "Please stop running."], "part_of_speech": "verb"},
    {"word": "Star", "meaning": "A bright object in the sky at night", "category": "blends", "examples": ["The star is shining.", "I see a star!"], "part_of_speech": "noun"},
    {"word": "Spin", "meaning": "To turn around and around quickly", "category": "blends", "examples": ["The top can spin.", "Spin around!"], "part_of_speech": "verb"},
    {"word": "Spot", "meaning": "A small mark or a place", "category": "blends", "examples": ["The dog has a spot.", "This is a nice spot."], "part_of_speech": "noun"},
    {"word": "Step", "meaning": "To move your foot forward", "category": "blends", "examples": ["Take one step.", "Step carefully."], "part_of_speech": "verb"},
    {"word": "Swim", "meaning": "To move through water", "category": "blends", "examples": ["Fish can swim.", "I like to swim."], "part_of_speech": "verb"},
    {"word": "Snap", "meaning": "To break with a sharp sound", "category": "blends", "examples": ["Snap your fingers!", "The twig will snap."], "part_of_speech": "verb"},
    {"word": "Black", "meaning": "A very dark color", "category": "blends", "examples": ["The cat is black.", "I have black shoes."], "part_of_speech": "adjective"},
    {"word": "Clap", "meaning": "To hit your hands together", "category": "blends", "examples": ["Clap your hands!", "Everyone will clap."], "part_of_speech": "verb"},
    {"word": "Flag", "meaning": "A piece of cloth with colors or symbols", "category": "blends", "examples": ["Wave the flag!", "Our flag is beautiful."], "part_of_speech": "noun"},
    
    # Rhymes (10)
    {"word": "Hat", "meaning": "Something you wear on your head", "category": "rhymes", "examples": ["I wear a hat.", "The hat is red."], "part_of_speech": "noun", "rhymes_with": "cat"},
    {"word": "Cat", "meaning": "A small furry pet that says meow", "category": "rhymes", "examples": ["The cat is soft.", "My cat plays."], "part_of_speech": "noun", "rhymes_with": "hat"},
    {"word": "Dog", "meaning": "A pet that barks and wags its tail", "category": "rhymes", "examples": ["The dog is happy.", "My dog runs fast."], "part_of_speech": "noun", "rhymes_with": "log"},
    {"word": "Log", "meaning": "A piece of wood from a tree", "category": "rhymes", "examples": ["Sit on the log.", "The log is big."], "part_of_speech": "noun", "rhymes_with": "dog"},
    {"word": "Big", "meaning": "Large in size", "category": "rhymes", "examples": ["The elephant is big.", "I want a big cake."], "part_of_speech": "adjective", "rhymes_with": "pig"},
    {"word": "Pig", "meaning": "A pink farm animal that oinks", "category": "rhymes", "examples": ["The pig is pink.", "Pigs like mud."], "part_of_speech": "noun", "rhymes_with": "big"},
    {"word": "Red", "meaning": "The color of apples and fire", "category": "rhymes", "examples": ["The apple is red.", "I like red."], "part_of_speech": "adjective", "rhymes_with": "bed"},
    {"word": "Bed", "meaning": "Where you sleep at night", "category": "rhymes", "examples": ["Go to bed.", "My bed is soft."], "part_of_speech": "noun", "rhymes_with": "red"},
    {"word": "Sun", "meaning": "The big bright ball in the sky", "category": "rhymes", "examples": ["The sun is hot.", "I love the sun."], "part_of_speech": "noun", "rhymes_with": "fun"},
    {"word": "Fun", "meaning": "Something enjoyable and happy", "category": "rhymes", "examples": ["Playing is fun!", "We had fun."], "part_of_speech": "noun", "rhymes_with": "sun"},
    
    # Connectors (10)
    {"word": "And", "meaning": "A word to join things together", "category": "connectors", "examples": ["Mom and Dad.", "Red and blue."], "part_of_speech": "conjunction"},
    {"word": "The", "meaning": "A word used before nouns", "category": "connectors", "examples": ["The cat is here.", "Give me the ball."], "part_of_speech": "article"},
    {"word": "Is", "meaning": "A word that tells about something", "category": "connectors", "examples": ["The sky is blue.", "She is happy."], "part_of_speech": "verb"},
    {"word": "Are", "meaning": "A word for more than one thing", "category": "connectors", "examples": ["They are friends.", "We are playing."], "part_of_speech": "verb"},
    {"word": "My", "meaning": "Something that belongs to me", "category": "connectors", "examples": ["My toy is red.", "This is my book."], "part_of_speech": "pronoun"},
    {"word": "Your", "meaning": "Something that belongs to you", "category": "connectors", "examples": ["Your turn now.", "Is this your bag?"], "part_of_speech": "pronoun"},
    {"word": "This", "meaning": "Points to something close", "category": "connectors", "examples": ["This is nice.", "I want this."], "part_of_speech": "pronoun"},
    {"word": "That", "meaning": "Points to something far", "category": "connectors", "examples": ["Look at that!", "That is big."], "part_of_speech": "pronoun"},
    {"word": "Here", "meaning": "In this place", "category": "connectors", "examples": ["Come here!", "I am here."], "part_of_speech": "adverb"},
    {"word": "There", "meaning": "In that place", "category": "connectors", "examples": ["Go there.", "Look over there!"], "part_of_speech": "adverb"},
    
    # Questions (4)
    {"word": "What", "meaning": "Asking about a thing", "category": "questions", "examples": ["What is this?", "What do you want?"], "part_of_speech": "pronoun"},
    {"word": "Where", "meaning": "Asking about a place", "category": "questions", "examples": ["Where are you?", "Where is the ball?"], "part_of_speech": "adverb"},
    {"word": "Who", "meaning": "Asking about a person", "category": "questions", "examples": ["Who is that?", "Who are you?"], "part_of_speech": "pronoun"},
    {"word": "Why", "meaning": "Asking for a reason", "category": "questions", "examples": ["Why are you sad?", "Why is the sky blue?"], "part_of_speech": "adverb"},
    
    # Daily boosters (16)
    {"word": "More", "meaning": "A bigger amount", "category": "daily", "examples": ["I want more!", "Give me more."], "part_of_speech": "adverb"},
    {"word": "All", "meaning": "Everything, the whole thing", "category": "daily", "examples": ["All done!", "I ate all."], "part_of_speech": "determiner"},
    {"word": "Gone", "meaning": "Not here anymore", "category": "daily", "examples": ["The bird is gone.", "All gone!"], "part_of_speech": "adjective"},
    {"word": "Come", "meaning": "To move toward someone", "category": "daily", "examples": ["Come here!", "Please come."], "part_of_speech": "verb"},
    {"word": "Look", "meaning": "To use your eyes to see", "category": "daily", "examples": ["Look at me!", "Look there!"], "part_of_speech": "verb"},
    {"word": "See", "meaning": "To notice with your eyes", "category": "daily", "examples": ["I see you!", "Can you see?"], "part_of_speech": "verb"},
    {"word": "Find", "meaning": "To discover something", "category": "daily", "examples": ["Find the ball!", "I will find it."], "part_of_speech": "verb"},
    {"word": "Give", "meaning": "To hand something to someone", "category": "daily", "examples": ["Give me that.", "I will give you."], "part_of_speech": "verb"},
    {"word": "Take", "meaning": "To get or grab something", "category": "daily", "examples": ["Take this.", "I will take it."], "part_of_speech": "verb"},
    {"word": "Help", "meaning": "To assist or aid someone", "category": "daily", "examples": ["Help me please!", "I will help you."], "part_of_speech": "verb"},
    {"word": "Want", "meaning": "To wish for something", "category": "daily", "examples": ["I want juice.", "Do you want this?"], "part_of_speech": "verb"},
    {"word": "Need", "meaning": "To require something", "category": "daily", "examples": ["I need help.", "We need food."], "part_of_speech": "verb"},
    {"word": "Like", "meaning": "To enjoy something", "category": "daily", "examples": ["I like this!", "Do you like it?"], "part_of_speech": "verb"},
    {"word": "Love", "meaning": "To care deeply about", "category": "daily", "examples": ["I love you!", "I love ice cream."], "part_of_speech": "verb"},
    {"word": "Play", "meaning": "To have fun with games", "category": "daily", "examples": ["Let's play!", "I want to play."], "part_of_speech": "verb"},
    {"word": "Go", "meaning": "To move from one place to another", "category": "daily", "examples": ["Let's go!", "Time to go."], "part_of_speech": "verb"},
]

# Ages 5-7: 75 Descriptive Synonyms & Opposites (2nd-3rd)
SECOND_THIRD_WORDS = [
    # Synonyms - Happy (4)
    {"word": "Happy", "meaning": "Feeling joy and pleasure", "category": "synonyms", "examples": ["I am happy today.", "She looks happy."], "part_of_speech": "adjective", "synonyms": ["joyful", "glad", "cheerful"]},
    {"word": "Joyful", "meaning": "Full of happiness", "category": "synonyms", "examples": ["A joyful song.", "She felt joyful."], "part_of_speech": "adjective", "synonyms": ["happy", "glad"]},
    {"word": "Glad", "meaning": "Pleased and happy", "category": "synonyms", "examples": ["I am glad to see you.", "She was glad."], "part_of_speech": "adjective", "synonyms": ["happy", "pleased"]},
    {"word": "Cheerful", "meaning": "Happy and positive", "category": "synonyms", "examples": ["A cheerful smile.", "Be cheerful!"], "part_of_speech": "adjective", "synonyms": ["happy", "bright"]},
    
    # Synonyms - Sad (4)
    {"word": "Sad", "meaning": "Feeling unhappy", "category": "synonyms", "examples": ["I feel sad.", "The movie was sad."], "part_of_speech": "adjective", "synonyms": ["upset", "gloomy", "blue"]},
    {"word": "Upset", "meaning": "Unhappy or worried", "category": "synonyms", "examples": ["Don't be upset.", "She looked upset."], "part_of_speech": "adjective", "synonyms": ["sad", "troubled"]},
    {"word": "Gloomy", "meaning": "Dark and sad", "category": "synonyms", "examples": ["A gloomy day.", "He felt gloomy."], "part_of_speech": "adjective", "synonyms": ["sad", "dark"]},
    {"word": "Blue", "meaning": "Feeling sad (not the color)", "category": "synonyms", "examples": ["Feeling blue today.", "Why so blue?"], "part_of_speech": "adjective", "synonyms": ["sad", "down"]},
    
    # Synonyms - Big (4)
    {"word": "Huge", "meaning": "Very very big", "category": "synonyms", "examples": ["A huge elephant.", "That's huge!"], "part_of_speech": "adjective", "synonyms": ["big", "giant"]},
    {"word": "Giant", "meaning": "Extremely large", "category": "synonyms", "examples": ["A giant tree.", "He's a giant!"], "part_of_speech": "adjective", "synonyms": ["huge", "enormous"]},
    {"word": "Large", "meaning": "Big in size", "category": "synonyms", "examples": ["A large house.", "That's large."], "part_of_speech": "adjective", "synonyms": ["big", "huge"]},
    {"word": "Enormous", "meaning": "Extremely big", "category": "synonyms", "examples": ["An enormous whale.", "It was enormous!"], "part_of_speech": "adjective", "synonyms": ["huge", "massive"]},
    
    # Synonyms - Small (4)
    {"word": "Tiny", "meaning": "Very very small", "category": "synonyms", "examples": ["A tiny ant.", "So tiny!"], "part_of_speech": "adjective", "synonyms": ["small", "little"]},
    {"word": "Little", "meaning": "Small in size", "category": "synonyms", "examples": ["A little bird.", "My little friend."], "part_of_speech": "adjective", "synonyms": ["small", "tiny"]},
    {"word": "Mini", "meaning": "Very small version", "category": "synonyms", "examples": ["A mini car.", "Mini size please."], "part_of_speech": "adjective", "synonyms": ["small", "tiny"]},
    {"word": "Petite", "meaning": "Small and delicate", "category": "synonyms", "examples": ["A petite flower.", "She is petite."], "part_of_speech": "adjective", "synonyms": ["small", "dainty"]},
    
    # Opposites (20)
    {"word": "Above", "meaning": "Higher than something", "category": "opposites", "examples": ["The bird is above.", "Look above you."], "part_of_speech": "preposition", "antonyms": ["below"]},
    {"word": "Below", "meaning": "Lower than something", "category": "opposites", "examples": ["The fish swims below.", "Look below."], "part_of_speech": "preposition", "antonyms": ["above"]},
    {"word": "Front", "meaning": "The forward part", "category": "opposites", "examples": ["Sit in front.", "The front door."], "part_of_speech": "noun", "antonyms": ["back"]},
    {"word": "Back", "meaning": "The rear part", "category": "opposites", "examples": ["Go to the back.", "My back hurts."], "part_of_speech": "noun", "antonyms": ["front"]},
    {"word": "Enter", "meaning": "To go inside", "category": "opposites", "examples": ["Enter the room.", "Please enter."], "part_of_speech": "verb", "antonyms": ["exit"]},
    {"word": "Exit", "meaning": "To go outside", "category": "opposites", "examples": ["Exit this way.", "Find the exit."], "part_of_speech": "verb", "antonyms": ["enter"]},
    {"word": "Push", "meaning": "To move away from you", "category": "opposites", "examples": ["Push the door.", "Don't push me!"], "part_of_speech": "verb", "antonyms": ["pull"]},
    {"word": "Pull", "meaning": "To move toward you", "category": "opposites", "examples": ["Pull the rope.", "Pull harder!"], "part_of_speech": "verb", "antonyms": ["push"]},
    {"word": "Win", "meaning": "To be successful in a game", "category": "opposites", "examples": ["I want to win!", "We will win."], "part_of_speech": "verb", "antonyms": ["lose"]},
    {"word": "Lose", "meaning": "To not win", "category": "opposites", "examples": ["Don't lose hope.", "We might lose."], "part_of_speech": "verb", "antonyms": ["win"]},
    
    # Time words (10)
    {"word": "Now", "meaning": "At this moment", "category": "time", "examples": ["Do it now!", "I am here now."], "part_of_speech": "adverb", "antonyms": ["then"]},
    {"word": "Then", "meaning": "At that time", "category": "time", "examples": ["What happened then?", "I was young then."], "part_of_speech": "adverb", "antonyms": ["now"]},
    {"word": "Soon", "meaning": "In a short time", "category": "time", "examples": ["See you soon!", "Coming soon."], "part_of_speech": "adverb", "antonyms": ["late"]},
    {"word": "Late", "meaning": "After the expected time", "category": "time", "examples": ["Don't be late!", "It's getting late."], "part_of_speech": "adjective", "antonyms": ["early"]},
    {"word": "Always", "meaning": "All the time", "category": "time", "examples": ["I always try.", "Always be kind."], "part_of_speech": "adverb", "antonyms": ["never"]},
    {"word": "Never", "meaning": "Not at any time", "category": "time", "examples": ["Never give up!", "I never lie."], "part_of_speech": "adverb", "antonyms": ["always"]},
    {"word": "First", "meaning": "Before all others", "category": "time", "examples": ["You go first.", "First place!"], "part_of_speech": "adjective", "antonyms": ["last"]},
    {"word": "Last", "meaning": "After all others", "category": "time", "examples": ["The last one.", "Who is last?"], "part_of_speech": "adjective", "antonyms": ["first"]},
    {"word": "Next", "meaning": "Coming after this", "category": "time", "examples": ["What's next?", "Next please!"], "part_of_speech": "adjective"},
    {"word": "Before", "meaning": "Earlier than", "category": "time", "examples": ["Before dinner.", "Think before you speak."], "part_of_speech": "preposition", "antonyms": ["after"]},
    
    # Quantity (10)
    {"word": "Many", "meaning": "A large number of", "category": "quantity", "examples": ["Many birds flew.", "So many!"], "part_of_speech": "determiner", "antonyms": ["few"]},
    {"word": "Few", "meaning": "A small number of", "category": "quantity", "examples": ["A few friends.", "Only few left."], "part_of_speech": "determiner", "antonyms": ["many"]},
    {"word": "Some", "meaning": "An amount of", "category": "quantity", "examples": ["Some water please.", "I have some."], "part_of_speech": "determiner", "antonyms": ["none"]},
    {"word": "None", "meaning": "Not any", "category": "quantity", "examples": ["None left.", "I have none."], "part_of_speech": "pronoun", "antonyms": ["all"]},
    {"word": "Enough", "meaning": "As much as needed", "category": "quantity", "examples": ["That's enough!", "Enough for all."], "part_of_speech": "determiner"},
    {"word": "Less", "meaning": "A smaller amount", "category": "quantity", "examples": ["Less sugar please.", "We have less."], "part_of_speech": "determiner", "antonyms": ["more"]},
    {"word": "Full", "meaning": "Completely filled", "category": "quantity", "examples": ["The glass is full.", "I'm full!"], "part_of_speech": "adjective", "antonyms": ["empty"]},
    {"word": "Empty", "meaning": "Nothing inside", "category": "quantity", "examples": ["The box is empty.", "Empty your pockets."], "part_of_speech": "adjective", "antonyms": ["full"]},
    {"word": "Every", "meaning": "Each one", "category": "quantity", "examples": ["Every day.", "Every person."], "part_of_speech": "determiner"},
    {"word": "Each", "meaning": "Every single one", "category": "quantity", "examples": ["Each child.", "One for each."], "part_of_speech": "determiner"},
    
    # Movement (13)
    {"word": "Fast", "meaning": "Moving quickly", "category": "movement", "examples": ["Run fast!", "A fast car."], "part_of_speech": "adjective", "synonyms": ["quick", "rapid"]},
    {"word": "Quick", "meaning": "Done in a short time", "category": "movement", "examples": ["Be quick!", "A quick look."], "part_of_speech": "adjective", "synonyms": ["fast", "speedy"]},
    {"word": "Slow", "meaning": "Not fast", "category": "movement", "examples": ["Go slow.", "A slow walk."], "part_of_speech": "adjective", "synonyms": ["gentle"]},
    {"word": "Gentle", "meaning": "Soft and careful", "category": "movement", "examples": ["Be gentle.", "A gentle touch."], "part_of_speech": "adjective"},
    {"word": "Jump", "meaning": "To push off the ground", "category": "movement", "examples": ["Jump high!", "I can jump."], "part_of_speech": "verb", "synonyms": ["leap", "hop"]},
    {"word": "Leap", "meaning": "To jump far", "category": "movement", "examples": ["Leap over it!", "A big leap."], "part_of_speech": "verb", "synonyms": ["jump"]},
    {"word": "Run", "meaning": "To move fast with legs", "category": "movement", "examples": ["Run fast!", "I love to run."], "part_of_speech": "verb", "synonyms": ["dash", "sprint"]},
    {"word": "Dash", "meaning": "To run very quickly", "category": "movement", "examples": ["Dash to the finish!", "A quick dash."], "part_of_speech": "verb", "synonyms": ["run", "sprint"]},
    {"word": "Walk", "meaning": "To move on foot slowly", "category": "movement", "examples": ["Walk slowly.", "Let's walk."], "part_of_speech": "verb", "synonyms": ["stroll"]},
    {"word": "Stroll", "meaning": "To walk in a relaxed way", "category": "movement", "examples": ["A nice stroll.", "Let's stroll."], "part_of_speech": "verb", "synonyms": ["walk"]},
    {"word": "Skip", "meaning": "To hop while walking", "category": "movement", "examples": ["Skip along!", "I like to skip."], "part_of_speech": "verb"},
    {"word": "Hop", "meaning": "To jump on one foot", "category": "movement", "examples": ["Hop like a bunny!", "Hop over here."], "part_of_speech": "verb"},
    {"word": "Climb", "meaning": "To go up using hands and feet", "category": "movement", "examples": ["Climb the tree.", "I can climb."], "part_of_speech": "verb"},
]

# Ages 8-10: 100 Multi-Meaning & Idioms (4th-5th)
FOURTH_FIFTH_WORDS = [
    # Multi-meaning words (20)
    {"word": "Bank", "meaning": "1) Land beside a river 2) Place to keep money", "category": "multi-meaning", "examples": ["We sat on the river bank.", "I have money in the bank."], "part_of_speech": "noun"},
    {"word": "Bat", "meaning": "1) A flying animal 2) A stick for hitting balls", "category": "multi-meaning", "examples": ["The bat flies at night.", "He swung the bat."], "part_of_speech": "noun"},
    {"word": "Fair", "meaning": "1) A fun event with rides 2) Treating everyone equally", "category": "multi-meaning", "examples": ["We went to the fair.", "That's not fair!"], "part_of_speech": "noun/adjective"},
    {"word": "Left", "meaning": "1) The opposite of right 2) Past tense of leave", "category": "multi-meaning", "examples": ["Turn left here.", "She left the room."], "part_of_speech": "adjective/verb"},
    {"word": "Right", "meaning": "1) Correct 2) The opposite of left", "category": "multi-meaning", "examples": ["You are right!", "Turn right."], "part_of_speech": "adjective"},
    {"word": "Light", "meaning": "1) Not heavy 2) Brightness", "category": "multi-meaning", "examples": ["The bag is light.", "Turn on the light."], "part_of_speech": "adjective/noun"},
    {"word": "Watch", "meaning": "1) To look at 2) A clock on your wrist", "category": "multi-meaning", "examples": ["Watch the movie.", "I love my watch."], "part_of_speech": "verb/noun"},
    {"word": "Ring", "meaning": "1) Jewelry for finger 2) A sound", "category": "multi-meaning", "examples": ["A gold ring.", "The phone will ring."], "part_of_speech": "noun/verb"},
    {"word": "Park", "meaning": "1) A green area to play 2) To stop a car", "category": "multi-meaning", "examples": ["Play in the park.", "Park the car here."], "part_of_speech": "noun/verb"},
    {"word": "Match", "meaning": "1) A stick to make fire 2) A sports game", "category": "multi-meaning", "examples": ["Light the match.", "Watch the cricket match."], "part_of_speech": "noun"},
    {"word": "Can", "meaning": "1) A metal container 2) To be able to", "category": "multi-meaning", "examples": ["Open the can.", "I can do it!"], "part_of_speech": "noun/verb"},
    {"word": "Leaves", "meaning": "1) Parts of a tree 2) Goes away", "category": "multi-meaning", "examples": ["The leaves fall.", "She leaves at 5."], "part_of_speech": "noun/verb"},
    {"word": "Bark", "meaning": "1) Sound a dog makes 2) Outside of a tree", "category": "multi-meaning", "examples": ["Dogs bark loudly.", "Feel the tree bark."], "part_of_speech": "verb/noun"},
    {"word": "Wave", "meaning": "1) Move hand to say hi 2) Water in the ocean", "category": "multi-meaning", "examples": ["Wave goodbye!", "A big wave came."], "part_of_speech": "verb/noun"},
    {"word": "Present", "meaning": "1) A gift 2) Being here now", "category": "multi-meaning", "examples": ["A birthday present.", "I am present today."], "part_of_speech": "noun/adjective"},
    {"word": "Kind", "meaning": "1) Being nice 2) A type of something", "category": "multi-meaning", "examples": ["Be kind to others.", "What kind is it?"], "part_of_speech": "adjective/noun"},
    {"word": "Well", "meaning": "1) A hole for water 2) In good health", "category": "multi-meaning", "examples": ["Water from a well.", "I feel well."], "part_of_speech": "noun/adverb"},
    {"word": "Sink", "meaning": "1) Basin for washing 2) To go down in water", "category": "multi-meaning", "examples": ["Wash in the sink.", "The ship will sink."], "part_of_speech": "noun/verb"},
    {"word": "Fly", "meaning": "1) An insect 2) To move through air", "category": "multi-meaning", "examples": ["Shoo the fly!", "Birds can fly."], "part_of_speech": "noun/verb"},
    {"word": "Spring", "meaning": "1) A season 2) To jump suddenly 3) Water source", "category": "multi-meaning", "examples": ["Spring is beautiful.", "Spring up quickly!", "Water from a spring."], "part_of_speech": "noun/verb"},
    
    # Idioms (20)
    {"word": "Break a leg", "meaning": "Good luck (used before a performance)", "category": "idioms", "examples": ["Break a leg at your dance show!", "Everyone said break a leg!"], "part_of_speech": "idiom"},
    {"word": "Piece of cake", "meaning": "Something very easy to do", "category": "idioms", "examples": ["The test was a piece of cake!", "This is a piece of cake."], "part_of_speech": "idiom"},
    {"word": "Hit the books", "meaning": "To study hard", "category": "idioms", "examples": ["Time to hit the books!", "I need to hit the books."], "part_of_speech": "idiom"},
    {"word": "Under the weather", "meaning": "Feeling sick or unwell", "category": "idioms", "examples": ["I'm feeling under the weather.", "She's under the weather today."], "part_of_speech": "idiom"},
    {"word": "Cost an arm and a leg", "meaning": "Very expensive", "category": "idioms", "examples": ["That toy costs an arm and a leg!", "It cost an arm and a leg."], "part_of_speech": "idiom"},
    {"word": "A piece of my mind", "meaning": "To scold or tell someone off", "category": "idioms", "examples": ["I'll give him a piece of my mind!", "She got a piece of my mind."], "part_of_speech": "idiom"},
    {"word": "Raining cats and dogs", "meaning": "Raining very heavily", "category": "idioms", "examples": ["It's raining cats and dogs outside!", "Don't go out, it's raining cats and dogs."], "part_of_speech": "idiom"},
    {"word": "Feeling blue", "meaning": "Feeling sad", "category": "idioms", "examples": ["Why are you feeling blue?", "I'm feeling blue today."], "part_of_speech": "idiom"},
    {"word": "On cloud nine", "meaning": "Extremely happy", "category": "idioms", "examples": ["She's on cloud nine!", "I'm on cloud nine!"], "part_of_speech": "idiom"},
    {"word": "Let the cat out of the bag", "meaning": "To reveal a secret", "category": "idioms", "examples": ["Don't let the cat out of the bag!", "Who let the cat out of the bag?"], "part_of_speech": "idiom"},
    {"word": "The early bird catches the worm", "meaning": "Starting early leads to success", "category": "idioms", "examples": ["Wake up! The early bird catches the worm.", "Remember, the early bird catches the worm."], "part_of_speech": "idiom"},
    {"word": "Spill the beans", "meaning": "To reveal secret information", "category": "idioms", "examples": ["Don't spill the beans!", "Who spilled the beans?"], "part_of_speech": "idiom"},
    {"word": "Best of both worlds", "meaning": "Getting advantages of two different things", "category": "idioms", "examples": ["Working from home is the best of both worlds.", "You get the best of both worlds."], "part_of_speech": "idiom"},
    {"word": "Bite off more than you can chew", "meaning": "To take on too much", "category": "idioms", "examples": ["Don't bite off more than you can chew.", "I bit off more than I could chew."], "part_of_speech": "idiom"},
    {"word": "A blessing in disguise", "meaning": "Something good that seemed bad at first", "category": "idioms", "examples": ["The delay was a blessing in disguise.", "It turned out to be a blessing in disguise."], "part_of_speech": "idiom"},
    
    # Advanced synonyms (15)
    {"word": "Angry", "meaning": "Feeling strong displeasure", "category": "synonyms-advanced", "examples": ["I was angry.", "Don't make me angry."], "part_of_speech": "adjective", "synonyms": ["furious", "mad", "irritated"]},
    {"word": "Furious", "meaning": "Extremely angry", "category": "synonyms-advanced", "examples": ["She was furious!", "A furious storm."], "part_of_speech": "adjective", "synonyms": ["angry", "enraged"]},
    {"word": "Irritated", "meaning": "Slightly angry", "category": "synonyms-advanced", "examples": ["He looked irritated.", "Don't get irritated."], "part_of_speech": "adjective", "synonyms": ["annoyed", "bothered"]},
    {"word": "Beautiful", "meaning": "Very pleasing to look at", "category": "synonyms-advanced", "examples": ["A beautiful sunset.", "You look beautiful."], "part_of_speech": "adjective", "synonyms": ["gorgeous", "lovely", "stunning"]},
    {"word": "Gorgeous", "meaning": "Extremely beautiful", "category": "synonyms-advanced", "examples": ["A gorgeous dress.", "The view is gorgeous."], "part_of_speech": "adjective", "synonyms": ["beautiful", "stunning"]},
    {"word": "Lovely", "meaning": "Beautiful and pleasant", "category": "synonyms-advanced", "examples": ["A lovely day.", "How lovely!"], "part_of_speech": "adjective", "synonyms": ["beautiful", "charming"]},
    {"word": "Stunning", "meaning": "Extremely impressive", "category": "synonyms-advanced", "examples": ["A stunning performance.", "That's stunning!"], "part_of_speech": "adjective", "synonyms": ["amazing", "breathtaking"]},
    {"word": "Scared", "meaning": "Feeling fear", "category": "synonyms-advanced", "examples": ["I was scared.", "Don't be scared."], "part_of_speech": "adjective", "synonyms": ["terrified", "frightened", "nervous"]},
    {"word": "Terrified", "meaning": "Extremely scared", "category": "synonyms-advanced", "examples": ["I was terrified!", "She looked terrified."], "part_of_speech": "adjective", "synonyms": ["scared", "petrified"]},
    {"word": "Frightened", "meaning": "Feeling fear", "category": "synonyms-advanced", "examples": ["The noise frightened me.", "A frightened animal."], "part_of_speech": "adjective", "synonyms": ["scared", "afraid"]},
    {"word": "Nervous", "meaning": "Feeling worried", "category": "synonyms-advanced", "examples": ["I'm nervous about the test.", "Don't be nervous."], "part_of_speech": "adjective", "synonyms": ["anxious", "worried"]},
    {"word": "Brave", "meaning": "Not afraid of danger", "category": "synonyms-advanced", "examples": ["Be brave!", "A brave hero."], "part_of_speech": "adjective", "synonyms": ["courageous", "fearless"]},
    {"word": "Courageous", "meaning": "Having courage", "category": "synonyms-advanced", "examples": ["A courageous act.", "Be courageous!"], "part_of_speech": "adjective", "synonyms": ["brave", "bold"]},
    {"word": "Clever", "meaning": "Quick to understand", "category": "synonyms-advanced", "examples": ["A clever idea!", "She's very clever."], "part_of_speech": "adjective", "synonyms": ["smart", "intelligent"]},
    {"word": "Intelligent", "meaning": "Having high mental ability", "category": "synonyms-advanced", "examples": ["An intelligent student.", "That's intelligent!"], "part_of_speech": "adjective", "synonyms": ["smart", "bright"]},
    
    # Prepositions (10)
    {"word": "Across", "meaning": "From one side to the other", "category": "prepositions", "examples": ["Walk across the road.", "Across the bridge."], "part_of_speech": "preposition"},
    {"word": "Against", "meaning": "In opposition to", "category": "prepositions", "examples": ["Lean against the wall.", "Against the rules."], "part_of_speech": "preposition"},
    {"word": "Among", "meaning": "In the middle of", "category": "prepositions", "examples": ["Among friends.", "Among the trees."], "part_of_speech": "preposition"},
    {"word": "Around", "meaning": "On all sides", "category": "prepositions", "examples": ["Look around you.", "Around the corner."], "part_of_speech": "preposition"},
    {"word": "Beside", "meaning": "Next to", "category": "prepositions", "examples": ["Sit beside me.", "Beside the river."], "part_of_speech": "preposition"},
    {"word": "Between", "meaning": "In the middle of two things", "category": "prepositions", "examples": ["Between us.", "Between the lines."], "part_of_speech": "preposition"},
    {"word": "Beyond", "meaning": "On the far side of", "category": "prepositions", "examples": ["Beyond the mountains.", "Beyond imagination."], "part_of_speech": "preposition"},
    {"word": "Inside", "meaning": "In the inner part", "category": "prepositions", "examples": ["Go inside.", "Inside the box."], "part_of_speech": "preposition"},
    {"word": "Outside", "meaning": "On the outer part", "category": "prepositions", "examples": ["Play outside.", "Outside the house."], "part_of_speech": "preposition"},
    {"word": "Through", "meaning": "From one end to another", "category": "prepositions", "examples": ["Through the tunnel.", "Walk through."], "part_of_speech": "preposition"},
    
    # School boosters (20)
    {"word": "Predict", "meaning": "To say what will happen", "category": "school", "examples": ["Can you predict the ending?", "I predict rain."], "part_of_speech": "verb"},
    {"word": "Compare", "meaning": "To look at differences", "category": "school", "examples": ["Compare the two stories.", "Let's compare."], "part_of_speech": "verb"},
    {"word": "Explain", "meaning": "To make something clear", "category": "school", "examples": ["Please explain the answer.", "Can you explain?"], "part_of_speech": "verb"},
    {"word": "Summarize", "meaning": "To give the main points", "category": "school", "examples": ["Summarize the chapter.", "Let me summarize."], "part_of_speech": "verb"},
    {"word": "Conclude", "meaning": "To come to an end or decision", "category": "school", "examples": ["To conclude the essay.", "What can we conclude?"], "part_of_speech": "verb"},
    {"word": "Evidence", "meaning": "Proof that shows something", "category": "school", "examples": ["Show me the evidence.", "There's no evidence."], "part_of_speech": "noun"},
    {"word": "Opinion", "meaning": "What you think about something", "category": "school", "examples": ["In my opinion...", "Share your opinion."], "part_of_speech": "noun"},
    {"word": "Fact", "meaning": "Something that is true", "category": "school", "examples": ["That's a fact!", "Is it a fact or opinion?"], "part_of_speech": "noun"},
    {"word": "Cause", "meaning": "What makes something happen", "category": "school", "examples": ["What was the cause?", "The cause of the fire."], "part_of_speech": "noun"},
    {"word": "Effect", "meaning": "What happens as a result", "category": "school", "examples": ["The effect was amazing.", "Cause and effect."], "part_of_speech": "noun"},
    {"word": "Sequence", "meaning": "The order of events", "category": "school", "examples": ["In sequence.", "The correct sequence."], "part_of_speech": "noun"},
    {"word": "Describe", "meaning": "To tell about something in detail", "category": "school", "examples": ["Describe the picture.", "Can you describe it?"], "part_of_speech": "verb"},
    {"word": "Infer", "meaning": "To figure out from clues", "category": "school", "examples": ["What can you infer?", "I infer that..."], "part_of_speech": "verb"},
    {"word": "Analyze", "meaning": "To examine carefully", "category": "school", "examples": ["Analyze the data.", "Let's analyze this."], "part_of_speech": "verb"},
    {"word": "Contrast", "meaning": "To show differences", "category": "school", "examples": ["Compare and contrast.", "In contrast to..."], "part_of_speech": "verb"},
]

# Ages 10-11: 125 Academic & Abstract (5th-adv) - Part 1
FIFTH_ADV_WORDS_1 = [
    # Abstract/Traits (30)
    {"word": "Ambitious", "meaning": "Having strong desire to succeed", "category": "abstract-traits", "examples": ["She's very ambitious.", "An ambitious goal."], "part_of_speech": "adjective"},
    {"word": "Cautious", "meaning": "Being careful to avoid danger", "category": "abstract-traits", "examples": ["Be cautious!", "A cautious approach."], "part_of_speech": "adjective"},
    {"word": "Diligent", "meaning": "Working hard and carefully", "category": "abstract-traits", "examples": ["A diligent student.", "Be diligent in your work."], "part_of_speech": "adjective"},
    {"word": "Efficient", "meaning": "Working well without waste", "category": "abstract-traits", "examples": ["An efficient method.", "Very efficient!"], "part_of_speech": "adjective"},
    {"word": "Flexible", "meaning": "Able to change or bend easily", "category": "abstract-traits", "examples": ["Be flexible.", "A flexible schedule."], "part_of_speech": "adjective"},
    {"word": "Generous", "meaning": "Willing to give and share", "category": "abstract-traits", "examples": ["How generous!", "A generous person."], "part_of_speech": "adjective"},
    {"word": "Humble", "meaning": "Not proud or arrogant", "category": "abstract-traits", "examples": ["Stay humble.", "A humble attitude."], "part_of_speech": "adjective"},
    {"word": "Innovative", "meaning": "Creating new ideas", "category": "abstract-traits", "examples": ["An innovative solution.", "Be innovative!"], "part_of_speech": "adjective"},
    {"word": "Jealous", "meaning": "Wanting what others have", "category": "abstract-traits", "examples": ["Don't be jealous.", "Feeling jealous."], "part_of_speech": "adjective"},
    {"word": "Kindhearted", "meaning": "Having a kind nature", "category": "abstract-traits", "examples": ["A kindhearted person.", "So kindhearted!"], "part_of_speech": "adjective"},
    {"word": "Loyal", "meaning": "Always faithful and supportive", "category": "abstract-traits", "examples": ["A loyal friend.", "Stay loyal."], "part_of_speech": "adjective"},
    {"word": "Meticulous", "meaning": "Very careful about details", "category": "abstract-traits", "examples": ["Meticulous work.", "Be meticulous."], "part_of_speech": "adjective"},
    {"word": "Optimistic", "meaning": "Expecting good things", "category": "abstract-traits", "examples": ["Stay optimistic!", "An optimistic view."], "part_of_speech": "adjective"},
    {"word": "Persistent", "meaning": "Never giving up", "category": "abstract-traits", "examples": ["Be persistent!", "A persistent effort."], "part_of_speech": "adjective"},
    {"word": "Resilient", "meaning": "Able to recover from difficulties", "category": "abstract-traits", "examples": ["Be resilient!", "A resilient spirit."], "part_of_speech": "adjective"},
    {"word": "Sincere", "meaning": "Genuine and honest", "category": "abstract-traits", "examples": ["A sincere apology.", "Be sincere."], "part_of_speech": "adjective"},
    {"word": "Tolerant", "meaning": "Accepting differences", "category": "abstract-traits", "examples": ["Be tolerant.", "A tolerant society."], "part_of_speech": "adjective"},
    {"word": "Vigilant", "meaning": "Always watchful and alert", "category": "abstract-traits", "examples": ["Stay vigilant!", "A vigilant guard."], "part_of_speech": "adjective"},
    {"word": "Authentic", "meaning": "Real and genuine", "category": "abstract-traits", "examples": ["An authentic experience.", "Be authentic."], "part_of_speech": "adjective"},
    {"word": "Benevolent", "meaning": "Kind and generous", "category": "abstract-traits", "examples": ["A benevolent king.", "Benevolent actions."], "part_of_speech": "adjective"},
    {"word": "Candid", "meaning": "Honest and straightforward", "category": "abstract-traits", "examples": ["A candid opinion.", "Be candid with me."], "part_of_speech": "adjective"},
    {"word": "Empathetic", "meaning": "Understanding others' feelings", "category": "abstract-traits", "examples": ["An empathetic listener.", "Be empathetic."], "part_of_speech": "adjective"},
    {"word": "Gracious", "meaning": "Polite and kind", "category": "abstract-traits", "examples": ["A gracious host.", "How gracious!"], "part_of_speech": "adjective"},
    {"word": "Hospitable", "meaning": "Welcoming to guests", "category": "abstract-traits", "examples": ["A hospitable family.", "Very hospitable!"], "part_of_speech": "adjective"},
    {"word": "Integrity", "meaning": "Being honest and moral", "category": "abstract-traits", "examples": ["A person of integrity.", "Show integrity."], "part_of_speech": "noun"},
    {"word": "Compassion", "meaning": "Deep sympathy for others", "category": "abstract-traits", "examples": ["Show compassion.", "Full of compassion."], "part_of_speech": "noun"},
    {"word": "Determination", "meaning": "Firmness of purpose", "category": "abstract-traits", "examples": ["With determination.", "Great determination!"], "part_of_speech": "noun"},
    {"word": "Perseverance", "meaning": "Continuing despite difficulties", "category": "abstract-traits", "examples": ["Through perseverance.", "Show perseverance."], "part_of_speech": "noun"},
    {"word": "Wisdom", "meaning": "Good judgment from experience", "category": "abstract-traits", "examples": ["Words of wisdom.", "Gain wisdom."], "part_of_speech": "noun"},
    {"word": "Curiosity", "meaning": "Desire to know things", "category": "abstract-traits", "examples": ["Full of curiosity.", "Curiosity is good."], "part_of_speech": "noun"},
]

# Ages 10-11: 125 Academic & Abstract (5th-adv) - Part 2
FIFTH_ADV_WORDS_2 = [
    # Science/Tech (25)
    {"word": "Hypothesis", "meaning": "An educated guess to test", "category": "science-tech", "examples": ["Form a hypothesis.", "My hypothesis is..."], "part_of_speech": "noun"},
    {"word": "Variable", "meaning": "Something that can change", "category": "science-tech", "examples": ["The variable changed.", "Control the variable."], "part_of_speech": "noun"},
    {"word": "Ecosystem", "meaning": "A community of living things", "category": "science-tech", "examples": ["The forest ecosystem.", "Protect the ecosystem."], "part_of_speech": "noun"},
    {"word": "Photosynthesis", "meaning": "How plants make food from light", "category": "science-tech", "examples": ["Plants do photosynthesis.", "Learn about photosynthesis."], "part_of_speech": "noun"},
    {"word": "Evaporation", "meaning": "Water turning into vapor", "category": "science-tech", "examples": ["Evaporation happens.", "The evaporation process."], "part_of_speech": "noun"},
    {"word": "Circulation", "meaning": "Movement in a circle", "category": "science-tech", "examples": ["Blood circulation.", "Air circulation."], "part_of_speech": "noun"},
    {"word": "Algorithm", "meaning": "Step-by-step instructions", "category": "science-tech", "examples": ["Follow the algorithm.", "A computer algorithm."], "part_of_speech": "noun"},
    {"word": "Database", "meaning": "Organized collection of information", "category": "science-tech", "examples": ["Search the database.", "A large database."], "part_of_speech": "noun"},
    {"word": "Simulation", "meaning": "A model of something real", "category": "science-tech", "examples": ["Run a simulation.", "A computer simulation."], "part_of_speech": "noun"},
    {"word": "Biodiversity", "meaning": "Variety of living things", "category": "science-tech", "examples": ["Protect biodiversity.", "Rich biodiversity."], "part_of_speech": "noun"},
    {"word": "Habitat", "meaning": "Natural home of an animal", "category": "science-tech", "examples": ["Its natural habitat.", "Protect the habitat."], "part_of_speech": "noun"},
    {"word": "Erosion", "meaning": "Wearing away of land", "category": "science-tech", "examples": ["Soil erosion.", "Prevent erosion."], "part_of_speech": "noun"},
    {"word": "Climate", "meaning": "Weather patterns over time", "category": "science-tech", "examples": ["Climate change.", "A tropical climate."], "part_of_speech": "noun"},
    {"word": "Kinetic", "meaning": "Related to movement", "category": "science-tech", "examples": ["Kinetic energy.", "A kinetic sculpture."], "part_of_speech": "adjective"},
    {"word": "Latitude", "meaning": "Distance from the equator", "category": "science-tech", "examples": ["What latitude?", "At this latitude."], "part_of_speech": "noun"},
    {"word": "Nucleus", "meaning": "Center of a cell or atom", "category": "science-tech", "examples": ["The cell nucleus.", "Atomic nucleus."], "part_of_speech": "noun"},
    {"word": "Orbit", "meaning": "Path around another object", "category": "science-tech", "examples": ["Earth's orbit.", "To orbit the sun."], "part_of_speech": "noun/verb"},
    {"word": "Experiment", "meaning": "A test to discover something", "category": "science-tech", "examples": ["Do an experiment.", "A science experiment."], "part_of_speech": "noun"},
    {"word": "Observation", "meaning": "Watching and recording", "category": "science-tech", "examples": ["Make observations.", "Close observation."], "part_of_speech": "noun"},
    {"word": "Theory", "meaning": "An explanation based on evidence", "category": "science-tech", "examples": ["A scientific theory.", "In theory..."], "part_of_speech": "noun"},
    {"word": "Gravity", "meaning": "Force that pulls things down", "category": "science-tech", "examples": ["The force of gravity.", "Gravity keeps us down."], "part_of_speech": "noun"},
    {"word": "Energy", "meaning": "Power to do work", "category": "science-tech", "examples": ["Solar energy.", "Full of energy!"], "part_of_speech": "noun"},
    {"word": "Molecule", "meaning": "Tiny particles of matter", "category": "science-tech", "examples": ["A water molecule.", "Molecules combine."], "part_of_speech": "noun"},
    {"word": "Microscope", "meaning": "Tool to see tiny things", "category": "science-tech", "examples": ["Use a microscope.", "Under the microscope."], "part_of_speech": "noun"},
    {"word": "Telescope", "meaning": "Tool to see far things", "category": "science-tech", "examples": ["Use a telescope.", "Through the telescope."], "part_of_speech": "noun"},
]

# Ages 10-11: 125 Academic & Abstract (5th-adv) - Part 3
FIFTH_ADV_WORDS_3 = [
    # Literature/Arts (25)
    {"word": "Allegory", "meaning": "A story with hidden meaning", "category": "literature-arts", "examples": ["An allegory of life.", "Read the allegory."], "part_of_speech": "noun"},
    {"word": "Climax", "meaning": "Most exciting part of a story", "category": "literature-arts", "examples": ["The story's climax.", "At the climax."], "part_of_speech": "noun"},
    {"word": "Dialogue", "meaning": "Conversation between characters", "category": "literature-arts", "examples": ["Write dialogue.", "The dialogue was good."], "part_of_speech": "noun"},
    {"word": "Foreshadow", "meaning": "Hints about what will happen", "category": "literature-arts", "examples": ["This foreshadows the ending.", "A foreshadowing event."], "part_of_speech": "verb"},
    {"word": "Genre", "meaning": "Category of art or literature", "category": "literature-arts", "examples": ["What genre is it?", "The fantasy genre."], "part_of_speech": "noun"},
    {"word": "Imagery", "meaning": "Descriptive language for pictures in mind", "category": "literature-arts", "examples": ["Vivid imagery.", "Use imagery."], "part_of_speech": "noun"},
    {"word": "Metaphor", "meaning": "Comparing two unlike things", "category": "literature-arts", "examples": ["Life is a journey (metaphor).", "Use a metaphor."], "part_of_speech": "noun"},
    {"word": "Narrative", "meaning": "A story or account", "category": "literature-arts", "examples": ["A compelling narrative.", "The narrative flows."], "part_of_speech": "noun"},
    {"word": "Onomatopoeia", "meaning": "Words that sound like what they mean", "category": "literature-arts", "examples": ["Buzz is onomatopoeia.", "Use onomatopoeia."], "part_of_speech": "noun"},
    {"word": "Protagonist", "meaning": "Main character in a story", "category": "literature-arts", "examples": ["The protagonist wins.", "A brave protagonist."], "part_of_speech": "noun"},
    {"word": "Simile", "meaning": "Comparison using like or as", "category": "literature-arts", "examples": ["Fast as lightning (simile).", "Use a simile."], "part_of_speech": "noun"},
    {"word": "Theme", "meaning": "Main idea or message", "category": "literature-arts", "examples": ["The theme is hope.", "What's the theme?"], "part_of_speech": "noun"},
    {"word": "Verse", "meaning": "A line or section of poetry", "category": "literature-arts", "examples": ["Read the verse.", "A beautiful verse."], "part_of_speech": "noun"},
    {"word": "Alliteration", "meaning": "Same starting sounds", "category": "literature-arts", "examples": ["Peter Piper (alliteration).", "Use alliteration."], "part_of_speech": "noun"},
    {"word": "Irony", "meaning": "Opposite of what's expected", "category": "literature-arts", "examples": ["The irony!", "A twist of irony."], "part_of_speech": "noun"},
    {"word": "Rhythm", "meaning": "Pattern of sounds or beats", "category": "literature-arts", "examples": ["Feel the rhythm.", "A steady rhythm."], "part_of_speech": "noun"},
    {"word": "Stanza", "meaning": "A group of lines in a poem", "category": "literature-arts", "examples": ["The first stanza.", "Read each stanza."], "part_of_speech": "noun"},
    {"word": "Symbol", "meaning": "Something representing another thing", "category": "literature-arts", "examples": ["A symbol of peace.", "What does it symbolize?"], "part_of_speech": "noun"},
    {"word": "Tone", "meaning": "The feeling of writing", "category": "literature-arts", "examples": ["A serious tone.", "The tone is happy."], "part_of_speech": "noun"},
    {"word": "Context", "meaning": "The situation around something", "category": "literature-arts", "examples": ["In this context.", "Understand the context."], "part_of_speech": "noun"},
    {"word": "Perspective", "meaning": "Point of view", "category": "literature-arts", "examples": ["From my perspective.", "A different perspective."], "part_of_speech": "noun"},
    {"word": "Conflict", "meaning": "Struggle between forces", "category": "literature-arts", "examples": ["The main conflict.", "Resolve the conflict."], "part_of_speech": "noun"},
    {"word": "Resolution", "meaning": "Solution to a problem", "category": "literature-arts", "examples": ["The story's resolution.", "Find a resolution."], "part_of_speech": "noun"},
    {"word": "Setting", "meaning": "Time and place of a story", "category": "literature-arts", "examples": ["The story's setting.", "A historical setting."], "part_of_speech": "noun"},
    {"word": "Plot", "meaning": "The events in a story", "category": "literature-arts", "examples": ["An exciting plot.", "The plot thickens."], "part_of_speech": "noun"},
]

# Ages 10-11: 125 Academic & Abstract (5th-adv) - Part 4
FIFTH_ADV_WORDS_4 = [
    # Math/Social (25)
    {"word": "Equation", "meaning": "Math statement showing equality", "category": "math-social", "examples": ["Solve the equation.", "A simple equation."], "part_of_speech": "noun"},
    {"word": "Fraction", "meaning": "Part of a whole", "category": "math-social", "examples": ["Half is a fraction.", "Add the fractions."], "part_of_speech": "noun"},
    {"word": "Geometry", "meaning": "Math of shapes and sizes", "category": "math-social", "examples": ["Study geometry.", "A geometry problem."], "part_of_speech": "noun"},
    {"word": "Infinity", "meaning": "Without end", "category": "math-social", "examples": ["To infinity!", "Infinity is endless."], "part_of_speech": "noun"},
    {"word": "Quotient", "meaning": "Result of division", "category": "math-social", "examples": ["Find the quotient.", "The quotient is 5."], "part_of_speech": "noun"},
    {"word": "Radius", "meaning": "Distance from center to edge", "category": "math-social", "examples": ["The circle's radius.", "Measure the radius."], "part_of_speech": "noun"},
    {"word": "Statistics", "meaning": "Numbers that show information", "category": "math-social", "examples": ["Look at the statistics.", "Statistics show..."], "part_of_speech": "noun"},
    {"word": "Percentage", "meaning": "Part of 100", "category": "math-social", "examples": ["What percentage?", "A high percentage."], "part_of_speech": "noun"},
    {"word": "Democracy", "meaning": "Government by the people", "category": "math-social", "examples": ["We live in a democracy.", "Democracy is important."], "part_of_speech": "noun"},
    {"word": "Economy", "meaning": "System of making and using money", "category": "math-social", "examples": ["The country's economy.", "A strong economy."], "part_of_speech": "noun"},
    {"word": "Heritage", "meaning": "Things passed down from ancestors", "category": "math-social", "examples": ["Our cultural heritage.", "Protect heritage."], "part_of_speech": "noun"},
    {"word": "Immigration", "meaning": "Moving to a new country", "category": "math-social", "examples": ["Immigration rules.", "Immigration increased."], "part_of_speech": "noun"},
    {"word": "Legislation", "meaning": "Laws made by government", "category": "math-social", "examples": ["New legislation.", "Pass legislation."], "part_of_speech": "noun"},
    {"word": "Parliament", "meaning": "Law-making group", "category": "math-social", "examples": ["In parliament.", "Parliament voted."], "part_of_speech": "noun"},
    {"word": "Republic", "meaning": "Country ruled by elected leaders", "category": "math-social", "examples": ["A republic.", "The Republic of India."], "part_of_speech": "noun"},
    {"word": "Constitution", "meaning": "Basic laws of a country", "category": "math-social", "examples": ["The constitution says...", "Constitutional rights."], "part_of_speech": "noun"},
    {"word": "Citizen", "meaning": "Member of a country", "category": "math-social", "examples": ["A good citizen.", "Citizens have rights."], "part_of_speech": "noun"},
    {"word": "Community", "meaning": "Group of people living together", "category": "math-social", "examples": ["Our community.", "Community service."], "part_of_speech": "noun"},
    {"word": "Culture", "meaning": "Beliefs and customs of a group", "category": "math-social", "examples": ["Indian culture.", "Cultural diversity."], "part_of_speech": "noun"},
    {"word": "Tradition", "meaning": "Customs passed through generations", "category": "math-social", "examples": ["A family tradition.", "Keep traditions alive."], "part_of_speech": "noun"},
    
    # Prefixes/Suffixes (20)
    {"word": "Unhappy", "meaning": "Not happy (un- prefix)", "category": "prefixes-suffixes", "examples": ["I feel unhappy.", "Don't be unhappy."], "part_of_speech": "adjective", "word_parts": {"prefix": "un-", "root": "happy"}},
    {"word": "Redo", "meaning": "Do again (re- prefix)", "category": "prefixes-suffixes", "examples": ["Redo the work.", "Let me redo it."], "part_of_speech": "verb", "word_parts": {"prefix": "re-", "root": "do"}},
    {"word": "Disagree", "meaning": "Not agree (dis- prefix)", "category": "prefixes-suffixes", "examples": ["I disagree.", "We disagree."], "part_of_speech": "verb", "word_parts": {"prefix": "dis-", "root": "agree"}},
    {"word": "Preview", "meaning": "View before (pre- prefix)", "category": "prefixes-suffixes", "examples": ["Watch the preview.", "A movie preview."], "part_of_speech": "noun", "word_parts": {"prefix": "pre-", "root": "view"}},
    {"word": "Misunderstand", "meaning": "Understand wrongly (mis- prefix)", "category": "prefixes-suffixes", "examples": ["Don't misunderstand.", "I misunderstood."], "part_of_speech": "verb", "word_parts": {"prefix": "mis-", "root": "understand"}},
    {"word": "Nonsense", "meaning": "No sense (non- prefix)", "category": "prefixes-suffixes", "examples": ["That's nonsense!", "Pure nonsense."], "part_of_speech": "noun", "word_parts": {"prefix": "non-", "root": "sense"}},
    {"word": "Antibiotic", "meaning": "Against bacteria (anti- prefix)", "category": "prefixes-suffixes", "examples": ["Take antibiotics.", "An antibiotic medicine."], "part_of_speech": "noun", "word_parts": {"prefix": "anti-", "root": "biotic"}},
    {"word": "Bicycle", "meaning": "Two-wheeled vehicle (bi- prefix)", "category": "prefixes-suffixes", "examples": ["Ride a bicycle.", "My bicycle is red."], "part_of_speech": "noun", "word_parts": {"prefix": "bi-", "root": "cycle"}},
    {"word": "Triangle", "meaning": "Three-sided shape (tri- prefix)", "category": "prefixes-suffixes", "examples": ["Draw a triangle.", "A triangle shape."], "part_of_speech": "noun", "word_parts": {"prefix": "tri-", "root": "angle"}},
    {"word": "Automatic", "meaning": "Self-acting (auto- prefix)", "category": "prefixes-suffixes", "examples": ["An automatic door.", "Automatic mode."], "part_of_speech": "adjective", "word_parts": {"prefix": "auto-", "root": "matic"}},
    {"word": "Washable", "meaning": "Can be washed (-able suffix)", "category": "prefixes-suffixes", "examples": ["It's washable.", "Machine washable."], "part_of_speech": "adjective", "word_parts": {"root": "wash", "suffix": "-able"}},
    {"word": "Education", "meaning": "Process of teaching (-tion suffix)", "category": "prefixes-suffixes", "examples": ["Good education.", "Education is important."], "part_of_speech": "noun", "word_parts": {"root": "educate", "suffix": "-tion"}},
    {"word": "Excitement", "meaning": "State of being excited (-ment suffix)", "category": "prefixes-suffixes", "examples": ["Full of excitement!", "The excitement grew."], "part_of_speech": "noun", "word_parts": {"root": "excite", "suffix": "-ment"}},
    {"word": "Kindness", "meaning": "Being kind (-ness suffix)", "category": "prefixes-suffixes", "examples": ["Show kindness.", "Acts of kindness."], "part_of_speech": "noun", "word_parts": {"root": "kind", "suffix": "-ness"}},
    {"word": "Hopeful", "meaning": "Full of hope (-ful suffix)", "category": "prefixes-suffixes", "examples": ["Stay hopeful!", "I'm hopeful."], "part_of_speech": "adjective", "word_parts": {"root": "hope", "suffix": "-ful"}},
    {"word": "Careless", "meaning": "Without care (-less suffix)", "category": "prefixes-suffixes", "examples": ["Don't be careless.", "A careless mistake."], "part_of_speech": "adjective", "word_parts": {"root": "care", "suffix": "-less"}},
    {"word": "Quickly", "meaning": "In a quick way (-ly suffix)", "category": "prefixes-suffixes", "examples": ["Move quickly!", "Finish quickly."], "part_of_speech": "adverb", "word_parts": {"root": "quick", "suffix": "-ly"}},
    {"word": "Memorize", "meaning": "To put into memory (-ize suffix)", "category": "prefixes-suffixes", "examples": ["Memorize this.", "I memorized it."], "part_of_speech": "verb", "word_parts": {"root": "memory", "suffix": "-ize"}},
    {"word": "Biology", "meaning": "Study of life (-ology suffix)", "category": "prefixes-suffixes", "examples": ["Study biology.", "A biology class."], "part_of_speech": "noun", "word_parts": {"root": "bio", "suffix": "-ology"}},
    {"word": "Arachnophobia", "meaning": "Fear of spiders (-phobia suffix)", "category": "prefixes-suffixes", "examples": ["She has arachnophobia.", "Overcome phobias."], "part_of_speech": "noun", "word_parts": {"root": "arachno", "suffix": "-phobia"}},
]


def create_word_entry(word_data, level, word_id_prefix, index):
    """Create a properly formatted word entry"""
    return {
        "word_id": f"{word_id_prefix}_{index:03d}",
        "word_english": word_data["word"],
        "word_telugu": None,
        "translations": {},
        "meaning": word_data["meaning"],
        "gender": None,
        "example_sentence": None,
        "example_sentences": word_data.get("examples", []),
        "level": level,
        "category": word_data["category"],
        "synonyms": word_data.get("synonyms", []),
        "antonyms": word_data.get("antonyms", []),
        "part_of_speech": word_data["part_of_speech"],
        "difficulty": 1 if level == "lkg-1st" else 2 if level == "2nd-3rd" else 3 if level == "4th-5th" else 4
    }


async def seed_words():
    """Seed all strengthening words into the database"""
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Get current max word_id for each level to avoid conflicts
    all_words = []
    
    # LKG-1st (50 words)
    print("Processing LKG-1st words...")
    for i, word in enumerate(LKG_1ST_WORDS, start=400):
        all_words.append(create_word_entry(word, "lkg-1st", "lkg_str", i))
    
    # 2nd-3rd (75 words)
    print("Processing 2nd-3rd words...")
    for i, word in enumerate(SECOND_THIRD_WORDS, start=350):
        all_words.append(create_word_entry(word, "2nd-3rd", "2nd_str", i))
    
    # 4th-5th (100 words)
    print("Processing 4th-5th words...")
    for i, word in enumerate(FOURTH_FIFTH_WORDS, start=350):
        all_words.append(create_word_entry(word, "4th-5th", "4th_str", i))
    
    # 5th-adv (125 words - split into 4 parts)
    print("Processing 5th-adv words...")
    adv_words = FIFTH_ADV_WORDS_1 + FIFTH_ADV_WORDS_2 + FIFTH_ADV_WORDS_3 + FIFTH_ADV_WORDS_4
    for i, word in enumerate(adv_words, start=400):
        all_words.append(create_word_entry(word, "5th-adv", "adv_str", i))
    
    # Insert all words
    if all_words:
        result = await db.words.insert_many(all_words)
        print(f"✓ Inserted {len(result.inserted_ids)} strengthening words")
    
    # Count words by level
    counts = {}
    for level in ["lkg-1st", "2nd-3rd", "4th-5th", "5th-adv"]:
        count = await db.words.count_documents({"level": level})
        counts[level] = count
        print(f"  {level}: {count} words")
    
    total = await db.words.count_documents({})
    print(f"\n✓ Total words in database: {total}")
    
    client.close()
    return counts


if __name__ == "__main__":
    asyncio.run(seed_words())
