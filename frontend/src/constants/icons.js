/**
 * Centralized icon constants for consistent rendering across all platforms
 * Using Unicode code points to ensure cross-platform compatibility
 */

export const ICONS = {
  // Dashboard Stats Icons
  CLOCK: '\u23F0',           // ⏰ - Due Today
  CALENDAR: '\u{1F4C5}',     // 📅 - Due This Week
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
