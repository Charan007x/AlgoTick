/**
 * Centralized icon constants for consistent rendering across all platforms
 * Using custom SVG components for consistent appearance
 */

import SVGIcons from './svg-icons';

export const ICONS = {
  // Dashboard Stats Icons
  CLOCK: <SVGIcons.CLOCK />,           // Clock - Due Today
  CALENDAR: <SVGIcons.CALENDAR />,     // Calendar - Due This Week
  CHECKMARK: <SVGIcons.CHECKMARK />,   // Checkmark - Fully Revised
  
  // Common UI Icons
  FIRE: <SVGIcons.FIRE />,             // Fire - Streak
  CHART: <SVGIcons.CHART />,           // Chart - Growth/Stats
  TARGET: <SVGIcons.TARGET />,         // Target - Goal/Focus
  LOCK: <SVGIcons.LOCK />,             // Lock - Security/Privacy
  BRAIN: <SVGIcons.BRAIN />,           // Brain - Memory/Learning
  LIGHTNING: <SVGIcons.LIGHTNING />,   // Lightning - Speed/Performance
  
  // Status Icons
  SUCCESS: <SVGIcons.SUCCESS />,       // Success checkmark
  ERROR: <SVGIcons.ERROR />,           // Error X
  WARNING: <SVGIcons.WARNING />,       // Warning triangle
  INFO: <SVGIcons.INFO />,             // Info i
  
  // Action Icons
  ROCKET: <SVGIcons.ROCKET />,         // Rocket - Launch/Start
  SPARKLES: <SVGIcons.SPARKLES />,     // Sparkles - New/Special
  REFRESH: <SVGIcons.REFRESH />,       // Refresh - Reload/Sync
  PLUS: <SVGIcons.PLUS />,             // Plus - Add
  MINUS: <SVGIcons.MINUS />,           // Minus - Remove
  
  // Navigation Icons
  LEFT_ARROW: <SVGIcons.LEFT_ARROW />,     // Left arrow
  RIGHT_ARROW: <SVGIcons.RIGHT_ARROW />,   // Right arrow
  UP_ARROW: <SVGIcons.UP_ARROW />,         // Up arrow
  DOWN_ARROW: <SVGIcons.DOWN_ARROW />,     // Down arrow
};

export default ICONS;
