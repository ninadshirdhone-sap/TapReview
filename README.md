# Smart_Review.in 🚀
### Mobile-First QR & NFC Business Standee Assistant

**Smart_Review.in** is a high-performance, mobile-first web application designed for physical QR/NFC business standees (placed on restaurant tables, clinic counters, retail checkout desks, and salon mirrors).

It is powered entirely by **Google Sheets as its database**, requiring zero paid databases or external AI API keys.

---

## 🌟 The 3 Core Standee Features

1. **Smart Google Review Assistant**:
   - Customers tap a star rating (1 to 5) and choose experience highlights (Food, Service, Ambience, Cleanliness, Wait Time, etc.).
   - Assembles a natural review draft using predefined sentence templates from the `ReviewPrompts` tab in Google Sheets.
   - Allows instant editing, shuffling/regeneration, copying to clipboard, and 1-tap "Open Google Reviews" linking directly to the business profile.
   - **Honest Feedback Guarantee**: Unconditionally supports genuine reviews for all star ratings (1 to 5 stars) with zero deceptive gating or rating filtering, keeping your business strictly compliant with Google Review policies.

2. **Instagram Follow**:
   - Opens the business's verified Instagram profile with 1 tap.
   - Displays follower perks, daily specials, and handle.
   - Cleanly hides if `instagramUrl` is blank in Google Sheets.

3. **WhatsApp VIP Offers & Channel**:
   - Opens the business's WhatsApp Channel or VIP chat with 1 tap.
   - Drives customer loyalty with exclusive discounts, secret menu drops, and event invitations.
   - Cleanly hides if `whatsappUrl` is blank in Google Sheets.

---

## 📊 Google Sheets Setup (Businesses & Review Comments)

You can manage your app using **two sheets** (either as 2 tabs in the same Google Sheet, or as 2 separate spreadsheets):

### Sheet 1: `Businesses`
| Column Header | Example | Description |
| :--- | :--- | :--- |
| `Business ID` | `spice-hub` | Unique standee slug used in URL/NFC/QR (`/b/spice-hub`) |
| `Business name` | `Spice Hub Fine Dining` | Display name of the business |
| `Business Type (restaurant, salon, gym)` | `restaurant`, `salon`, `gym`, `cafe`, `clinic` | Matches category in Review Comments |
| `google place ID(review)` | `ChIJrTLr-GyuEmsRBfy61i59si0` or full URL | Auto-converts Google Place ID to direct write-review link |
| `Insta URL` | `https://instagram.com/spicehub` or `@spicehub` | Instagram profile button (hidden if empty) |
| `Whatsapp chanel Url` | `https://chat.whatsapp.com/...` or phone | WhatsApp VIP offers button (hidden if empty) |
| `active/disactive status` | `active` or `disactive` | If `disactive`, standee displays polite offline notice |

---

### Sheet 2: `ReviewComments` (For Random Multi-Variation Review Generation)
Create a tab named `ReviewComments` (or `Reviews` / `Sentences`) to store comments. The website will randomly select and assemble them so **every customer sees a fresh, brand-new review draft every time!**

| Column Header | Example | Description |
| :--- | :--- | :--- |
| `Business Type` | `restaurant`, `salon`, `gym`, or `Universal` | Business type matching Sheet 1 |
| `Star Rating` | `5`, `4`, `3`, `2`, `1` | Star rating selected by customer |
| `Tag / Highlight` | `Overall`, `Food Quality`, `Staff`, `Ambience` | Set to `Overall` (or blank) for star-only comments, or specify tag |
| `Comment / Sentence Template` | "The dishes were bursting with authentic flavors and fresh spices." | The sentence to randomly pick |
| `Active` | `TRUE` | `TRUE` to enable, `FALSE` to disable |

#### 🎲 How Random Review Generation Works:
- **Comments only for stars**: When `Tag / Highlight` is `Overall` (or empty), the generator uses these comments for customers who choose a star rating without selecting any tags.
- **Comments for tags and stars**: When customers toggle highlights (e.g. `Food Quality` + `Staff`), the engine randomly samples matching sentences for each chosen tag.
- Every click on **"🎲 Shuffle / New Review"** randomly picks fresh sentences from the Google Sheet candidate pool, guaranteeing endless variety!

---

## 🚀 How to Host on Vercel (Step-by-Step)

The project is pre-configured with `vercel.json` and a serverless API adapter (`/api/index.ts`). You can deploy it in less than 2 minutes:

### Step 1: Push your code to GitHub
If you haven't already pushed your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit for Smart Review"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

### Step 2: Import into Vercel
1. Go to **[vercel.com](https://vercel.com)** and log in with your GitHub account.
2. Click **"Add New..."** -> **"Project"**.
3. Select your GitHub repository from the list and click **"Import"**.

### Step 3: Configure Project Settings on Vercel
Vercel will automatically detect Vite:
- **Framework Preset**: `Vite` (or `Other`)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install` (default)

### Step 4: Add Environment Variables
Under the **Environment Variables** section, add:
- `GOOGLE_SHEET_ID`: `1ghUovqB8NqnIKFqfwIruDS5InZN2cDEgteiypvHUWD0` (or your custom Google Sheet ID)
- `GOOGLE_SHEETS_API_KEY`: *(Optional)* Your Google Cloud API Key with Google Sheets API enabled (Leave empty if your sheet is shared as "Anyone with the link can view")

### Step 5: Click "Deploy"
Vercel will build and deploy your application in ~45 seconds. Once finished, you will receive a free `https://your-project.vercel.app` domain!

### Testing your deployed Standee URLs:
- `https://your-project.vercel.app/b/spice-hub`
- `https://your-project.vercel.app/b/apex-dental`
- `https://your-project.vercel.app/b/glow-salon`
- `https://your-project.vercel.app/?admin=true` (Opens the Admin sync & standee preview modal)

---

## ⚙️ Environment Variables

Add these to your `.env` or Vercel Environment Variables:

```env
# Your Google Spreadsheet ID (from the URL: docs.google.com/spreadsheets/d/[ID]/edit)
GOOGLE_SHEET_ID="your_google_sheet_id_here"

# Method A (Zero Config / Free):
# Just set the Google Sheet share permissions to "Anyone with the link can view".
# The server will automatically query via Google's CSV export endpoint securely.

# Method B (Recommended for high volume):
# Google Cloud API Key with "Google Sheets API" enabled:
GOOGLE_SHEETS_API_KEY=""

# The production URL of your deployment
APP_URL="https://your-domain.vercel.app"
```

---

## 🖨️ Physical Standee Specs & NFC Setup

1. **NFC Tags**: Use standard **NTAG213** or **NTAG215** stickers (cost: ~₹15-₹30 / $0.25).
2. **NFC Programming**: Use any free NFC app (e.g. *NFC Tools* on iOS/Android).
   - Write Record: **URL / URI**
   - Value: `https://your-domain.com/b/your-business-id` (e.g. `https://smart-review.in/b/cafe-roma`)
3. **QR Code**: Open the **Standee Preview** tool in the app header and click **Download QR PNG** or **Print Standee** to print the acrylic tent card directly!
