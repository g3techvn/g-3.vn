'use client';

import { useTheme } from '@/context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white/50 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 dark:focus:ring-gray-700"
      title={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
    >
      <span className="sr-only">
        {theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
      </span>
      <SunIcon
        className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        aria-hidden="true"
      />
      <MoonIcon
        className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        aria-hidden="true"
      />
    </button>
  );
} 