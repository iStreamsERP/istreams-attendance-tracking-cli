import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { MD3LightTheme as PaperLightTheme, MD3DarkTheme as PaperDarkTheme } from 'react-native-paper';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const scheme = useColorScheme();
  const darkMode = scheme === 'dark';

  const paperTheme = {
    ...(darkMode ? PaperDarkTheme : PaperLightTheme),
    dark: darkMode,
    colors: {
      ...(darkMode ? PaperDarkTheme.colors : PaperLightTheme.colors),
      ...(darkMode
        ? {
            primary: '#0685de',
            background: '#0f172a',
            loginBackground: "rgba(15, 23, 42, 0.85)",
            surface: '#1e293b',
            text: '#ffffff',
            card: '#1e293b',
            border: '#334155',
            white: '#ffffff',
            gray: '#94a3b8',
            lightGray: '#334155',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            blue: '#3b82f6',
            pink: '#ec4899',
            purple: '#8b5cf6',
          }
        : {
            primary: '#0685de',
            background: '#f8fafc',
            loginBackground: "rgba(255, 255, 255, 0.85)",
            surface: '#ffffff',
            text: '#000000',
            card: '#e6e6e6',
            border: '#e2e8f0',
            white: '#ffffff',
            gray: '#64748b',
            lightGray: '#e2e8f0',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            blue: '#3b82f6',
            pink: '#ec4899',
            purple: '#8b5cf6',
          }),
    },
  };

  return (
    <ThemeContext.Provider value={{ darkMode, theme: paperTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);