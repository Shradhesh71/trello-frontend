// Map colors to gradient classes
export const colorToGradient: Record<string, string> = {
  '#0079bf': 'from-blue-600 to-purple-600',
  '#ff9500': 'from-orange-500 to-pink-600',
  '#51e898': 'from-green-500 to-teal-600',
  '#9f7aea': 'from-purple-600 to-pink-600',
  '#eb5a46': 'from-red-500 to-pink-600',
  '#00c2e0': 'from-cyan-500 to-blue-600',
  '#61bd4f': 'from-emerald-500 to-green-600',
  '#ff78cb': 'from-pink-500 to-rose-600',
  '#f2d600': 'from-yellow-500 to-orange-500',
  '#8b949e': 'from-gray-600 to-slate-700',
  '#6366f1': 'from-indigo-600 to-purple-700',
  '#34d399': 'from-teal-400 to-cyan-500',
};

export function getBoardGradient(background?: string): string {
  if (!background) {
    return 'from-blue-600 to-purple-600'; // Default
  }
  
  return colorToGradient[background] || 'from-blue-600 to-purple-600';
}
