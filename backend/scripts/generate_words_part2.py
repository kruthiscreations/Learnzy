#!/usr/bin/env python3
"""
Generate comprehensive word database for SpeakEasy Kids Pro - Part 2
Ages 8-10 (4th-5th): 250 Adjectives, Places, Hobbies, Nature
Ages 10-11 (5th-adv): 250 Advanced Concepts, Science, Abstracts
"""

import json

def get_translation(word):
    """Return basic translation structure"""
    return {"telugu": word, "hindi": word, "tamil": word, "kannada": word, "malayalam": word}

def create_word(word_id, word, meaning, examples, level, category, synonyms=[], antonyms=[], pos="noun", difficulty=3):
    return {
        "word_id": word_id,
        "word_english": word.capitalize() if word[0].islower() else word,
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

# Load existing words
with open("/app/backend/data/words_production.json", "r", encoding="utf-8") as f:
    words = json.load(f)

# ============== AGES 8-10 (4th-5th): 250 Words ==============
level = "4th-5th"
idx = 1

# Emotions Advanced (14 words)
emotions_adv = [
    ("brave", "Not afraid of danger", ["Be brave.", "The soldier was brave."], ["courageous"], ["cowardly"]),
    ("nervous", "Feeling worried or anxious", ["I feel nervous before tests.", "Don't be nervous."], ["anxious"], ["calm"]),
    ("proud", "Feeling good about achievements", ["I am proud of you.", "She felt proud."], ["pleased"], ["ashamed"]),
    ("excited", "Very enthusiastic", ["I am excited about the trip!", "The kids were excited."], ["thrilled"], ["bored"]),
    ("bored", "Not interested", ["I am bored.", "Don't get bored."], ["uninterested"], ["excited"]),
    ("jealous", "Wanting what others have", ["Don't be jealous.", "He was jealous."], ["envious"], []),
    ("calm", "Peaceful and quiet", ["Stay calm.", "The sea was calm."], ["peaceful"], ["angry"]),
    ("silly", "Funny in a childish way", ["Don't be silly.", "That's a silly joke."], ["foolish"], ["serious"]),
    ("lonely", "Feeling alone", ["I feel lonely.", "The old man was lonely."], ["alone"], ["accompanied"]),
    ("surprised", "Caught off guard", ["I was surprised!", "What a surprise!"], ["amazed"], []),
    ("grateful", "Thankful", ["I am grateful for your help.", "Be grateful."], ["thankful"], ["ungrateful"]),
    ("confused", "Not understanding", ["I am confused.", "Don't be confused."], ["puzzled"], ["clear"]),
    ("cheerful", "Happy and positive", ["She is always cheerful.", "Be cheerful!"], ["happy"], ["sad"]),
    ("grumpy", "In a bad mood", ["Don't be grumpy.", "He woke up grumpy."], ["moody"], ["cheerful"]),
]
for word, meaning, examples, syns, ants in emotions_adv:
    words.append(create_word(f"4th_{idx:03d}", word, meaning, examples, level, "emotions", syns, ants, "adjective", 3))
    idx += 1

# Places & Travel (18 words)
places_adv = [
    ("beach", "Sandy area by the sea", ["We went to the beach.", "The beach has waves."], "places"),
    ("village", "Small town in countryside", ["My grandparents live in a village.", "The village is peaceful."], "places"),
    ("island", "Land surrounded by water", ["Hawaii is an island.", "The island is beautiful."], "places"),
    ("city", "Large urban area", ["Mumbai is a big city.", "I live in a city."], "places"),
    ("town", "Smaller than a city", ["Our town is quiet.", "The town has a market."], "places"),
    ("mountain", "Very high land", ["We climbed the mountain.", "Mountains are majestic."], "nature"),
    ("forest", "Large area with trees", ["The forest is dense.", "Animals live in the forest."], "nature"),
    ("river", "Large flowing water", ["The river flows to the sea.", "We swam in the river."], "nature"),
    ("lake", "Body of water surrounded by land", ["The lake is calm.", "We went boating on the lake."], "nature"),
    ("desert", "Dry sandy area", ["The desert is hot.", "Camels live in the desert."], "nature"),
    ("ocean", "Very large body of water", ["The ocean is vast.", "Ships sail on the ocean."], "nature"),
    ("bridge", "Structure over water or road", ["Cross the bridge.", "The bridge is long."], "places"),
    ("road", "Path for vehicles", ["The road is long.", "Drive on the road."], "places"),
    ("airport", "Where airplanes land and take off", ["We went to the airport.", "The airport is busy."], "places"),
    ("station", "Place for trains or buses", ["Wait at the station.", "The train station is crowded."], "places"),
    ("museum", "Place with historical items", ["Visit the museum.", "The museum has artifacts."], "places"),
    ("factory", "Place where things are made", ["The factory makes cars.", "Workers work in the factory."], "places"),
    ("stadium", "Large sports arena", ["The stadium was full.", "Watch the match at the stadium."], "places"),
]
for word, meaning, examples, category in places_adv:
    words.append(create_word(f"4th_{idx:03d}", word, meaning, examples, level, category, difficulty=3))
    idx += 1

# Nature Expanded (12 words)
nature_exp = [
    ("rainbow", "Colorful arc after rain", ["Look at the rainbow!", "Rainbows have seven colors."], "nature"),
    ("leaf", "Part of a plant", ["The leaf is green.", "Leaves fall in autumn."], "nature"),
    ("branch", "Part of a tree", ["The bird sat on a branch.", "Don't break the branch."], "nature"),
    ("root", "Part of plant underground", ["Roots absorb water.", "Trees have deep roots."], "nature"),
    ("seed", "Grows into a plant", ["Plant a seed.", "Seeds need water to grow."], "nature"),
    ("pond", "Small body of water", ["Fish live in the pond.", "The pond has lotuses."], "nature"),
    ("hill", "Small mountain", ["Climb the hill.", "The hill has a view."], "nature"),
    ("valley", "Low land between hills", ["The valley is green.", "Rivers flow through valleys."], "nature"),
    ("cave", "Hole in rock or mountain", ["Explore the cave.", "Bats live in caves."], "nature"),
    ("volcano", "Mountain that erupts", ["The volcano erupted.", "Lava comes from volcanoes."], "nature"),
    ("waterfall", "Water falling from height", ["The waterfall is beautiful.", "Niagara is a famous waterfall."], "nature"),
    ("jungle", "Dense tropical forest", ["Animals live in the jungle.", "The jungle is wild."], "nature"),
]
for word, meaning, examples, category in nature_exp:
    words.append(create_word(f"4th_{idx:03d}", word, meaning, examples, level, category, difficulty=3))
    idx += 1

# Hobbies & Actions (16 words)
hobbies = [
    ("paint", "Create art with colors", ["I paint pictures.", "She paints beautifully."], "hobbies"),
    ("garden", "Grow plants as hobby", ["I love to garden.", "She gardens every weekend."], "hobbies"),
    ("explore", "Discover new places", ["Explore the forest.", "I love to explore."], "hobbies"),
    ("invent", "Create something new", ["Scientists invent things.", "He invented a machine."], "hobbies"),
    ("volunteer", "Help without payment", ["Volunteer at the shelter.", "She volunteers on weekends."], "hobbies"),
    ("cook", "Prepare food", ["I love to cook.", "Mom cooks dinner."], "hobbies"),
    ("bake", "Make bread or cakes", ["Bake a cake.", "She bakes cookies."], "hobbies"),
    ("camp", "Stay outdoors in tents", ["We went camping.", "Camp in the forest."], "hobbies"),
    ("hike", "Walk in nature", ["Hike up the mountain.", "We hiked all day."], "hobbies"),
    ("collect", "Gather items as hobby", ["I collect stamps.", "She collects coins."], "hobbies"),
    ("photograph", "Take pictures", ["I photograph nature.", "She photographs birds."], "hobbies"),
    ("create", "Make something new", ["Create art.", "She creates beautiful things."], "hobbies"),
    ("design", "Plan how something looks", ["Design a poster.", "He designs buildings."], "hobbies"),
    ("build", "Construct something", ["Build a robot.", "They built a treehouse."], "hobbies"),
    ("exercise", "Physical activity", ["Exercise daily.", "I exercise in the morning."], "health"),
    ("meditate", "Calm your mind", ["Meditate for peace.", "She meditates daily."], "health"),
]
for word, meaning, examples, category in hobbies:
    words.append(create_word(f"4th_{idx:03d}", word, meaning, examples, level, category, pos="verb", difficulty=3))
    idx += 1

# Household (12 words)
household = [
    ("bedroom", "Room for sleeping", ["Clean your bedroom.", "My bedroom is cozy."], "home"),
    ("garden", "Area with plants", ["Water the garden.", "The garden has flowers."], "home"),
    ("fridge", "Keeps food cold", ["Get milk from the fridge.", "The fridge is full."], "home"),
    ("oven", "Cooks food with heat", ["Bake in the oven.", "The oven is hot."], "home"),
    ("sink", "For washing dishes", ["Wash dishes in the sink.", "The sink has water."], "home"),
    ("mirror", "Shows your reflection", ["Look in the mirror.", "The mirror is clean."], "home"),
    ("pillow", "For resting head", ["Fluff the pillow.", "My pillow is soft."], "home"),
    ("blanket", "Covers you when sleeping", ["Pull up the blanket.", "The blanket is warm."], "home"),
    ("sofa", "Comfortable seat", ["Sit on the sofa.", "The sofa is big."], "home"),
    ("shelf", "Holds books and items", ["Put it on the shelf.", "The shelf is full."], "home"),
    ("curtain", "Covers windows", ["Open the curtains.", "The curtains are blue."], "home"),
    ("carpet", "Floor covering", ["Walk on the carpet.", "The carpet is soft."], "home"),
]
for word, meaning, examples, category in household:
    words.append(create_word(f"4th_{idx:03d}", word, meaning, examples, level, category, difficulty=3))
    idx += 1

# Descriptions (16 words)
descriptions = [
    ("beautiful", "Very pretty", ["The sunset is beautiful.", "What a beautiful day!"], "adjectives"),
    ("dangerous", "Could cause harm", ["Fire is dangerous.", "Avoid dangerous areas."], "adjectives"),
    ("wise", "Having good judgment", ["The owl is wise.", "Be wise."], "adjectives"),
    ("smooth", "Not rough", ["The surface is smooth.", "Her skin is smooth."], "adjectives"),
    ("rough", "Not smooth", ["The road is rough.", "Sandpaper is rough."], "adjectives"),
    ("shiny", "Reflecting light", ["The star is shiny.", "My shoes are shiny."], "adjectives"),
    ("dull", "Not shiny or bright", ["The knife is dull.", "The color is dull."], "adjectives"),
    ("sweet", "Having sugar taste", ["Sugar is sweet.", "She has a sweet voice."], "adjectives"),
    ("sour", "Acidic taste", ["Lemon is sour.", "This milk is sour."], "adjectives"),
    ("bitter", "Strong unpleasant taste", ["Coffee is bitter.", "The medicine is bitter."], "adjectives"),
    ("spicy", "Hot with spices", ["The curry is spicy.", "I like spicy food."], "adjectives"),
    ("fresh", "Recently made", ["Fresh bread smells good.", "Fresh air is nice."], "adjectives"),
    ("stale", "Not fresh", ["The bread is stale.", "Don't eat stale food."], "adjectives"),
    ("ancient", "Very old", ["The ruins are ancient.", "Ancient civilizations."], "adjectives"),
    ("modern", "Current times", ["Modern technology.", "A modern building."], "adjectives"),
    ("enormous", "Very large", ["The elephant is enormous.", "An enormous building."], "adjectives"),
]
for word, meaning, examples, category in descriptions:
    words.append(create_word(f"4th_{idx:03d}", word, meaning, examples, level, category, pos="adjective", difficulty=3))
    idx += 1

# Animals Advanced (10 words)
animals_adv = [
    ("crocodile", "Large reptile with big mouth", ["Crocodiles are dangerous.", "The crocodile swam."], "animals"),
    ("hippopotamus", "Large water-loving animal", ["Hippos live in rivers.", "The hippo is huge."], "animals"),
    ("rhinoceros", "Animal with horn on nose", ["Rhinos are endangered.", "The rhino charged."], "animals"),
    ("peacock", "Bird with colorful tail", ["The peacock displayed its feathers.", "Peacocks are beautiful."], "animals"),
    ("parrot", "Colorful talking bird", ["The parrot talks.", "Parrots are smart."], "animals"),
    ("owl", "Bird that hunts at night", ["Owls are nocturnal.", "The owl hooted."], "animals"),
    ("bat", "Flying mammal", ["Bats sleep upside down.", "Bats come out at night."], "animals"),
    ("squirrel", "Small animal that collects nuts", ["The squirrel gathered nuts.", "Squirrels climb trees."], "animals"),
    ("hedgehog", "Small spiny animal", ["The hedgehog curled up.", "Hedgehogs are cute."], "animals"),
    ("dolphin", "Intelligent sea mammal", ["Dolphins are smart.", "The dolphin jumped."], "animals"),
]
for word, meaning, examples, category in animals_adv:
    words.append(create_word(f"4th_{idx:03d}", word, meaning, examples, level, category, difficulty=3))
    idx += 1

# School Subjects (7 words)
subjects = [
    ("mathematics", "Study of numbers", ["I love mathematics.", "Math is useful."], "school"),
    ("science", "Study of nature", ["Science is interesting.", "We did a science experiment."], "school"),
    ("history", "Study of the past", ["Learn history.", "History teaches us lessons."], "school"),
    ("geography", "Study of Earth", ["Geography shows maps.", "I like geography."], "school"),
    ("art", "Creative expression", ["Art class is fun.", "She is good at art."], "school"),
    ("music", "Sound art form", ["I love music.", "She plays music."], "school"),
    ("sports", "Physical games", ["I play sports.", "Sports keep us fit."], "school"),
]
for word, meaning, examples, category in subjects:
    words.append(create_word(f"4th_{idx:03d}", word, meaning, examples, level, category, difficulty=3))
    idx += 1

# Food Advanced (9 words)
food_adv = [
    ("pizza", "Italian food with cheese", ["I love pizza.", "Pizza is delicious."], "food"),
    ("pasta", "Italian noodles", ["Pasta with sauce.", "I like pasta."], "food"),
    ("sandwich", "Bread with filling", ["Make a sandwich.", "I had a sandwich for lunch."], "food"),
    ("burger", "Bread with patty", ["I want a burger.", "The burger is tasty."], "food"),
    ("noodles", "Long thin pasta", ["Noodles are yummy.", "I eat noodles."], "food"),
    ("dessert", "Sweet after meal", ["What's for dessert?", "Ice cream is my favorite dessert."], "food"),
    ("spice", "Adds flavor", ["Add some spice.", "Indian food has spices."], "food"),
    ("ingredient", "Part of a recipe", ["Mix the ingredients.", "This is a key ingredient."], "food"),
    ("recipe", "Instructions for cooking", ["Follow the recipe.", "She has many recipes."], "food"),
]
for word, meaning, examples, category in food_adv:
    words.append(create_word(f"4th_{idx:03d}", word, meaning, examples, level, category, difficulty=3))
    idx += 1

# Time (6 words)
time_words = [
    ("morning", "Early part of day", ["Good morning!", "I exercise in the morning."], "time"),
    ("afternoon", "Middle of day", ["Good afternoon!", "We play in the afternoon."], "time"),
    ("evening", "Late part of day", ["Good evening!", "The evening is peaceful."], "time"),
    ("midnight", "12 o'clock at night", ["It's midnight.", "The clock struck midnight."], "time"),
    ("dawn", "When sun rises", ["Wake at dawn.", "The dawn is beautiful."], "time"),
    ("dusk", "When sun sets", ["Walk at dusk.", "Dusk has beautiful colors."], "time"),
]
for word, meaning, examples, category in time_words:
    words.append(create_word(f"4th_{idx:03d}", word, meaning, examples, level, category, difficulty=3))
    idx += 1

# More 4th-5th words
more_4th = [
    ("adventure", "Exciting experience", ["Life is an adventure.", "We had an adventure."], "nouns"),
    ("achievement", "Something accomplished", ["Great achievement!", "I'm proud of my achievement."], "nouns"),
    ("attention", "Focus", ["Pay attention.", "She needs attention."], "nouns"),
    ("balance", "Steady position", ["Keep your balance.", "Balance is important."], "nouns"),
    ("behavior", "How you act", ["Good behavior.", "Watch your behavior."], "nouns"),
    ("believe", "Think is true", ["I believe you.", "Believe in yourself."], "verbs"),
    ("celebrate", "Mark special occasion", ["Celebrate your birthday.", "We celebrate festivals."], "verbs"),
    ("challenge", "Difficult task", ["Accept the challenge.", "It was a challenge."], "nouns"),
    ("character", "Person's nature", ["He has good character.", "The story character."], "nouns"),
    ("communicate", "Share information", ["We communicate by talking.", "Communication is key."], "verbs"),
    ("compare", "Find similarities and differences", ["Compare the two.", "Let's compare."], "verbs"),
    ("complete", "Finish entirely", ["Complete your work.", "The task is complete."], "verbs"),
    ("concentrate", "Focus hard", ["Concentrate on studies.", "I can't concentrate."], "verbs"),
    ("consider", "Think about carefully", ["Consider your options.", "I will consider it."], "verbs"),
    ("continue", "Keep going", ["Continue reading.", "Please continue."], "verbs"),
    ("curious", "Wanting to know", ["I am curious.", "Curious minds learn."], "adjectives"),
    ("decide", "Make a choice", ["Decide now.", "I decided to go."], "verbs"),
    ("describe", "Tell about in detail", ["Describe your day.", "Can you describe it?"], "verbs"),
    ("develop", "Grow or create", ["Develop your skills.", "The plan developed."], "verbs"),
    ("discover", "Find out", ["Discover new things.", "I discovered the truth."], "verbs"),
    ("discuss", "Talk about", ["Discuss the topic.", "Let's discuss."], "verbs"),
    ("education", "Process of learning", ["Education is important.", "Get good education."], "nouns"),
    ("encourage", "Give support", ["Encourage each other.", "She encouraged me."], "verbs"),
    ("environment", "Surroundings", ["Protect the environment.", "A clean environment."], "nouns"),
    ("excellent", "Very good", ["Excellent work!", "She is excellent."], "adjectives"),
    ("experience", "Knowledge from doing", ["Learn from experience.", "It was an experience."], "nouns"),
    ("experiment", "Scientific test", ["Do an experiment.", "The experiment worked."], "nouns"),
    ("explain", "Make clear", ["Explain the answer.", "Can you explain?"], "verbs"),
    ("expression", "Showing feelings", ["A happy expression.", "Express yourself."], "nouns"),
    ("famous", "Well known", ["A famous person.", "She became famous."], "adjectives"),
    ("freedom", "Being free", ["Freedom is precious.", "We have freedom."], "nouns"),
    ("generous", "Giving freely", ["Be generous.", "She is generous."], "adjectives"),
    ("government", "Ruling authority", ["The government helps.", "Government buildings."], "nouns"),
    ("imagine", "Create in mind", ["Imagine a world.", "I can imagine."], "verbs"),
    ("improve", "Make better", ["Improve your skills.", "I improved."], "verbs"),
    ("include", "Have as part", ["Include everyone.", "It includes all."], "verbs"),
    ("information", "Facts and details", ["Get information.", "This is useful information."], "nouns"),
    ("intelligent", "Very smart", ["She is intelligent.", "Intelligent answer."], "adjectives"),
    ("interest", "Want to know more", ["Show interest.", "My interest grew."], "nouns"),
    ("knowledge", "What you know", ["Knowledge is power.", "Gain knowledge."], "nouns"),
    ("language", "System of words", ["Learn a new language.", "English is a language."], "nouns"),
    ("measure", "Find the size", ["Measure the length.", "I measured it."], "verbs"),
    ("memory", "What you remember", ["I have a good memory.", "Happy memories."], "nouns"),
    ("necessary", "Needed", ["It's necessary.", "A necessary step."], "adjectives"),
    ("opportunity", "Chance", ["A great opportunity.", "Don't miss the opportunity."], "nouns"),
    ("organize", "Arrange in order", ["Organize your desk.", "I organized everything."], "verbs"),
    ("patient", "Able to wait calmly", ["Be patient.", "She is patient."], "adjectives"),
    ("population", "Number of people", ["Large population.", "The population grew."], "nouns"),
    ("practice", "Do repeatedly to improve", ["Practice makes perfect.", "I practice daily."], "verbs"),
    ("prepare", "Get ready", ["Prepare for the test.", "I prepared lunch."], "verbs"),
    ("problem", "Difficulty to solve", ["Solve the problem.", "We have a problem."], "nouns"),
    ("protect", "Keep safe", ["Protect the environment.", "I will protect you."], "verbs"),
    ("purpose", "Reason for something", ["What's the purpose?", "Life has a purpose."], "nouns"),
    ("quality", "How good something is", ["Good quality.", "Quality matters."], "nouns"),
    ("question", "Something asked", ["Ask a question.", "I have a question."], "nouns"),
    ("realize", "Become aware", ["I realized my mistake.", "She realized the truth."], "verbs"),
    ("recommend", "Suggest", ["I recommend this book.", "He recommended it."], "verbs"),
    ("remember", "Keep in memory", ["Remember the rules.", "I remember you."], "verbs"),
    ("responsible", "Having duty", ["Be responsible.", "I am responsible."], "adjectives"),
    ("result", "Outcome", ["Good results.", "The result was positive."], "nouns"),
    ("success", "Achievement of goal", ["Success takes time.", "Congratulations on your success."], "nouns"),
    ("support", "Help", ["I support you.", "Thank you for your support."], "verbs"),
    ("technology", "Scientific tools", ["Modern technology.", "Technology helps us."], "nouns"),
    ("tradition", "Customs passed down", ["Follow tradition.", "It's a tradition."], "nouns"),
    ("understand", "Comprehend", ["I understand.", "Do you understand?"], "verbs"),
    ("valuable", "Worth a lot", ["Valuable advice.", "Time is valuable."], "adjectives"),
]
for word, meaning, examples, category in more_4th:
    words.append(create_word(f"4th_{idx:03d}", word, meaning, examples, level, category, difficulty=3))
    idx += 1

print(f"4th-5th level: {idx-1} words")

# ============== AGES 10-11 (5th-adv): 250 Words ==============
level = "5th-adv"
idx = 1

# Science & Nature (13 words)
science = [
    ("planet", "Body orbiting a star", ["Earth is a planet.", "There are 8 planets."], "science"),
    ("energy", "Power to do work", ["Solar energy.", "Save energy."], "science"),
    ("magnet", "Attracts iron", ["The magnet pulls metal.", "Magnets are useful."], "science"),
    ("experiment", "Scientific test", ["Conduct an experiment.", "The experiment succeeded."], "science"),
    ("gravity", "Force pulling down", ["Gravity keeps us on Earth.", "Gravity is a force."], "science"),
    ("electricity", "Form of energy", ["Electricity powers lights.", "Be careful with electricity."], "science"),
    ("microscope", "Makes tiny things visible", ["Look through the microscope.", "Use a microscope."], "science"),
    ("telescope", "See far objects", ["Look through the telescope.", "Telescopes show stars."], "science"),
    ("fossil", "Remains of ancient life", ["We found a fossil.", "Dinosaur fossils."], "science"),
    ("earthquake", "Ground shaking", ["The earthquake was scary.", "Earthquakes are natural."], "science"),
    ("tornado", "Spinning wind column", ["A tornado hit the town.", "Tornadoes are dangerous."], "science"),
    ("atmosphere", "Air around Earth", ["Earth's atmosphere.", "The atmosphere protects us."], "science"),
    ("temperature", "How hot or cold", ["Check the temperature.", "The temperature dropped."], "science"),
]
for word, meaning, examples, category in science:
    words.append(create_word(f"5th_{idx:03d}", word, meaning, examples, level, category, difficulty=4))
    idx += 1

# Time Advanced (9 words)
time_adv = [
    ("minute", "60 seconds", ["Wait a minute.", "It takes 5 minutes."], "time"),
    ("hour", "60 minutes", ["An hour has passed.", "Meet in an hour."], "time"),
    ("second", "Unit of time", ["Just a second.", "Count the seconds."], "time"),
    ("century", "100 years", ["A century ago.", "The 21st century."], "time"),
    ("decade", "10 years", ["A decade of progress.", "In the last decade."], "time"),
    ("calendar", "Shows dates", ["Check the calendar.", "Mark the calendar."], "time"),
    ("schedule", "Plan of times", ["Follow the schedule.", "My schedule is full."], "time"),
    ("deadline", "Final time limit", ["Meet the deadline.", "The deadline is tomorrow."], "time"),
    ("ancient", "Very old time", ["Ancient history.", "Ancient civilizations."], "time"),
]
for word, meaning, examples, category in time_adv:
    words.append(create_word(f"5th_{idx:03d}", word, meaning, examples, level, category, difficulty=4))
    idx += 1

# Abstract Ideas (15 words)
abstract = [
    ("courage", "Bravery", ["Show courage.", "Courage is important."], "abstract"),
    ("freedom", "Liberty", ["Freedom to choose.", "Value your freedom."], "abstract"),
    ("honesty", "Being truthful", ["Honesty is the best policy.", "Practice honesty."], "abstract"),
    ("secret", "Hidden information", ["Keep a secret.", "It's a secret."], "abstract"),
    ("promise", "Commitment to do", ["Keep your promise.", "I promise."], "abstract"),
    ("adventure", "Exciting experience", ["Life is an adventure.", "Seek adventure."], "abstract"),
    ("wisdom", "Good judgment", ["Wisdom comes with age.", "Share your wisdom."], "abstract"),
    ("creativity", "Using imagination", ["Show creativity.", "Creativity is valued."], "abstract"),
    ("justice", "Fairness", ["Seek justice.", "Justice prevails."], "abstract"),
    ("respect", "Regard for others", ["Show respect.", "Earn respect."], "abstract"),
    ("responsibility", "Duty", ["Take responsibility.", "It's your responsibility."], "abstract"),
    ("patience", "Ability to wait", ["Have patience.", "Patience is key."], "abstract"),
    ("determination", "Firm purpose", ["Show determination.", "With determination, you can succeed."], "abstract"),
    ("imagination", "Creative thinking", ["Use your imagination.", "Imagination is limitless."], "abstract"),
    ("inspiration", "Something that motivates", ["Find inspiration.", "She is my inspiration."], "abstract"),
]
for word, meaning, examples, category in abstract:
    words.append(create_word(f"5th_{idx:03d}", word, meaning, examples, level, category, difficulty=4))
    idx += 1

# Actions Advanced (15 words)
actions_adv = [
    ("journey", "Trip or travel", ["Begin the journey.", "Life is a journey."], "actions"),
    ("notice", "Observe", ["I noticed the change.", "Did you notice?"], "actions"),
    ("discover", "Find out", ["Discover the truth.", "She discovered the answer."], "actions"),
    ("create", "Make something new", ["Create art.", "We create memories."], "actions"),
    ("achieve", "Accomplish", ["Achieve your goals.", "I achieved success."], "actions"),
    ("analyze", "Study in detail", ["Analyze the data.", "Let's analyze."], "actions"),
    ("appreciate", "Value highly", ["I appreciate your help.", "Appreciate life."], "actions"),
    ("communicate", "Share information", ["Communicate clearly.", "We must communicate."], "actions"),
    ("demonstrate", "Show how", ["Demonstrate the process.", "She demonstrated."], "actions"),
    ("evaluate", "Assess", ["Evaluate the results.", "I evaluated the options."], "actions"),
    ("investigate", "Examine", ["Investigate the case.", "Let's investigate."], "actions"),
    ("negotiate", "Discuss to agree", ["Negotiate a deal.", "They negotiated."], "actions"),
    ("participate", "Take part", ["Participate actively.", "Everyone participated."], "actions"),
    ("persuade", "Convince", ["Persuade them.", "She persuaded me."], "actions"),
    ("transform", "Change completely", ["Transform your life.", "The city transformed."], "actions"),
]
for word, meaning, examples, category in actions_adv:
    words.append(create_word(f"5th_{idx:03d}", word, meaning, examples, level, category, pos="verb", difficulty=4))
    idx += 1

# School & Learning (8 words)
learning = [
    ("alphabet", "Letters of language", ["Learn the alphabet.", "26 letters in the alphabet."], "school"),
    ("dictionary", "Book of words and meanings", ["Use the dictionary.", "Look it up in the dictionary."], "school"),
    ("paragraph", "Group of sentences", ["Write a paragraph.", "Read the paragraph."], "school"),
    ("sentence", "Group of words", ["Make a sentence.", "Write complete sentences."], "school"),
    ("vowel", "A, E, I, O, U", ["Identify the vowels.", "Every word has vowels."], "school"),
    ("consonant", "Letters that aren't vowels", ["B, C, D are consonants.", "Count the consonants."], "school"),
    ("grammar", "Rules of language", ["Study grammar.", "Grammar is important."], "school"),
    ("vocabulary", "Words you know", ["Build your vocabulary.", "My vocabulary is growing."], "school"),
]
for word, meaning, examples, category in learning:
    words.append(create_word(f"5th_{idx:03d}", word, meaning, examples, level, category, difficulty=4))
    idx += 1

# Numbers (3 words)
numbers_adv = [
    ("hundred", "The number 100", ["Count to a hundred.", "I have a hundred books."], "numbers"),
    ("thousand", "The number 1000", ["A thousand stars.", "It costs a thousand."], "numbers"),
    ("million", "The number 1,000,000", ["Millions of people.", "A million dollars."], "numbers"),
]
for word, meaning, examples, category in numbers_adv:
    words.append(create_word(f"5th_{idx:03d}", word, meaning, examples, level, category, pos="number", difficulty=4))
    idx += 1

# Technology (7 words)
technology = [
    ("internet", "Global network", ["Use the internet.", "The internet connects people."], "technology"),
    ("computer", "Electronic device", ["Use a computer.", "Computers are useful."], "technology"),
    ("website", "Internet page", ["Visit the website.", "Create a website."], "technology"),
    ("keyboard", "Typing device", ["Type on the keyboard.", "Clean the keyboard."], "technology"),
    ("software", "Computer programs", ["Install software.", "Update the software."], "technology"),
    ("battery", "Stores power", ["Charge the battery.", "The battery is low."], "technology"),
    ("device", "Electronic tool", ["Use the device.", "A new device."], "technology"),
]
for word, meaning, examples, category in technology:
    words.append(create_word(f"5th_{idx:03d}", word, meaning, examples, level, category, difficulty=4))
    idx += 1

# More advanced words
more_5th = [
    ("accomplish", "Complete successfully", ["Accomplish your goals.", "I accomplished my task."], "verbs"),
    ("accurate", "Correct and precise", ["Be accurate.", "The answer is accurate."], "adjectives"),
    ("adequate", "Enough", ["Adequate supplies.", "This is adequate."], "adjectives"),
    ("alternative", "Another option", ["Find an alternative.", "What's the alternative?"], "nouns"),
    ("appropriate", "Suitable", ["Appropriate behavior.", "Is this appropriate?"], "adjectives"),
    ("argument", "Disagreement", ["Avoid arguments.", "They had an argument."], "nouns"),
    ("authority", "Power to control", ["The authority decided.", "Who has authority?"], "nouns"),
    ("benefit", "Advantage", ["Benefits of exercise.", "It will benefit you."], "nouns"),
    ("category", "Group with similar things", ["In this category.", "Which category?"], "nouns"),
    ("circumstance", "Situation", ["Under the circumstances.", "Different circumstances."], "nouns"),
    ("community", "Group of people", ["Our community.", "Community service."], "nouns"),
    ("consequence", "Result of action", ["Face the consequences.", "Every action has consequences."], "nouns"),
    ("consider", "Think about", ["Consider the options.", "I'll consider it."], "verbs"),
    ("constant", "Never changing", ["Constant support.", "A constant friend."], "adjectives"),
    ("contribute", "Give to help", ["Contribute to society.", "She contributed."], "verbs"),
    ("cooperation", "Working together", ["Need cooperation.", "Thank you for your cooperation."], "nouns"),
    ("definition", "Meaning of word", ["What's the definition?", "Look up the definition."], "nouns"),
    ("demonstrate", "Show clearly", ["Demonstrate the method.", "She demonstrated."], "verbs"),
    ("economy", "System of money and trade", ["The economy is growing.", "Economic growth."], "nouns"),
    ("efficient", "Works well", ["An efficient method.", "Be efficient."], "adjectives"),
    ("establish", "Set up", ["Establish rules.", "They established a company."], "verbs"),
    ("estimate", "Guess approximately", ["Estimate the cost.", "My estimate was close."], "verbs"),
    ("evidence", "Proof", ["Show evidence.", "The evidence is clear."], "nouns"),
    ("examine", "Look at closely", ["Examine the details.", "I examined it."], "verbs"),
    ("feature", "Characteristic", ["Key feature.", "Special features."], "nouns"),
    ("flexible", "Can bend or change", ["Be flexible.", "Flexible schedule."], "adjectives"),
    ("function", "Purpose or role", ["The function of this.", "It functions well."], "nouns"),
    ("generation", "People born around same time", ["My generation.", "Future generations."], "nouns"),
    ("guarantee", "Promise certainty", ["I guarantee it.", "Money-back guarantee."], "verbs"),
    ("identify", "Recognize", ["Identify the problem.", "I identified it."], "verbs"),
    ("illustrate", "Show with examples", ["Illustrate your point.", "The diagram illustrates."], "verbs"),
    ("impact", "Strong effect", ["Make an impact.", "The impact was huge."], "nouns"),
    ("individual", "Single person", ["Each individual.", "Individual effort."], "nouns"),
    ("initial", "First", ["Initial reaction.", "Initial stage."], "adjectives"),
    ("instance", "Example", ["For instance...", "In this instance."], "nouns"),
    ("interpret", "Explain meaning", ["Interpret the results.", "How do you interpret?"], "verbs"),
    ("involve", "Include", ["It involves effort.", "Don't involve me."], "verbs"),
    ("maintain", "Keep in condition", ["Maintain your health.", "I maintain my car."], "verbs"),
    ("majority", "More than half", ["The majority voted yes.", "Majority decision."], "nouns"),
    ("maximum", "Greatest amount", ["Maximum speed.", "The maximum is 100."], "nouns"),
    ("minimum", "Least amount", ["Minimum effort.", "The minimum is 10."], "nouns"),
    ("obvious", "Easy to see", ["It's obvious.", "The obvious choice."], "adjectives"),
    ("occur", "Happen", ["It will occur tomorrow.", "When did it occur?"], "verbs"),
    ("option", "Choice", ["We have options.", "Choose an option."], "nouns"),
    ("original", "First or unique", ["Original idea.", "The original version."], "adjectives"),
    ("participate", "Take part", ["Please participate.", "Everyone participated."], "verbs"),
    ("percent", "Out of hundred", ["Ten percent.", "50 percent off."], "nouns"),
    ("period", "Length of time", ["A period of time.", "That period was tough."], "nouns"),
    ("permanent", "Lasting forever", ["Permanent change.", "Is it permanent?"], "adjectives"),
    ("phenomenon", "Observable event", ["A natural phenomenon.", "Strange phenomenon."], "nouns"),
    ("physical", "Related to body", ["Physical exercise.", "Physical health."], "adjectives"),
    ("policy", "Rule or principle", ["Company policy.", "Follow the policy."], "nouns"),
    ("positive", "Good or certain", ["Stay positive.", "Positive attitude."], "adjectives"),
    ("potential", "Possible ability", ["Reach your potential.", "Great potential."], "nouns"),
    ("previous", "Before this", ["The previous day.", "Previous experience."], "adjectives"),
    ("primary", "Main", ["Primary goal.", "Primary school."], "adjectives"),
    ("principle", "Basic truth or rule", ["Basic principles.", "Principle of fairness."], "nouns"),
    ("procedure", "Way of doing", ["Follow the procedure.", "Standard procedure."], "nouns"),
    ("process", "Series of steps", ["The process takes time.", "Follow the process."], "nouns"),
    ("professional", "Expert", ["Professional work.", "A professional."], "adjectives"),
    ("proportion", "Part of whole", ["In proportion.", "Equal proportions."], "nouns"),
    ("purchase", "Buy", ["Purchase a ticket.", "Good purchase."], "verbs"),
    ("range", "Variety", ["Wide range.", "In this range."], "nouns"),
    ("region", "Area", ["This region.", "Different regions."], "nouns"),
    ("regulate", "Control", ["Regulate temperature.", "It's regulated."], "verbs"),
    ("relevant", "Related to topic", ["Is it relevant?", "Relevant information."], "adjectives"),
    ("reliable", "Can be trusted", ["A reliable source.", "He is reliable."], "adjectives"),
    ("require", "Need", ["It requires effort.", "What do you require?"], "verbs"),
    ("research", "Study to find facts", ["Do research.", "Research shows."], "nouns"),
    ("resource", "Available supply", ["Natural resources.", "Use resources wisely."], "nouns"),
    ("respond", "Reply", ["Please respond.", "I responded quickly."], "verbs"),
    ("role", "Part to play", ["Important role.", "What's your role?"], "nouns"),
    ("section", "Part", ["This section.", "Read section 3."], "nouns"),
    ("select", "Choose", ["Select one.", "I selected the best."], "verbs"),
    ("significant", "Important", ["Significant change.", "A significant event."], "adjectives"),
    ("similar", "Almost the same", ["Similar ideas.", "They look similar."], "adjectives"),
    ("source", "Where something comes from", ["The source of information.", "What's the source?"], "nouns"),
    ("specific", "Particular", ["Be specific.", "Specific details."], "adjectives"),
    ("strategy", "Plan to achieve", ["Good strategy.", "What's the strategy?"], "nouns"),
    ("structure", "How something is built", ["Building structure.", "Sentence structure."], "nouns"),
    ("sufficient", "Enough", ["Sufficient time.", "Is this sufficient?"], "adjectives"),
    ("survey", "Study by asking", ["Take a survey.", "Survey results."], "nouns"),
    ("technique", "Method of doing", ["New technique.", "Learn the technique."], "nouns"),
    ("theory", "Idea explaining something", ["In theory.", "Scientific theory."], "nouns"),
    ("transfer", "Move from one to another", ["Transfer money.", "File transfer."], "verbs"),
    ("unique", "One of a kind", ["You are unique.", "A unique opportunity."], "adjectives"),
    ("variety", "Different types", ["A variety of options.", "Wide variety."], "nouns"),
    ("version", "Form of something", ["New version.", "Which version?"], "nouns"),
]
for word, meaning, examples, category in more_5th:
    words.append(create_word(f"5th_{idx:03d}", word, meaning, examples, level, category, difficulty=4))
    idx += 1

print(f"5th-adv level: {idx-1} words")

# Save all words
with open("/app/backend/data/words_production.json", "w", encoding="utf-8") as f:
    json.dump(words, f, ensure_ascii=False, indent=2)

# Print summary
levels = {}
for w in words:
    lvl = w["level"]
    levels[lvl] = levels.get(lvl, 0) + 1

print(f"\n=== FINAL WORD DATABASE ===")
print(f"Total words: {len(words)}")
print(f"By level: {levels}")
print("\nWords saved to /app/backend/data/words_production.json")
