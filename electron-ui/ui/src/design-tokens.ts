/**
 * Design tokens extracted from Paper artboards.
 * This file is the SINGLE SOURCE OF TRUTH for all visual values.
 *
 * DO NOT hardcode colors, spacing, font sizes, or radii in components.
 * Import from here or use the CSS variable equivalents.
 *
 * Paper artboards:
 *   - "Accessible Color Scales" — text tiers and contrast ratios
 *   - "Component Decomposition" — atoms and molecules
 *   - "List Management Patterns" — density and filter bar
 *   - "Concept B — Action Items" — 3-zone layout
 */

// ─── Typography ──────────────────────────────────────────────
export const typography = {
  fontFamily: {
    display: "'Space Grotesk', sans-serif",
    body: "'Inter', sans-serif",
  },
  fontSize: {
    displayLg: "40px",
    displayMd: "24px",
    displaySm: "20px",
    heading: "14px",
    body: "13px",
    caption: "12px",
    label: "11px",
    micro: "10px",
    navLabel: "9px",
  },
  fontWeight: {
    display: 700,
    heading: 600,
    bodyMedium: 500,
    body: 400,
    label: 500,
    badgeStrong: 700,
  },
  letterSpacing: {
    displayTight: "-0.03em",
    headingTight: "-0.02em",
    sectionLabel: "0.02em",
    groupLabel: "0.04em",
    badgeWide: "0.04em",
    uppercase: "0.06em",
  },
  lineHeight: {
    display: "28px",
    body: "20px",
    caption: "18px",
    label: "16px",
    micro: "14px",
  },
} as const;

// ─── Spacing ─────────────────────────────────────────────────
export const spacing = {
  section: "32px",
  group: "16px",
  element: "8px",
  tight: "4px",
  navRailWidth: "56px",
  sidebarWidth: "300px",
  sidebarWidthWide: "520px",  // Action Items sidebar
  assistantWidth: "380px",
  topBarHeight: "48px",
  listRowPadding: {
    comfortable: "10px 16px",
    compact: "5px 8px",
    dense: "3px 8px",
  },
} as const;

// ─── Border Radius ───────────────────────────────────────────
export const radii = {
  badge: "4px",
  tag: "3px",
  checkbox: "4px",
  button: "6px",
  commandBar: "8px",
  commandBarItem: "6px",
  input: "8px",
  card: "12px",
  countPill: "10px",
  chatBubbleUser: "12px 12px 2px 12px",
  chatBubbleAssistant: "2px 12px 12px 12px",
  navRailLogo: "6px",
} as const;

// ─── Accessible Text Tiers ───────────────────────────────────
// WCAG AA compliance: Primary 7:1+, Secondary 4.5:1+, Decorative non-text only
// These map to CSS variables. Actual hex values are in index.css per theme.
export const textTiers = {
  primary: {
    description: "Headings, titles, action item text",
    minContrastRatio: 7,
    cssVar: "var(--color-text-primary)",
  },
  body: {
    description: "Paragraphs, descriptions",
    minContrastRatio: 7,
    cssVar: "var(--color-text-body)",
  },
  secondary: {
    description: "Dates, owners, metadata, labels",
    minContrastRatio: 4.5,
    cssVar: "var(--color-text-secondary)",
  },
  muted: {
    description: "Large labels only (11px+ bold). NOT for body text.",
    minContrastRatio: 3,
    cssVar: "var(--color-text-muted)",
  },
  decorative: {
    description: "BORDERS, DIVIDERS, PROGRESS TRACKS ONLY. Never for readable text.",
    minContrastRatio: 0,
    cssVar: "var(--color-line)",
  },
} as const;

// ─── Component Specs ─────────────────────────────────────────
// Exact values from Paper "Component Decomposition" artboard

export const badge = {
  fontSize: "10px",
  fontWeight: 700,
  padding: "2px 8px",
  borderRadius: "4px",
  letterSpacing: "0.04em",
  variants: {
    critical: { bg: "var(--color-danger)", text: "white" },
    high: { bg: "#EA580C", text: "white" },
    medium: { bg: "var(--color-accent)", text: "white" },
    low: { bg: "var(--color-bg-elevated)", text: "var(--color-text-secondary)" },
    open: { bg: "#DCFCE7", text: "#15803D" },
    draft: { bg: "var(--color-tint)", text: "var(--color-accent)" },
    identified: { bg: "var(--color-bg-elevated)", text: "var(--color-text-secondary)" },
    tracked: { bg: "#DBEAFE", text: "#1D4ED8" },
    completed: { bg: "var(--color-bg-elevated)", text: "var(--color-text-secondary)" },
  },
} as const;

export const tag = {
  fontSize: "10px",
  fontWeight: 500,
  padding: "2px 8px",
  borderRadius: "3px",
  bg: "var(--color-bg-elevated)",
  text: "var(--color-text-secondary)",
  milestoneVariant: {
    borderLeft: "2px solid var(--color-accent)",
  },
} as const;

export const commandBar = {
  containerPadding: "2px",
  containerRadius: "8px",
  containerBg: "var(--color-bg-elevated)",
  itemPadding: "6px 12px",
  itemRadius: "6px",
  itemFontSize: "12px",
  itemFontWeight: 500,
  activeItemBg: "var(--color-bg-surface)",
  activeItemText: "var(--color-text-body)",
  defaultItemText: "var(--color-text-secondary)",
  destructiveItemText: "var(--color-danger)",
  successItemText: "#15803D",
  dividerWidth: "1px",
  dividerHeight: "16px",
  dividerColor: "var(--color-line)",
  iconSize: "14px",
  iconStrokeWidth: "2",
} as const;

export const notesButton = {
  bg: "rgba(201, 122, 46, 0.08)",
  text: "#C97A2E",
  badgeBg: "rgba(201, 122, 46, 0.12)",
  badgeText: "#C97A2E",
  badgeFontSize: "9px",
  badgePadding: "1px 4px",
  badgeRadius: "3px",
  iconSize: "13px",
  fontSize: "11px",
  fontWeight: 600,
  padding: "4px 10px",
  radius: "6px",
} as const;

export const sectionHeader = {
  labelFont: typography.fontFamily.display,
  labelSize: "13px",
  labelWeight: 600,
  labelLetterSpacing: "0.02em",
  labelTransform: "uppercase" as const,
  expandedLabelColor: "var(--color-text-primary)",
  collapsedLabelColor: "var(--color-text-muted)",
  chevronSize: "12px",
  ruleHeight: "1px",
  ruleColor: "var(--color-line)",
} as const;

export const listItemRow = {
  selected: {
    bg: "var(--color-tint)",
    borderLeft: "2px solid var(--color-accent)",
    titleColor: "var(--color-text-primary)",
    titleWeight: 500,
  },
  default: {
    bg: "transparent",
    borderLeft: "none",
    titleColor: "var(--color-text-body)",
    titleWeight: 400,
  },
  hover: {
    bg: "var(--color-bg-elevated)",
    borderLeft: "none",
    titleColor: "var(--color-text-body)",
    titleWeight: 400,
  },
  titleSize: "13px",
  metadataSize: "11px",
  metadataColor: "var(--color-text-secondary)",
} as const;

export const density = {
  comfortable: {
    rowPadding: "10px 16px",
    titleSize: "13px",
    metadataSize: "11px",
    badgeStyle: "full",         // "CRITICAL"
    ownerStyle: "full",         // "Wesley Donaldson"
    checkboxSize: "14px",
    visibleItems: "~10",
  },
  compact: {
    rowPadding: "5px 8px",
    titleSize: "12px",
    metadataSize: "10px",
    badgeStyle: "abbreviated",  // "C"
    ownerStyle: "shortened",    // "Wesley D."
    checkboxSize: "12px",
    visibleItems: "~18",
  },
  dense: {
    rowPadding: "3px 8px",
    titleSize: "11px",
    metadataSize: "9px",
    badgeStyle: "dot",          // colored 4px dot
    ownerStyle: "initials",     // "WD"
    checkboxSize: "10px",
    visibleItems: "~30",
  },
} as const;

// ─── Responsive Breakpoints ─────────────────────────────────
export const breakpoints = {
  mobile: 768,
  tablet: 1280,
} as const;

// ─── Per-Breakpoint Layout ──────────────────────────────────
export const layout = {
  mobile: {
    navRailWidth: 0,
    bottomTabHeight: 56,
    sheetHandleHeight: 20,
    sidebarWidth: 0,
    chatPanelWidth: 0,
  },
  tablet: {
    navRailWidth: 0,
    bottomTabHeight: 56,
    sheetHandleHeight: 20,
    sidebarWidth: 280,
    chatPanelWidth: 320,
  },
  desktop: {
    navRailWidth: 56,
    bottomTabHeight: 0,
    sidebarWidth: 300,
    chatPanelWidth: 380,
  },
} as const;

export const searchResultCard = {
  checkboxSize: "16px",
  checkboxRadius: "4px",
  checkboxUncheckedBorder: "#c0bab3",
  checkedAccent: "#e67e22",
  checkedBorderLeft: "3px solid #e67e22",
  titleFont: typography.fontFamily.display,
  titleSize: typography.fontSize.body,
  titleWeight: typography.fontWeight.heading,
  tagBg: "#f0eeeb",
  tagFontSize: "9px",
  tagFontWeight: typography.fontWeight.label,
  tagColor: "#6b6660",
  tagRadius: "3px",
  tagPadding: "1px 6px",
  scoreFont: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
  scoreSize: typography.fontSize.label,
  scoreWeight: typography.fontWeight.heading,
  scoreColors: {
    high: "#2d8a4e",
    medHigh: "#5a9a3e",
    med: "#7a9a3e",
    low: "#9aaa3e",
  },
  openCtaFont: typography.fontFamily.body,
  openCtaSize: typography.fontSize.label,
  openCtaWeight: typography.fontWeight.label,
  openCtaColor: "#e67e22",
  whyBg: "#fdf8f0",
  whyBorderLeft: "2px solid #e6a54a",
  whyLabelFont: typography.fontFamily.body,
  whyLabelSize: typography.fontSize.micro,
  whyLabelWeight: typography.fontWeight.badgeStrong,
  whyLabelColor: "#c17a1a",
  whyLabelTracking: "0.03em",
  whyTextFont: typography.fontFamily.body,
  whyTextSize: typography.fontSize.label,
  whyTextColor: "#7a6e5f",
  artifactIndent: "24px",
  artifactItemFont: typography.fontFamily.body,
  artifactItemSize: typography.fontSize.label,
  artifactItemWeight: typography.fontWeight.label,
  artifactMetaSize: typography.fontSize.micro,
  artifactMetaColor: "var(--color-text-muted)",
  moreTextColor: "#b0aaa3",
  riskTextColor: "#9a5c1a",
  decisionIconColor: "#d97706",
  sectionHeaderFont: typography.fontFamily.body,
  sectionHeaderSize: typography.fontSize.micro,
  sectionHeaderWeight: typography.fontWeight.badgeStrong,
  sectionHeaderColor: "var(--color-text-secondary)",
  sectionHeaderTracking: "0.03em",
} as const;

export const filterChip = {
  padding: "4px 10px",
  borderRadius: "6px",
  border: "1px solid var(--color-line)",
  bg: "var(--color-bg-input)",
  labelSize: "11px",
  labelColor: "var(--color-text-secondary)",
  valueSize: "11px",
  valueWeight: 600,
  valueColor: "var(--color-text-primary)",
  activeChip: {
    bg: "var(--color-tint)",
    text: "var(--color-accent)",
    borderRadius: "4px",
    padding: "3px 8px",
    fontSize: "10px",
    fontWeight: 500,
  },
} as const;
