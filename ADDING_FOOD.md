# How to Add Food in NutriScan

You have **two options** to add food entries:

## Option 1: Enter Manually (No API Key Required) ⚡

1. Go to **Add Food** page
2. Enter the food name (required)
3. Optionally add brand and serving size
4. Click **"Enter Manually"** button
5. Fill in the nutrition values you know
6. Click **"Save Entry"**

✅ **This works immediately without any setup!**

---

## Option 2: Use AI Estimation (Requires OpenAI API Key) 🤖

### Setup (One-time):

1. Get an API key:
   - Go to https://platform.openai.com/api-keys
   - Create an account (if you don't have one)
   - Create a new API key
   - Copy the key (starts with `sk-...`)

2. Add the key to your `.env` file:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. Restart the dev server:
   - Press `Ctrl+C` in the terminal
   - Run: `npm run dev -- -p 8000`

### Usage:

1. Go to **Add Food** page
2. Enter food name, brand, and serving size
3. Click **"Estimate with AI"**
4. Review and edit the AI estimates
5. Click **"Save Entry"**

---

## Alternative: Scan Labels 📸

You can also use the **Scan Label** feature:
- Works **without** an API key
- Uses Tesseract.js for OCR (runs in your browser)
- Upload a photo of a nutrition label
- Review and edit the parsed data
- Save to your intake log

---

## Which Method to Use?

- **No API key?** → Use "Enter Manually" or "Scan Label"
- **Have API key?** → Use "Estimate with AI" for quick estimates
- **Packaged food?** → Use "Scan Label" for accuracy
- **Restaurant/homemade?** → Use "Estimate with AI" or "Enter Manually"

All three methods let you edit the values before saving!

