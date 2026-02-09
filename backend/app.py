from flask import Flask, request, jsonify
from flask_cors import CORS
from ds_modules.hash_map import HashMap
from ds_modules.trie import Trie
from ds_modules.linked_list import DoublyLinkedList
from ds_modules.heap import MaxHeap
from ds_modules.graph import Graph
from ds_modules.stack import Stack
import datetime
import requests

# Additional Resources (HashMap for Links)
exercise_video_map = {
    # Strength - Upper Body
    "Pushups": "https://www.youtube.com/watch?v=IODxDxX7oi4",
    "Pullups": "https://www.youtube.com/watch?v=eGo4IYlbE5g",
    "Bench Press": "https://www.youtube.com/watch?v=vcBig73ojpE",
    "Incline Bench Press": "https://www.youtube.com/watch?v=8iP6H_f_0Sg",
    "Dumbbell Press": "https://www.youtube.com/watch?v=VmB1G1K7v94",
    "Shoulder Press": "https://www.youtube.com/watch?v=qEwKCR5JCog",
    "Overhead Press": "https://www.youtube.com/watch?v=_RlRD5S1678",
    "Bicep Curls": "https://www.youtube.com/watch?v=ykJmrZ5v0BA",
    "Hammer Curls": "https://www.youtube.com/watch?v=7jqi2qWAUzE",
    "Tricep Dips": "https://www.youtube.com/watch?v=6kALZikcZdU",
    "Skull Crushers": "https://www.youtube.com/watch?v=d_KQCf7D0zQ",
    "Lat Pulldown": "https://www.youtube.com/watch?v=CAwf7n6Luuc",
    "Barbell Rows": "https://www.youtube.com/watch?v=9efgcAjQW7E",
    "Dumbbell Rows": "https://www.youtube.com/watch?v=5PoEksoJNaw",
    "Face Pulls": "https://www.youtube.com/watch?v=rep-qVOkqgk",
    "Side Laterals": "https://www.youtube.com/watch?v=3VcKaXpzqRo",
    "Front Raises": "https://www.youtube.com/watch?v=hRJ6EB_78mU",
    "Shrugs": "https://www.youtube.com/watch?v=7T6He1p0sYI",
    
    # Strength - Lower Body
    "Squats": "https://www.youtube.com/watch?v=gcNh17Ckjgg",
    "Deadlift": "https://www.youtube.com/watch?v=XQhV-6-C7vE",
    "Sumo Deadlift": "https://www.youtube.com/watch?v=p23S_I9F8p8",
    "Romanian Deadlift": "https://www.youtube.com/watch?v=2SHsk9A_O8A",
    "Bulgarian Split Squat": "https://www.youtube.com/watch?v=2C-uNgKwPLE",
    "Goblet Squat": "https://www.youtube.com/watch?v=MeIiIdbaat4",
    "Zercher Squat": "https://www.youtube.com/watch?v=U2OKpZ5Im28",
    "Lunges": "https://www.youtube.com/watch?v=QOVaHwm-Q6U",
    "Leg Press": "https://www.youtube.com/watch?v=CHX-j_uUey0",
    "Leg Extensions": "https://www.youtube.com/watch?v=m0FOpMEgero",
    "Leg Curls": "https://www.youtube.com/watch?v=n5mB8xInJFM",
    "Calf Raises": "https://www.youtube.com/watch?v=-M4-G8p8fmc",
    "Hip Thrusts": "https://www.youtube.com/watch?v=LM8LGne_K28",
    "Glute Bridges": "https://www.youtube.com/watch?v=9_pX2fR3hS0",
    "Step Ups": "https://www.youtube.com/watch?v=dQqApCGd5Ss",
    
    # Core
    "Plank": "https://www.youtube.com/watch?v=ASdvN_XEl_c",
    "Russian Twists": "https://www.youtube.com/watch?v=1fGCPW1Yx-s",
    "Leg Raises": "https://www.youtube.com/watch?v=JB2oyawG9KI",
    "Hanging Leg Raises": "https://www.youtube.com/watch?v=LpUv3Tj9iKM",
    "Crunches": "https://www.youtube.com/watch?v=Xyd_fa5zoEU",
    "Flutter Kicks": "https://www.youtube.com/watch?v=ANVvpxXdgN4",
    "Superman": "https://www.youtube.com/watch?v=z6PJMT2y8GQ",
    "Bird Dog": "https://www.youtube.com/watch?v=wiFNA3sqjCA",
    "Situps": "https://www.youtube.com/watch?v=jDwoBqPH0yk",
    "Abs": "https://www.youtube.com/watch?v=1fGCPW1Yx-s",
    "Dead Bug": "https://www.youtube.com/watch?v=rbmAt-FAnV4",
    "Windshield Wipers": "https://www.youtube.com/watch?v=fXvQnRE0UuI",
    
    # Cardio & High Intensity
    "Running": "https://www.youtube.com/watch?v=_kGESn8Ipma",
    "Cycling": "https://www.youtube.com/watch?v=rUj2pP_V24A",
    "Swimming": "https://www.youtube.com/watch?v=pFnifeT_T_Y",
    "Burpees": "https://www.youtube.com/watch?v=qLBImHhCXSw",
    "Jumping Jacks": "https://www.youtube.com/watch?v=nGaXj3kkmrU",
    "Mountain Climbers": "https://www.youtube.com/watch?v=cnyTQDSE884",
    "Box Jumps": "https://www.youtube.com/watch?v=52r_Ul5k03g",
    "Rowing": "https://www.youtube.com/watch?v=H0ID_v1_S8M",
    "Zumba": "https://www.youtube.com/watch?v=Vf8zD-8Xy-M",
    "Skipping Rope": "https://www.youtube.com/watch?v=u3zgHI8QnqE",
    "Tabata": "https://www.youtube.com/watch?v=Xyd_fa5zoEU",
    "HIIT": "https://www.youtube.com/watch?v=ml6cT4AZdqI",
    "Battle Ropes": "https://www.youtube.com/watch?v=fV82cR6W-eY",
    "Arnold Press": "https://www.youtube.com/watch?v=6Z15_Wdxxhw",
    "Turkish Get Up": "https://www.youtube.com/watch?v=0bT_idY6B6A",
    "Preacher Curls": "https://www.youtube.com/watch?v=fIWP-E_TshA",
    "Concentration Curls": "https://www.youtube.com/watch?v=JvjKuAnZ94E",
    "Cable Flys": "https://www.youtube.com/watch?v=fA4h0_v8SxA",
    "Farmers Walk": "https://www.youtube.com/watch?v=rtP-I6Zq_n8",
    "Sled Push": "https://www.youtube.com/watch?v=2rE5L2YvX_s",
    "Pistol Squats": "https://www.youtube.com/watch?v=gnf_yS75PXI",
    "Muscle Ups": "https://www.youtube.com/watch?v=mRzx9XGvWpg",
    
    # Flexibility & Mind-Body
    "Yoga": "https://www.youtube.com/watch?v=v7AYKMP6rOE",
    "Pilates": "https://www.youtube.com/watch?v=K-PpDmiJ_wA",
    "Tai Chi": "https://www.youtube.com/watch?v=vHBR5MZmEsY",
    "Meditation": "https://www.youtube.com/watch?v=inpok4MKVLM",
    "Stretching": "https://www.youtube.com/watch?v=mGmzP7AtK-4",
    
    "Boxing": "https://www.youtube.com/watch?v=ca69Ba6Dqis",
    "Karate": "https://www.youtube.com/watch?v=s2pP6g6A6pE",
    "Cricket": "https://www.youtube.com/watch?v=Yf_t0-jXp8Q",
    "Football": "https://www.youtube.com/watch?v=HGmZiaGue_0",
    "Basketball": "https://www.youtube.com/watch?v=T6fEwT9vUqc",
    "Volleyball": "https://www.youtube.com/watch?v=rUj2pP_V24A",
    "Tennis": "https://www.youtube.com/watch?v=EDpW_kZp_x0",
    "Table Tennis": "https://www.youtube.com/watch?v=rXIn9_T5D5c",
    "Badminton": "https://www.youtube.com/watch?v=S2-G_Wz-yYY",
    "Golf": "https://www.youtube.com/watch?v=Gv5M_mP_e4g",
    "Bowling": "https://www.youtube.com/watch?v=v-Ysh2uW0iE",
    "Surfing": "https://www.youtube.com/watch?v=7uN_iX0v0v8",
    "Rock Climbing": "https://www.youtube.com/watch?v=u6_Uf5I-Oyo",
    "Hiking": "https://www.youtube.com/watch?v=zYVbS_R8h7U",
    "Baseball": "https://www.youtube.com/watch?v=0tW9_tq_T8k",
    "Hockey": "https://www.youtube.com/watch?v=H7Z8WpS_A_I",
    "Rugby": "https://www.youtube.com/watch?v=pFnifeT_T_Y",
    "American Football": "https://www.youtube.com/watch?v=HGmZiaGue_0",
    "Wrestling": "https://www.youtube.com/watch?v=gcNh17Ckjgg",
    "Judo": "https://www.youtube.com/watch?v=vcBig73ojpE",
    "Lower Body": "https://www.youtube.com/watch?v=X038uRreXmU",
    "Full Body": "https://www.youtube.com/watch?v=ml6cT4AZdqI",
    "Kettlebell Swing": "https://www.youtube.com/watch?v=YE9L77B_u8U",
    "Kettlebell Snatch": "https://www.youtube.com/watch?v=liYAnY9Oey0",
    "Kettlebell Clean": "https://www.youtube.com/watch?v=AF9i3k616wI",
    "Sun Salutation": "https://www.youtube.com/watch?v=IsXGf9_B5vI",
    "Warrior Pose": "https://www.youtube.com/watch?v=v7AYKMP6rOE",
    "Downward Dog": "https://www.youtube.com/watch?v=v7AYKMP6rOE",
    "Shadow Boxing": "https://www.youtube.com/watch?v=ca69Ba6Dqis",
    "Forearms": "https://www.youtube.com/watch?v=ykJmrZ5v0BA",
    "Neck Exercise": "https://www.youtube.com/watch?v=EqH6K-R_O-8"
}

# In-Memory Persistence
nutrition_log = [
    { "name": 'Oats with Milk', "cals": 350, "p": 12, "c": 45, "f": 8 },
    { "name": 'Grilled Chicken', "cals": 280, "p": 40, "c": 0, "f": 5 }
]

# User Profile Storage (Default for demonstration)
current_user_profile = {
    "name": "",
    "height": 170, # cm
    "weight": 70,  # kg
    "age": 25,
    "gender": "Female",
    "goal": "Maintain", # Lose, Gain, Maintain
    "activity_level": 1.2 # Baseline
}

app = Flask(__name__)
CORS(app)

# --- 1. Data Structure Initialization (In-Memory Database) ---
users_db = HashMap(capacity=100)       # Auth
exercise_trie = Trie()                 # Search
food_trie = Trie()                     # Search
workout_history = DoublyLinkedList()   # History
reminder_heap = MaxHeap()              # Priority Reminders
recommendation_graph = Graph()         # AI Coach
action_stack = Stack()                 # Undo

# --- Seed Data for Trie (Extremely Expanded) ---
exercises = [
    # --- STRENGTH: CHEST ---
    "Pushups", "Bench Press", "Incline Bench Press", "Decline Bench Press", "Dumbbell Press", 
    "Incline Dumbbell Press", "Decline Dumbbell Press", "Chest Flys", "Cable Flys", "Pec Deck", 
    "Dips", "Chest Press Machine", "Svend Press", "Landmine Press", "Plyometric Pushups", 
    "Weighted Pushups", "Archer Pushups", "Diamond Pushups", "Wide Grip Pushups", "Guillotine Press",
    
    # --- STRENGTH: BACK ---
    "Pullups", "Chin-ups", "Lat Pulldown", "Deadlift", "Barbell Rows", "Dumbbell Rows", 
    "T-Bar Rows", "Seated Cable Rows", "Face Pulls", "Lat Pullovers", "Single Arm Rows", 
    "Meadows Row", "Pendlay Row", "Rack Pulls", "Good Mornings", "Back Extensions", 
    "Hyperextensions", "Superman", "Renegade Rows", "Inverted Rows", "Shrugs", "Kelso Shrugs",
    
    # --- STRENGTH: LEGS (QUADS/HAMSTRINGS/GLUTES) ---
    "Squats", "Front Squats", "Goblet Squats", "Bulgarian Split Squats", "Lunges", 
    "Walking Lunges", "Reverse Lunges", "Side Lunges", "Step Ups", "Leg Press", 
    "Leg Extensions", "Leg Curls", "Seated Leg Curls", "Lying Leg Curls", "Romanian Deadlift", 
    "Stiff Leg Deadlift", "Sumo Deadlift", "Glute Bridges", "Hip Thrusts", "Calf Raises", 
    "Seated Calf Raises", "Donkey Calf Raises", "Hack Squats", "Sissy Squats", "Box Squats", 
    "Jump Squats", "Pistol Squats", "Cosack Squats", "Nordic Hamstring Curls", "Glute Kickbacks", 
    "Cable Pull Throughs", "Abductor Machine", "Adductor Machine", "Wall Sit",
    
    # --- STRENGTH: SHOULDERS ---
    "Overhead Press", "Military Press", "Arnold Press", "Dumbbell Shoulder Press", 
    "Side Lateral Raises", "Front Raises", "Rear Delt Flys", "Upright Rows", "Face Pulls", 
    "Egyptian Lateral Raises", "Cable Lateral Raises", "Reverse Pec Deck", "Handstand Pushups", 
    "Pike Pushups", "Z Press", "Bradford Press", "Lu Raises", "Around the Worlds",
    
    # --- STRENGTH: ARMS (BICEPS/TRICEPS) ---
    "Bicep Curls", "Hammer Curls", "Preacher Curls", "Concentration Curls", "Cable Curls", 
    "Spider Curls", "Zottman Curls", "Incline Dumbbell Curls", "Bayesian Curls", "Reverse Curls", 
    "Tricep Dips", "Skull Crushers", "Tricep Pushdowns", "Overhead Tricep Extensions", 
    "Close Grip Bench Press", "Kickbacks", "Diamond Pushups", "French Press", "JM Press", "Tate Press",
    
    # --- CORE / ABS ---
    "Plank", "Side Plank", "Crunches", "Situps", "Leg Raises", "Hanging Leg Raises", 
    "Russian Twists", "Bicycle Curls", "Mountain Climbers", "Flutter Kicks", "Scissor Kicks", 
    "V-Ups", "Hollow Body Hold", "Dead Bug", "Ab Wheel Rollout", "Toes to Bar", "L-Sit", 
    "Dragon Flags", "Windshield Wipers", "Cable Woodchoppers", "Pallof Press", "Vaccuum",
    
    # --- CARDIO / HIIT ---
    "Running", "Sprinting", "Jogging", "Treadmill", "Cycling", "Spinning", "Elliptical", 
    "Rowing Machine", "Stair Master", "Jump Rope", "Skipping Rope", "Double Unders", 
    "Burpees", "Jumping Jacks", "High Knees", "Butt Kicks", "Box Jumps", "Battle Ropes", 
    "Sled Push", "Sled Pull", "Farmers Walk", "Bear Crawl", "Shadow Boxing", "Heavy Bag", 
    "Speed Bag", "Swimming", "Hiking", "Rucking", "Aerobics", "Zumba", "Dance Cardio",
    
    # --- FLEXIBILITY / MOBILITY / YOGA ---
    "Yoga", "Pilates", "Stretching", "Foam Rolling", "Sun Salutation", "Downward Dog", 
    "Upward Dog", "Childs Pose", "Warrior Pose", "Triangle Pose", "Tree Pose", "Pigeon Pose", 
    "Cobra Pose", "Cat Cow", "Bridge Pose", "Wheel Pose", "Crow Pose", "Headstand", 
    "Handstand", "Split Training", "Mobility Flow", "Animal Flow", "Tai Chi", "Qigong",
    
    # --- SPORTS & ACTIVITIES ---
    "Basketball", "Football", "Soccer", "Tennis", "Volleyball", "Badminton", "Cricket", 
    "Rugby", "Baseball", "Hockey", "Golf", "Boxing", "Kickboxing", "Muay Thai", "Judo", 
    "Wrestling", "Brazilian Jiu Jitsu", "Karate", "Taekwondo", "Kung Fu", "Capoeira", 
    "Surfing", "Skateboarding", "Snowboarding", "Skiing", "Ice Skating", "Rollerblading", 
    "Rock Climbing", "Bouldering", "Parkour", "Gymnastics", "Cheerleading", "Ballet", 
    "Salsa", "Ballroom Dance", "Hip Hop Dance", "Kayaking", "Canoeing", "Paddleboarding", 
    "Scuba Diving", "Snorkeling", "Frisbee", "Ultimate Frisbee", "Table Tennis", "Squash", 
    "Racquetball", "Fencing", "Archery", "Bowling", "Curling", "Lacrosse", "Water Polo",
    
    # --- CROSSFIT / FUNCTIONAL ---
    "Clean and Jerk", "Snatch", "Thrusters", "Wall Balls", "Kettlebell Swings", 
    "Kettlebell Snatch", "Kettlebell Clean", "Turkish Get Up", "Muscle Ups", "Ring Dips", 
    "Rope Climb", "Handstand Walk", "Tire Flip", "Sledgehammer Hits", "Sandbag Carries", 
    "Atlas Stones", "Yoke Carry", "Log Press", "Axle Press"
]

# --- Rich Food Database (Source of Truth) ---
food_database = {
    # Proteins (Non-Veg)
    "Chicken Breast": { "cals": 165, "p": 31, "c": 0, "f": 3.6, "benefits": "High lean protein for muscle repair", "control": "Prevents muscle loss" },
    "Grilled Chicken": { "cals": 220, "p": 35, "c": 0, "f": 8, "benefits": "Good source of protein", "control": "Supports metabolism" },
    "Salmon": { "cals": 208, "p": 20, "c": 0, "f": 13, "benefits": "Rich in Omega-3 fatty acids", "control": "Heart health, lowers inflammation" },
    "Tuna": { "cals": 132, "p": 28, "c": 0, "f": 1, "benefits": "Low calorie protein source", "control": "Supports heart health" },
    "Egg (Whole)": { "cals": 155, "p": 13, "c": 1.1, "f": 11, "benefits": "Complete protein profile", "control": "Eye health (Lutein)" },
    "Egg Whites": { "cals": 52, "p": 11, "c": 0.7, "f": 0.2, "benefits": "Pure protein, low fat", "control": "Cholesterol management" },
    "Fish Curry": { "cals": 320, "p": 25, "c": 8, "f": 20, "benefits": "Brain health boost", "control": "Reduces risk of stroke" },
    "Chicken Curry": { "cals": 350, "p": 28, "c": 12, "f": 22, "benefits": "Immunity boosting spices", "control": "Anti-inflammatory" },
    "Mutton Curry": { "cals": 450, "p": 30, "c": 10, "f": 32, "benefits": "High in Iron and B12", "control": "Prevents Anemia" },
    
    # Vegetarian / Vegan / Indian
    "Paneer (Cottage Cheese)": { "cals": 265, "p": 18, "c": 1.2, "f": 20, "benefits": "Rich in Calcium and Protein", "control": "Bone health" },
    "Lentils (Dal)": { "cals": 116, "p": 9, "c": 20, "f": 0.4, "benefits": "High fiber, stabilizes blood sugar", "control": "Diabetes management" },
    "Chickpeas (Chana)": { "cals": 164, "p": 9, "c": 27, "f": 2.6, "benefits": "Feeling full, digestive health", "control": "Weight management" },
    "Kidney Beans (Rajma)": { "cals": 127, "p": 9, "c": 23, "f": 0.5, "benefits": "Excellent source of fiber", "control": "Colon health" },
    "Sprouts (Moong)": { "cals": 30, "p": 3, "c": 6, "f": 0.2, "benefits": "Highly digestible protein", "control": "Detoxification" },
    "Tofu": { "cals": 76, "p": 8, "c": 1.9, "f": 4.8, "benefits": "Complete plant protein", "control": "Lowers cholesterol" },
    "Soya Chunks": { "cals": 345, "p": 52, "c": 33, "f": 0.5, "benefits": "Highest plant-based protein", "control": "Muscle growth" },
    "Greek Yogurt": { "cals": 59, "p": 10, "c": 3.6, "f": 0.4, "benefits": "Probiotics for gut health", "control": "Digestion support" },
    "Milk": { "cals": 42, "p": 3.4, "c": 5, "f": 1, "benefits": "Calcium and Vitamin D", "control": "Bone density" },
    
    # Carbs / grains
    "Rice (White)": { "cals": 130, "p": 2.7, "c": 28, "f": 0.3, "benefits": "Instant energy source", "control": "Digestive ease" },
    "Brown Rice": { "cals": 111, "p": 2.6, "c": 23, "f": 0.9, "benefits": "Whole grain goodness", "control": "Blood sugar regulation" },
    "Roti (Chapati)": { "cals": 120, "p": 3, "c": 18, "f": 3.7, "benefits": "Complex carbohydrates", "control": "Sustained energy" },
    "Oats": { "cals": 389, "p": 16.9, "c": 66, "f": 6.9, "benefits": "Beta-glucan fiber", "control": "Heart health" },
    "Quinoa": { "cals": 120, "p": 4.1, "c": 21, "f": 1.9, "benefits": "Gluten-free complete protein", "control": "Metabolic health" },
    "Bread (Whole Wheat)": { "cals": 247, "p": 13, "c": 41, "f": 3.4, "benefits": "Fiber rich", "control": "Digestive health" },
    "Dosa (Plain)": { "cals": 133, "p": 3, "c": 23, "f": 3, "benefits": "Fermented probiotic food", "control": "Gut health" },
    "Idli": { "cals": 39, "p": 2, "c": 8, "f": 0, "benefits": "Steamed and light", "control": "Weight loss friendly" },

    # Fruits & Veg
    "Apple": { "cals": 52, "p": 0.3, "c": 14, "f": 0.2, "benefits": "Vitamin C and Fiber", "control": "Immunity" },
    "Banana": { "cals": 89, "p": 1.1, "c": 22.8, "f": 0.3, "benefits": "Potassium rich", "control": "Blood pressure" },
    "Spinach": { "cals": 23, "p": 2.9, "c": 3.6, "f": 0.4, "benefits": "Iron and Vitamin K", "control": "Eye health" },
    "Broccoli": { "cals": 34, "p": 2.8, "c": 6.6, "f": 0.4, "benefits": "Sulforaphane antioxidant", "control": "Anti-cancer properties" },
    "Sweet Potato": { "cals": 86, "p": 1.6, "c": 20, "f": 0.1, "benefits": "Vitamin A powerhouse", "control": "Vision and skin" },
    "Almonds": { "cals": 579, "p": 21, "c": 22, "f": 49, "benefits": "Healthy fats and Vitamin E", "control": "Brain health" },
    
    # Fitness & Performance
    "Whey Protein Scoop": { "cals": 120, "p": 24, "c": 3, "f": 1, "benefits": "Rapid absorption protein", "control": "Post-workout recovery" },
    "Casein Protein": { "cals": 120, "p": 24, "c": 3, "f": 1, "benefits": "Slow-release protein", "control": "Overnight muscle repair" },
    "Creatine Monohydrate": { "cals": 0, "p": 0, "c": 0, "f": 0, "benefits": "Increases ATP availability", "control": "Strength & power output" },
    "Black Coffee": { "cals": 2, "p": 0, "c": 0, "f": 0, "benefits": "Caffeine for energy", "control": "Metabolism boost" },
    "Green Tea": { "cals": 2, "p": 0, "c": 0, "f": 0, "benefits": "High in antioxidants", "control": "Fat burning" },

    # More Proteins
    "Turkey Breast": { "cals": 135, "p": 30, "c": 0, "f": 1, "benefits": "Very lean protein", "control": "Weight loss" },
    "Shrimp": { "cals": 99, "p": 24, "c": 0.2, "f": 0.3, "benefits": "Low cal, high protein", "control": "Thyroid health (Iodine)" },
    "Cod": { "cals": 82, "p": 18, "c": 0, "f": 0.7, "benefits": "Lean white fish", "control": "Heart health" },
    "Lean Ground Beef": { "cals": 250, "p": 26, "c": 0, "f": 15, "benefits": "High Zinc and Iron", "control": "Hormonal health" },

    # Healthy Fats
    "Avocado": { "cals": 160, "p": 2, "c": 9, "f": 15, "benefits": "Monounsaturated fats", "control": "Heart health" },
    "Peanut Butter": { "cals": 190, "p": 8, "c": 6, "f": 16, "benefits": "Energy dense", "control": "Satiety" },
    "Walnuts": { "cals": 185, "p": 4, "c": 4, "f": 18, "benefits": "Omega-3 (ALA)", "control": "Brain health" },
    "Chia Seeds": { "cals": 138, "p": 5, "c": 12, "f": 9, "benefits": "Fiber and Omega-3", "control": "Digestion" },
    "Olive Oil (1tbsp)": { "cals": 119, "p": 0, "c": 0, "f": 14, "benefits": "Healthy fats", "control": "Anti-inflammatory" },

    # Complex Carbs & Veg
    "Black Beans": { "cals": 227, "p": 15, "c": 41, "f": 0.9, "benefits": "Fiber and protein combo", "control": "Blood sugar control" },
    "Pasta (Whole Wheat)": { "cals": 174, "p": 8, "c": 37, "f": 0.6, "benefits": "Steady energy", "control": "Digestive health" },
    "Blueberries": { "cals": 84, "p": 1, "c": 21, "f": 0.5, "benefits": "High antioxidants", "control": "Brain function" },
    "Strawberries": { "cals": 49, "p": 1, "c": 12, "f": 0.5, "benefits": "Vitamin C", "control": "Skin health" },
    "Orange": { "cals": 62, "p": 1.2, "c": 15, "f": 0.2, "benefits": "Vitamin C", "control": "Immunity" },
    "Watermelon": { "cals": 30, "p": 0.6, "c": 8, "f": 0.2, "benefits": "Hydration (92% water)", "control": "Muscle soreness" },
    "Cucumber": { "cals": 16, "p": 0.7, "c": 3.6, "f": 0.1, "benefits": "Hydration", "control": "Detox" },
    "Kale": { "cals": 33, "p": 2.9, "c": 6, "f": 0.6, "benefits": "Nutrient dense superfood", "control": "Bone health (Vit K)" },
    "Mushroom": { "cals": 22, "p": 3.1, "c": 3.3, "f": 0.3, "benefits": "Selenium and Vitamin D", "control": "Immunity" }
}

for ex in exercises:
    exercise_trie.insert(ex)
# Insert Keys from the new database
for fd in food_database.keys():
    food_trie.insert(fd)
# Also insert generic items if needed, or rely on database availability

# --- Seed Data for Graph (Recommendations) ---
# Connecting Exercises to Muscle Groups/Goals
recommendation_graph.add_edge("Strength", "Bench Press")
recommendation_graph.add_edge("Strength", "Deadlift")
recommendation_graph.add_edge("Strength", "Pushups")
recommendation_graph.add_edge("Strength", "Pullups")
recommendation_graph.add_edge("Strength", "Squats")
recommendation_graph.add_edge("Strength", "Lunges")
recommendation_graph.add_edge("Strength", "Shoulder Press")
recommendation_graph.add_edge("Strength", "Bicep Curls")
recommendation_graph.add_edge("Strength", "Tricep Dips")
recommendation_graph.add_edge("Strength", "Leg Press")
recommendation_graph.add_edge("Strength", "Lat Pulldown")
recommendation_graph.add_edge("Cardio", "Running")
recommendation_graph.add_edge("Cardio", "Cycling")
recommendation_graph.add_edge("Cardio", "Burpees")
recommendation_graph.add_edge("Cardio", "Swimming")
recommendation_graph.add_edge("Cardio", "Mountain Climbers")
recommendation_graph.add_edge("Cardio", "Jumping Jacks")
recommendation_graph.add_edge("Cardio", "Hiking")
recommendation_graph.add_edge("Flexibility", "Yoga")
recommendation_graph.add_edge("Flexibility", "Pilates")
recommendation_graph.add_edge("Flexibility", "Plank")
recommendation_graph.add_edge("Flexibility", "Tai Chi")

# --- Routes ---

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "CultFit Backend Running", "status": "Active"})

# 1. Auth (Hash Map)
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    # Simple check if user exists
    if users_db.get(username):
        return jsonify({"error": "User already exists"}), 400
    
    users_db.put(username, data)
    return jsonify({"message": "User registered", "username": username})

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    user = users_db.get(username)
    if user and user.get('password') == data.get('password'):
        return jsonify({"message": "Login successful", "user": user})
    return jsonify({"error": "Invalid credentials"}), 401

# 1.1 User Profile Persistence
@app.route('/api/user/profile', methods=['GET', 'POST'])
def manage_profile():
    global current_user_profile
    if request.method == 'POST':
        data = request.json
        current_user_profile.update(data)
        return jsonify({"message": "Profile updated", "profile": current_user_profile})
    
    return jsonify(current_user_profile)

# 2. Search (Trie)
@app.route('/api/search/exercise', methods=['GET'])
def search_exercise():
    query = request.args.get('q', '')
    results = exercise_trie.search_prefix(query)
    return jsonify({"results": results})

@app.route('/api/search/food', methods=['GET'])
def search_food():
    query = request.args.get('q', '')
    result_names = food_trie.search_prefix(query)
    
    # Enrich results with database details
    rich_results = []
    for name in result_names:
        if name in food_database:
            item = food_database[name].copy()
            item['name'] = name # Ensure name is included
            rich_results.append(item)
        else:
            # Fallback for old items not in DB (shouldn't happen if initialized correctly)
            rich_results.append({"name": name, "cals": 0, "p": 0, "c": 0, "f": 0})
            
    return jsonify({"results": rich_results})

# Unified Search
@app.route('/api/search/all', methods=['GET'])
def search_all():
    query = request.args.get('q', '')
    if not query:
        return jsonify({"exercises": [], "food": []})
        
    exercises = exercise_trie.search_prefix(query)
    food = food_trie.search_prefix(query)
    
    return jsonify({
        "exercises": exercises,
        "food": food
    })

# HashMap for Links
@app.route('/api/exercise/link', methods=['GET'])
def get_exercise_link():
    name = request.args.get('name', '').strip()
    if not name: return jsonify({"link": ""})
    
    name_lower = name.lower()
    
    # 1. Exact or Case-Insensitive Match (Highest Priority)
    link = exercise_video_map.get(name) or next((v for k, v in exercise_video_map.items() if k.lower() == name_lower), None)
    if link:
        return jsonify({"link": link})
    
    # 2. Trie-Based Prefix Matching (User Suggestion)
    # Use the Trie search_prefix to find valid canonical names
    potential_matches = exercise_trie.search_prefix(name)
    if potential_matches:
        # If there's a match, get the video for the first suggestion
        best_match = potential_matches[0]
        link = exercise_video_map.get(best_match)
        if link:
            return jsonify({"link": link, "matched_via": "Trie Prefix", "suggestion": best_match})

    # 3. Keyword/Partial Match (Smart Logic)
    # Check if any known exercise key is contained within the user's title
    sorted_keys = sorted(exercise_video_map.keys(), key=len, reverse=True)
    for key in sorted_keys:
        if key.lower() in name_lower:
            return jsonify({"link": exercise_video_map[key], "matched_keyword": key})
    
    # 4. In-reverse Keyword Match (Any word in title matches an exercise)
    title_words = name_lower.split()
    for word in title_words:
        if len(word) < 3: continue # Skip short words
        match = next((v for k, v in exercise_video_map.items() if word in k.lower()), None)
        if match:
            return jsonify({"link": match, "matched_via": "Word Match"})

    # 5. Fallback to general YouTube search
    search_link = f"https://www.youtube.com/results?search_query={name.replace(' ', '+')}+tutorial"
    return jsonify({"link": search_link, "fallback": True})

# Nutrition Log Persistence
@app.route('/api/nutrition', methods=['GET', 'POST'])
def handle_nutrition():
    if request.method == 'POST':
        item = request.json
        nutrition_log.append(item)
        return jsonify({"message": "Food added to log"})
    
    return jsonify({"log": nutrition_log})

@app.route('/api/nutrition/<int:index>', methods=['DELETE'])
def delete_nutrition(index):
    if 0 <= index < len(nutrition_log):
        nutrition_log.pop(index)
        return jsonify({"message": "Item deleted"})
    return jsonify({"error": "Invalid index"}), 400

# 3. History (Linked List)
@app.route('/api/history', methods=['GET', 'POST'])
def handle_history():
    if request.method == 'POST':
        data = request.json
        data['timestamp'] = datetime.datetime.now().isoformat()
        workout_history.append(data)
        return jsonify({"message": "Workout logged"})
    
    return jsonify({"history": workout_history.get_history()})

# 4. Reminders (Max Heap)
@app.route('/api/reminders', methods=['GET', 'POST'])
def handle_reminders():
    if request.method == 'POST':
        data = request.json
        priority = data.get('priority', 1)
        message = data.get('message')
        reminder_heap.push((priority, message))
        return jsonify({"message": "Reminder added"})
    
    # Peek at most urgent
    next_urgent = reminder_heap.peek()
    return jsonify({
        "urgent": next_urgent,
        "all_reminders": sorted(reminder_heap.heap, key=lambda x: x[0], reverse=False) # Ascending for Min Heap
    })

# Stack Visualizer Endpoint
@app.route('/api/undo/all', methods=['GET'])
def get_stack():
    return jsonify({
        "stack": action_stack.items[::-1] # Return reversed list (Top of stack first)
    })

@app.route('/api/reminders/pop', methods=['POST'])
def pop_reminder():
    reminder = reminder_heap.pop()
    return jsonify({"completed": reminder})

# 5. Recommendations (Graph)
@app.route('/api/exercise/bundle', methods=['GET'])
def get_workout_bundle():
    name = request.args.get('name', '').strip()
    if not name: return jsonify({"bundle": []})
    
    # 1. Find the category for this exercise
    category = None
    for cat in ["Strength", "Cardio", "Flexibility"]:
        if name.lower() in [ex.lower() for ex in recommendation_graph.adj_list.get(cat, [])]:
            category = cat
            break
    
    if not category:
        # Fallback: check case-insensitive match for category itself
        for cat in recommendation_graph.adj_list.keys():
            if cat.lower() == name.lower():
                category = cat
                break
                
    if category:
        # 2. Get 3 other exercises from the same category
        bundle = [ex for ex in recommendation_graph.adj_list[category] if ex.lower() != name.lower()]
        return jsonify({
            "category": category,
            "bundle": bundle[:3] # Suggest top 3
        })
    
    return jsonify({"bundle": []})

@app.route('/api/recommendations/<category>', methods=['GET'])
def get_recommendations(category):
    # BFS to find related items
    recs = recommendation_graph.bfs(category)
    return jsonify({"recommendations": recs})

# 6. Undo (Stack)
@app.route('/api/undo/push', methods=['POST'])
def push_action():
    data = request.json
    action_stack.push(data)
    return jsonify({"message": "Action pushed"})

@app.route('/api/undo/pop', methods=['POST'])
def pop_action():
    action = action_stack.pop()
    if action:
        return jsonify({"undone": action})
    return jsonify({"message": "Nothing to undo"}), 400

# AI Assistant Support Data
motivational_quotes = [
    "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.",
    "The only way to do great work is to love what you do.",
    "Your health is an investment, not an expense.",
    "The secret of getting ahead is getting started.",
    "Don't stop when you're tired. Stop when you're done.",
    "Strength does not come from physical capacity. It comes from an indomitable will.",
    "Fitness is not about being better than someone else. It's about being better than you were yesterday."
]

health_advice = {
    "water": "Drinking enough water is essential for your body to function correctly. Aim for 8-10 glasses a day.",
    "sleep": "Getting 7-9 hours of quality sleep is crucial for muscle recovery and mental clarity.",
    "protein": "Protein is the building block of muscles. Try to include a protein source in every meal.",
    "consistency": "Consistency is key in fitness. It's better to work out for 30 minutes every day than 3 hours once a week.",
    "stress": "High stress levels can hinder your progress. Try meditation or deep breathing exercises.",
    "vegetables": "Incorporate a variety of colorful vegetables into your diet to ensure you get all necessary vitamins and minerals.",
    "fasting": "Intermittent fasting can help with insulin sensitivity, but listen to your body and don't overdo it.",
    "keto": "The ketogenic diet is high-fat and very low-carb. It can be effective for weight loss but requires strict discipline.",
    "muscle growth": "To grow muscle, you need a combination of progressive overload in weightlifting and a caloric surplus with enough protein.",
    "hydration": "Drink water consistently throughout the day, not just when you're thirsty. Thirst is often a late sign of dehydration."
}

# --- Smart AI Brain Logic (Enhanced) ---
class SmartBrain:
    def __init__(self, food_db, exercise_graph, motivational_quotes, health_advice):
        self.food_db = food_db
        self.exercise_graph = exercise_graph
        self.motivational_quotes = motivational_quotes
        self.health_advice = health_advice
        self.stopwords = {"i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now", "want", "wanna", "need", "help", "please", "tell", "show", "give", "get", "find"}

    def process(self, query):
        import random
        q = query.lower().strip()
        tokens = [t.strip("?!.,") for t in q.split()]
        sig_tokens = [t for t in tokens if t not in self.stopwords and len(t) > 1]
        
        response_parts = []

        # 1. High Priority: Motivation
        if "motivation" in q or "quote" in q or "motivate" in q:
            quote = random.choice(self.motivational_quotes)
            return f"### Motivation\n> \"{quote}\""

        # 2. Emotional / Mood (Shortened)
        moods = {
            "sad": "Flexibility", "depressed": "Flexibility", "bored": "Cardio",
            "not interested": "Cardio", "intrested": "Cardio", "lazy": "HIIT",
            "stressed": "Flexibility", "anxious": "Flexibility", "angry": "Strength"
        }
        for mood, cat in moods.items():
            if mood in q:
                recs = self.exercise_graph.adj_list.get(cat, exercises[:5])
                suggested = random.sample(recs, min(2, len(recs)))
                parts = [f"### Support\nFeeling {mood}? Let's shift that."]
                parts.append(f"**Try {cat}**: {', '.join(suggested)}.")
                parts.append(f"> \"{random.choice(self.motivational_quotes)}\"")
                return "\n\n".join(parts)

        # 3. Nutrition Goals (Concise)
        if "protein" in q or "protien" in q:
            p_foods = [n for n, i in self.food_db.items() if i.get('p', 0) > 15]
            picks = random.sample(p_foods, min(3, len(p_foods)))
            res = ["### High Protein Picks"]
            for f in picks: res.append(f"• **{f}**: {self.food_db[f]['p']}g P")
            return "\n".join(res)
        
        if "weight loss" in q or "fat loss" in q:
            lc_foods = [n for n, i in self.food_db.items() if i.get('cals', 0) < 100]
            picks = random.sample(lc_foods, min(3, len(lc_foods)))
            res = ["### Weight Loss Tips"]
            for f in picks: res.append(f"• **{f}**: {self.food_db[f]['cals']} kcal")
            return "\n".join(res)

        # 4. Fitness Goals / Exercises
        if "exercise" in q or "workout" in q or "fitness" in q or "goal" in q:
            recs = random.sample(["Pushups", "Running", "Plank", "Squats", "Yoga"], 3)
            return f"### Fitness Suggestion\nTo reach your goal, try: **{', '.join(recs)}**.\nConsistency is key!"

        # 5. Specific Lookup
        found = []
        for t in sig_tokens:
            matches = food_trie.search_prefix(t) + exercise_trie.search_prefix(t)
            for m in matches:
                if m.lower() in q and m not in found: found.append(m)
        
        if found:
            res = ["### Insights"]
            for e in found[:2]:
                if e in self.food_db:
                    i = self.food_db[e]
                    res.append(f"**{e}**: {i['cals']} cal, {i['p']}g P. {i['benefits']}")
                else: res.append(f"**{e}**: Great choice! [Tutorial](https://youtube.com/results?search_query={e})")
            return "\n".join(res)

        # 6. Fallback (Menu)
        return "### I can help with:\n• **Nutrition**: Ask about calories/protein.\n• **Workouts**: Tell me your mood or goal.\n• **Motivation**: Just say 'motivate me'!"

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    data = request.json
    query = data.get('query', '')
    
    brain = SmartBrain(food_database, recommendation_graph, motivational_quotes, health_advice)
    response_text = brain.process(query)
    
    return jsonify({
        "response": response_text
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
