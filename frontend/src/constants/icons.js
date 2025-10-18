/**
 * Centralized icon constants for consistent rendering across all platforms
 * Using Unicode code points to ensure cross-platform compatibility
 */

// Custom SVG Calendar Component
export const CalendarIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="10" width="36" height="32" rx="4" fill="currentColor" opacity="0.2"/>
    <rect x="6" y="10" width="36" height="8" rx="4" fill="currentColor" opacity="0.3"/>
    <line x1="16" y1="6" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="32" y1="6" x2="32" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <text x="24" y="26" fontSize="8" fontWeight="600" fill="currentColor" textAnchor="middle">APR</text>
    <text x="24" y="36" fontSize="12" fontWeight="bold" fill="currentColor" textAnchor="middle">9</text>
  </svg>
);

export const ICONS = {
  // Dashboard Stats Icons
  CLOCK: '\u23F0',           // ⏰ - Due Today
  CALENDAR: <CalendarIcon />, // Custom SVG - Due This Week
  CHECKMARK: '\u2705',       // ✅ - Fully Revised
  
  // Common UI Icons
  FIRE: '\u{1F525}',         // 🔥 - Streak
  CHART: '\u{1F4C8}',        // 📈 - Growth/Stats
  TARGET: '\u{1F3AF}',       // 🎯 - Goal/Focus
  LOCK: '\u{1F512}',         // 🔒 - Security/Privacy
  BRAIN: '\u{1F9E0}',        // 🧠 - Memory/Learning
  LIGHTNING: '\u26A1',       // ⚡ - Speed/Performance
  
  // Status Icons
  SUCCESS: '\u2705',         // ✅ - Success
  ERROR: '\u274C',           // ❌ - Error
  WARNING: '\u26A0\uFE0F',   // ⚠️ - Warning
  INFO: '\u2139\uFE0F',      // ℹ️ - Information
  
  // Action Icons
  ROCKET: '\u{1F680}',       // 🚀 - Launch/Start
  SPARKLES: '\u2728',        // ✨ - New/Special
  REFRESH: '\u{1F504}',      // 🔄 - Refresh/Sync
  PLUS: '\u2795',            // ➕ - Add
  MINUS: '\u2796',           // ➖ - Remove
  
  // Navigation Icons
  LEFT_ARROW: '\u2B05\uFE0F',  // ⬅️ - Left
  RIGHT_ARROW: '\u27A1\uFE0F', // ➡️ - Right
  UP_ARROW: '\u2B06\uFE0F',    // ⬆️ - Up
  DOWN_ARROW: '\u2B07\uFE0F',  // ⬇️ - Down
};

/**
 * Icon component wrapper for consistent styling
 * @param {string} icon - Icon from ICONS constant
 * @param {string} className - Additional CSS classes
 * @param {string} ariaLabel - Accessibility label
 */
export const Icon = ({ icon, className = '', ariaLabel = '' }) => {
  return (
    <span 
      className={`inline-block ${className}`}
      role="img"
      aria-label={ariaLabel}
      style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji"' }}
    >
      {icon}
    </span>
  );
};

export default ICONS;
