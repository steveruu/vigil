import users from '../data/users.json';

export function getUserId(name: string): string | null {
  // Normalize the name for lookup (case-insensitive)
  const normalizedName = name.trim();
  
  // Try exact match first
  if (users[normalizedName as keyof typeof users]) {
    return users[normalizedName as keyof typeof users] || null;
  }
  
  // Try case-insensitive match
  const key = Object.keys(users).find(
    k => k.toLowerCase() === normalizedName.toLowerCase()
  );
  
  if (key) {
    return users[key as keyof typeof users] || null;
  }
  
  return null;
}

export function formatUserMention(name: string): string {
  const userId = getUserId(name);
  return userId ? `**${name}** (<@${userId}>)` : `**${name}**`;
}

export function formatUserList(names: string[]): string {
  const mentions = names.map(name => formatUserMention(name));
  
  if (mentions.length === 0) return '';
  if (mentions.length === 1) return mentions[0];
  if (mentions.length === 2) return `${mentions[0]} a ${mentions[1]}`;
  
  // For more than 2, use commas and "a" before the last one
  const allButLast = mentions.slice(0, -1).join(', ');
  const last = mentions[mentions.length - 1];
  return `${allButLast} a ${last}`;
}
