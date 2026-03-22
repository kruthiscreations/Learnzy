#!/usr/bin/env python3
"""Generate additional words to expand database to 1000+"""
import json
import os

# Load existing words
with open('data/words_production.json', 'r') as f:
    existing = json.load(f)

existing_words = {w['word_english'].lower() for w in existing}
existing_ids = {w['word_id'] for w in existing}

# Count current per level
from collections import Counter
level_counts = Counter(w['level'] for w in existing)

def make_word(word_id, english, translations, meaning, examples, level, category, pos, difficulty, synonyms=None, antonyms=None):
    return {
        "word_id": word_id,
        "word_english": english,
        "translations": translations,
        "meaning": meaning,
        "example_sentences": examples,
        "level": level,
        "category": category,
        "synonyms": synonyms or [],
        "antonyms": antonyms or [],
        "part_of_speech": pos,
        "difficulty": difficulty
    }

new_words = []

# ==================== LKG-1ST ADDITIONAL WORDS ====================
lkg_words = [
    ("Pot", {"telugu": "కుండ", "hindi": "बर्तन", "tamil": "பானை"}, "A round container for cooking or holding things", ["The pot is hot.", "Mom cooked in a pot."], "household", "noun", 1),
    ("Jug", {"telugu": "జగ్", "hindi": "जग", "tamil": "ஜக்"}, "A container for pouring water or juice", ["Pour water from the jug.", "The jug is full."], "household", "noun", 1),
    ("Lid", {"telugu": "మూత", "hindi": "ढक्कन", "tamil": "மூடி"}, "A cover for a pot or box", ["Put the lid on the box.", "The lid is blue."], "household", "noun", 1),
    ("Mop", {"telugu": "తుడుపు", "hindi": "पोछा", "tamil": "துடைப்பம்"}, "A tool used to clean floors", ["Mom uses a mop.", "The mop is wet."], "household", "noun", 1),
    ("Bin", {"telugu": "బుట్ట", "hindi": "बिन", "tamil": "தொட்டி"}, "A container for throwing away trash", ["Put trash in the bin.", "The bin is green."], "household", "noun", 1),
    ("Tap", {"telugu": "కుళాయి", "hindi": "नल", "tamil": "குழாய்"}, "A device that controls water flow", ["Turn off the tap.", "Water comes from the tap."], "household", "noun", 1),
    ("Mat", {"telugu": "చాప", "hindi": "चटाई", "tamil": "பாய்"}, "A flat piece of material on the floor", ["Sit on the mat.", "The mat is soft."], "household", "noun", 1),
    ("Bib", {"telugu": "బిబ్", "hindi": "बिब", "tamil": "பிப்"}, "A cloth tied around a baby's neck", ["The baby wears a bib.", "The bib is white."], "clothing", "noun", 1),
    ("Yam", {"telugu": "చిలగడదుంప", "hindi": "शकरकंद", "tamil": "கிழங்கு"}, "A root vegetable that is sweet", ["I like to eat yam.", "Yam is healthy."], "food", "noun", 1),
    ("Fig", {"telugu": "అంజీర", "hindi": "अंजीर", "tamil": "அத்தி"}, "A soft sweet fruit", ["I ate a fig.", "The fig is sweet."], "food", "noun", 1),
    ("Pea", {"telugu": "బఠాణి", "hindi": "मटर", "tamil": "பட்டாணி"}, "A small round green vegetable", ["I like green peas.", "Peas grow in pods."], "food", "noun", 1),
    ("Jam", {"telugu": "జామ్", "hindi": "जैम", "tamil": "ஜாம்"}, "A sweet spread made from fruit", ["I put jam on bread.", "Jam is yummy."], "food", "noun", 1),
    ("Dew", {"telugu": "మంచు", "hindi": "ओस", "tamil": "பனி"}, "Water drops on grass in the morning", ["I saw dew on the grass.", "Dew sparkles in the sun."], "nature", "noun", 1),
    ("Fog", {"telugu": "పొగమంచు", "hindi": "कोहरा", "tamil": "மூடுபனி"}, "Thick cloud near the ground", ["I cannot see in the fog.", "Fog comes in winter."], "nature", "noun", 1),
    ("Bay", {"telugu": "అఖాతం", "hindi": "खाड़ी", "tamil": "வளைகுடா"}, "An area of water near land", ["The bay is calm.", "Fish live in the bay."], "nature", "noun", 1),
    ("Elm", {"telugu": "ఎల్మ్ చెట్టు", "hindi": "एल्म पेड़", "tamil": "எல்ம் மரம்"}, "A type of large tree", ["The elm tree is tall.", "Birds sit on the elm."], "nature", "noun", 1),
    ("Ivy", {"telugu": "ఐవీ తీగ", "hindi": "आइवी लता", "tamil": "ஐவி கொடி"}, "A climbing green plant", ["Ivy grows on the wall.", "The ivy is green."], "nature", "noun", 1),
    ("Paw", {"telugu": "పంజ", "hindi": "पंजा", "tamil": "பாதம்"}, "An animal's foot", ["The dog has soft paws.", "The cat hurt its paw."], "animals", "noun", 1),
    ("Cub", {"telugu": "పిల్ల", "hindi": "शावक", "tamil": "குட்டி"}, "A young animal like a bear or lion", ["The lion cub is cute.", "The cub plays a lot."], "animals", "noun", 1),
    ("Fin", {"telugu": "రెక్క", "hindi": "पंख", "tamil": "துடுப்பு"}, "A body part of a fish used for swimming", ["The fish has a big fin.", "Fins help fish swim."], "animals", "noun", 1),
    ("Web", {"telugu": "గూడు", "hindi": "जाला", "tamil": "வலை"}, "A net made by a spider", ["The spider made a web.", "A fly got stuck in the web."], "animals", "noun", 1),
    ("Hive", {"telugu": "తేనెపట్టు", "hindi": "छत्ता", "tamil": "தேனீக்கூடு"}, "A home for bees", ["Bees live in a hive.", "The hive has honey."], "animals", "noun", 1),
    ("Hug", {"telugu": "కౌగిలింత", "hindi": "गले लगाना", "tamil": "கட்டிப்பிடி"}, "To put your arms around someone", ["I hug my mom.", "Hugs make me happy."], "actions", "verb", 1),
    ("Skip", {"telugu": "దాటు", "hindi": "कूदना", "tamil": "தாண்டு"}, "To move by hopping on each foot", ["I skip in the park.", "Let us skip together."], "actions", "verb", 1),
    ("Wipe", {"telugu": "తుడుచు", "hindi": "पोंछना", "tamil": "துடை"}, "To clean by rubbing", ["Wipe the table.", "I wipe my hands."], "actions", "verb", 1),
    ("Dig", {"telugu": "తవ్వు", "hindi": "खोदना", "tamil": "தோண்டு"}, "To make a hole in the ground", ["The dog likes to dig.", "We dig in the sand."], "actions", "verb", 1),
    ("Nap", {"telugu": "కునుకు", "hindi": "झपकी", "tamil": "சிறு தூக்கம்"}, "A short sleep during the day", ["The baby takes a nap.", "I had a nap."], "actions", "noun", 1),
    ("Yell", {"telugu": "అరుపు", "hindi": "चिल्लाना", "tamil": "கத்து"}, "To shout loudly", ["Do not yell.", "He yelled for help."], "actions", "verb", 1),
    ("Peek", {"telugu": "చూపు", "hindi": "झांकना", "tamil": "எட்டிப்பார்"}, "To look quickly and secretly", ["I peeked behind the door.", "Peek-a-boo!"], "actions", "verb", 1),
    ("Tug", {"telugu": "లాగు", "hindi": "खींचना", "tamil": "இழு"}, "To pull something hard", ["The child tugs the rope.", "Tug of war is fun."], "actions", "verb", 1),
    ("Soft", {"telugu": "మృదువైన", "hindi": "मुलायम", "tamil": "மென்மை"}, "Not hard or rough", ["The pillow is soft.", "Soft toys are nice."], "adjectives", "adjective", 1),
    ("Loud", {"telugu": "పెద్దగా", "hindi": "ज़ोर से", "tamil": "சத்தம்"}, "Making a lot of noise", ["The music is loud.", "Do not be loud."], "adjectives", "adjective", 1),
    ("Dark", {"telugu": "చీకటి", "hindi": "अंधेरा", "tamil": "இருள்"}, "Without light", ["It is dark at night.", "The room is dark."], "adjectives", "adjective", 1),
    ("Thin", {"telugu": "సన్నగా", "hindi": "पतला", "tamil": "மெல்லிய"}, "Not thick or wide", ["The stick is thin.", "A thin line."], "adjectives", "adjective", 1),
    ("Deep", {"telugu": "లోతైన", "hindi": "गहरा", "tamil": "ஆழமான"}, "Going far down", ["The pool is deep.", "A deep hole."], "adjectives", "adjective", 1),
    ("Wide", {"telugu": "వెడల్పు", "hindi": "चौड़ा", "tamil": "அகலமான"}, "Covering a lot of space from side to side", ["The river is wide.", "Open your mouth wide."], "adjectives", "adjective", 1),
    ("Hill", {"telugu": "కొండ", "hindi": "पहाड़ी", "tamil": "குன்று"}, "A raised area of land smaller than a mountain", ["We climbed the hill.", "A green hill."], "nature", "noun", 1),
    ("Cave", {"telugu": "గుహ", "hindi": "गुफा", "tamil": "குகை"}, "A natural opening in rock or ground", ["The bear lives in a cave.", "The cave is dark."], "nature", "noun", 1),
    ("Pond", {"telugu": "చెరువు", "hindi": "तालाब", "tamil": "குளம்"}, "A small body of still water", ["Ducks swim in the pond.", "The pond is clean."], "nature", "noun", 1),
    ("Nest", {"telugu": "గూడు", "hindi": "घोंसला", "tamil": "கூடு"}, "A home that birds build", ["The bird made a nest.", "Eggs are in the nest."], "nature", "noun", 1),
    ("Leaf", {"telugu": "ఆకు", "hindi": "पत्ता", "tamil": "இலை"}, "A flat green part of a plant", ["The leaf is green.", "Leaves fall in autumn."], "nature", "noun", 1),
    ("Seed", {"telugu": "విత్తనం", "hindi": "बीज", "tamil": "விதை"}, "The small part of a plant from which a new plant grows", ["Plant the seed.", "The seed will grow."], "nature", "noun", 1),
    ("Tray", {"telugu": "ట్రే", "hindi": "ट्रे", "tamil": "தட்டு"}, "A flat board for carrying things", ["Put food on the tray.", "The tray is big."], "household", "noun", 1),
    ("Soap", {"telugu": "సబ్బు", "hindi": "साबुन", "tamil": "சோப்பு"}, "Something used to wash and clean", ["Wash your hands with soap.", "Soap makes bubbles."], "household", "noun", 1),
    ("Belt", {"telugu": "బెల్ట్", "hindi": "बेल्ट", "tamil": "பெல்ட்"}, "A strip worn around the waist", ["Dad wears a belt.", "My belt is brown."], "clothing", "noun", 1),
    ("Vest", {"telugu": "లోపలి బట్ట", "hindi": "बनियान", "tamil": "உள்ளாடை"}, "A piece of clothing worn on the upper body", ["Wear a vest inside.", "The vest is white."], "clothing", "noun", 1),
    ("Gown", {"telugu": "గౌను", "hindi": "गाउन", "tamil": "கவுன்"}, "A long dress", ["The princess wears a gown.", "A beautiful gown."], "clothing", "noun", 1),
    ("Lime", {"telugu": "నిమ్మ", "hindi": "नींबू", "tamil": "எலுமிச்சை"}, "A small green citrus fruit", ["Lime juice is sour.", "Add lime to water."], "food", "noun", 1),
    ("Corn", {"telugu": "మొక్కజొన్న", "hindi": "मक्का", "tamil": "சோளம்"}, "A tall plant with yellow kernels", ["I like roasted corn.", "Corn grows in fields."], "food", "noun", 1),
    ("Bean", {"telugu": "బీన్", "hindi": "सेम", "tamil": "பீன்ஸ்"}, "A seed of a plant used as food", ["I eat beans.", "Beans are healthy."], "food", "noun", 1),
    ("Plum", {"telugu": "ప్లమ్", "hindi": "बेर", "tamil": "பிளம்"}, "A round purple fruit", ["The plum is juicy.", "I picked a plum."], "food", "noun", 1),
    ("Claw", {"telugu": "గోరు", "hindi": "पंजा", "tamil": "நகம்"}, "A sharp curved nail on an animal's foot", ["The cat has sharp claws.", "The eagle has big claws."], "animals", "noun", 1),
    ("Tail", {"telugu": "తోక", "hindi": "पूँछ", "tamil": "வால்"}, "The part at the back of an animal's body", ["The dog wags its tail.", "The monkey has a long tail."], "animals", "noun", 1),
    ("Beak", {"telugu": "ముక్కు", "hindi": "चोंच", "tamil": "அலகு"}, "The hard pointed part of a bird's mouth", ["The parrot has a red beak.", "Birds eat with their beak."], "animals", "noun", 1),
    ("Horn", {"telugu": "కొమ్ము", "hindi": "सींग", "tamil": "கொம்பு"}, "A hard pointed growth on an animal's head", ["The cow has horns.", "The bull's horns are big."], "animals", "noun", 1),
    ("Wool", {"telugu": "ఊలు", "hindi": "ऊन", "tamil": "கம்பளி"}, "Soft hair from a sheep", ["Sweaters are made of wool.", "Wool keeps us warm."], "materials", "noun", 1),
    ("Clay", {"telugu": "మట్టి", "hindi": "मिट्टी", "tamil": "களிமண்"}, "Soft earth used to make pots", ["We make pots from clay.", "Play with clay."], "materials", "noun", 1),
    ("Rope", {"telugu": "తాడు", "hindi": "रस्सी", "tamil": "கயிறு"}, "A thick strong string", ["Pull the rope.", "Skip with a rope."], "objects", "noun", 1),
    ("Kite", {"telugu": "గాలిపటం", "hindi": "पतंग", "tamil": "காத்தாடி"}, "A toy that flies in the wind", ["I fly a kite.", "The kite is high."], "toys", "noun", 1),
    ("Drum", {"telugu": "డ్రమ్", "hindi": "ढोल", "tamil": "மேளம்"}, "A musical instrument you hit", ["I play the drum.", "The drum is loud."], "music", "noun", 1),
    ("Bell", {"telugu": "గంట", "hindi": "घंटी", "tamil": "மணி"}, "An object that makes a ringing sound", ["Ring the bell.", "The bell is loud."], "objects", "noun", 1),
    ("Flag", {"telugu": "జెండా", "hindi": "झंडा", "tamil": "கொடி"}, "A piece of cloth with a design", ["The Indian flag.", "Wave the flag."], "objects", "noun", 1),
    ("Lamp", {"telugu": "దీపం", "hindi": "लैंप", "tamil": "விளக்கு"}, "A device that gives light", ["Turn on the lamp.", "The lamp is bright."], "household", "noun", 1),
    ("Coin", {"telugu": "నాణెం", "hindi": "सिक्का", "tamil": "நாணயம்"}, "A small flat piece of metal money", ["I found a coin.", "The coin is shiny."], "objects", "noun", 1),
    ("Comb", {"telugu": "దువ్వెన", "hindi": "कंघी", "tamil": "சீப்பு"}, "A tool used to arrange hair", ["Comb your hair.", "I lost my comb."], "objects", "noun", 1),
    ("Worm", {"telugu": "పురుగు", "hindi": "कीड़ा", "tamil": "புழு"}, "A small soft animal that lives in soil", ["The worm is in the soil.", "Birds eat worms."], "animals", "noun", 1),
    ("Toad", {"telugu": "కప్ప", "hindi": "मेंढक", "tamil": "தேரை"}, "An animal like a frog with bumpy skin", ["The toad hops.", "I saw a toad."], "animals", "noun", 1),
    ("Snail", {"telugu": "నత్త", "hindi": "घोंघा", "tamil": "நத்தை"}, "A small animal with a shell on its back", ["The snail moves slowly.", "Snails leave a trail."], "animals", "noun", 1),
    ("Crow", {"telugu": "కాకి", "hindi": "कौआ", "tamil": "காகம்"}, "A large black bird", ["The crow is black.", "The crow caws."], "animals", "noun", 1),
    ("Broom", {"telugu": "చీపురు", "hindi": "झाड़ू", "tamil": "விளக்குமாறு"}, "A brush for sweeping floors", ["Sweep with a broom.", "The broom is new."], "household", "noun", 1),
    ("Stool", {"telugu": "స్టూల్", "hindi": "स्टूल", "tamil": "ஸ்டூல்"}, "A seat without a back", ["Sit on the stool.", "The stool is wooden."], "household", "noun", 1),
    ("Shelf", {"telugu": "అరమర", "hindi": "शेल्फ", "tamil": "அலமாரி"}, "A flat surface for keeping things", ["Books are on the shelf.", "Clean the shelf."], "household", "noun", 1),
    ("Chalk", {"telugu": "చాక్", "hindi": "चॉक", "tamil": "சாக்"}, "A soft white stick used for writing", ["Write with chalk.", "Chalk is white."], "school", "noun", 1),
    ("Desk", {"telugu": "డెస్క్", "hindi": "डेस्क", "tamil": "மேஜை"}, "A table for reading or writing", ["My desk is clean.", "I sit at my desk."], "school", "noun", 1),
    ("Glue", {"telugu": "జిగురు", "hindi": "गोंद", "tamil": "பசை"}, "A sticky substance for joining things", ["Use glue to stick it.", "The glue is sticky."], "school", "noun", 1),
    ("Ring", {"telugu": "ఉంగరం", "hindi": "अंगूठी", "tamil": "மோதிரம்"}, "A small circular band worn on a finger", ["Mom wears a ring.", "The ring is gold."], "objects", "noun", 1),
    ("Cage", {"telugu": "పంజరం", "hindi": "पिंजरा", "tamil": "கூண்டு"}, "A structure to keep birds or animals", ["The bird is in a cage.", "Open the cage."], "objects", "noun", 1),
    ("Knee", {"telugu": "మోకాలు", "hindi": "घुटना", "tamil": "முழங்கால்"}, "The joint in the middle of your leg", ["I hurt my knee.", "Bend your knees."], "body", "noun", 1),
    ("Palm", {"telugu": "అరచేయి", "hindi": "हथेली", "tamil": "உள்ளங்கை"}, "The inside part of your hand", ["Show me your palm.", "My palm is soft."], "body", "noun", 1),
    ("Heel", {"telugu": "మడమ", "hindi": "एड़ी", "tamil": "குதிகால்"}, "The back part of the foot", ["I hurt my heel.", "Stand on your heels."], "body", "noun", 1),
    ("Wrist", {"telugu": "మణికట్టు", "hindi": "कलाई", "tamil": "மணிக்கட்டு"}, "The joint between hand and arm", ["I wear a watch on my wrist.", "My wrist hurts."], "body", "noun", 1),
]

# ==================== 2ND-3RD ADDITIONAL WORDS ====================
second_words = [
    ("Brave", {"telugu": "ధైర్యమైన", "hindi": "बहादुर", "tamil": "தைரியமான"}, "Having courage, not afraid", ["The brave boy saved the cat.", "Be brave and try again."], "adjectives", "adjective", 2),
    ("Clever", {"telugu": "తెలివైన", "hindi": "चतुर", "tamil": "புத்திசாலி"}, "Quick at learning and understanding", ["The clever girl solved the puzzle.", "Foxes are clever animals."], "adjectives", "adjective", 2),
    ("Honest", {"telugu": "నిజాయితీ", "hindi": "ईमानदार", "tamil": "நேர்மையான"}, "Always telling the truth", ["Be honest always.", "An honest person is respected."], "adjectives", "adjective", 2),
    ("Polite", {"telugu": "మర్యాదగా", "hindi": "विनम्र", "tamil": "கண்ணியமான"}, "Showing good manners", ["She is very polite.", "Be polite to elders."], "adjectives", "adjective", 2),
    ("Greedy", {"telugu": "అత్యాశ", "hindi": "लालची", "tamil": "பேராசை"}, "Wanting more than you need", ["The greedy man wanted all the gold.", "Do not be greedy."], "adjectives", "adjective", 2),
    ("Shallow", {"telugu": "లోతులేని", "hindi": "उथला", "tamil": "ஆழமற்ற"}, "Not deep", ["The shallow pool is safe.", "The river is shallow here."], "adjectives", "adjective", 2),
    ("Smooth", {"telugu": "మృదువైన", "hindi": "चिकना", "tamil": "மென்மையான"}, "Having an even surface", ["The marble is smooth.", "The road is smooth."], "adjectives", "adjective", 2),
    ("Fierce", {"telugu": "భయంకరమైన", "hindi": "भयंकर", "tamil": "கடுமையான"}, "Very strong or violent", ["The lion looks fierce.", "A fierce storm."], "adjectives", "adjective", 2),
    ("Gather", {"telugu": "సేకరించు", "hindi": "इकट्ठा करना", "tamil": "சேகரி"}, "To collect or bring together", ["Gather the flowers.", "We gather in the hall."], "actions", "verb", 2),
    ("Scatter", {"telugu": "చెదరగొట్టు", "hindi": "बिखेरना", "tamil": "சிதறு"}, "To spread things in many directions", ["The wind scattered the leaves.", "Do not scatter your toys."], "actions", "verb", 2),
    ("Stir", {"telugu": "కలుపు", "hindi": "हिलाना", "tamil": "கிளறு"}, "To mix something by moving it around", ["Stir the soup.", "Stir the tea."], "actions", "verb", 2),
    ("Fold", {"telugu": "మడతపెట్టు", "hindi": "मोड़ना", "tamil": "மடி"}, "To bend something over itself", ["Fold your clothes.", "Fold the paper in half."], "actions", "verb", 2),
    ("Squeeze", {"telugu": "పిండు", "hindi": "निचोड़ना", "tamil": "பிழி"}, "To press something firmly", ["Squeeze the lemon.", "Squeeze the sponge."], "actions", "verb", 2),
    ("Spray", {"telugu": "చల్లు", "hindi": "छिड़कना", "tamil": "தெளி"}, "To scatter liquid in small drops", ["Spray water on plants.", "The spray of the sea."], "actions", "verb", 2),
    ("Stretch", {"telugu": "సాగు", "hindi": "खींचना", "tamil": "நீட்டு"}, "To make something longer or wider", ["Stretch your arms.", "The cat stretched."], "actions", "verb", 2),
    ("Harvest", {"telugu": "పంట కోయు", "hindi": "फसल काटना", "tamil": "அறுவடை"}, "To collect crops from fields", ["Farmers harvest rice.", "It is harvest season."], "actions", "verb", 2),
    ("Merchant", {"telugu": "వ్యాపారి", "hindi": "व्यापारी", "tamil": "வணிகர்"}, "A person who buys and sells things", ["The merchant sells cloth.", "The merchant travels far."], "people", "noun", 2),
    ("Tailor", {"telugu": "దర్జి", "hindi": "दर्ज़ी", "tamil": "தையல்காரர்"}, "A person who makes or mends clothes", ["The tailor stitched my shirt.", "Go to the tailor."], "people", "noun", 2),
    ("Carpenter", {"telugu": "వడ్రంగి", "hindi": "बढ़ई", "tamil": "தச்சர்"}, "A person who makes things from wood", ["The carpenter made a table.", "My uncle is a carpenter."], "people", "noun", 2),
    ("Potter", {"telugu": "కుమ్మరి", "hindi": "कुम्हार", "tamil": "குயவர்"}, "A person who makes pots from clay", ["The potter makes beautiful pots.", "We visited the potter."], "people", "noun", 2),
    ("Barber", {"telugu": "మంగలి", "hindi": "नाई", "tamil": "நாவிதர்"}, "A person who cuts hair", ["I went to the barber.", "The barber cut my hair."], "people", "noun", 2),
    ("Island", {"telugu": "దీవి", "hindi": "द्वीप", "tamil": "தீவு"}, "A piece of land surrounded by water", ["We visited an island.", "The island has coconut trees."], "geography", "noun", 2),
    ("Desert", {"telugu": "ఎడారి", "hindi": "रेगिस्तान", "tamil": "பாலைவனம்"}, "A dry, sandy area with little rain", ["Camels live in the desert.", "The desert is hot."], "geography", "noun", 2),
    ("Valley", {"telugu": "లోయ", "hindi": "घाटी", "tamil": "பள்ளத்தாக்கு"}, "Low land between hills or mountains", ["The valley is green.", "A beautiful valley."], "geography", "noun", 2),
    ("Cliff", {"telugu": "కొండ అంచు", "hindi": "चट्टान", "tamil": "பாறை"}, "A steep rock face", ["Do not go near the cliff.", "The cliff is very high."], "geography", "noun", 2),
    ("Forest", {"telugu": "అడవి", "hindi": "जंगल", "tamil": "காடு"}, "A large area with many trees", ["Animals live in the forest.", "The forest is dense."], "geography", "noun", 2),
    ("Stream", {"telugu": "సెలయేరు", "hindi": "धारा", "tamil": "நீரோடை"}, "A small river", ["The stream flows gently.", "Fish swim in the stream."], "geography", "noun", 2),
    ("Volcano", {"telugu": "అగ్నిపర్వతం", "hindi": "ज्वालामुखी", "tamil": "எரிமலை"}, "A mountain that can erupt", ["The volcano erupted.", "Lava flows from a volcano."], "geography", "noun", 2),
    ("Compass", {"telugu": "దిక్సూచి", "hindi": "कम्पास", "tamil": "திசைகாட்டி"}, "A tool showing directions", ["Use a compass to find north.", "The compass points north."], "tools", "noun", 2),
    ("Lantern", {"telugu": "లాంతరు", "hindi": "लालटेन", "tamil": "விளக்கு"}, "A lamp you can carry", ["Light the lantern.", "The lantern shines bright."], "objects", "noun", 2),
    ("Shield", {"telugu": "కవచం", "hindi": "ढाल", "tamil": "கேடயம்"}, "Something used for protection", ["The warrior held a shield.", "A shield protects you."], "objects", "noun", 2),
    ("Arrow", {"telugu": "బాణం", "hindi": "तीर", "tamil": "அம்பு"}, "A pointed stick shot from a bow", ["The arrow hit the target.", "Arjuna shot an arrow."], "objects", "noun", 2),
    ("Wheat", {"telugu": "గోధుమ", "hindi": "गेहूं", "tamil": "கோதுமை"}, "A cereal plant used to make flour", ["Wheat grows in the field.", "Bread is made from wheat."], "food", "noun", 2),
    ("Honey", {"telugu": "తేనె", "hindi": "शहद", "tamil": "தேன்"}, "Sweet liquid made by bees", ["I like honey.", "Honey is healthy."], "food", "noun", 2),
    ("Cheese", {"telugu": "చీజ్", "hindi": "पनीर", "tamil": "சீஸ்"}, "Food made from milk", ["I love cheese.", "Cheese is tasty."], "food", "noun", 2),
    ("Parrot", {"telugu": "చిలుక", "hindi": "तोता", "tamil": "கிளி"}, "A colorful bird that can talk", ["The parrot is green.", "The parrot can talk."], "animals", "noun", 2),
    ("Peacock", {"telugu": "నెమలి", "hindi": "मोर", "tamil": "மயில்"}, "A beautiful bird with colorful feathers", ["The peacock danced.", "The peacock is India's national bird."], "animals", "noun", 2),
    ("Dolphin", {"telugu": "డాల్ఫిన్", "hindi": "डॉल्फ़िन", "tamil": "டால்பின்"}, "A smart sea animal", ["Dolphins are friendly.", "The dolphin jumped."], "animals", "noun", 2),
    ("Sparrow", {"telugu": "పిచ్చుక", "hindi": "गौरैया", "tamil": "சிட்டுக்குருவி"}, "A small brown bird", ["A sparrow sat on the window.", "Sparrows chirp sweetly."], "animals", "noun", 2),
    ("Squirrel", {"telugu": "ఉడుత", "hindi": "गिलहरी", "tamil": "அணில்"}, "A small animal with a bushy tail", ["The squirrel eats nuts.", "A squirrel climbed the tree."], "animals", "noun", 2),
    ("Tortoise", {"telugu": "తాబేలు", "hindi": "कछुआ", "tamil": "ஆமை"}, "A slow-moving animal with a hard shell", ["The tortoise won the race.", "A tortoise lives long."], "animals", "noun", 2),
    ("Sunset", {"telugu": "సూర్యాస్తమయం", "hindi": "सूर्यास्त", "tamil": "சூரிய அஸ்தமனம்"}, "When the sun goes down in the evening", ["The sunset is beautiful.", "We watched the sunset."], "nature", "noun", 2),
    ("Rainbow", {"telugu": "ఇంద్రధనుస్సు", "hindi": "इंद्रधनुष", "tamil": "வானவில்"}, "An arc of colors in the sky", ["I saw a rainbow.", "The rainbow has seven colors."], "nature", "noun", 2),
    ("Thunder", {"telugu": "ఉరుము", "hindi": "बिजली", "tamil": "இடி"}, "A loud sound during a storm", ["I heard thunder.", "Thunder scared the dog."], "nature", "noun", 2),
    ("Breeze", {"telugu": "గాలి", "hindi": "हवा", "tamil": "தென்றல்"}, "A gentle wind", ["A cool breeze blows.", "The breeze feels nice."], "nature", "noun", 2),
    ("Dusk", {"telugu": "సంధ్య", "hindi": "शाम", "tamil": "அந்தி"}, "The time when it starts getting dark", ["We came home at dusk.", "Dusk is peaceful."], "time", "noun", 2),
    ("Dawn", {"telugu": "తెల్లవారుజాము", "hindi": "सुबह", "tamil": "விடியல்"}, "The time when daylight first appears", ["Birds sing at dawn.", "We woke up at dawn."], "time", "noun", 2),
    ("Season", {"telugu": "ఋతువు", "hindi": "मौसम", "tamil": "பருவம்"}, "A time of year with different weather", ["Summer is my favorite season.", "India has many seasons."], "time", "noun", 2),
    ("Village", {"telugu": "గ్రామం", "hindi": "गाँव", "tamil": "கிராமம்"}, "A small town in the countryside", ["My grandparents live in a village.", "The village is peaceful."], "places", "noun", 2),
    ("Temple", {"telugu": "దేవాలయం", "hindi": "मंदिर", "tamil": "கோவில்"}, "A place of worship", ["We went to the temple.", "The temple is old."], "places", "noun", 2),
    ("Market", {"telugu": "మార్కెట్", "hindi": "बाज़ार", "tamil": "சந்தை"}, "A place where things are sold", ["We buy vegetables at the market.", "The market is busy."], "places", "noun", 2),
    ("Bridge", {"telugu": "వంతెన", "hindi": "पुल", "tamil": "பாலம்"}, "A structure built over a river or road", ["We crossed the bridge.", "The bridge is long."], "places", "noun", 2),
    ("Harbor", {"telugu": "రేవు", "hindi": "बंदरगाह", "tamil": "துறைமுகம்"}, "A place where ships are kept", ["Ships dock at the harbor.", "The harbor is busy."], "places", "noun", 2),
    ("Ancient", {"telugu": "ప్రాచీన", "hindi": "प्राचीन", "tamil": "பழமையான"}, "Very old, from long ago", ["The ancient fort is huge.", "India has ancient temples."], "adjectives", "adjective", 2),
    ("Fierce", {"telugu": "భయంకరమైన", "hindi": "भयंकर", "tamil": "உக்கிரமான"}, "Very powerful or strong", ["The tiger is fierce.", "A fierce battle."], "adjectives", "adjective", 3),
    ("Pebble", {"telugu": "గులకరాయి", "hindi": "कंकड़", "tamil": "கூழாங்கல்"}, "A small smooth stone", ["I threw a pebble in the water.", "Pebbles are on the beach."], "nature", "noun", 2),
    ("Meadow", {"telugu": "పచ్చిక బయలు", "hindi": "घास का मैदान", "tamil": "புல்வெளி"}, "A field of grass", ["Cows graze in the meadow.", "The meadow is green."], "nature", "noun", 2),
    ("Thirst", {"telugu": "దాహం", "hindi": "प्यास", "tamil": "தாகம்"}, "The feeling of needing to drink", ["I have thirst after running.", "Drink water to quench thirst."], "feelings", "noun", 2),
    ("Hunger", {"telugu": "ఆకలి", "hindi": "भूख", "tamil": "பசி"}, "The feeling of needing food", ["I feel hunger.", "Hunger makes you tired."], "feelings", "noun", 2),
    ("Courage", {"telugu": "ధైర్యం", "hindi": "साहस", "tamil": "தைரியம்"}, "The ability to face danger without fear", ["Show courage.", "She showed great courage."], "feelings", "noun", 2),
    ("Journey", {"telugu": "ప్రయాణం", "hindi": "यात्रा", "tamil": "பயணம்"}, "Traveling from one place to another", ["The journey was long.", "We enjoyed the journey."], "actions", "noun", 2),
    ("Treasure", {"telugu": "నిధి", "hindi": "खज़ाना", "tamil": "புதையல்"}, "A collection of valuable things", ["The pirates found treasure.", "Knowledge is a treasure."], "objects", "noun", 2),
    ("Shadow", {"telugu": "నీడ", "hindi": "छाया", "tamil": "நிழல்"}, "A dark area formed when light is blocked", ["I see my shadow.", "The shadow is long."], "nature", "noun", 2),
    ("Flame", {"telugu": "మంట", "hindi": "लौ", "tamil": "சுடர்"}, "The hot glowing gas from a fire", ["The flame is bright.", "The candle flame flickered."], "nature", "noun", 2),
    ("Harvest", {"telugu": "పంట", "hindi": "फसल", "tamil": "அறுவடை"}, "The crops gathered from fields", ["The harvest was good.", "We celebrate harvest festival."], "agriculture", "noun", 2),
    ("Festival", {"telugu": "పండుగ", "hindi": "त्योहार", "tamil": "திருவிழா"}, "A special celebration or event", ["Diwali is my favorite festival.", "We enjoy festivals."], "culture", "noun", 2),
]

# ==================== 4TH-5TH ADDITIONAL WORDS ====================
fourth_words = [
    ("Ambitious", {"telugu": "ఆశయం", "hindi": "महत्त्वाकांक्षी", "tamil": "லட்சியமுள்ள"}, "Having a strong desire to succeed", ["She is very ambitious.", "Be ambitious in life."], "adjectives", "adjective", 3),
    ("Generous", {"telugu": "ఉదారమైన", "hindi": "उदार", "tamil": "தாராளமான"}, "Willing to give and share", ["He is generous with his time.", "A generous donation."], "adjectives", "adjective", 3),
    ("Cautious", {"telugu": "జాగ్రత్తగా", "hindi": "सतर्क", "tamil": "எச்சரிக்கையான"}, "Being careful to avoid danger", ["Be cautious while crossing.", "A cautious driver."], "adjectives", "adjective", 3),
    ("Numerous", {"telugu": "అనేక", "hindi": "अनेक", "tamil": "எண்ணற்ற"}, "Very many", ["Numerous stars in the sky.", "There are numerous birds."], "adjectives", "adjective", 3),
    ("Peculiar", {"telugu": "విచిత్రమైన", "hindi": "अजीब", "tamil": "விசித்திரமான"}, "Strange or unusual", ["A peculiar sound.", "The animal had peculiar markings."], "adjectives", "adjective", 3),
    ("Frequent", {"telugu": "తరచుగా", "hindi": "बार-बार", "tamil": "அடிக்கடி"}, "Happening often", ["Frequent rain in monsoon.", "She makes frequent visits."], "adjectives", "adjective", 3),
    ("Navigate", {"telugu": "నావిగేట్", "hindi": "दिशा निर्देश", "tamil": "வழிசெலுத்து"}, "To find your way", ["Use a map to navigate.", "Ships navigate the ocean."], "actions", "verb", 3),
    ("Investigate", {"telugu": "విచారించు", "hindi": "जांच करना", "tamil": "விசாரணை செய்"}, "To examine or look into something carefully", ["Police investigate crimes.", "Let us investigate the problem."], "actions", "verb", 3),
    ("Construct", {"telugu": "నిర్మించు", "hindi": "निर्माण करना", "tamil": "கட்டமை"}, "To build or make something", ["They construct buildings.", "We constructed a model."], "actions", "verb", 3),
    ("Demonstrate", {"telugu": "ప్రదర్శించు", "hindi": "प्रदर्शित करना", "tamil": "நிரூபி"}, "To show or prove something", ["She demonstrated the experiment.", "Can you demonstrate?"], "actions", "verb", 3),
    ("Experiment", {"telugu": "ప్రయోగం", "hindi": "प्रयोग", "tamil": "சோதனை"}, "A test done to discover something", ["The science experiment worked.", "We did an experiment."], "science", "noun", 3),
    ("Telescope", {"telugu": "దూరదర్శిని", "hindi": "दूरबीन", "tamil": "தொலைநோக்கி"}, "A tool used to see far away things", ["Look through the telescope.", "I saw the moon through a telescope."], "science", "noun", 3),
    ("Microscope", {"telugu": "సూక్ష్మదర్శిని", "hindi": "सूक्ष्मदर्शी", "tamil": "நுண்ணோக்கி"}, "A tool used to see very small things", ["We used a microscope in class.", "Bacteria are seen through a microscope."], "science", "noun", 3),
    ("Gravity", {"telugu": "గురుత్వాకర్షణ", "hindi": "गुरुत्वाकर्षण", "tamil": "ஈர்ப்பு விசை"}, "The force that pulls things down", ["Gravity keeps us on the ground.", "Newton discovered gravity."], "science", "noun", 3),
    ("Oxygen", {"telugu": "ఆక్సిజన్", "hindi": "ऑक्सीजन", "tamil": "ஆக்சிஜன்"}, "A gas we breathe", ["We need oxygen to live.", "Trees give us oxygen."], "science", "noun", 3),
    ("Atmosphere", {"telugu": "వాతావరణం", "hindi": "वातावरण", "tamil": "வளிமண்டலம்"}, "The layer of air around Earth", ["The atmosphere protects us.", "Pollution harms the atmosphere."], "science", "noun", 3),
    ("Continent", {"telugu": "ఖండం", "hindi": "महाद्वीप", "tamil": "கண்டம்"}, "A large mass of land", ["Asia is the biggest continent.", "There are seven continents."], "geography", "noun", 3),
    ("Peninsula", {"telugu": "ద్వీపకల్పం", "hindi": "प्रायद्वीप", "tamil": "தீபகற்பம்"}, "Land surrounded by water on three sides", ["India is a peninsula.", "The peninsula has beaches."], "geography", "noun", 3),
    ("Glacier", {"telugu": "హిమానీనదం", "hindi": "हिमनद", "tamil": "பனிப்பாறை"}, "A large mass of ice that moves slowly", ["Glaciers melt due to warming.", "The glacier is huge."], "geography", "noun", 3),
    ("Erosion", {"telugu": "కోత", "hindi": "कटाव", "tamil": "அரிப்பு"}, "The wearing away of land by water or wind", ["Rain causes erosion.", "Erosion shapes the land."], "geography", "noun", 3),
    ("Ecosystem", {"telugu": "పర్యావరణ వ్యవస్థ", "hindi": "पारिस्थितिकी तंत्र", "tamil": "சூழல்மண்டலம்"}, "A community of living things and their environment", ["The forest is an ecosystem.", "Protect the ecosystem."], "science", "noun", 3),
    ("Predator", {"telugu": "వేటగాడు", "hindi": "शिकारी", "tamil": "வேட்டையாடி"}, "An animal that hunts other animals", ["The lion is a predator.", "Predators hunt prey."], "animals", "noun", 3),
    ("Camouflage", {"telugu": "మారువేషం", "hindi": "छद्मावरण", "tamil": "உருமறைப்பு"}, "Colors or patterns that help an animal hide", ["The chameleon uses camouflage.", "Camouflage helps animals survive."], "animals", "noun", 3),
    ("Migration", {"telugu": "వలస", "hindi": "प्रवास", "tamil": "இடம்பெயர்வு"}, "Moving from one place to another", ["Birds go on migration.", "Migration happens every year."], "animals", "noun", 3),
    ("Hibernate", {"telugu": "సుషుప్తి", "hindi": "शीत निद्रा", "tamil": "குளிர்கால உறக்கம்"}, "To sleep through winter", ["Bears hibernate in winter.", "Some animals hibernate."], "animals", "verb", 3),
    ("Parliament", {"telugu": "పార్లమెంట్", "hindi": "संसद", "tamil": "நாடாளுமன்றம்"}, "The group that makes laws for a country", ["Parliament meets in Delhi.", "Laws are made in Parliament."], "government", "noun", 3),
    ("Constitution", {"telugu": "రాజ్యాంగం", "hindi": "संविधान", "tamil": "அரசியலமைப்பு"}, "The basic rules of a country", ["India has a written constitution.", "The constitution protects rights."], "government", "noun", 3),
    ("Democracy", {"telugu": "ప్రజాస్వామ్యం", "hindi": "लोकतंत्र", "tamil": "ஜனநாயகம்"}, "A system where people choose their leaders", ["India is a democracy.", "Democracy gives everyone a voice."], "government", "noun", 3),
    ("Heritage", {"telugu": "వారసత్వం", "hindi": "विरासत", "tamil": "பாரம்பரியம்"}, "Things passed down from earlier generations", ["India has a rich heritage.", "Protect our cultural heritage."], "culture", "noun", 3),
    ("Monument", {"telugu": "స్మారక చిహ్నం", "hindi": "स्मारक", "tamil": "நினைவுச்சின்னம்"}, "A building or statue to remember something", ["The Taj Mahal is a monument.", "We visited the monument."], "culture", "noun", 3),
    ("Architecture", {"telugu": "వాస్తుశిల్పం", "hindi": "वास्तुकला", "tamil": "கட்டிடக்கலை"}, "The art of designing buildings", ["Indian architecture is beautiful.", "Modern architecture uses glass."], "culture", "noun", 3),
    ("Astronomy", {"telugu": "ఖగోళ శాస్త్రం", "hindi": "खगोल विज्ञान", "tamil": "வானியல்"}, "The study of stars and planets", ["I love astronomy.", "Astronomy helps us understand space."], "science", "noun", 3),
    ("Civilization", {"telugu": "నాగరికత", "hindi": "सभ्यता", "tamil": "நாகரிகம்"}, "A developed society", ["The Indus Valley Civilization.", "Ancient civilizations built great things."], "history", "noun", 3),
    ("Compass", {"telugu": "దిక్సూచి", "hindi": "दिशा सूचक", "tamil": "திசைகாட்டி"}, "A device showing directions", ["Sailors use a compass.", "The compass points north."], "tools", "noun", 3),
    ("Machinery", {"telugu": "యంత్రాలు", "hindi": "मशीनरी", "tamil": "இயந்திரம்"}, "Machines used in factories", ["Heavy machinery is used in construction.", "Machinery makes work easier."], "technology", "noun", 3),
    ("Satellite", {"telugu": "ఉపగ్రహం", "hindi": "उपग्रह", "tamil": "செயற்கைக்கோள்"}, "An object that orbits Earth", ["India launched a satellite.", "Satellites help with communication."], "technology", "noun", 3),
    ("Revolution", {"telugu": "విప్లవం", "hindi": "क्रांति", "tamil": "புரட்சி"}, "A big change or turning around", ["The Industrial Revolution.", "Earth makes one revolution around the sun."], "history", "noun", 3),
    ("Boundary", {"telugu": "సరిహద్దు", "hindi": "सीमा", "tamil": "எல்லை"}, "A line marking the edge of an area", ["India has international boundaries.", "Do not cross the boundary."], "geography", "noun", 3),
    ("Tropical", {"telugu": "ఉష్ణమండల", "hindi": "उष्णकटिबंधीय", "tamil": "வெப்பமண்டல"}, "Hot and humid climate", ["India has a tropical climate.", "Tropical forests have many animals."], "geography", "adjective", 3),
    ("Fertile", {"telugu": "సారవంతమైన", "hindi": "उपजाऊ", "tamil": "வளமான"}, "Good for growing crops", ["The soil is fertile.", "Fertile land produces good crops."], "agriculture", "adjective", 3),
    ("Nutrition", {"telugu": "పోషణ", "hindi": "पोषण", "tamil": "ஊட்டச்சத்து"}, "Food and substances needed for health", ["Good nutrition is important.", "Fruits provide nutrition."], "health", "noun", 3),
    ("Vaccination", {"telugu": "టీకా", "hindi": "टीकाकरण", "tamil": "தடுப்பூசி"}, "Medicine given to prevent disease", ["Get your vaccination.", "Vaccination protects from illness."], "health", "noun", 3),
    ("Communicate", {"telugu": "సంభాషించు", "hindi": "संवाद करना", "tamil": "தொடர்பு கொள்"}, "To share information with others", ["We communicate through language.", "Animals also communicate."], "actions", "verb", 3),
    ("Collaborate", {"telugu": "సహకరించు", "hindi": "सहयोग करना", "tamil": "ஒத்துழை"}, "To work together with others", ["Let us collaborate on this project.", "Teams collaborate to win."], "actions", "verb", 3),
    ("Appreciate", {"telugu": "అభినందించు", "hindi": "सराहना करना", "tamil": "பாராட்டு"}, "To recognize the value of something", ["I appreciate your help.", "Appreciate nature."], "actions", "verb", 3),
    ("Calculate", {"telugu": "లెక్కించు", "hindi": "गणना करना", "tamil": "கணக்கிடு"}, "To work out a number or amount", ["Calculate the total.", "We learned to calculate in math."], "actions", "verb", 3),
]

# ==================== 5TH-ADV ADDITIONAL WORDS ====================
fifth_words = [
    ("Perseverance", {"telugu": "పట్టుదల", "hindi": "दृढ़ता", "tamil": "விடாமுயற்சி"}, "Continuing despite difficulty", ["Success needs perseverance.", "She showed great perseverance."], "character", "noun", 4),
    ("Compassion", {"telugu": "కరుణ", "hindi": "करुणा", "tamil": "இரக்கம்"}, "Feeling concern for others' suffering", ["Show compassion to animals.", "Compassion makes us human."], "character", "noun", 4),
    ("Integrity", {"telugu": "సమగ్రత", "hindi": "ईमानदारी", "tamil": "நேர்மை"}, "Being honest and having strong morals", ["A leader needs integrity.", "Act with integrity."], "character", "noun", 4),
    ("Resilience", {"telugu": "స్థితిస్థాపకత", "hindi": "लचीलापन", "tamil": "மீள் திறன்"}, "The ability to recover from difficulties", ["Build resilience through challenges.", "Nature shows resilience."], "character", "noun", 4),
    ("Hypothesis", {"telugu": "పరికల్పన", "hindi": "परिकल्पना", "tamil": "கருதுகோள்"}, "An idea that can be tested", ["The scientist tested her hypothesis.", "Form a hypothesis before experimenting."], "science", "noun", 4),
    ("Phenomenon", {"telugu": "దృగ్విషయం", "hindi": "घटना", "tamil": "நிகழ்வு"}, "An observable event or fact", ["A rainbow is a natural phenomenon.", "Scientists study phenomena."], "science", "noun", 4),
    ("Photosynthesis", {"telugu": "కిరణజన్య సంయోగక్రియ", "hindi": "प्रकाश संश्लेषण", "tamil": "ஒளிச்சேர்க்கை"}, "How plants make food using sunlight", ["Plants need sunlight for photosynthesis.", "Photosynthesis produces oxygen."], "science", "noun", 4),
    ("Biodiversity", {"telugu": "జీవవైవిధ్యం", "hindi": "जैव विविधता", "tamil": "உயிர்ப்பன்மை"}, "The variety of life in an area", ["India has rich biodiversity.", "Protect biodiversity."], "science", "noun", 4),
    ("Renewable", {"telugu": "పునరుత్పాదక", "hindi": "नवीकरणीय", "tamil": "புதுப்பிக்கத்தக்க"}, "Can be used again and again", ["Solar energy is renewable.", "Use renewable resources."], "science", "adjective", 4),
    ("Sustainable", {"telugu": "సుస్థిర", "hindi": "टिकाऊ", "tamil": "நிலையான"}, "Can continue for a long time", ["Sustainable farming protects the earth.", "Live a sustainable life."], "environment", "adjective", 4),
    ("Conservation", {"telugu": "సంరక్షణ", "hindi": "संरक्षण", "tamil": "பாதுகாப்பு"}, "Protecting natural resources", ["Wildlife conservation is important.", "Water conservation saves resources."], "environment", "noun", 4),
    ("Deforestation", {"telugu": "అటవీ నిర్మూలన", "hindi": "वनों की कटाई", "tamil": "காடழிப்பு"}, "Cutting down forests", ["Deforestation harms animals.", "Stop deforestation."], "environment", "noun", 4),
    ("Elaborate", {"telugu": "వివరించు", "hindi": "विस्तृत", "tamil": "விரிவான"}, "Very detailed and complicated", ["An elaborate plan.", "Please elaborate on your idea."], "adjectives", "adjective", 4),
    ("Magnificent", {"telugu": "అద్భుతమైన", "hindi": "शानदार", "tamil": "அற்புதமான"}, "Extremely beautiful or impressive", ["The Taj Mahal is magnificent.", "A magnificent sunset."], "adjectives", "adjective", 4),
    ("Significant", {"telugu": "ముఖ్యమైన", "hindi": "महत्वपूर्ण", "tamil": "குறிப்பிடத்தக்க"}, "Important or meaningful", ["A significant discovery.", "This is a significant event."], "adjectives", "adjective", 4),
    ("Consequence", {"telugu": "పరిణామం", "hindi": "परिणाम", "tamil": "விளைவு"}, "A result of an action", ["Every action has a consequence.", "Think about the consequences."], "concepts", "noun", 4),
    ("Perspective", {"telugu": "దృష్టికోణం", "hindi": "दृष्टिकोण", "tamil": "கண்ணோட்டம்"}, "A point of view", ["Look at it from a different perspective.", "Everyone has their own perspective."], "concepts", "noun", 4),
    ("Innovation", {"telugu": "ఆవిష్కరణ", "hindi": "नवाचार", "tamil": "புதுமை"}, "A new idea or method", ["Technology drives innovation.", "Innovation changes the world."], "concepts", "noun", 4),
    ("Algorithm", {"telugu": "అల్గారిథమ్", "hindi": "एल्गोरिथम", "tamil": "வழிமுறை"}, "A set of rules to solve a problem", ["Computers use algorithms.", "Write an algorithm for sorting."], "technology", "noun", 4),
    ("Artificial", {"telugu": "కృత్రిమ", "hindi": "कृत्रिम", "tamil": "செயற்கை"}, "Made by humans, not natural", ["Artificial intelligence is growing.", "Artificial flowers look real."], "technology", "adjective", 4),
    ("Collaborate", {"telugu": "సహకరించు", "hindi": "सहयोग", "tamil": "ஒத்துழை"}, "To work together toward a goal", ["Scientists collaborate globally.", "Let us collaborate on this."], "actions", "verb", 4),
    ("Distinguish", {"telugu": "వేరుచేయు", "hindi": "भेद करना", "tamil": "வேறுபடுத்து"}, "To recognize differences between things", ["Distinguish fact from fiction.", "Can you distinguish the colors?"], "actions", "verb", 4),
    ("Interpret", {"telugu": "వ్యాఖ్యానించు", "hindi": "व्याख्या करना", "tamil": "விளக்கு"}, "To explain the meaning of something", ["Interpret the poem.", "How do you interpret this data?"], "actions", "verb", 4),
    ("Analyze", {"telugu": "విశ్లేషించు", "hindi": "विश्लेषण करना", "tamil": "பகுப்பாய்வு செய்"}, "To examine something in detail", ["Analyze the results.", "Scientists analyze data carefully."], "actions", "verb", 4),
    ("Evaluate", {"telugu": "మూల్యాంకనం", "hindi": "मूल्यांकन करना", "tamil": "மதிப்பிடு"}, "To judge the value or quality of something", ["Evaluate your performance.", "Teachers evaluate students."], "actions", "verb", 4),
    ("Synthesize", {"telugu": "సంశ్లేషణ", "hindi": "संश्लेषण करना", "tamil": "தொகுத்தல்"}, "To combine parts to form something new", ["Synthesize information from many sources.", "Plants synthesize food."], "actions", "verb", 4),
    ("Metaphor", {"telugu": "రూపకం", "hindi": "रूपक", "tamil": "உருவகம்"}, "A comparison without using like or as", ["Life is a journey is a metaphor.", "Poets use metaphors."], "language", "noun", 4),
    ("Narrative", {"telugu": "కథనం", "hindi": "कथा", "tamil": "கதையாடல்"}, "A story or account of events", ["Write a narrative essay.", "The narrative was interesting."], "language", "noun", 4),
    ("Dialogue", {"telugu": "సంభాషణ", "hindi": "संवाद", "tamil": "உரையாடல்"}, "A conversation between two or more people", ["The dialogue in the story is good.", "Practice English through dialogue."], "language", "noun", 4),
    ("Vocabulary", {"telugu": "పదజాలం", "hindi": "शब्दावली", "tamil": "சொல்வளம்"}, "The words known to a person", ["Build your vocabulary.", "A rich vocabulary helps in writing."], "language", "noun", 4),
    ("Pronunciation", {"telugu": "ఉచ్చారణ", "hindi": "उच्चारण", "tamil": "உச்சரிப்பு"}, "The way a word is spoken", ["Practice your pronunciation.", "Good pronunciation is important."], "language", "noun", 4),
    ("Entrepreneur", {"telugu": "వ్యవస్థాపకుడు", "hindi": "उद्यमी", "tamil": "தொழில்முனைவர்"}, "A person who starts a business", ["She is a young entrepreneur.", "Entrepreneurs take risks."], "business", "noun", 4),
    ("Archaeology", {"telugu": "పురాతత్వశాస్త్రం", "hindi": "पुरातत्व", "tamil": "தொல்பொருளியல்"}, "The study of ancient civilizations", ["Archaeology reveals history.", "She studies archaeology."], "science", "noun", 4),
    ("Chronological", {"telugu": "కాలక్రమ", "hindi": "कालानुक्रमिक", "tamil": "காலவரிசை"}, "Arranged in order of time", ["Put events in chronological order.", "A chronological list of kings."], "concepts", "adjective", 4),
    ("Symmetry", {"telugu": "సమరూపత", "hindi": "समरूपता", "tamil": "சமச்சீர்"}, "When two halves match exactly", ["The butterfly has symmetry.", "Buildings use symmetry in design."], "math", "noun", 4),
    ("Proportion", {"telugu": "అనుపాతం", "hindi": "अनुपात", "tamil": "விகிதம்"}, "The relationship of size between parts", ["The drawing is in correct proportion.", "Calculate the proportion."], "math", "noun", 4),
    ("Equation", {"telugu": "సమీకరణం", "hindi": "समीकरण", "tamil": "சமன்பாடு"}, "A math statement showing two things are equal", ["Solve the equation.", "x + 5 = 10 is an equation."], "math", "noun", 4),
    ("Circumference", {"telugu": "చుట్టుకొలత", "hindi": "परिधि", "tamil": "சுற்றளவு"}, "The distance around a circle", ["Calculate the circumference.", "The circumference of the earth."], "math", "noun", 4),
    ("Latitude", {"telugu": "అక్షాంశం", "hindi": "अक्षांश", "tamil": "அட்சரேகை"}, "Distance north or south of the equator", ["India lies between certain latitudes.", "Latitude affects climate."], "geography", "noun", 4),
    ("Longitude", {"telugu": "రేఖాంశం", "hindi": "देशांतर", "tamil": "தீர்க்கரேகை"}, "Distance east or west of the prime meridian", ["Longitude helps determine time zones.", "Find the longitude on the map."], "geography", "noun", 4),
    ("Evaporation", {"telugu": "బాష్పీభవనం", "hindi": "वाष्पीकरण", "tamil": "ஆவியாதல்"}, "When water turns to vapor", ["Evaporation happens when water is heated.", "The water cycle includes evaporation."], "science", "noun", 4),
    ("Condensation", {"telugu": "ఘనీభవనం", "hindi": "संघनन", "tamil": "சுருங்குதல்"}, "When vapor turns back to liquid", ["Condensation forms clouds.", "Water droplets on a cold glass is condensation."], "science", "noun", 4),
    ("Precipitation", {"telugu": "అవపాతం", "hindi": "वर्षण", "tamil": "மழைப்பொழிவு"}, "Rain, snow, or other water falling from clouds", ["Precipitation varies by region.", "India gets monsoon precipitation."], "science", "noun", 4),
    ("Electromagnetic", {"telugu": "విద్యుదయస్కాంత", "hindi": "विद्युत चुम्बकीय", "tamil": "மின்காந்த"}, "Related to electricity and magnetism together", ["Light is electromagnetic radiation.", "Electromagnetic waves carry energy."], "science", "adjective", 4),
    ("Indigenous", {"telugu": "స్వదేశీ", "hindi": "देशज", "tamil": "பழங்குடி"}, "Originating from a particular place", ["Indigenous plants grow here naturally.", "Respect indigenous cultures."], "culture", "adjective", 4),
    ("Prosperity", {"telugu": "సమృద్ధి", "hindi": "समृद्धि", "tamil": "செழிப்பு"}, "The state of being successful", ["Hard work leads to prosperity.", "We wish you prosperity."], "concepts", "noun", 4),
]

# Generate word IDs and add to list
idx = 705
for word_data in lkg_words:
    eng = word_data[0]
    if eng.lower() not in existing_words:
        new_words.append(make_word(
            f"lkg_{idx:03d}", eng, word_data[1], word_data[2], word_data[3],
            "lkg-1st", word_data[4], word_data[5], word_data[6]
        ))
        existing_words.add(eng.lower())
        idx += 1

for word_data in second_words:
    eng = word_data[0]
    if eng.lower() not in existing_words:
        new_words.append(make_word(
            f"2nd_{idx:03d}", eng, word_data[1], word_data[2], word_data[3],
            "2nd-3rd", word_data[4], word_data[5], word_data[6]
        ))
        existing_words.add(eng.lower())
        idx += 1

for word_data in fourth_words:
    eng = word_data[0]
    if eng.lower() not in existing_words:
        new_words.append(make_word(
            f"4th_{idx:03d}", eng, word_data[1], word_data[2], word_data[3],
            "4th-5th", word_data[4], word_data[5], word_data[6]
        ))
        existing_words.add(eng.lower())
        idx += 1

for word_data in fifth_words:
    eng = word_data[0]
    if eng.lower() not in existing_words:
        new_words.append(make_word(
            f"5th_{idx:03d}", eng, word_data[1], word_data[2], word_data[3],
            "5th-adv", word_data[4], word_data[5], word_data[6]
        ))
        existing_words.add(eng.lower())
        idx += 1

print(f"New words generated: {len(new_words)}")

# Combine with existing
all_words = existing + new_words
print(f"Total words: {len(all_words)}")

# Count by level
from collections import Counter
new_levels = Counter(w['level'] for w in all_words)
for k, v in sorted(new_levels.items()):
    print(f"  {k}: {v}")

# Save expanded production file
with open('data/words_production.json', 'w', encoding='utf-8') as f:
    json.dump(all_words, f, ensure_ascii=False, indent=2)

print("Saved to data/words_production.json")
