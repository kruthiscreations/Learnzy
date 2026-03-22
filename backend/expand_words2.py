#!/usr/bin/env python3
"""Add more words to reach 1000+"""
import json

with open('data/words_production.json', 'r') as f:
    existing = json.load(f)

existing_words = {w['word_english'].lower() for w in existing}
idx = 882

def make_word(word_id, english, translations, meaning, examples, level, category, pos, difficulty):
    return {
        "word_id": word_id,
        "word_english": english,
        "translations": translations,
        "meaning": meaning,
        "example_sentences": examples,
        "level": level,
        "category": category,
        "synonyms": [],
        "antonyms": [],
        "part_of_speech": pos,
        "difficulty": difficulty
    }

new_words = []

# More LKG-1st words
extra_lkg = [
    ("Rug", {"telugu": "తివాచి", "hindi": "गलीचा", "tamil": "விரிப்பு"}, "A small carpet", ["The rug is on the floor.", "A soft rug."], "household", "noun", 1),
    ("Pin", {"telugu": "పిన్", "hindi": "पिन", "tamil": "ஊசி"}, "A thin pointed metal piece", ["Use a pin.", "The pin is sharp."], "objects", "noun", 1),
    ("Bud", {"telugu": "మొగ్గ", "hindi": "कली", "tamil": "மொட்டு"}, "A flower before it opens", ["The bud will bloom.", "A rose bud."], "nature", "noun", 1),
    ("Dip", {"telugu": "ముంచు", "hindi": "डुबाना", "tamil": "நனைக்க"}, "To put into liquid briefly", ["Dip the brush in paint.", "Dip your feet in water."], "actions", "verb", 1),
    ("Mix", {"telugu": "కలుపు", "hindi": "मिलाना", "tamil": "கலக்கு"}, "To put things together", ["Mix the colors.", "Mix flour and water."], "actions", "verb", 1),
    ("Zip", {"telugu": "జిప్", "hindi": "ज़िप", "tamil": "ஜிப்"}, "A fastener on clothes or bags", ["Zip up your jacket.", "The zip is stuck."], "objects", "noun", 1),
    ("Mug", {"telugu": "మగ్", "hindi": "मग", "tamil": "கோப்பை"}, "A large cup with a handle", ["Drink milk from a mug.", "The mug is full."], "household", "noun", 1),
    ("Pit", {"telugu": "గొయ్యి", "hindi": "गड्ढा", "tamil": "குழி"}, "A hole in the ground", ["A deep pit.", "Do not fall in the pit."], "nature", "noun", 1),
    ("Tub", {"telugu": "తొట్టి", "hindi": "टब", "tamil": "தொட்டி"}, "A wide container for water", ["Bath in the tub.", "The tub is big."], "household", "noun", 1),
    ("Fur", {"telugu": "బొచ్చు", "hindi": "फर", "tamil": "உரோமம்"}, "Soft thick hair of an animal", ["The cat has soft fur.", "Fur keeps animals warm."], "animals", "noun", 1),
    ("Den", {"telugu": "గుహ", "hindi": "मांद", "tamil": "குகை"}, "A wild animal's home", ["The bear lives in a den.", "A fox's den."], "animals", "noun", 1),
    ("Sip", {"telugu": "తాగు", "hindi": "घूंट", "tamil": "சிறிது குடி"}, "To drink a small amount", ["Sip the hot tea.", "Take a sip of water."], "actions", "verb", 1),
    ("Hum", {"telugu": "గుణగుణ", "hindi": "गुनगुनाना", "tamil": "முணுமுணு"}, "To make a singing sound with lips closed", ["She hums a song.", "I hum while walking."], "actions", "verb", 1),
    ("Rub", {"telugu": "రుద్దు", "hindi": "रगड़ना", "tamil": "தேய்"}, "To move your hand back and forth", ["Rub your hands together.", "Rub the stain."], "actions", "verb", 1),
    ("Slim", {"telugu": "సన్నగా", "hindi": "पतला", "tamil": "மெலிந்த"}, "Thin in an attractive way", ["She is slim.", "A slim book."], "adjectives", "adjective", 1),
    ("Dull", {"telugu": "మొద్దు", "hindi": "सुस्त", "tamil": "மந்தமான"}, "Not bright or sharp", ["A dull knife.", "The color is dull."], "adjectives", "adjective", 1),
    ("Tiny", {"telugu": "చిన్న", "hindi": "छोटा", "tamil": "சிறிய"}, "Very small", ["A tiny ant.", "Tiny flowers."], "adjectives", "adjective", 1),
    ("Huge", {"telugu": "భారీ", "hindi": "विशाल", "tamil": "மிகப்பெரிய"}, "Very very big", ["A huge elephant.", "The tree is huge."], "adjectives", "adjective", 1),
    ("Cool", {"telugu": "చల్లని", "hindi": "ठंडा", "tamil": "குளிர்"}, "A little cold", ["The water is cool.", "A cool breeze."], "adjectives", "adjective", 1),
    ("Warm", {"telugu": "వెచ్చని", "hindi": "गरम", "tamil": "சூடான"}, "A little hot", ["A warm blanket.", "The sun is warm."], "adjectives", "adjective", 1),
    ("Fork", {"telugu": "ఫోర్క్", "hindi": "कांटा", "tamil": "முள்கரண்டி"}, "A tool with prongs for eating", ["Eat with a fork.", "The fork is silver."], "household", "noun", 1),
    ("Spoon", {"telugu": "చెంచా", "hindi": "चम्मच", "tamil": "கரண்டி"}, "A tool for eating soup or rice", ["Use a spoon.", "The spoon is clean."], "household", "noun", 1),
    ("Plate", {"telugu": "ప్లేట్", "hindi": "प्लेट", "tamil": "தட்டு"}, "A flat dish for food", ["Put food on the plate.", "A white plate."], "household", "noun", 1),
    ("Bowl", {"telugu": "గిన్నె", "hindi": "कटोरा", "tamil": "கிண்ணம்"}, "A round dish for soup or cereal", ["Eat soup in a bowl.", "A big bowl."], "household", "noun", 1),
    ("Path", {"telugu": "దారి", "hindi": "रास्ता", "tamil": "பாதை"}, "A track or way to walk", ["Walk on the path.", "A garden path."], "places", "noun", 1),
    ("Gate", {"telugu": "గేటు", "hindi": "गेट", "tamil": "வாயில்"}, "A door in a fence or wall", ["Open the gate.", "The gate is red."], "places", "noun", 1),
    ("Roof", {"telugu": "పైకప్పు", "hindi": "छत", "tamil": "கூரை"}, "The top covering of a building", ["The roof is brown.", "Rain falls on the roof."], "places", "noun", 1),
    ("Step", {"telugu": "మెట్టు", "hindi": "सीढ़ी", "tamil": "படி"}, "A place for the foot when going up", ["Step by step.", "Climb the steps."], "places", "noun", 1),
    ("Wave", {"telugu": "అల", "hindi": "लहर", "tamil": "அலை"}, "A moving curve of water", ["The wave is big.", "Waves crash on the shore."], "nature", "noun", 1),
    ("Cloud", {"telugu": "మేఘం", "hindi": "बादल", "tamil": "மேகம்"}, "White or grey mass in the sky", ["The cloud is fluffy.", "Dark clouds bring rain."], "nature", "noun", 1),
]

# More 2nd-3rd words
extra_2nd = [
    ("Glimpse", {"telugu": "ఒక చూపు", "hindi": "झलक", "tamil": "ஒரு பார்வை"}, "A quick look at something", ["I caught a glimpse of the bird.", "A glimpse of the moon."], "actions", "noun", 2),
    ("Vanish", {"telugu": "అదృశ్యమగు", "hindi": "गायब होना", "tamil": "மறை"}, "To disappear suddenly", ["The rabbit vanished.", "The fog will vanish."], "actions", "verb", 2),
    ("Tremble", {"telugu": "వణుకు", "hindi": "कांपना", "tamil": "நடுங்கு"}, "To shake slightly from cold or fear", ["My hands tremble in cold.", "The leaves tremble."], "actions", "verb", 2),
    ("Whisper", {"telugu": "గుసగుస", "hindi": "फुसफुसाना", "tamil": "கிசுகிசு"}, "To speak very softly", ["She whispered a secret.", "Whisper in my ear."], "actions", "verb", 2),
    ("Wander", {"telugu": "తిరుగు", "hindi": "भटकना", "tamil": "அலை"}, "To move around without a purpose", ["The dog wandered the streets.", "I like to wander in the garden."], "actions", "verb", 2),
    ("Admire", {"telugu": "మెచ్చు", "hindi": "प्रशंसा करना", "tamil": "பாராட்டு"}, "To look at with pleasure and respect", ["I admire my teacher.", "We admire the painting."], "actions", "verb", 2),
    ("Custom", {"telugu": "ఆచారం", "hindi": "रिवाज़", "tamil": "பழக்கம்"}, "A traditional practice", ["It is a local custom.", "Follow the customs."], "culture", "noun", 2),
    ("Legend", {"telugu": "ఐతిహ్యం", "hindi": "दंतकथा", "tamil": "புராணக்கதை"}, "An old story passed down", ["The legend of the king.", "A famous legend."], "culture", "noun", 2),
    ("Courage", {"telugu": "ధైర్యం", "hindi": "हिम्मत", "tamil": "தைரியம்"}, "Bravery in the face of danger", ["Show courage.", "It takes courage to speak up."], "character", "noun", 2),
    ("Scarlet", {"telugu": "ఎర్రని", "hindi": "लाल", "tamil": "கருஞ்சிவப்பு"}, "A bright red color", ["A scarlet flower.", "The sky turned scarlet at sunset."], "colors", "adjective", 2),
    ("Crimson", {"telugu": "ముదురు ఎరుపు", "hindi": "गहरा लाल", "tamil": "செந்நிறம்"}, "A deep dark red color", ["Crimson roses.", "The crimson sunset."], "colors", "adjective", 2),
    ("Azure", {"telugu": "ఆకాశ నీలం", "hindi": "आसमानी", "tamil": "நீலம்"}, "A bright blue color like the sky", ["The azure sky.", "Azure waters of the sea."], "colors", "adjective", 2),
    ("Emerald", {"telugu": "పచ్చ", "hindi": "पन्ना", "tamil": "மரகதம்"}, "A bright green color", ["Emerald green forests.", "An emerald ring."], "colors", "noun", 2),
    ("Ivory", {"telugu": "దంతపు రంగు", "hindi": "हाथीदांत", "tamil": "தந்தம்"}, "A creamy white color", ["An ivory dress.", "Ivory white walls."], "colors", "noun", 2),
    ("Canyon", {"telugu": "లోయ", "hindi": "खड्ड", "tamil": "பள்ளத்தாக்கு"}, "A deep valley with steep sides", ["The Grand Canyon is amazing.", "We hiked in the canyon."], "geography", "noun", 2),
    ("Plateau", {"telugu": "పీఠభూమి", "hindi": "पठार", "tamil": "பீடபூமி"}, "A flat area of high land", ["The Deccan Plateau.", "A plateau is flat on top."], "geography", "noun", 2),
    ("Oasis", {"telugu": "ఒయాసిస్", "hindi": "मरुद्यान", "tamil": "சோலை"}, "A green area in a desert", ["They found an oasis.", "The oasis has water."], "geography", "noun", 2),
    ("Anchor", {"telugu": "లంగరు", "hindi": "लंगर", "tamil": "நங்கூரம்"}, "A heavy object that keeps a ship in place", ["Drop the anchor.", "The ship has an anchor."], "objects", "noun", 2),
    ("Trophy", {"telugu": "ట్రోఫీ", "hindi": "ट्रॉफी", "tamil": "கோப்பை"}, "A prize for winning", ["She won a trophy.", "The golden trophy."], "objects", "noun", 2),
    ("Wreath", {"telugu": "పుష్పగుచ్ఛం", "hindi": "माला", "tamil": "மாலை"}, "A ring of flowers or leaves", ["A beautiful wreath.", "Hang the wreath on the door."], "objects", "noun", 2),
]

# More 4th-5th words
extra_4th = [
    ("Archaeology", {"telugu": "పురాతత్వశాస్త్రం", "hindi": "पुरातत्व", "tamil": "தொல்பொருளியல்"}, "Study of ancient people and places", ["Archaeology reveals the past.", "He studies archaeology."], "science", "noun", 3),
    ("Biodegradable", {"telugu": "జీవ విచ్ఛిన్నమయ్యే", "hindi": "जैव अपघटनीय", "tamil": "மக்கக்கூடிய"}, "Can be broken down naturally", ["Use biodegradable bags.", "Paper is biodegradable."], "environment", "adjective", 3),
    ("Condensation", {"telugu": "ఘనీభవనం", "hindi": "संघनन", "tamil": "ஒடுக்கம்"}, "When gas changes to liquid", ["Condensation forms dew.", "See condensation on the glass."], "science", "noun", 3),
    ("Diameter", {"telugu": "వ్యాసం", "hindi": "व्यास", "tamil": "விட்டம்"}, "The distance across a circle through the center", ["Measure the diameter.", "The diameter is 10 cm."], "math", "noun", 3),
    ("Equator", {"telugu": "భూమధ్యరేఖ", "hindi": "भूमध्य रेखा", "tamil": "நிலநடுக்கோடு"}, "An imaginary line around the middle of Earth", ["The equator divides Earth.", "It is hot near the equator."], "geography", "noun", 3),
    ("Fraction", {"telugu": "భిన్నం", "hindi": "भिन्न", "tamil": "பின்னம்"}, "A part of a whole number", ["Half is a fraction.", "Learn fractions in math."], "math", "noun", 3),
    ("Geometry", {"telugu": "రేఖాగణితం", "hindi": "ज्यामिति", "tamil": "வடிவியல்"}, "Math about shapes and sizes", ["Geometry is interesting.", "I study geometry."], "math", "noun", 3),
    ("Hemisphere", {"telugu": "అర్ధగోళం", "hindi": "गोलार्ध", "tamil": "அரைக்கோளம்"}, "Half of the Earth or a sphere", ["India is in the northern hemisphere.", "The hemisphere above the equator."], "geography", "noun", 3),
    ("Invertebrate", {"telugu": "అకశేరుకం", "hindi": "अकशेरुकी", "tamil": "முதுகெலும்பில்லாத"}, "An animal without a backbone", ["Insects are invertebrates.", "Worms are invertebrates."], "animals", "noun", 3),
    ("Photovoltaic", {"telugu": "సౌర విద్యుత్", "hindi": "सौर विद्युत", "tamil": "ஒளிமின்"}, "Converting light into electricity", ["Solar panels are photovoltaic.", "Photovoltaic energy is clean."], "technology", "adjective", 3),
    ("Metamorphosis", {"telugu": "రూపాంతరం", "hindi": "कायापलट", "tamil": "உருமாற்றம்"}, "A major change in form", ["A butterfly goes through metamorphosis.", "Frogs undergo metamorphosis."], "science", "noun", 3),
    ("Legislature", {"telugu": "శాసనసభ", "hindi": "विधायिका", "tamil": "சட்டமன்றம்"}, "The group that makes laws", ["The legislature passed a new law.", "Parliament is the legislature."], "government", "noun", 3),
    ("Agriculture", {"telugu": "వ్యవసాయం", "hindi": "कृषि", "tamil": "வேளாண்மை"}, "Farming and growing crops", ["Agriculture feeds the world.", "India depends on agriculture."], "agriculture", "noun", 3),
    ("Irrigation", {"telugu": "నీటిపారుదల", "hindi": "सिंचाई", "tamil": "நீர்ப்பாசனம்"}, "Supplying water to land for crops", ["Irrigation helps crops grow.", "Canals are used for irrigation."], "agriculture", "noun", 3),
    ("Petroleum", {"telugu": "పెట్రోలియం", "hindi": "पेट्रोलियम", "tamil": "பெட்ரோலியம்"}, "Oil found underground used for fuel", ["Petroleum is a fossil fuel.", "Cars use petroleum."], "science", "noun", 3),
]

# More 5th-advanced words
extra_5th = [
    ("Amalgamation", {"telugu": "సమ్మేళనం", "hindi": "विलय", "tamil": "இணைப்பு"}, "Combining different things into one", ["An amalgamation of cultures.", "The company merger was an amalgamation."], "concepts", "noun", 4),
    ("Benevolent", {"telugu": "దయగల", "hindi": "परोपकारी", "tamil": "அருள்மிக்க"}, "Kind and generous", ["A benevolent leader.", "Her benevolent nature."], "character", "adjective", 4),
    ("Catastrophe", {"telugu": "విపత్తు", "hindi": "तबाही", "tamil": "பேரழிவு"}, "A sudden great disaster", ["The earthquake was a catastrophe.", "Prevent catastrophe."], "concepts", "noun", 4),
    ("Diligent", {"telugu": "శ్రద్ధగల", "hindi": "मेहनती", "tamil": "விடாமுயற்சியுள்ள"}, "Working carefully and steadily", ["A diligent student.", "Be diligent in your work."], "character", "adjective", 4),
    ("Eloquent", {"telugu": "వాక్పటిమ", "hindi": "वाक्पटु", "tamil": "சொல்வன்மையுள்ள"}, "Expressing ideas clearly and powerfully", ["An eloquent speaker.", "Her speech was eloquent."], "language", "adjective", 4),
    ("Formidable", {"telugu": "భయంకరమైన", "hindi": "दुर्जेय", "tamil": "வலிமையான"}, "Inspiring fear or respect", ["A formidable opponent.", "The challenge is formidable."], "adjectives", "adjective", 4),
    ("Gregarious", {"telugu": "సాంఘిక", "hindi": "मिलनसार", "tamil": "கூட்டமான"}, "Fond of company and socializing", ["She is gregarious.", "A gregarious person."], "character", "adjective", 4),
    ("Harmonious", {"telugu": "సామరస్యపూర్వక", "hindi": "सामंजस्यपूर्ण", "tamil": "இணக்கமான"}, "In agreement, peaceful", ["A harmonious relationship.", "The music is harmonious."], "adjectives", "adjective", 4),
    ("Impeccable", {"telugu": "నిర్దోషమైన", "hindi": "निर्दोष", "tamil": "குற்றமற்ற"}, "Perfect, without any flaw", ["Her manners are impeccable.", "Impeccable work."], "adjectives", "adjective", 4),
    ("Jurisprudence", {"telugu": "న్యాయశాస్త్రం", "hindi": "न्यायशास्त्र", "tamil": "சட்டவியல்"}, "The study of law and legal systems", ["She studies jurisprudence.", "Jurisprudence is complex."], "concepts", "noun", 4),
    ("Meticulous", {"telugu": "కూలంకషమైన", "hindi": "सावधानीपूर्वक", "tamil": "நுணுக்கமான"}, "Very careful and precise", ["A meticulous researcher.", "Be meticulous in your work."], "character", "adjective", 4),
    ("Nostalgia", {"telugu": "నాస్టాల్జియా", "hindi": "पुरानी यादें", "tamil": "நினைவுத் தாகம்"}, "A longing for the past", ["I feel nostalgia for my village.", "Nostalgia for school days."], "feelings", "noun", 4),
    ("Paradox", {"telugu": "విరుద్ధం", "hindi": "विरोधाभास", "tamil": "முரண்பாடு"}, "A statement that seems impossible but is true", ["Time travel creates a paradox.", "It is a paradox."], "concepts", "noun", 4),
    ("Quintessential", {"telugu": "సారాంశం", "hindi": "सर्वोत्कृष्ट", "tamil": "சாரமான"}, "The most typical example of something", ["A quintessential Indian dish.", "She is the quintessential leader."], "adjectives", "adjective", 4),
    ("Ubiquitous", {"telugu": "సర్వవ్యాప్తమైన", "hindi": "सर्वव्यापी", "tamil": "எங்கும் நிறைந்த"}, "Found everywhere", ["Mobile phones are ubiquitous.", "Technology is ubiquitous today."], "adjectives", "adjective", 4),
]

for word_data in extra_lkg:
    eng = word_data[0]
    if eng.lower() not in existing_words:
        new_words.append(make_word(f"lkg_{idx:03d}", eng, word_data[1], word_data[2], word_data[3], "lkg-1st", word_data[4], word_data[5], word_data[6]))
        existing_words.add(eng.lower())
        idx += 1

for word_data in extra_2nd:
    eng = word_data[0]
    if eng.lower() not in existing_words:
        new_words.append(make_word(f"2nd_{idx:03d}", eng, word_data[1], word_data[2], word_data[3], "2nd-3rd", word_data[4], word_data[5], word_data[6]))
        existing_words.add(eng.lower())
        idx += 1

for word_data in extra_4th:
    eng = word_data[0]
    if eng.lower() not in existing_words:
        new_words.append(make_word(f"4th_{idx:03d}", eng, word_data[1], word_data[2], word_data[3], "4th-5th", word_data[4], word_data[5], word_data[6]))
        existing_words.add(eng.lower())
        idx += 1

for word_data in extra_5th:
    eng = word_data[0]
    if eng.lower() not in existing_words:
        new_words.append(make_word(f"5th_{idx:03d}", eng, word_data[1], word_data[2], word_data[3], "5th-adv", word_data[4], word_data[5], word_data[6]))
        existing_words.add(eng.lower())
        idx += 1

print(f"New words added: {len(new_words)}")

all_words = existing + new_words
print(f"Total words: {len(all_words)}")

from collections import Counter
levels = Counter(w['level'] for w in all_words)
for k, v in sorted(levels.items()):
    print(f"  {k}: {v}")

with open('data/words_production.json', 'w', encoding='utf-8') as f:
    json.dump(all_words, f, ensure_ascii=False, indent=2)

print("Saved!")
