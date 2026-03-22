# Learnzy — Deployment Guide

## Architecture
```
Expo App (Android/iOS)  →  FastAPI Backend (Railway)  →  MongoDB Atlas
                                    ↓
                              OpenAI API
                           (GPT-4o-mini | Whisper | TTS)
                                    ↓
                              Razorpay (payments)
```

---

## STEP 1 — MongoDB Atlas (free)
1. https://cloud.mongodb.com → Create free account
2. Create cluster → M0 Free Tier
3. Database Access → Add user → save username + password
4. Network Access → Add IP → 0.0.0.0/0 (allow all)
5. Connect → Connect your application → copy connection string
   - Replace `<password>` with your actual password
   - Example: `mongodb+srv://speakeasy:mypass@cluster0.abc.mongodb.net/`

---

## STEP 2 — OpenAI API Key
1. https://platform.openai.com/api-keys
2. Create new secret key → copy it (shown only once)
3. This single key handles:
   - Chat (GPT-4o-mini)
   - Voice input (Whisper speech-to-text)
   - Voice output (TTS)
4. Add billing at https://platform.openai.com/settings/billing
   - Suggested starting credit: $10–$20

---

## STEP 3 — Deploy Backend (Railway — recommended)
1. https://railway.app → sign up with GitHub
2. New Project → Deploy from GitHub repo
3. Set Root Directory: `backend`
4. Railway auto-detects `railway.toml`
5. Settings → Variables → add:
   ```
   MONGO_URL=mongodb+srv://...
   DB_NAME=learnzy
   OPENAI_API_KEY=sk-...
   RAZORPAY_KEY_ID=rzp_live_...
   RAZORPAY_KEY_SECRET=...
   ```
6. Deploy → copy the public URL

### Seed words database (run once after deploy):
```bash
curl -X POST https://YOUR_BACKEND_URL/api/seed-words
```

---

## STEP 4 — Configure Frontend
1. Create `frontend/.env`:
   ```
   EXPO_PUBLIC_BACKEND_URL=https://your-backend.railway.app
   ```
2. Update `frontend/app.json` projectId:
   - Go to https://expo.dev → New Project
   - Copy the UUID → replace `"projectId": "learnzy"`

---

## STEP 5 — Build APK (EAS)
```bash
npm install -g eas-cli
cd frontend
npm install
eas login
eas build:configure
eas build --platform android --profile preview
```
Download APK from Expo dashboard → install on device for testing.

---

## STEP 6 — Google Play (production)
1. $25 one-time developer account: https://play.google.com/console
2. Build AAB: `eas build --platform android --profile production`
3. Upload AAB → complete store listing → children's app content rating
4. Add privacy policy URL (required for kids apps)

---

## Character Reference
| ID       | Name  | Personality       | TTS Voice |
|----------|-------|-------------------|-----------|
| cat      | Cuty  | Playful & Curious | nova      |
| dog      | Candy | Loyal & Enthusiastic | alloy  |
| rabbit   | Bunny | Quick & Energetic | shimmer   |
| elephant | Jumbo | Wise & Patient    | onyx      |

## 6 Learning Modules
1. 📖 **Vocabulary** — Word Explorer with daily words
2. 🔤 **Phonics** — Sounds, letters, pronunciation
3. ✍️ **Writing** — Sentences, stories, creative writing
4. 📝 **Grammar** — Rules, quests, error spotting
5. 🗣️ **Conversation** — AI voice chat, 6 subject modes
6. 🎮 **Game Zone** — 15 educational games
