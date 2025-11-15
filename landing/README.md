# 🧠 LeetCode Revision Tracker - Landing Page

A stunning, professional landing page built with **React + Vite** featuring an animated matrix-style background effect.

## ✨ Features

- **Animated LetterGlitch Background**: Matrix-style character animation with smooth color transitions
- **Modern UI/UX**: Built with Tailwind CSS, featuring gradients, hover effects, and smooth animations
- **Responsive Design**: Fully responsive across all devices
- **Fast Performance**: Powered by Vite for instant hot module replacement
- **Professional Sections**:
  - Hero with animated background
  - Features showcase (6 key features)
  - How It Works (4-step process)
  - Call-to-action sections
  - Stats display

## 🚀 Quick Start

```bash
# Navigate to landing directory
cd landing

# Install dependencies
npm install

# Start development server
npm run dev
```

The landing page will be available at: **http://localhost:3001/**

## 📦 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **LetterGlitch Component** - Custom animated background

## 🎨 Customization

### Change Colors

Edit `src/App.jsx` to modify the glitch colors:

```javascript
<LetterGlitch
  glitchColors={['#0d1f17', '#16a34a', '#22c55e']} // Your custom colors
  glitchSpeed={50}
  smooth={true}
/>
```

### Modify Content

All content is in `src/App.jsx`:
- `features` array - Feature cards
- `steps` array - How it works steps  
- `stats` array - Statistics bar

## 🔗 Integration

The landing page links to the main app:
- **Get Started** button → `http://localhost:3000/signup`
- **Sign In** button → `http://localhost:3000/login`
- **Launch App** button → `http://localhost:3000`

Make sure your main app is running on port 3000!

## 📁 Project Structure

```
landing/
├── src/
│   ├── components/
│   │   └── LetterGlitch.jsx    # Animated background
│   ├── App.jsx                  # Main landing page
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 🎯 Key Features Highlighted

1. **Spaced Repetition System** - 1 week + 1 month reminders
2. **LeetCode Integration** - Automatic submission verification
3. **Smart Verification** - Only counts submissions after adding
4. **Visual Dashboard** - Track progress with stats
5. **Checkbox-Based UI** - Manual verification control
6. **Secure & Private** - JWT auth + MongoDB

## 🌐 Deployment

### Build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to deploy to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

### Preview production build:

```bash
npm run preview
```

## 🎨 Design Features

- **Smooth scrolling** with anchor links
- **Sticky navigation** with blur effect on scroll
- **Hover animations** on feature cards and buttons
- **Gradient text effects** for emphasis
- **Responsive grid layouts** for all screen sizes
- **Accessibility-friendly** with semantic HTML

## 📝 License

Part of the LeetCode Revision Tracker project.

---

Built with ❤️ using React + Vite, Tailwind CSS, and creative code!
