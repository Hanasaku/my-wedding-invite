export const palette = {
    // Backgrounds
    bgPrimary: '#020205',
    bgCard: 'rgba(20, 20, 20, 0.6)',

    // Golds
    goldBright: '#FFD700',
    goldMain: '#D4AF37',
    goldDeep: '#8E6E17',
    goldDim: '#5c4d18',

    // Accents & Signals
    accentSuccess: '#00ff41',
    accentError: '#E65100', // Sophisticated Amber-Red (Interstellar Style)
    textPrimary: '#FFFFFF',
    textDim: 'rgba(255, 255, 255, 0.2)',

    // Base Colors
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',

    // Fonts
    fontTech: "'Rajdhani', sans-serif",
    fontClassy: "'Cinzel', serif",
};

/**
 * Helper to convert hex to rgba with opacity
 */
export const hexToRGBA = (hex: string, opacity: number): string => {
    let r = 0, g = 0, b = 0;
    // Handle short hex (e.g. #000)
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export type ThemeType = typeof palette;
