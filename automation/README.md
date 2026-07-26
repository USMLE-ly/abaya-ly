# 👗 Nadine Social Media Auto-Poster

Auto-post fashion product videos to TikTok, Instagram, Twitter, and Facebook.

## Setup

### 1. Install Python 3.12+
```bash
# Ubuntu/Debian
sudo apt install python3.12 python3.12-venv

# macOS
brew install python@3.12

# Windows — download from python.org
```

### 2. Install Firefox + geckodriver
```bash
# Ubuntu/Debian
sudo apt install firefox
# geckodriver is auto-installed by webdriver-manager

# macOS
brew install firefox
brew install geckodriver
```

### 3. Setup the project
```bash
cd automation

# Create virtual environment
python3.12 -m venv venv
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt
```

### 4. Import cookies
For each platform, export your browser cookies and save as JSON:

```bash
# Save cookies to these files:
cookies/tiktok.json
cookies/instagram.json
cookies/twitter.json
cookies/facebook.json
```

**How to export cookies:**
1. Install a browser extension like "Cookie Editor" or "EditThisCookie"
2. Log into the platform in your browser
3. Export cookies as JSON
4. Save to the `cookies/` folder

### 5. Add videos
Drop your MP4 video files into the `content/` folder.

### 6. Run
```bash
cd automation
source venv/bin/activate
python src/main.py
```

## Usage

1. **Select option 1** (Post a video now)
2. **Choose a product** from the catalog (search by name or ID)
3. **Choose a video** from the content folder
4. **Review the generated caption** (approve, reject, or edit)
5. **Posts to all enabled platforms** automatically

## Caption Format

Every post follows this structure:
```
🔥 [Question hook with emoji]

✅ [Proof point 1]
✅ [Proof point 2]
✅ [Proof point 3]

👉 https://nadine.luxor.ly/product/{id}

#نادين #عبايات_فاخرة #فاشن_ليبيا #ملابس_نسائية #تصميم_مميز #أناقة #ستايل #ملابس
```

## File Structure

```
automation/
├── config.json              # Settings
├── requirements.txt         # Dependencies
├── README.md                # This file
├── src/
│   ├── main.py              # Entry point
│   ├── caption_generator.py # Generates Arabic captions
│   ├── cookie_manager.py    # Cookie lifecycle
│   ├── scheduler.py         # Post scheduling
│   └── publishers/          # Platform publishers
│       ├── base_publisher.py
│       ├── tiktok_publisher.py
│       ├── instagram_publisher.py
│       ├── twitter_publisher.py
│       └── facebook_publisher.py
├── content/                 # Drop videos here
├── cookies/                 # Platform cookies
└── logs/                    # Post history
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No cookies found | Export cookies from browser and save to `cookies/` folder |
| Video not uploading | Check video format (MP4 preferred) and size |
| Caption too long | Edit the caption to shorten it before posting |
| Browser errors | Update Firefox and geckodriver |
| Posts not happening | Check posting time windows in config.json |
