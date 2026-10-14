# 🍎 Apple Notes PWA (with Real-Time Sharing & Collaboration)

A mock static Progressive Web App (PWA) inspired by **Apple Notes (iOS 18 / iOS 17)**, featuring full offline capability, multi-color highlighting, interactive checklists, handwriting/sketch pad, and a dedicated **Share & Collaborate** experience with live simulation.

---

## ✨ Features

- **Iconic Apple Notes UI & Design System**:
  - Exact Apple gold/yellow accent (`#E3A008`)
  - iOS inset grouped cards, typography, and blurred translucent navigation & toolbars
  - Light mode & Dark mode support (auto-detects system preferences or toggles manually)
  - Haptic feedback on mobile interactions
- **Folders, Tags & Search**:
  - Folders: *Quick Notes*, *Shared*, *All iCloud*, *Notes*, *Inbox*, *Today*, *PDFs*
  - Interactive Tag pills: `#highlights`, `#apps`, `#business`, `#camping`, `#books`, etc.
  - Live instant search filtering across note titles and content
- **Rich Note Editor**:
  - **Multi-color Apple Highlights**: Pink, Purple, Yellow, Mint, and Blue
  - **Interactive Checklists**: Apple-style circular checkmarks with strike-through animations
  - **Headings & Formatting**: Title, Heading, Subheading, Body, Monostyled, Bold, Italic, Underline, Strikethrough
  - **Tables**: Insert and edit table data inside notes
  - **Handwriting & Sketch Pad**: Full-screen drawing canvas to doodle, sign, or sketch and embed directly into notes
  - **Attachments**: Camera & photo attachments
  - **Undo / Redo** history
- **Share & Collaborate Hub**:
  - **Web Share API**: Native phone sharing sheet (`navigator.share`)
  - **Collaboration Link & QR Code**: Instantly share or scan from phone
  - **Collaborators Roster**: Manage roles (*Owner*, *Editor*, *Viewer*) and see online/away status
  - **Interactive Live Collaboration Simulator**: Tap *"Simulate Partner"* to watch Sarah Chen type into the note in real time with a colored live cursor!
  - **Activity Feed**: Timeline of edits and collaborator actions
- **PWA (Progressive Web App)**:
  - 100% offline support via Service Worker (`sw.js`)
  - Web App Manifest (`manifest.webmanifest`)
  - Installable to iOS Home Screen (Safari) and Android (Chrome)

---

## 📱 How to Run and Install on Your Phone

### Option 1: Run Locally on Your Home Wi-Fi

1. Start the local server:
   ```bash
   nix-shell -p python3 --run "python3 server.py"
   ```
   *(or if you have python installed globally: `python3 server.py`)*

2. The terminal will display your local network URL, for example:
   ```
   http://192.168.20.134:8000
   ```

3. Open that URL on your phone's browser (make sure phone is connected to the same Wi-Fi).

4. **Install to Home Screen**:
   - **On iPhone (Safari)**:
     1. Tap the **Share** button (⎋) at the bottom.
     2. Scroll down and tap **Add to Home Screen** (➕).
     3. Tap **Add**. The Notes app will appear on your iPhone home screen!
   - **On Android (Chrome)**:
     1. Tap the three dots (⋮) in the top-right.
     2. Tap **Install app** or **Add to Home screen**.

---

### Option 2: Deploy Free to the Web (Instant HTTPS)

Because this is a 100% static site (pure HTML, CSS, JS), you can deploy it in seconds:

- **GitHub Pages**:
  Push this repository to GitHub, go to **Settings -> Pages**, select `main` branch root, and click **Save**.
- **Cloudflare Pages / Vercel / Netlify**:
  Drag-and-drop this folder or connect the repository. No build step required!

---

## 📂 Project Structure

```
.
├── index.html              # Main application shell with iOS views
├── manifest.webmanifest    # PWA configuration and shortcuts
├── sw.js                   # Service Worker for offline caching
├── server.py               # Local server helper with LAN IP detection
├── generate_icons.py       # Script that generates Apple Notes icons
├── icons/                  # 192x192, 512x512, maskable, touch icons
├── css/
│   ├── ios-base.css        # Colors, variables, dark mode, typography
│   ├── components.css      # Navigation bar, inset lists, sheets, modals
│   └── editor.css          # Note canvas, highlights, checklists, canvas
└── js/
    ├── app.js              # View transitions, navigation, search
    ├── editor.js           # Rich text, highlights, checklists, sketches
    ├── collab.js           # Share sheet, live simulation, activity log
    ├── storage.js          # LocalStorage persistence & seed data
    └── pwa.js              # Service worker registration & install prompts
```