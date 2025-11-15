# Animation System Documentation

## Overview
AlgoTick uses **two distinct animation systems**:
- **App (Frontend)**: Subtle, consistent animations for a professional dashboard feel
- **Landing Page**: Bold, dynamic animations to create excitement and engagement

## App Animation System (Frontend)

### Core Principles
- **Consistency**: All animations use the same timing and easing functions
- **Uniformity**: Only 4 animation types throughout the application
- **Performance**: CSS-based animations with minimal JavaScript
- **Subtle**: Non-disruptive animations that enhance UX

### Animation Classes

#### 1. `animate-fadeIn`
**Purpose**: Universal entry animation for most elements
**Duration**: 0.6s
**Easing**: ease-out
**Effect**: Fades in with slight upward movement (20px translateY)
**Usage**: Default animation for sections, cards, headers

```jsx
<div className="animate-fadeIn">Content</div>
```

#### 2. `animate-scaleIn`
**Purpose**: For modals, forms, and prominent cards
**Duration**: 0.4s
**Easing**: ease-out
**Effect**: Scales from 95% to 100% with fade
**Usage**: Login/Signup forms, important dialogs

```jsx
<div className="animate-scaleIn delay-100">Form Card</div>
```

#### 3. `animate-slideIn`
**Purpose**: For alerts, messages, and notifications
**Duration**: 0.4s
**Easing**: ease-out
**Effect**: Slides in from left (-20px translateX) with fade
**Usage**: Error messages, success alerts

```jsx
<div className="animate-slideIn">Alert Message</div>
```

#### 4. `animate-shake`
**Purpose**: For error states and invalid inputs
**Duration**: 0.5s
**Easing**: ease-in-out
**Effect**: Horizontal shake motion
**Usage**: Form validation errors

```jsx
<div className="animate-shake">Error!</div>
```

### Delay Classes (App)
- `delay-100` through `delay-600` (0.1s - 0.6s)

---

## Landing Page Animation System

### Core Principles
- **Bold**: Larger movements and more dramatic effects
- **Engaging**: Eye-catching animations to capture attention
- **Varied**: Multiple animation types for visual interest
- **Dynamic**: Different animations for different elements

### Animation Classes

#### 1. `animate-slideUp`
**Duration**: 0.8s
**Easing**: cubic-bezier(0.16, 1, 0.3, 1) (bounce effect)
**Effect**: Slides up from 60px below with fade
**Usage**: Subtitles, descriptions, CTAs

```jsx
<p className="opacity-0 animate-slideUp delay-200">Text</p>
```

#### 2. `animate-slideDown`
**Duration**: 0.8s
**Easing**: cubic-bezier(0.16, 1, 0.3, 1)
**Effect**: Slides down from 40px above with fade
**Usage**: Section headers, mobile menu

```jsx
<h2 className="opacity-0 animate-slideDown">Heading</h2>
```

#### 3. `animate-scaleUp`
**Duration**: 0.7s
**Easing**: cubic-bezier(0.34, 1.56, 0.64, 1) (elastic bounce)
**Effect**: Scales from 85% to 100% with fade
**Usage**: Hero titles, feature cards, important elements

```jsx
<h1 className="opacity-0 animate-scaleUp">AlgoTick</h1>
```

#### 4. `animate-slideRight`
**Duration**: 0.8s
**Easing**: cubic-bezier(0.16, 1, 0.3, 1)
**Effect**: Slides in from left (-60px) with fade
**Usage**: Alternating step cards

```jsx
<div className="opacity-0 animate-slideRight delay-400">Card</div>
```

#### 5. `animate-slideLeft`
**Duration**: 0.8s
**Easing**: cubic-bezier(0.16, 1, 0.3, 1)
**Effect**: Slides in from right (60px) with fade
**Usage**: Alternating step cards

```jsx
<div className="opacity-0 animate-slideLeft delay-500">Card</div>
```

#### 6. `animate-rotateIn`
**Duration**: 0.7s
**Easing**: cubic-bezier(0.34, 1.56, 0.64, 1)
**Effect**: Rotates from -10deg and scales from 90% with fade
**Usage**: Feature cards (adds playfulness)

```jsx
<div className="opacity-0 animate-rotateIn delay-600">Feature</div>
```

#### 7. Infinite Animations
- `animate-float` - Gentle floating motion (3s loop)
- `animate-pulse` - Pulsing scale/opacity (2s loop)
- `animate-glow` - Glowing box-shadow effect (2s loop)

```jsx
<button className="animate-glow">CTA Button</button>
```

### Delay Classes (Landing)
- `delay-100` through `delay-1000` (0.1s - 1s)
- Extended range for staggered effects across multiple sections

---

## Implementation Files

### App (Frontend)
**File**: `frontend/src/index.css`
- 4 core animations (fadeIn, scaleIn, slideIn, shake)
- Timing: 0.4-0.6s
- Easing: ease-out (smooth, quick)

### Landing Page
**File**: `landing/src/index.css`
- 6+ animations (slideUp, slideDown, scaleUp, slideRight, slideLeft, rotateIn)
- Timing: 0.7-0.8s
- Easing: cubic-bezier (bouncy, elastic)
- Includes infinite animations (float, pulse, glow)

## Page-Specific Patterns

### App Pages

#### Dashboard
- Stats cards: `animate-fadeIn delay-100/200/300`
- Heatmap: `animate-fadeIn delay-400`
- Form: `animate-fadeIn delay-500`
- Question list: `animate-fadeIn delay-600`

#### Login/Signup
- Logo: `animate-fadeIn`
- Form card: `animate-scaleIn delay-100`
- Errors: `animate-shake`

#### Custom Lists
- Header: `animate-fadeIn`
- Sidebar: `animate-fadeIn delay-100`
- Details panel: `animate-fadeIn delay-200`
- Messages: `animate-slideIn`

#### Settings
- Page title: `animate-fadeIn`
- Settings sections: `animate-fadeIn delay-100`

### Landing Page

#### Hero Section
- Title: `opacity-0 animate-scaleUp` (big entrance!)
- Subtitle: `opacity-0 animate-slideUp delay-200`
- CTA button: `opacity-0 animate-slideUp delay-400` + `animate-glow`

#### Features Section
- Section title: `opacity-0 animate-slideDown`
- Section subtitle: `opacity-0 animate-slideUp delay-200`
- Feature cards: Mix of `animate-rotateIn`, `animate-scaleUp`, `animate-slideUp` with delays 300-800ms

#### How It Works
- Section title: `opacity-0 animate-slideDown`
- Section subtitle: `opacity-0 animate-slideUp delay-200`
- Step cards: Alternating `animate-slideRight` and `animate-slideLeft` with delays 400-700ms

#### CTA Section
- Heading: `opacity-0 animate-scaleUp`
- Text: `opacity-0 animate-slideUp delay-200`
- Buttons: `opacity-0 animate-slideUp delay-400`

---

## Why Two Different Systems?

### App (Subtle & Professional)
The main application uses **subtle, consistent animations** because:
- Users interact with it daily - animations shouldn't be distracting
- Dashboard context requires focus and clarity
- Professional feel for a productivity tool
- Faster animations (0.4-0.6s) for responsive feel

### Landing Page (Bold & Engaging)
The landing page uses **bold, varied animations** because:
- First impression - needs to capture attention
- Marketing context - creates excitement
- Visitor sees it once - can be more dramatic
- Slower animations (0.7-0.8s) with bounce for impact
- Varied animations prevent monotony

---

## CSS Implementation

### App (`frontend/src/index.css`)
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.6s ease-out forwards;
  opacity: 0;
}
```

### Landing (`landing/src/index.css`)
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(60px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideUp {
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

---

## Best Practices

### App Animations - DO ✅
- Use `animate-fadeIn` as the default
- Apply delays (100-600ms) for staggered effects
- Use `animate-scaleIn` for important UI elements
- Use `animate-slideIn` for temporary messages
- Keep it subtle and professional

### App Animations - DON'T ❌
- Don't use bold animations
- Don't exceed 0.6s duration
- Don't use bouncy easing functions
- Don't animate everything

### Landing Animations - DO ✅
- Use bold movements (60px translations)
- Mix different animation types for variety
- Add `opacity-0` class to prevent FOUC
- Use longer delays (up to 1s) for dramatic sequences
- Apply `animate-glow` to CTAs for attention

### Landing Animations - DON'T ❌
- Don't use subtle app animations
- Don't make animations too long (max 0.8s)
- Don't use the same animation for everything
- Don't forget the `opacity-0` initial state

---

## Migration from Old System

**Old classes (removed):**
- `animate-fadeInUp` → `animate-fadeIn`
- `animate-fadeInDown` → `animate-fadeIn`
- `animate-zoomIn` → `animate-scaleIn`
- `animate-slideInLeft` → `animate-slideIn`
- `animate-bounceIn` → `animate-fadeIn` or `animate-scaleIn`
- `stagger-1/2/3/4/5/6` → `delay-100/200/300/400/500/600`

## Testing Animations

To test animations:
1. Run `npm run dev` in both frontend and landing directories
2. Navigate through all pages
3. Verify consistent timing and smooth transitions
4. Check mobile responsiveness
5. Ensure no flickering or layout shifts

## Performance Notes

- All animations use CSS transforms (hardware accelerated)
- Initial `opacity: 0` prevents FOUC (Flash of Unstyled Content)
- Animations are non-blocking and won't impact interactivity
- Total animation time per page load: ~0.6-1.2s including delays

---

**Last Updated**: 2025
**Maintained By**: Development Team
