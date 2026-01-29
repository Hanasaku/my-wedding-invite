export const palette = {
    // Backgrounds
    bgPrimary: '#020205',
    bgCard: 'rgba(20, 20, 20, 0.6)',

    // Golds
    goldBright: '#FFD700',
    goldMain: '#D4AF37',
    goldDeep: '#8E6E17',
    goldDim: '#5c4d18',
    goldMuted: '#AD8D2D',      // Satin gold for processing state
    goldMutedLight: '#C4A43D', // Brighter bronze for borders

    // Accents & Signals
    accentSuccess: '#00ff41',
    accentError: '#E65100', // Sophisticated Amber-Red (Interstellar Style)
    orangeRed: '#FF4500',
    textPrimary: '#FFFFFF',
    textDim: 'rgba(255, 255, 255, 0.2)',

    // Base Colors
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',

    // Dress Code Swatches (Gradient Pairs)
    dressCode: {
        grey: { from: '#4A4A4A', to: '#757575' },
        blue: { from: '#1A237E', to: '#3949AB' },
        purple: { from: '#4A148C', to: '#7B1FA2' },
    },

    // UX / Emotional States
    sentiment: {
        positive: '#D4AF37', // goldMain
        distant: '#607d8b',  // Steel Blue Grey
    },

    // Fonts
    fontTech: "'Rajdhani', sans-serif",
    fontClassy: "'Cinzel', serif",

    // Guest Hasher Tool (Ergonomic Sage Themes)
    tool: {
        dark: {
            bg: '#121612',
            card: '#1a1f1a',
            primary: '#88b091',
            accent: '#d4a373',
            text: '#e0e6e0',
            muted: '#8d968d',
            border: '#2a332a',
        },
        light: {
            bg: '#f4f7f4',
            card: '#ffffff',
            primary: '#6b8e6b',
            accent: '#bc8a5f',
            text: '#3a413a',
            muted: '#707a70',
            border: '#e0e6e0',
        }
    }
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
