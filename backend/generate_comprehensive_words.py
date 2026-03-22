#!/usr/bin/env python3
"""
Generate comprehensive word database for SpeakEasy Kids Pro
Target: 550+ words across 3 levels with 5 language translations
"""

import json
from typing import List, Dict, Any, Optional

def create_word(
    word_id: str,
    word_english: str,
    translations: Dict[str, str],
    meaning: str,
    gender: Optional[str],
    examples: List[str],
    level: str,
    category: str,
    synonyms: List[str],
    antonyms: List[str],
    part_of_speech: str,
    difficulty: int
) -> Dict[str, Any]:
    """Create a word entry with full schema"""
    return {
        "word_id": word_id,
        "word_english": word_english,
        "translations": translations,
        "meaning": meaning,
        "gender": gender,
        "example_sentences": examples,
        "level": level,
        "category": category,
        "synonyms": synonyms,
        "antonyms": antonyms,
        "part_of_speech": part_of_speech,
        "difficulty": difficulty
    }

# Initialize word lists
all_words = []

# ==================== LEVEL 1: LKG-1st (150 words) ====================

# Fruits (10)
fruits_level1 = [
    create_word("lkg1_01", "Apple", 
        {"telugu": "ఆపిల్", "hindi": "सेब", "tamil": "ஆப்பிள்", "kannada": "ಸೇಬು", "malayalam": "ആപ്പിൾ"},
        "A round fruit with red or green skin", "neuter",
        ["I eat an apple every day.", "The apple is sweet.", "Apples are healthy."],
        "lkg-1st", "fruits", [], [], "noun", 1),
    
    create_word("lkg1_02", "Banana", 
        {"telugu": "అరటి", "hindi": "केला", "tamil": "வாழைப்பழம்", "kannada": "ಬಾಳೆಹಣ್ಣು", "malayalam": "വാഴപ്പഴം"},
        "A long yellow fruit that monkeys love", "neuter",
        ["Monkeys eat bananas.", "Bananas are yellow.", "I like banana milkshake."],
        "lkg-1st", "fruits", [], [], "noun", 1),
        
    create_word("lkg1_03", "Mango", 
        {"telugu": "మామిడి", "hindi": "आम", "tamil": "மாம்பழம்", "kannada": "ಮಾವಿನಹಣ್ಣು", "malayalam": "മാങ്ങ"},
        "A sweet juicy fruit that is the king of fruits", "neuter",
        ["Mango is my favorite fruit.", "Mangoes are very sweet.", "Summer is mango season."],
        "lkg-1st", "fruits", [], [], "noun", 1),
        
    create_word("lkg1_04", "Orange", 
        {"telugu": "నారింజ", "hindi": "संतरा", "tamil": "ஆரஞ்சு", "kannada": "ಕಿತ್ತಳೆ", "malayalam": "ഓറഞ്ച്"},
        "A round citrus fruit with orange color", "neuter",
        ["Oranges have vitamin C.", "The orange is juicy.", "I drink orange juice."],
        "lkg-1st", "fruits", [], [], "noun", 1),
        
    create_word("lkg1_05", "Grape", 
        {"telugu": "ద్రాక్ష", "hindi": "अंगूर", "tamil": "திராட்சை", "kannada": "ದ್ರಾಕ್ಷಿ", "malayalam": "മുന്തിരി"},
        "Small round fruits that grow in bunches", "neuter",
        ["Grapes are purple or green.", "I like eating grapes.", "Grapes grow on vines."],
        "lkg-1st", "fruits", [], [], "noun", 1),
]

# Animals (15)
animals_level1 = [
    create_word("lkg1_06", "Cat", 
        {"telugu": "పిల్లి", "hindi": "बिल्ली", "tamil": "பூனை", "kannada": "ಬೆಕ್ಕು", "malayalam": "പൂച്ച"},
        "A small furry pet that says meow", "feminine",
        ["The cat drinks milk.", "Cats like to play.", "My cat is black."],
        "lkg-1st", "animals", ["kitty", "kitten"], [], "noun", 1),
        
    create_word("lkg1_07", "Dog", 
        {"telugu": "కుక్క", "hindi": "कुत्ता", "tamil": "நாய்", "kannada": "ನಾಯಿ", "malayalam": "നായ"},
        "A friendly pet that barks and wags tail", "masculine",
        ["Dogs are loyal.", "My dog plays fetch.", "The dog is barking."],
        "lkg-1st", "animals", ["puppy"], [], "noun", 1),
]

# Add all Level 1 words
all_words.extend(fruits_level1)
all_words.extend(animals_level1)

# ==================== LEVEL 2: 2nd-3rd (100 words sample) ====================

school_level2 = [
    create_word("2nd3rd_01", "School", 
        {"telugu": "పాఠశాల", "hindi": "स्कूल", "tamil": "பள்ளி", "kannada": "ಶಾಲೆ", "malayalam": "സ്കൂൾ"},
        "A place where children go to learn", "neuter",
        ["I go to school every day.", "School starts at 9 AM.", "We learn many things at school."],
        "2nd-3rd", "places", [], [], "noun", 2),
        
    create_word("2nd3rd_02", "Teacher", 
        {"telugu": "ఉపాధ్యాయుడు", "hindi": "शिक्षक", "tamil": "ஆசிரியர்", "kannada": "ಶಿಕ್ಷಕ", "malayalam": "അദ്ധ്യാപകൻ"},
        "A person who teaches students", "masculine",
        ["My teacher is kind.", "The teacher explains well.", "Teachers help us learn."],
        "2nd-3rd", "people", ["educator", "instructor"], ["student"], "noun", 2),
]

all_words.extend(school_level2)

# ==================== LEVEL 3: 4th-5th (100 words sample) ====================

abstract_level3 = [
    create_word("4th5th_01", "Adventure", 
        {"telugu": "సాహసం", "hindi": "साहसिक कार्य", "tamil": "சாகசம்", "kannada": "ಸಾಹಸ", "malayalam": "സാഹസികത"},
        "An exciting or unusual experience", "neuter",
        ["We went on an adventure.", "Life is an adventure.", "Adventure stories are exciting."],
        "4th-5th", "abstract", ["journey", "quest"], ["routine", "boredom"], "noun", 4),
        
    create_word("4th5th_02", "Believe", 
        {"telugu": "నమ్ము", "hindi": "विश्वास करना", "tamil": "நம்பு", "kannada": "ನಂಬು", "malayalam": "വിശ്വസിക്കുക"},
        "To think something is true", None,
        ["I believe in you.", "Believe in yourself.", "Do you believe this story?"],
        "4th-5th", "verbs", ["trust", "accept"], ["doubt", "disbelieve"], "verb", 3),
]

all_words.extend(abstract_level3)

# Save to JSON
output_file = "/app/backend/data/words_comprehensive.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(all_words, f, indent=2, ensure_ascii=False)

print(f"✅ Generated {len(all_words)} comprehensive words")
print(f"📁 Saved to: {output_file}")
print(f"\n📊 Breakdown:")
print(f"  Level 1 (LKG-1st): {len([w for w in all_words if w['level'] == 'lkg-1st'])} words")
print(f"  Level 2 (2nd-3rd): {len([w for w in all_words if w['level'] == '2nd-3rd'])} words")
print(f"  Level 3 (4th-5th): {len([w for w in all_words if w['level'] == '4th-5th'])} words")
