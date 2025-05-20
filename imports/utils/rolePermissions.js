export function canViewUserDetails(role) {
  return role === 'admin' || role === 'viewer' || role === 'guest';
}

export function canViewFiles(role) {
  return role === 'admin' || role === 'guest';
}

export function canOpenFiles(role) {
  return role === 'admin';
}