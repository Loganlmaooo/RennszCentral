import { ThemeSetting } from "../types";

/**
 * Applies a theme to the document by setting CSS variables
 */
export function applyTheme(theme: ThemeSetting): void {
  if (!theme) return;
  
  const root = document.documentElement;
  
  // Set color variables
  root.style.setProperty('--primary-color', theme.primaryColor);
  root.style.setProperty('--secondary-color', theme.secondaryColor);
  root.style.setProperty('--accent-color', theme.accentColor);
  root.style.setProperty('--text-color', theme.textColor);
  
  // Set fonts
  root.style.setProperty('--heading-font', theme.headingFont);
  root.style.setProperty('--body-font', theme.bodyFont);
  
  // Apply background
  if (theme.backgroundType === 'image') {
    document.body.style.backgroundImage = `url(${theme.backgroundValue})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundBlendMode = 'overlay';
    document.body.style.backgroundColor = theme.primaryColor;
  } else if (theme.backgroundType === 'gradient') {
    document.body.style.backgroundImage = theme.backgroundValue;
    document.body.style.backgroundSize = '100% 100%';
  } else {
    document.body.style.backgroundColor = theme.backgroundValue;
    document.body.style.backgroundImage = 'none';
  }
  
  // Update meta theme color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme.primaryColor);
  } else {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = theme.primaryColor;
    document.head.appendChild(meta);
  }
}

/**
 * Create a style element for fonts if not already loaded
 */
export function loadFonts(headingFont: string, bodyFont: string): void {
  const fontFamilies = [headingFont, bodyFont].filter((font, index, self) => self.indexOf(font) === index);
  
  // Create a formatted string for Google Fonts
  const formattedFonts = fontFamilies.map(font => {
    return font.replace(/\s+/g, '+') + ':wght@300;400;500;600;700';
  }).join('|');
  
  // Check if this font link already exists
  const existingLink = document.querySelector(`link[href*="${formattedFonts}"]`);
  if (existingLink) return;
  
  // Create and append the link element
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${formattedFonts}&display=swap`;
  document.head.appendChild(link);
}
