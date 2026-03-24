export function sortUsersByCreatedAt(users) {
  if (!users) return [];

  return Object.entries(users).sort(([, user1], [, user2]) => {
    return (user2.createdAt || 0) - (user1.createdAt || 0);
  });
}