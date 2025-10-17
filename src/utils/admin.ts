const ADMIN_ID = process.env.ADMIN_ID || '';

export function isAdmin(userId: string): boolean {
  return userId === ADMIN_ID;
}

export function getAdminId(): string {
  return ADMIN_ID;
}
