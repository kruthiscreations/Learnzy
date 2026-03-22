#!/usr/bin/env python3
"""Add all user-specified words from the 4 age groups (2-4, 5-7, 8-10, 10-11)"""
import json

with open('data/words_production.json', 'r', encoding='utf-8') as f:
    existing = json.load(f)

existing_words = {w['word_english'].lower() for w in existing}
print(f"Starting with {len(existing)} words ({len(existing_words)} unique)")

new_words = []
idx = len(existing) + 1

def add(english, meaning, examples, level, category, pos, difficulty, translations=None):
    global idx
    key = english.lower().strip()
    if key in existing_words:
        return
    existing_words.add(key)
    w = {
        "word_id": f"u_{idx:04d}",
        "word_english": english.strip(),
        "translations": translations or {},
        "meaning": meaning,
        "example_sentences": examples,
        "level": level,
        "category": category,
        "synonyms": [],
        "antonyms": [],
        "part_of_speech": pos,
        "difficulty": difficulty
    }
    new_words.append(w)
    idx += 1

# =====================================================================
# AGES 2-4 → lkg-1st (difficulty=1)
# =====================================================================
LVL = "lkg-1st"
D = 1

# Family & People
for w, m, ex in [
    ("Mom", "Your mother", ["My mom is kind.", "Mom loves me."]),
    ("Dad", "Your father", ["My dad is strong.", "Dad plays with me."]),
    ("Baby", "A very young child", ["The baby is sleeping.", "I love the baby."]),
    ("Me", "Yourself", ["Look at me.", "This is me."]),
    ("You", "The person being spoken to", ["I like you.", "You are my friend."]),
    ("Brother", "A male sibling", ["My brother is tall.", "I play with my brother."]),
    ("Sister", "A female sibling", ["My sister is nice.", "Sister helps me."]),
    ("Grandma", "Your mother's or father's mother", ["Grandma tells stories.", "I love grandma."]),
    ("Grandpa", "Your mother's or father's father", ["Grandpa is wise.", "Grandpa reads to me."]),
    ("Friend", "A person you like and trust", ["She is my friend.", "Friends play together."]),
    ("Family", "People related to you", ["I love my family.", "Family is important."]),
    ("Boy", "A male child", ["The boy runs fast.", "A happy boy."]),
    ("Girl", "A female child", ["The girl sings well.", "A clever girl."]),
    ("Man", "An adult male", ["The man is tall.", "A kind man."]),
    ("Woman", "An adult female", ["The woman smiles.", "A strong woman."]),
    ("Aunt", "Your parent's sister", ["Aunt gave me a gift.", "I visit my aunt."]),
    ("Uncle", "Your parent's brother", ["Uncle is funny.", "My uncle teaches me."]),
    ("Cousin", "Child of your aunt or uncle", ["My cousin plays cricket.", "We visit our cousins."]),
    ("Neighbor", "A person who lives nearby", ["Our neighbor is kind.", "The neighbor has a dog."]),
    ("Child", "A young person", ["The child is happy.", "Every child deserves love."]),
    ("Kid", "A young person", ["The kid is playing.", "Kids love games."]),
]:
    add(w, m, ex, LVL, "family", "noun", D)

# Animals
for w, m, ex in [
    ("Dog", "A common pet that barks", ["The dog wags its tail.", "I love my dog."]),
    ("Cat", "A furry pet that meows", ["The cat sleeps on the mat.", "My cat is soft."]),
    ("Bird", "An animal that can fly", ["The bird sings.", "A colorful bird."]),
    ("Fish", "An animal that lives in water", ["The fish swims.", "I fed the fish."]),
    ("Cow", "A farm animal that gives milk", ["The cow says moo.", "Cows eat grass."]),
    ("Pig", "A pink farm animal", ["The pig rolls in mud.", "Pigs are funny."]),
    ("Sheep", "A woolly farm animal", ["The sheep has soft wool.", "Sheep graze in the field."]),
    ("Horse", "A large animal you can ride", ["The horse gallops fast.", "I rode a horse."]),
    ("Lion", "The king of the jungle", ["The lion roars.", "Lions are brave."]),
    ("Tiger", "A striped wild cat", ["The tiger is strong.", "Tigers live in forests."]),
    ("Elephant", "The largest land animal", ["The elephant has a trunk.", "Elephants are wise."]),
    ("Duck", "A bird that swims and quacks", ["The duck swims in the pond.", "Ducks say quack."]),
    ("Chicken", "A bird kept for eggs", ["The chicken lays eggs.", "We have chickens."]),
    ("Frog", "A small green jumping animal", ["The frog jumps.", "Frogs live near ponds."]),
    ("Mouse", "A tiny animal with a long tail", ["The mouse is small.", "A mouse eats cheese."]),
    ("Rabbit", "A furry animal with long ears", ["The rabbit hops.", "Rabbits eat carrots."]),
    ("Snake", "A long animal without legs", ["The snake slithers.", "Snakes hiss."]),
    ("Bear", "A large furry wild animal", ["The bear is strong.", "Bears love honey."]),
    ("Fox", "A clever wild animal", ["The fox is clever.", "A red fox."]),
    ("Deer", "A gentle animal with antlers", ["The deer runs fast.", "A beautiful deer."]),
    ("Goat", "A farm animal that bleats", ["The goat climbs rocks.", "Goats eat leaves."]),
    ("Turkey", "A large bird", ["The turkey gobbles.", "A big turkey."]),
    ("Swan", "A graceful white bird", ["The swan is beautiful.", "Swans swim in lakes."]),
    ("Wolf", "A wild animal that howls", ["The wolf howls at the moon.", "Wolves live in packs."]),
    ("Hamster", "A small fluffy pet", ["The hamster runs in a wheel.", "My hamster is cute."]),
]:
    add(w, m, ex, LVL, "animals", "noun", D)

# Food Basics
for w, m, ex in [
    ("Apple", "A round red or green fruit", ["I eat an apple.", "Apples are healthy."]),
    ("Banana", "A long yellow fruit", ["The banana is sweet.", "I like bananas."]),
    ("Milk", "A white drink from cows", ["Drink your milk.", "Milk makes you strong."]),
    ("Bread", "Food made from flour", ["I eat bread.", "Bread is soft."]),
    ("Egg", "Food that comes from hens", ["I ate an egg.", "Eggs are nutritious."]),
    ("Rice", "White grains we eat", ["I eat rice.", "Rice is a staple food."]),
    ("Water", "A clear liquid we drink", ["Drink water.", "Water is important."]),
    ("Juice", "A drink made from fruit", ["Orange juice is yummy.", "I drink juice."]),
    ("Cake", "A sweet baked dessert", ["I love cake.", "A birthday cake."]),
    ("Cookie", "A small sweet baked treat", ["The cookie is crunchy.", "I baked cookies."]),
    ("Cheese", "A food made from milk", ["I like cheese.", "Cheese is tasty."]),
    ("Butter", "A yellow spread from milk", ["Spread butter on bread.", "Butter is soft."]),
    ("Jam", "A sweet fruit spread", ["I put jam on toast.", "Strawberry jam."]),
    ("Soup", "A warm liquid food", ["Hot soup warms you.", "Tomato soup."]),
    ("Tea", "A hot drink from leaves", ["Mom drinks tea.", "Tea is warm."]),
    ("Orange", "A round citrus fruit", ["The orange is juicy.", "I peel the orange."]),
    ("Pear", "A green or yellow fruit", ["The pear is sweet.", "Pears are soft."]),
    ("Grape", "A small round fruit in bunches", ["Grapes are purple.", "I eat grapes."]),
    ("Yogurt", "A creamy dairy food", ["Yogurt is healthy.", "I eat yogurt."]),
    ("Honey", "Sweet syrup from bees", ["Honey is sweet.", "Bees make honey."]),
]:
    add(w, m, ex, LVL, "food", "noun", D)

# Colors
for w, m, ex in [
    ("Red", "The color of roses", ["The ball is red.", "Red is bright."]),
    ("Blue", "The color of the sky", ["The sky is blue.", "I like blue."]),
    ("Green", "The color of grass", ["Leaves are green.", "Green is fresh."]),
    ("Yellow", "The color of the sun", ["The sun is yellow.", "A yellow flower."]),
    ("Pink", "A light red color", ["Her dress is pink.", "Pink flowers."]),
    ("Purple", "A mix of red and blue", ["Grapes are purple.", "A purple crayon."]),
    ("Black", "The darkest color", ["The cat is black.", "Night is black."]),
    ("White", "The lightest color", ["Snow is white.", "A white cloud."]),
    ("Brown", "The color of wood", ["The tree is brown.", "A brown dog."]),
    ("Gray", "A color between black and white", ["The sky is gray.", "Gray clouds."]),
    ("Silver", "A shiny light gray color", ["A silver coin.", "Silver sparkles."]),
    ("Gold", "A shiny yellow color", ["A gold ring.", "Gold is precious."]),
]:
    add(w, m, ex, LVL, "colors", "adjective", D)

# Numbers 1-30
nums = [("One",1),("Two",2),("Three",3),("Four",4),("Five",5),("Six",6),("Seven",7),("Eight",8),("Nine",9),("Ten",10),("Eleven",11),("Twelve",12),("Thirteen",13),("Fourteen",14),("Fifteen",15),("Sixteen",16),("Seventeen",17),("Eighteen",18),("Nineteen",19),("Twenty",20),("Twenty-one",21),("Twenty-two",22),("Twenty-three",23),("Twenty-four",24),("Twenty-five",25),("Twenty-six",26),("Twenty-seven",27),("Twenty-eight",28),("Twenty-nine",29),("Thirty",30)]
for w, n in nums:
    add(w, f"The number {n}", [f"I have {w.lower()} apples.", f"Count to {w.lower()}."], LVL, "numbers", "noun", D)

# Body Parts
for w, m, ex in [
    ("Hand", "The part at the end of your arm", ["Raise your hand.", "Wash your hands."]),
    ("Foot", "The part you stand on", ["My foot hurts.", "Put on your shoes."]),
    ("Head", "The top part of your body", ["Nod your head.", "Wear a hat on your head."]),
    ("Nose", "The part you breathe through", ["Touch your nose.", "My nose is cold."]),
    ("Mouth", "The part you eat and talk with", ["Open your mouth.", "Brush your mouth."]),
    ("Eye", "The part you see with", ["Close your eyes.", "I have brown eyes."]),
    ("Ear", "The part you hear with", ["Listen with your ears.", "My ears are cold."]),
    ("Arm", "The part between shoulder and hand", ["Raise your arm.", "My arm is strong."]),
    ("Leg", "The part you walk with", ["Run with your legs.", "My leg hurts."]),
    ("Hair", "What grows on your head", ["Comb your hair.", "My hair is black."]),
    ("Tummy", "Your stomach area", ["My tummy is full.", "Tummy ache."]),
    ("Back", "The rear part of your body", ["Lie on your back.", "My back hurts."]),
    ("Finger", "The thin parts on your hand", ["Count your fingers.", "Point with your finger."]),
    ("Toe", "The small parts on your foot", ["Wiggle your toes.", "I stubbed my toe."]),
    ("Elbow", "The middle joint of your arm", ["Bend your elbow.", "My elbow is scratched."]),
    ("Neck", "Connects head to body", ["Turn your neck.", "A long neck."]),
    ("Chin", "The bottom of your face", ["Rest your chin.", "A strong chin."]),
]:
    add(w, m, ex, LVL, "body", "noun", D)

# Actions (2-4)
for w, m, ex in [
    ("Eat", "To put food in your mouth", ["I eat lunch.", "Eat your vegetables."]),
    ("Drink", "To take in liquid", ["Drink your milk.", "I drink water."]),
    ("Sleep", "To rest with eyes closed", ["Time to sleep.", "I sleep at night."]),
    ("Play", "To have fun", ["Let's play.", "Children play in the park."]),
    ("Go", "To move from one place to another", ["Let's go!", "Go to school."]),
    ("Run", "To move fast on your feet", ["I run fast.", "Run to the park."]),
    ("Jump", "To push off the ground", ["Jump high!", "I can jump."]),
    ("Sit", "To rest on a chair", ["Sit down.", "I sit on the chair."]),
    ("Stand", "To be on your feet", ["Stand up.", "I stand tall."]),
    ("Walk", "To move on foot", ["Let's walk.", "Walk slowly."]),
    ("Clap", "To hit your hands together", ["Clap your hands.", "We clap for joy."]),
    ("Wave", "To move your hand to greet", ["Wave hello.", "Wave goodbye."]),
    ("Hug", "To hold someone close", ["Hug your mom.", "A warm hug."]),
    ("Kiss", "To touch with your lips", ["Kiss goodnight.", "A sweet kiss."]),
    ("Cry", "To shed tears", ["Don't cry.", "The baby cries."]),
    ("Laugh", "To make happy sounds", ["Laugh out loud.", "We laugh together."]),
    ("Point", "To show with your finger", ["Point at the star.", "Don't point."]),
    ("Pull", "To bring toward you", ["Pull the rope.", "Pull the door."]),
    ("Push", "To move away from you", ["Push the cart.", "Push the swing."]),
    ("Roll", "To turn over and over", ["Roll the ball.", "The wheel rolls."]),
]:
    add(w, m, ex, LVL, "actions", "verb", D)

# Sizes & Descriptions
for w, m, ex in [
    ("Big", "Large in size", ["A big house.", "The dog is big."]),
    ("Small", "Little in size", ["A small ant.", "Small hands."]),
    ("Tall", "High in height", ["A tall tree.", "He is tall."]),
    ("Short", "Not tall or not long", ["A short boy.", "Short hair."]),
    ("Long", "Great in length", ["A long road.", "Long hair."]),
    ("Hot", "Very warm", ["The sun is hot.", "Hot water."]),
    ("Cold", "Very cool", ["Ice is cold.", "Cold weather."]),
    ("Wet", "Covered with water", ["The floor is wet.", "Wet clothes."]),
    ("Dry", "Not wet", ["The towel is dry.", "Dry weather."]),
    ("Fast", "Quick in speed", ["The car is fast.", "Run fast."]),
    ("Slow", "Not fast", ["The snail is slow.", "Walk slow."]),
    ("Happy", "Feeling good", ["I am happy.", "A happy day."]),
    ("Sad", "Feeling unhappy", ["He is sad.", "A sad story."]),
    ("Yes", "To agree", ["Yes, I can.", "Say yes."]),
    ("No", "To disagree", ["No, thank you.", "Say no."]),
    ("Good", "Of high quality", ["Good job!", "A good boy."]),
    ("Bad", "Not good", ["Bad weather.", "A bad dream."]),
]:
    add(w, m, ex, LVL, "descriptions", "adjective", D)

# Objects & Toys
for w, m, ex in [
    ("Ball", "A round toy for playing", ["Throw the ball.", "A red ball."]),
    ("Toy", "Something to play with", ["My favorite toy.", "Toys are fun."]),
    ("Book", "Pages with words or pictures", ["Read a book.", "I love books."]),
    ("Car", "A vehicle with four wheels", ["The car is red.", "Ride in a car."]),
    ("Doll", "A toy that looks like a person", ["A pretty doll.", "I play with my doll."]),
    ("Block", "A building toy piece", ["Stack the blocks.", "Colorful blocks."]),
    ("Cup", "A container for drinking", ["A cup of milk.", "The cup is blue."]),
    ("Spoon", "A tool for eating", ["Eat with a spoon.", "A silver spoon."]),
    ("Plate", "A flat dish for food", ["Put food on the plate.", "A clean plate."]),
    ("Shoe", "What you wear on feet", ["Put on your shoes.", "New shoes."]),
    ("Hat", "What you wear on your head", ["A red hat.", "Wear a hat."]),
    ("Bag", "Something to carry things in", ["My school bag.", "A big bag."]),
    ("Truck", "A large vehicle", ["The truck is big.", "A red truck."]),
    ("Plane", "A vehicle that flies", ["The plane flies high.", "A paper plane."]),
]:
    add(w, m, ex, LVL, "objects", "noun", D)

# Directions & Positions
for w, m, ex in [
    ("Up", "Toward a higher place", ["Look up.", "Jump up."]),
    ("Down", "Toward a lower place", ["Sit down.", "Come down."]),
    ("In", "Inside something", ["Come in.", "The cat is in the box."]),
    ("Out", "Outside something", ["Go out.", "The dog is out."]),
    ("On", "On top of", ["The book is on the table.", "Sit on the chair."]),
    ("Off", "Away from", ["Turn off the light.", "Jump off."]),
    ("Open", "Not closed", ["Open the door.", "Open the book."]),
    ("Close", "To shut", ["Close the window.", "Close your eyes."]),
    ("Over", "Above or across", ["Jump over.", "The bird flew over."]),
    ("Under", "Below something", ["Under the table.", "The cat is under the bed."]),
]:
    add(w, m, ex, LVL, "positions", "preposition", D)

# Nature & Weather (2-4)
for w, m, ex in [
    ("Sun", "The star that gives us light", ["The sun is bright.", "The sun is hot."]),
    ("Rain", "Water falling from clouds", ["It is raining.", "Rain makes puddles."]),
    ("Snow", "White frozen water from the sky", ["Snow is white.", "Snow is cold."]),
    ("Cloud", "White shapes in the sky", ["The cloud is fluffy.", "Dark clouds bring rain."]),
    ("Wind", "Moving air", ["The wind blows.", "A strong wind."]),
    ("Tree", "A tall plant with branches", ["Climb the tree.", "A big tree."]),
    ("Flower", "The colorful part of a plant", ["A red flower.", "Flowers smell nice."]),
    ("Grass", "Green plants on the ground", ["The grass is green.", "Sit on the grass."]),
    ("Sky", "The space above us", ["The sky is blue.", "Look at the sky."]),
    ("Moon", "The light in the night sky", ["The moon is bright.", "A full moon."]),
    ("Star", "A tiny light in the night sky", ["Stars twinkle.", "Count the stars."]),
    ("Rock", "A hard piece of earth", ["A big rock.", "Throw a rock."]),
]:
    add(w, m, ex, LVL, "nature", "noun", D)

# Home Items
for w, m, ex in [
    ("House", "A building where people live", ["My house is big.", "Come to my house."]),
    ("Door", "What you open to enter", ["Open the door.", "Close the door."]),
    ("Window", "An opening with glass", ["Look out the window.", "Open the window."]),
    ("Bed", "Where you sleep", ["Go to bed.", "My bed is soft."]),
    ("Chair", "A seat with a back", ["Sit on the chair.", "A wooden chair."]),
    ("Table", "A flat surface with legs", ["Put it on the table.", "Eat at the table."]),
    ("Floor", "The bottom of a room", ["Sit on the floor.", "Clean the floor."]),
    ("Wall", "The side of a room", ["Hang it on the wall.", "The wall is white."]),
]:
    add(w, m, ex, LVL, "home", "noun", D)

# Shapes
for w, m, ex in [
    ("Circle", "A round shape", ["Draw a circle.", "The ball is a circle."]),
    ("Square", "A shape with four equal sides", ["A square box.", "Draw a square."]),
    ("Triangle", "A shape with three sides", ["A triangle has three corners.", "Draw a triangle."]),
    ("Rectangle", "A shape with four sides, two long", ["The door is a rectangle.", "Draw a rectangle."]),
]:
    add(w, m, ex, LVL, "shapes", "noun", D)

# Clothing
for w, m, ex in [
    ("Shirt", "Clothing for the upper body", ["A blue shirt.", "Wear a clean shirt."]),
    ("Pants", "Clothing for legs", ["Blue pants.", "Put on your pants."]),
    ("Sock", "Clothing for feet", ["Wear your socks.", "A pair of socks."]),
    ("Dress", "A one-piece outfit", ["A pretty dress.", "She wears a dress."]),
    ("Coat", "A warm outer layer", ["Wear your coat.", "A warm coat."]),
    ("Glove", "Covering for hands", ["Put on gloves.", "Warm gloves."]),
]:
    add(w, m, ex, LVL, "clothing", "noun", D)

# Sounds
for w, m, ex in [
    ("Meow", "The sound a cat makes", ["The cat says meow.", "Meow meow!"]),
    ("Woof", "The sound a dog makes", ["The dog says woof.", "Woof woof!"]),
    ("Moo", "The sound a cow makes", ["The cow says moo.", "Moo moo!"]),
    ("Quack", "The sound a duck makes", ["The duck says quack.", "Quack quack!"]),
    ("Roar", "A loud sound like a lion", ["The lion roars.", "A mighty roar!"]),
]:
    add(w, m, ex, LVL, "sounds", "noun", D)

# =====================================================================
# AGES 5-7 → 2nd-3rd (difficulty=2)
# =====================================================================
LVL = "2nd-3rd"
D = 2

# Family & School
for w, m, ex in [
    ("Teacher", "A person who teaches", ["My teacher is kind.", "The teacher explains."]),
    ("Pencil", "A tool for writing", ["Sharpen your pencil.", "A yellow pencil."]),
    ("Bell", "Makes a ringing sound", ["The school bell rings.", "Ring the bell."]),
    ("Classroom", "A room where students learn", ["Our classroom is neat.", "Sit in the classroom."]),
    ("Homework", "Work done at home from school", ["Do your homework.", "Homework is important."]),
    ("Playground", "An outdoor area for playing", ["Play in the playground.", "The playground is fun."]),
    ("Lunchbox", "A box for carrying food", ["Pack your lunchbox.", "A colorful lunchbox."]),
    ("Ruler", "A straight tool for measuring", ["Use a ruler.", "The ruler is 30 cm."]),
    ("Eraser", "A tool to remove pencil marks", ["Use the eraser.", "A pink eraser."]),
    ("Notebook", "A book for writing notes", ["Write in your notebook.", "A new notebook."]),
    ("Crayon", "A colored wax stick for drawing", ["Color with crayons.", "A box of crayons."]),
    ("Scissors", "A tool for cutting", ["Cut with scissors.", "Be careful with scissors."]),
    ("Board", "A surface for writing in class", ["Write on the board.", "The board is green."]),
    ("Bookcase", "A shelf for storing books", ["Books are in the bookcase.", "A tall bookcase."]),
    ("Student", "A person who studies", ["She is a good student.", "Students learn."]),
    ("Principal", "The head of a school", ["The principal is kind.", "Meet the principal."]),
    ("Lesson", "A period of learning", ["The lesson is fun.", "Today's lesson."]),
]:
    add(w, m, ex, LVL, "school", "noun", D)

# Animals (5-7)
for w, m, ex in [
    ("Zebra", "A striped black and white animal", ["The zebra has stripes.", "Zebras live in Africa."]),
    ("Giraffe", "The tallest animal", ["The giraffe has a long neck.", "Giraffes eat leaves."]),
    ("Monkey", "A clever animal that climbs trees", ["The monkey swings.", "Monkeys eat bananas."]),
    ("Kangaroo", "An animal that hops with a pouch", ["The kangaroo hops.", "Baby kangaroo stays in pouch."]),
    ("Panda", "A black and white bear", ["The panda eats bamboo.", "Pandas are cute."]),
    ("Koala", "A cuddly Australian animal", ["The koala sleeps a lot.", "Koalas live in trees."]),
    ("Whale", "The largest sea animal", ["The whale is huge.", "Whales swim in the ocean."]),
    ("Shark", "A big fish with sharp teeth", ["The shark swims fast.", "Sharks live in the sea."]),
    ("Octopus", "A sea animal with eight arms", ["The octopus has eight arms.", "Octopus can change color."]),
    ("Butterfly", "A colorful flying insect", ["The butterfly is beautiful.", "Butterflies drink nectar."]),
    ("Bee", "An insect that makes honey", ["The bee buzzes.", "Bees make honey."]),
    ("Ant", "A tiny hard-working insect", ["Ants work together.", "A line of ants."]),
    ("Spider", "An insect that spins webs", ["The spider spins a web.", "A small spider."]),
    ("Turtle", "A slow animal with a shell", ["The turtle is slow.", "Turtles live long."]),
    ("Camel", "An animal with humps", ["The camel walks in the desert.", "Camels store water."]),
    ("Donkey", "A farm animal like a small horse", ["The donkey brays.", "Donkeys carry loads."]),
    ("Goose", "A large bird that honks", ["The goose honks.", "Geese fly in a V."]),
    ("Lizard", "A small reptile", ["The lizard is on the wall.", "Lizards bask in the sun."]),
    ("Seal", "A sea animal with flippers", ["The seal claps.", "Seals love fish."]),
]:
    add(w, m, ex, LVL, "animals", "noun", D)

# Verbs & Actions (5-7)
for w, m, ex in [
    ("Read", "To look at words and understand", ["Read a book.", "I love to read."]),
    ("Write", "To put words on paper", ["Write your name.", "I write stories."]),
    ("Draw", "To make pictures", ["Draw a cat.", "I draw flowers."]),
    ("Sing", "To make music with your voice", ["Sing a song.", "Birds sing."]),
    ("Dance", "To move to music", ["Let's dance.", "She dances well."]),
    ("Swim", "To move through water", ["I can swim.", "Fish swim."]),
    ("Kick", "To hit with your foot", ["Kick the ball.", "Don't kick."]),
    ("Throw", "To send through the air", ["Throw the ball.", "He throws far."]),
    ("Catch", "To grab something moving", ["Catch the ball.", "I can catch."]),
    ("Ride", "To sit on and move", ["Ride a bike.", "Ride a horse."]),
    ("Climb", "To go up using hands and feet", ["Climb the ladder.", "Monkeys climb trees."]),
    ("Slide", "To move smoothly down", ["Slide down the slide.", "The ice is slippery."]),
    ("Swing", "To move back and forth", ["Swing on the swing.", "Monkeys swing."]),
    ("Build", "To make something", ["Build a house.", "Build with blocks."]),
    ("Clean", "To make something tidy", ["Clean your room.", "Clean the table."]),
    ("Count", "To say numbers in order", ["Count to ten.", "Count the apples."]),
    ("Cut", "To divide with scissors", ["Cut the paper.", "Cut carefully."]),
    ("Paint", "To apply color", ["Paint a picture.", "Paint the wall."]),
    ("Talk", "To speak with someone", ["Let's talk.", "Talk to your friend."]),
]:
    add(w, m, ex, LVL, "actions", "verb", D)

# Numbers 31-100 + ordinals
for w, m, ex in [
    ("Thirty-one", "The number 31", ["Thirty-one days in January.", "Count to thirty-one."]),
    ("Forty", "The number 40", ["She is forty.", "Forty students."]),
    ("Fifty", "The number 50", ["Fifty books.", "Count to fifty."]),
    ("Sixty", "The number 60", ["Sixty minutes in an hour.", "Sixty people."]),
    ("Seventy", "The number 70", ["Seventy years.", "Seventy birds."]),
    ("Eighty", "The number 80", ["Eighty candies.", "Count to eighty."]),
    ("Ninety", "The number 90", ["Ninety days.", "Ninety flowers."]),
    ("Hundred", "The number 100", ["A hundred stars.", "One hundred!"]),
    ("First", "Coming before all others", ["I came first.", "The first prize."]),
    ("Second", "Coming after the first", ["He is second.", "Second place."]),
    ("Third", "Coming after the second", ["Third time lucky.", "Third position."]),
    ("Fourth", "Coming after the third", ["The fourth floor.", "Fourth place."]),
    ("Fifth", "Coming after the fourth", ["The fifth day.", "Fifth in line."]),
    ("Sixth", "Coming after the fifth", ["The sixth month.", "Sixth grade."]),
    ("Zero", "The number 0, nothing", ["Start from zero.", "Zero points."]),
]:
    add(w, m, ex, LVL, "numbers", "noun", D)

# Descriptions & Opposites (5-7)
for w, m, ex in [
    ("Day", "The time when the sun is up", ["A sunny day.", "Have a good day."]),
    ("Night", "The time when it's dark", ["Good night.", "Stars come out at night."]),
    ("Light", "Brightness from the sun or lamp", ["Turn on the light.", "The room is light."]),
    ("Dark", "Without light", ["It's dark outside.", "A dark room."]),
    ("Loud", "Making much noise", ["The music is loud.", "Don't be loud."]),
    ("Quiet", "Making little or no noise", ["Be quiet.", "A quiet room."]),
    ("Old", "Having lived many years", ["An old tree.", "Old and wise."]),
    ("New", "Recently made or fresh", ["A new toy.", "Something new."]),
    ("Hard", "Not soft, or difficult", ["The rock is hard.", "A hard test."]),
    ("Full", "Containing all it can hold", ["The glass is full.", "I am full."]),
    ("Empty", "Containing nothing", ["The box is empty.", "An empty bottle."]),
    ("Heavy", "Weighing a lot", ["The bag is heavy.", "A heavy stone."]),
    ("Strong", "Having much power", ["He is strong.", "A strong wind."]),
    ("Weak", "Not having much power", ["The rope is weak.", "I feel weak."]),
]:
    add(w, m, ex, LVL, "descriptions", "adjective", D)

# Weather (5-7)
for w, m, ex in [
    ("Sunny", "When the sun is shining", ["A sunny day.", "It is sunny."]),
    ("Cloudy", "When the sky has clouds", ["A cloudy day.", "It looks cloudy."]),
    ("Windy", "When the wind is blowing", ["A windy day.", "It is very windy."]),
    ("Stormy", "With heavy rain and wind", ["A stormy night.", "Stormy weather."]),
    ("Foggy", "When fog makes it hard to see", ["A foggy morning.", "It is foggy."]),
    ("Hail", "Small balls of ice from the sky", ["Hail fell today.", "Hail can be dangerous."]),
    ("Lightning", "A flash of light in the sky", ["Lightning is bright.", "I saw lightning."]),
]:
    add(w, m, ex, LVL, "weather", "noun", D)

# Food & Meals (5-7)
for w, m, ex in [
    ("Breakfast", "The first meal of the day", ["Eat breakfast.", "A healthy breakfast."]),
    ("Dinner", "The last big meal of the day", ["Dinner is ready.", "We eat dinner together."]),
    ("Lunch", "The midday meal", ["Time for lunch.", "Pack your lunch."]),
    ("Salad", "A dish of raw vegetables", ["Eat your salad.", "A fresh salad."]),
    ("Fruit", "Sweet food from plants", ["Eat fruit daily.", "Fruit is healthy."]),
    ("Vegetable", "A plant used as food", ["Eat your vegetables.", "Fresh vegetables."]),
    ("Carrot", "An orange root vegetable", ["Rabbits eat carrots.", "Carrots are crunchy."]),
    ("Potato", "A starchy vegetable", ["Mashed potato.", "Potatoes grow underground."]),
    ("Onion", "A strong-smelling vegetable", ["Chop the onion.", "Onions make you cry."]),
    ("Tomato", "A red juicy fruit used as vegetable", ["A ripe tomato.", "Tomato sauce."]),
    ("Meat", "Food from animals", ["We eat meat.", "Cook the meat."]),
    ("Ice cream", "A cold sweet dessert", ["I love ice cream.", "Vanilla ice cream."]),
    ("Chocolate", "A sweet brown food", ["I love chocolate.", "Chocolate cake."]),
    ("Pizza", "A flat bread with toppings", ["I love pizza.", "Cheese pizza."]),
    ("Pasta", "An Italian food made from flour", ["I eat pasta.", "Pasta with sauce."]),
]:
    add(w, m, ex, LVL, "food", "noun", D)

# Emotions (5-7)
for w, m, ex in [
    ("Love", "A deep feeling of care", ["I love my family.", "Love is kind."]),
    ("Fun", "Enjoyable activity", ["That was fun!", "Have fun."]),
    ("Angry", "Feeling very upset", ["Don't be angry.", "He looks angry."]),
    ("Scared", "Feeling afraid", ["I am scared.", "Don't be scared."]),
    ("Tired", "Needing rest", ["I am tired.", "Feeling tired."]),
    ("Hungry", "Needing food", ["I am hungry.", "A hungry child."]),
    ("Thirsty", "Needing water", ["I am thirsty.", "Drink when thirsty."]),
    ("Excited", "Very happy and eager", ["I am excited!", "An exciting day."]),
    ("Shy", "Not comfortable around others", ["The shy girl.", "Don't be shy."]),
    ("Glad", "Happy about something", ["I am glad.", "So glad to see you."]),
    ("Sorry", "Feeling regret", ["I am sorry.", "Say sorry."]),
    ("Proud", "Feeling pleased about something", ["I am proud of you.", "Be proud."]),
]:
    add(w, m, ex, LVL, "emotions", "noun", D)

# Body Actions (5-7)
for w, m, ex in [
    ("Blink", "To close and open eyes quickly", ["Don't blink.", "I blinked."]),
    ("Smile", "To curve your lips upward", ["Smile please.", "A big smile."]),
    ("Frown", "To make an unhappy face", ["Don't frown.", "He frowned."]),
    ("Cough", "To push air from lungs noisily", ["Cover your cough.", "I am coughing."]),
    ("Sneeze", "A sudden burst of air from nose", ["Bless you when you sneeze.", "I sneezed."]),
    ("Bend", "To make something curved", ["Bend your knees.", "Bend down."]),
    ("Hop", "To jump on one foot", ["Hop like a rabbit.", "Hop on one foot."]),
    ("Spin", "To turn around quickly", ["Spin the top.", "I spin around."]),
    ("Nod", "To move head up and down", ["Nod your head.", "He nodded yes."]),
    ("Shake", "To move back and forth", ["Shake the bottle.", "Shake hands."]),
]:
    add(w, m, ex, LVL, "actions", "verb", D)

# Places (5-7)
for w, m, ex in [
    ("School", "A place where children learn", ["I go to school.", "School is fun."]),
    ("Home", "Where you and your family live", ["Go home.", "Home sweet home."]),
    ("Park", "A green area for play", ["Play in the park.", "A beautiful park."]),
    ("Farm", "A place where crops and animals are", ["Visit the farm.", "The farm has cows."]),
    ("Zoo", "A place to see animals", ["Let's go to the zoo.", "The zoo has lions."]),
    ("Shop", "A place to buy things", ["Go to the shop.", "A toy shop."]),
    ("Kitchen", "The room for cooking", ["Cook in the kitchen.", "The kitchen is clean."]),
    ("Bathroom", "The room for washing", ["Go to the bathroom.", "A clean bathroom."]),
    ("Yard", "The area around a house", ["Play in the yard.", "A big yard."]),
]:
    add(w, m, ex, LVL, "places", "noun", D)

# Objects (5-7)
for w, m, ex in [
    ("Clock", "A device that shows time", ["Look at the clock.", "The clock ticks."]),
    ("Phone", "A device for calling people", ["Call on the phone.", "A mobile phone."]),
    ("TV", "A screen for watching shows", ["Watch TV.", "Turn off the TV."]),
    ("Radio", "A device for listening to music", ["Listen to the radio.", "The radio plays songs."]),
    ("Bike", "A two-wheeled vehicle", ["Ride a bike.", "A blue bike."]),
    ("Boat", "A vehicle for water", ["Row the boat.", "A small boat."]),
    ("Train", "A vehicle on rails", ["The train is fast.", "Ride the train."]),
    ("Bus", "A large vehicle for many people", ["Take the bus.", "The school bus."]),
    ("Van", "A covered vehicle", ["A delivery van.", "The van is white."]),
    ("Key", "A small metal piece for locks", ["Find the key.", "A golden key."]),
    ("Box", "A container with sides", ["Open the box.", "A cardboard box."]),
]:
    add(w, m, ex, LVL, "objects", "noun", D)

# Transport (5-7)
for w, m, ex in [
    ("Motorcycle", "A two-wheeled motor vehicle", ["Ride a motorcycle.", "The motorcycle is fast."]),
    ("Scooter", "A small two-wheeled vehicle", ["Ride the scooter.", "A red scooter."]),
    ("Taxi", "A car for hire", ["Take a taxi.", "The taxi is yellow."]),
    ("Subway", "An underground train", ["Ride the subway.", "The subway is fast."]),
    ("Helicopter", "An aircraft with blades on top", ["The helicopter flies.", "A rescue helicopter."]),
    ("Wagon", "A vehicle pulled by animals", ["The wagon carries hay.", "A red wagon."]),
]:
    add(w, m, ex, LVL, "transport", "noun", D)

# =====================================================================
# AGES 8-10 → 4th-5th (difficulty=3)
# =====================================================================
LVL = "4th-5th"
D = 3

# Emotions (8-10)
for w, m, ex in [
    ("Nervous", "Feeling worried or anxious", ["I am nervous about the test.", "Don't be nervous."]),
    ("Bored", "Feeling uninterested", ["I am bored.", "A boring day."]),
    ("Jealous", "Feeling envious of someone", ["Don't be jealous.", "Jealousy is bad."]),
    ("Calm", "Peaceful and relaxed", ["Stay calm.", "A calm sea."]),
    ("Silly", "Funny in a playful way", ["That was silly.", "A silly joke."]),
    ("Lonely", "Feeling alone and sad", ["I feel lonely.", "Don't be lonely."]),
    ("Surprised", "Feeling unexpected wonder", ["I am surprised!", "A surprise party."]),
    ("Grateful", "Feeling thankful", ["I am grateful.", "Be grateful."]),
    ("Confused", "Not understanding something", ["I am confused.", "A confusing problem."]),
    ("Cheerful", "Happy and bright", ["A cheerful smile.", "She is cheerful."]),
    ("Grumpy", "Bad-tempered and irritable", ["Don't be grumpy.", "A grumpy face."]),
    ("Mean", "Unkind or cruel", ["Don't be mean.", "That was mean."]),
    ("Joyful", "Very happy", ["A joyful occasion.", "Joyful laughter."]),
    ("Afraid", "Feeling fear", ["I am afraid.", "Don't be afraid."]),
    ("Content", "Happy and satisfied", ["I feel content.", "A content life."]),
]:
    add(w, m, ex, LVL, "emotions", "adjective", D)

# Nature (8-10)
for w, m, ex in [
    ("Branch", "Part of a tree", ["A bird sits on the branch.", "The branch broke."]),
    ("Root", "The underground part of a plant", ["The roots are deep.", "Plants have roots."]),
    ("Bush", "A shrub with many branches", ["The cat hid in the bush.", "A green bush."]),
    ("Vine", "A climbing plant", ["Grapes grow on vines.", "The vine climbed the wall."]),
    ("Cactus", "A desert plant with spines", ["A cactus needs little water.", "Don't touch the cactus."]),
    ("Waterfall", "Water falling from a height", ["The waterfall is beautiful.", "We saw a waterfall."]),
    ("Iceberg", "A large floating mass of ice", ["The iceberg is huge.", "Only the tip shows."]),
]:
    add(w, m, ex, LVL, "nature", "noun", D)

# Hobbies & Actions (8-10)
for w, m, ex in [
    ("Explore", "To travel and discover new things", ["Explore the forest.", "I love to explore."]),
    ("Invent", "To create something new", ["Invent a machine.", "She invented a game."]),
    ("Volunteer", "To offer help freely", ["Volunteer at school.", "I volunteer."]),
    ("Shiver", "To shake from cold or fear", ["I shiver in winter.", "She shivered."]),
    ("Stack", "To pile things up", ["Stack the books.", "A stack of papers."]),
    ("Cook", "To prepare food with heat", ["Cook dinner.", "I cook rice."]),
    ("Bake", "To cook in an oven", ["Bake a cake.", "I love to bake."]),
    ("Camp", "To stay outdoors overnight", ["Camp in the forest.", "We went camping."]),
    ("Hike", "To walk a long way in nature", ["Hike up the mountain.", "We hiked today."]),
    ("Sew", "To join with needle and thread", ["Sew a button.", "She sews clothes."]),
    ("Skate", "To glide on wheels or ice", ["Skate at the rink.", "I can skate."]),
    ("Juggle", "To toss and catch objects", ["Juggle three balls.", "The clown juggles."]),
    ("Collect", "To gather things together", ["Collect stamps.", "I collect coins."]),
]:
    add(w, m, ex, LVL, "hobbies", "verb", D)

# Household (8-10)
for w, m, ex in [
    ("Bedroom", "The room where you sleep", ["My bedroom is clean.", "Go to your bedroom."]),
    ("Fridge", "A cold box for storing food", ["Put milk in the fridge.", "The fridge is full."]),
    ("Oven", "A hot box for cooking", ["Bake in the oven.", "The oven is hot."]),
    ("Sink", "A bowl for washing", ["Wash dishes in the sink.", "The sink is clean."]),
    ("Mirror", "A glass that shows your reflection", ["Look in the mirror.", "A large mirror."]),
    ("Pillow", "A soft support for your head", ["Sleep on the pillow.", "A fluffy pillow."]),
    ("Blanket", "A cover for warmth", ["Wrap in a blanket.", "A warm blanket."]),
    ("Sofa", "A long comfortable seat", ["Sit on the sofa.", "A soft sofa."]),
    ("Cupboard", "A cabinet for storing things", ["Open the cupboard.", "Cups in the cupboard."]),
    ("Vase", "A container for flowers", ["Put flowers in the vase.", "A pretty vase."]),
]:
    add(w, m, ex, LVL, "household", "noun", D)

# Descriptions (8-10)
for w, m, ex in [
    ("Beautiful", "Very pleasing to look at", ["A beautiful sunset.", "She is beautiful."]),
    ("Dangerous", "Likely to cause harm", ["Fire is dangerous.", "A dangerous road."]),
    ("Wise", "Having good judgment", ["A wise teacher.", "Be wise."]),
    ("Rough", "Not smooth", ["The rock is rough.", "Rough surface."]),
    ("Shiny", "Reflecting light", ["A shiny coin.", "Shiny shoes."]),
    ("Sweet", "Tasting like sugar", ["Candy is sweet.", "A sweet mango."]),
    ("Sour", "Tasting sharp like lemon", ["Lemons are sour.", "A sour face."]),
    ("Bitter", "Having a sharp unpleasant taste", ["The medicine is bitter.", "Bitter gourd."]),
    ("Spicy", "Strongly flavored with spices", ["The food is spicy.", "Indian food is spicy."]),
    ("Thick", "Wide from side to side", ["A thick book.", "Thick walls."]),
    ("Straight", "Not curved or bent", ["A straight line.", "Stand straight."]),
    ("Curved", "Having a bent shape", ["A curved road.", "The river curves."]),
    ("Narrow", "Not wide", ["A narrow path.", "The door is narrow."]),
]:
    add(w, m, ex, LVL, "descriptions", "adjective", D)

# Animals (8-10)
for w, m, ex in [
    ("Crocodile", "A large reptile in rivers", ["The crocodile has big teeth.", "Crocodiles are dangerous."]),
    ("Hippopotamus", "A large heavy animal in rivers", ["The hippo is big.", "Hippos live in Africa."]),
    ("Rhinoceros", "A large animal with a horn", ["The rhino is strong.", "Rhinos are endangered."]),
    ("Owl", "A night bird with big eyes", ["The owl hoots at night.", "Owls are wise."]),
    ("Bat", "A flying mammal active at night", ["Bats fly at night.", "Bats hang upside down."]),
    ("Hedgehog", "A small spiny animal", ["The hedgehog rolls up.", "Don't touch the hedgehog."]),
    ("Lobster", "A sea creature with claws", ["The lobster is red.", "Lobsters live in the sea."]),
    ("Eagle", "A large powerful bird", ["The eagle soars high.", "Eagles have sharp eyes."]),
    ("Penguin", "A bird that cannot fly but swims", ["Penguins waddle.", "Penguins live in cold places."]),
    ("Flamingo", "A pink long-legged bird", ["The flamingo is pink.", "Flamingos stand on one leg."]),
    ("Seahorse", "A small sea creature shaped like a horse", ["The seahorse is tiny.", "Seahorses swim upright."]),
    ("Jellyfish", "A soft sea creature that stings", ["Don't touch the jellyfish.", "Jellyfish glow."]),
]:
    add(w, m, ex, LVL, "animals", "noun", D)

# School Subjects (8-10)
for w, m, ex in [
    ("Math", "The study of numbers", ["I like math.", "Math is useful."]),
    ("Science", "The study of nature and the world", ["Science is fun.", "I love science."]),
    ("History", "The study of the past", ["Learn history.", "History teaches us."]),
    ("Art", "Drawing, painting, and creating", ["Art is creative.", "I love art class."]),
    ("Music", "Sounds organized in rhythm", ["I play music.", "Music makes me happy."]),
    ("Sports", "Physical activities and games", ["I love sports.", "Play sports daily."]),
    ("Geography", "The study of the Earth", ["Geography teaches about places.", "I study geography."]),
    ("Language", "A system of communication", ["Learn a new language.", "Language is powerful."]),
    ("Reading", "Looking at and understanding text", ["I enjoy reading.", "Reading is important."]),
    ("Writing", "Putting thoughts into words", ["Practice writing.", "Good writing skills."]),
    ("Drama", "Acting and performing plays", ["Drama class is fun.", "I act in drama."]),
]:
    add(w, m, ex, LVL, "school", "noun", D)

# Food (8-10)
for w, m, ex in [
    ("Sandwich", "Bread with filling between slices", ["I ate a sandwich.", "A cheese sandwich."]),
    ("Burger", "Meat patty in a bun", ["I love burgers.", "A veggie burger."]),
    ("Dessert", "A sweet dish after a meal", ["Cake for dessert.", "I love desserts."]),
    ("Spice", "A flavoring for food", ["Add spice to the food.", "Indian spices are famous."]),
    ("Salt", "A white seasoning", ["Add some salt.", "Salt is essential."]),
    ("Pepper", "A spicy seasoning", ["Sprinkle pepper.", "Black pepper."]),
    ("Noodle", "Long thin pasta", ["I eat noodles.", "Noodle soup."]),
    ("Pancake", "A flat cake fried in a pan", ["I love pancakes.", "Pancake with syrup."]),
    ("Muffin", "A small round cake", ["A chocolate muffin.", "Muffins are tasty."]),
    ("Popcorn", "Heated corn kernels that pop", ["I eat popcorn.", "Movie popcorn."]),
    ("Pretzel", "A twisted baked snack", ["A salty pretzel.", "I love pretzels."]),
    ("Taco", "A folded tortilla with filling", ["I ate a taco.", "Tacos are delicious."]),
]:
    add(w, m, ex, LVL, "food", "noun", D)

# Time (8-10)
for w, m, ex in [
    ("Morning", "The start of the day", ["Good morning.", "I wake up in the morning."]),
    ("Afternoon", "The middle of the day", ["Good afternoon.", "We play in the afternoon."]),
    ("Evening", "The end of the day", ["Good evening.", "We eat in the evening."]),
    ("Today", "This current day", ["Today is sunny.", "What is today?"]),
    ("Tomorrow", "The day after today", ["See you tomorrow.", "Tomorrow will be better."]),
    ("Yesterday", "The day before today", ["Yesterday was fun.", "What happened yesterday?"]),
    ("Soon", "In a short time", ["See you soon.", "It will happen soon."]),
    ("Later", "At a time in the future", ["I will do it later.", "See you later."]),
    ("Now", "At this moment", ["Do it now.", "Now is the time."]),
]:
    add(w, m, ex, LVL, "time", "noun", D)

# Seasons
for w, m, ex in [
    ("Spring", "The season after winter", ["Flowers bloom in spring.", "Spring is beautiful."]),
    ("Summer", "The hottest season", ["Summer is hot.", "I swim in summer."]),
    ("Fall", "The season when leaves drop", ["Leaves fall in autumn.", "Fall colors are beautiful."]),
    ("Winter", "The coldest season", ["Winter is cold.", "Snow in winter."]),
]:
    add(w, m, ex, LVL, "seasons", "noun", D)

# Tools
for w, m, ex in [
    ("Hammer", "A tool for hitting nails", ["Use a hammer.", "The hammer is heavy."]),
    ("Saw", "A tool for cutting wood", ["Cut with a saw.", "A sharp saw."]),
    ("Screwdriver", "A tool for turning screws", ["Use a screwdriver.", "A flat screwdriver."]),
    ("Ladder", "Steps for climbing up", ["Climb the ladder.", "A tall ladder."]),
    ("Pliers", "A tool for gripping", ["Use pliers.", "Pliers are useful."]),
]:
    add(w, m, ex, LVL, "tools", "noun", D)

# =====================================================================
# AGES 10-11 → 5th-adv (difficulty=4)
# =====================================================================
LVL = "5th-adv"
D = 4

# Science & Nature (10-11)
for w, m, ex in [
    ("Planet", "A large body orbiting a star", ["Earth is a planet.", "There are eight planets."]),
    ("Robot", "A machine that does tasks", ["The robot moves.", "Robots help people."]),
    ("Energy", "The power to do work", ["Solar energy is clean.", "Food gives us energy."]),
    ("Magnet", "An object that attracts metal", ["The magnet sticks.", "Magnets attract iron."]),
    ("Electricity", "A form of energy", ["Turn on the electricity.", "Electricity powers homes."]),
    ("Earthquake", "Shaking of the ground", ["The earthquake was scary.", "Earthquakes are natural."]),
    ("Tornado", "A violent spinning wind", ["The tornado was powerful.", "Tornadoes are dangerous."]),
    ("Atom", "The smallest unit of matter", ["Everything is made of atoms.", "Atoms are tiny."]),
    ("Cell", "The basic unit of life", ["Our body has cells.", "Cells are microscopic."]),
    ("Galaxy", "A huge collection of stars", ["The Milky Way is our galaxy.", "Galaxies are vast."]),
    ("Comet", "An icy body orbiting the sun", ["The comet has a tail.", "Comets are rare."]),
    ("Crystal", "A solid with a regular shape", ["A beautiful crystal.", "Salt forms crystals."]),
    ("Pollen", "Fine powder from flowers", ["Bees carry pollen.", "Pollen helps plants grow."]),
]:
    add(w, m, ex, LVL, "science", "noun", D)

# Time (10-11)
for w, m, ex in [
    ("Minute", "60 seconds", ["Wait a minute.", "A few minutes."]),
    ("Hour", "60 minutes", ["One hour left.", "Hours pass quickly."]),
    ("Week", "7 days", ["See you next week.", "A week has seven days."]),
    ("Month", "About 30 days", ["This month is busy.", "Which month?"]),
    ("Year", "12 months", ["A new year.", "This year is great."]),
    ("Calendar", "A chart showing days and months", ["Check the calendar.", "A wall calendar."]),
    ("Decade", "10 years", ["A decade of progress.", "The last decade."]),
    ("Century", "100 years", ["The 21st century.", "A century ago."]),
    ("Midnight", "12 o'clock at night", ["It's midnight.", "The clock struck midnight."]),
]:
    add(w, m, ex, LVL, "time", "noun", D)

# Abstract Ideas (10-11)
for w, m, ex in [
    ("Freedom", "The state of being free", ["Freedom is precious.", "We value freedom."]),
    ("Secret", "Something hidden from others", ["Keep it a secret.", "A secret place."]),
    ("Promise", "A commitment to do something", ["I promise.", "Keep your promise."]),
    ("Adventure", "An exciting experience", ["A great adventure.", "I love adventures."]),
    ("Delicious", "Very tasty", ["The food is delicious.", "A delicious meal."]),
    ("Enormous", "Very very large", ["An enormous elephant.", "An enormous building."]),
    ("Furniture", "Tables, chairs, beds etc.", ["New furniture.", "Move the furniture."]),
    ("Gentle", "Kind and soft", ["Be gentle.", "A gentle touch."]),
    ("Height", "How tall something is", ["Measure the height.", "A great height."]),
    ("Ignore", "To pay no attention to", ["Don't ignore me.", "He ignored the warning."]),
    ("Humble", "Not proud, modest", ["Be humble.", "A humble person."]),
    ("Massive", "Very large and heavy", ["A massive rock.", "Massive buildings."]),
    ("Peaceful", "Calm and quiet", ["A peaceful place.", "Live peacefully."]),
    ("Rapid", "Very fast", ["Rapid growth.", "A rapid river."]),
    ("Strange", "Unusual or odd", ["A strange sound.", "How strange!"]),
    ("Wisdom", "Having deep knowledge", ["Wisdom comes with age.", "Words of wisdom."]),
    ("Justice", "Fairness and equality", ["Justice for all.", "Seek justice."]),
    ("Equality", "Being equal in rights", ["Equality matters.", "Fight for equality."]),
    ("Dream", "Images in your mind during sleep", ["I had a dream.", "Follow your dreams."]),
    ("Truth", "What is real and correct", ["Tell the truth.", "The truth matters."]),
]:
    add(w, m, ex, LVL, "concepts", "noun", D)

# Actions (10-11)
for w, m, ex in [
    ("Knowledge", "Information and understanding", ["Knowledge is power.", "Gain knowledge."]),
    ("Laughter", "The sound of laughing", ["Laughter is the best medicine.", "I heard laughter."]),
    ("Mystery", "Something unknown or unexplained", ["A great mystery.", "Solve the mystery."]),
    ("Notice", "To become aware of something", ["I noticed a change.", "Did you notice?"]),
    ("Quarrel", "An angry argument", ["Don't quarrel.", "They had a quarrel."]),
    ("Victory", "Winning a competition or battle", ["A great victory.", "Celebrate the victory."]),
    ("Discover", "To find something new", ["Discover new places.", "Scientists discover."]),
    ("Create", "To make something new", ["Create art.", "She creates music."]),
    ("Improve", "To make something better", ["Improve your skills.", "Always improve."]),
    ("Argue", "To give reasons for or against", ["Don't argue.", "They argued."]),
    ("Celebrate", "To mark a happy event", ["Celebrate your birthday.", "Let's celebrate!"]),
    ("Explain", "To make something clear", ["Explain the answer.", "She explained well."]),
    ("Imagine", "To create a picture in your mind", ["Imagine a world.", "I can imagine."]),
    ("Observe", "To watch carefully", ["Observe the stars.", "Scientists observe."]),
    ("Predict", "To say what will happen", ["Predict the weather.", "I predict rain."]),
    ("Solve", "To find the answer to", ["Solve the puzzle.", "We solved the problem."]),
    ("Perform", "To do or carry out", ["Perform on stage.", "She performed well."]),
    ("Research", "To study something deeply", ["Research the topic.", "Do your research."]),
]:
    add(w, m, ex, LVL, "actions", "verb", D)

# Places (10-11)
for w, m, ex in [
    ("Museum", "A building displaying art or history", ["Visit the museum.", "The museum is big."]),
    ("Factory", "A building where goods are made", ["The factory produces cars.", "A large factory."]),
    ("Stadium", "A large sports ground", ["The stadium is full.", "Watch cricket at the stadium."]),
    ("Castle", "A large fortified building", ["The castle is old.", "Kings lived in castles."]),
    ("Palace", "A grand home for royalty", ["The palace is beautiful.", "A royal palace."]),
    ("Airport", "A place for planes to land", ["Go to the airport.", "The airport is busy."]),
    ("Jungle", "A dense tropical forest", ["Animals live in the jungle.", "The jungle is wild."]),
]:
    add(w, m, ex, LVL, "places", "noun", D)

# Descriptions (10-11)
for w, m, ex in [
    ("Gigantic", "Extremely large", ["A gigantic whale.", "Gigantic waves."]),
    ("Fragile", "Easily broken", ["Handle with care, it's fragile.", "A fragile vase."]),
    ("Brilliant", "Very bright or clever", ["A brilliant idea.", "Brilliant sunshine."]),
    ("Cozy", "Warm and comfortable", ["A cozy room.", "Cozy by the fire."]),
    ("Dreadful", "Very bad or unpleasant", ["A dreadful storm.", "Dreadful weather."]),
    ("Elegant", "Graceful and stylish", ["An elegant dress.", "An elegant dancer."]),
    ("Golden", "The color of gold", ["A golden sunset.", "Golden hair."]),
    ("Harsh", "Severe or unkind", ["Harsh weather.", "Don't be harsh."]),
    ("Icy", "Very cold like ice", ["An icy road.", "Icy winds."]),
    ("Lazy", "Not wanting to work", ["Don't be lazy.", "A lazy afternoon."]),
]:
    add(w, m, ex, LVL, "descriptions", "adjective", D)

# School & Learning (10-11)
for w, m, ex in [
    ("Alphabet", "The letters A to Z", ["Learn the alphabet.", "26 letters in the alphabet."]),
    ("Dictionary", "A book of word meanings", ["Look it up in the dictionary.", "A big dictionary."]),
    ("Paragraph", "A section of writing", ["Write a paragraph.", "Read the paragraph."]),
    ("Sentence", "A group of words with meaning", ["Write a sentence.", "A complete sentence."]),
    ("Vowel", "The letters A, E, I, O, U", ["A is a vowel.", "Count the vowels."]),
    ("Consonant", "A letter that is not a vowel", ["B is a consonant.", "Most letters are consonants."]),
    ("Poetry", "Writing with rhythm and feeling", ["I love poetry.", "Write a poem."]),
    ("Essay", "A short piece of writing", ["Write an essay.", "A good essay."]),
    ("Chapter", "A section of a book", ["Read chapter one.", "The next chapter."]),
    ("Title", "The name of a book or work", ["What is the title?", "A catchy title."]),
    ("Author", "A person who writes", ["Who is the author?", "A famous author."]),
    ("Plot", "The main events of a story", ["A good plot.", "The plot thickens."]),
    ("Theme", "The main idea of a story", ["The theme is love.", "A common theme."]),
]:
    add(w, m, ex, LVL, "school", "noun", D)

# Numbers (10-11)
for w, m, ex in [
    ("Thousand", "The number 1000", ["A thousand stars.", "One thousand."]),
    ("Million", "The number 1,000,000", ["A million dreams.", "One million."]),
    ("Billion", "The number 1,000,000,000", ["Billions of stars.", "One billion."]),
    ("Dozen", "A group of twelve", ["A dozen eggs.", "Buy a dozen."]),
]:
    add(w, m, ex, LVL, "numbers", "noun", D)

# Emotions & Traits (10-11)
for w, m, ex in [
    ("Patient", "Able to wait without getting upset", ["Be patient.", "A patient teacher."]),
    ("Selfish", "Only thinking of yourself", ["Don't be selfish.", "Selfish behavior."]),
    ("Loyal", "Faithful and devoted", ["A loyal friend.", "Dogs are loyal."]),
    ("Curious", "Wanting to know more", ["A curious child.", "Stay curious."]),
    ("Stubborn", "Refusing to change", ["Don't be stubborn.", "A stubborn mule."]),
    ("Clumsy", "Lacking grace in movement", ["I am clumsy.", "A clumsy fall."]),
    ("Foolish", "Lacking good sense", ["A foolish mistake.", "Don't be foolish."]),
    ("Timid", "Shy and nervous", ["A timid rabbit.", "Don't be timid."]),
    ("Rude", "Not showing respect", ["Don't be rude.", "Rude behavior."]),
    ("Thoughtful", "Considerate of others", ["A thoughtful gift.", "Be thoughtful."]),
]:
    add(w, m, ex, LVL, "character", "adjective", D)

# Food & Culture (10-11)
for w, m, ex in [
    ("Sushi", "Japanese rice and fish dish", ["I tried sushi.", "Sushi is Japanese."]),
    ("Curry", "A spiced dish from India", ["Indian curry.", "Chicken curry."]),
    ("Waffle", "A crispy patterned bread", ["I love waffles.", "Waffles with syrup."]),
    ("Steak", "A thick piece of meat", ["Grilled steak.", "A juicy steak."]),
    ("Pie", "A baked dish with filling", ["Apple pie.", "I baked a pie."]),
    ("Falafel", "Fried ball of chickpeas", ["I ate falafel.", "Falafel is Middle Eastern."]),
    ("Hummus", "A dip made from chickpeas", ["I love hummus.", "Hummus with pita."]),
    ("Paella", "A Spanish rice dish", ["We tried paella.", "Paella is from Spain."]),
    ("Dimsum", "Small Chinese steamed dumplings", ["We ate dimsum.", "Dimsum is delicious."]),
]:
    add(w, m, ex, LVL, "food", "noun", D)

# Technology (10-11)
for w, m, ex in [
    ("Internet", "A global computer network", ["Use the internet.", "The internet connects us."]),
    ("Email", "Electronic mail", ["Send an email.", "Check your email."]),
    ("Website", "A page on the internet", ["Visit the website.", "A helpful website."]),
    ("Keyboard", "Keys for typing on a computer", ["Type on the keyboard.", "A wireless keyboard."]),
    ("Screen", "A display on a device", ["Look at the screen.", "A big screen."]),
    ("Battery", "A device that stores energy", ["The battery is low.", "Charge the battery."]),
    ("App", "A program on a phone", ["Download the app.", "A useful app."]),
    ("Printer", "A machine that prints", ["Use the printer.", "The printer is broken."]),
    ("Camera", "A device for taking photos", ["Take a photo with the camera.", "A digital camera."]),
    ("Software", "Programs on a computer", ["Install the software.", "Software update."]),
    ("Hardware", "Physical parts of a computer", ["Computer hardware.", "Hardware store."]),
]:
    add(w, m, ex, LVL, "technology", "noun", D)

# Sports & Games (10-11)
for w, m, ex in [
    ("Soccer", "A game played with feet and a ball", ["I play soccer.", "Soccer is popular."]),
    ("Basketball", "A game with a hoop", ["Shoot the basketball.", "I love basketball."]),
    ("Tennis", "A game with a racket and ball", ["Play tennis.", "Tennis is fun."]),
    ("Cricket", "A popular Indian bat and ball game", ["I play cricket.", "Cricket is exciting."]),
    ("Chess", "A strategic board game", ["Play chess.", "Chess needs thinking."]),
    ("Volleyball", "A game with a net", ["Play volleyball.", "Beach volleyball."]),
    ("Hockey", "A game played with sticks", ["Field hockey.", "India plays hockey."]),
    ("Rugby", "A team sport with an oval ball", ["Rugby is tough.", "Play rugby."]),
    ("Gymnastics", "Exercises requiring flexibility", ["She does gymnastics.", "Gymnastics is amazing."]),
    ("Karate", "A Japanese martial art", ["Practice karate.", "Karate is disciplined."]),
]:
    add(w, m, ex, LVL, "sports", "noun", D)

# History & Grammar (10-11)
for w, m, ex in [
    ("King", "A male ruler", ["The king was wise.", "A great king."]),
    ("Queen", "A female ruler", ["The queen was kind.", "A brave queen."]),
    ("War", "A conflict between groups", ["War is terrible.", "Avoid war."]),
    ("Peace", "Freedom from conflict", ["We want peace.", "Peace is important."]),
    ("Empire", "A large group of lands under one ruler", ["The Mughal Empire.", "A great empire."]),
    ("Hero", "A person admired for bravery", ["A true hero.", "Be a hero."]),
    ("Noun", "A word for a person, place, or thing", ["Dog is a noun.", "Find the nouns."]),
    ("Verb", "A word showing action", ["Run is a verb.", "Circle the verbs."]),
    ("Adjective", "A word describing a noun", ["Big is an adjective.", "Use adjectives."]),
    ("Adverb", "A word describing a verb", ["Quickly is an adverb.", "Add adverbs."]),
    ("Preposition", "A word showing position", ["In is a preposition.", "Use prepositions."]),
    ("Pronoun", "A word replacing a noun", ["He is a pronoun.", "Use pronouns."]),
]:
    add(w, m, ex, LVL, "grammar", "noun", D)

# Done - combine and save
print(f"\nNew words added: {len(new_words)}")
all_words = existing + new_words
print(f"Total words: {len(all_words)}")

from collections import Counter
levels = Counter(w['level'] for w in all_words)
for k, v in sorted(levels.items()):
    print(f"  {k}: {v}")

with open('data/words_production.json', 'w', encoding='utf-8') as f:
    json.dump(all_words, f, ensure_ascii=False, indent=2)

print("\nSaved to data/words_production.json!")
