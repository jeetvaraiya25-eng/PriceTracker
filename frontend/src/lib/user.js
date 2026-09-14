export function displayName(user) {
  return String(user?.username || user?.name || "").trim();
}

export function firstName(user) {
  const name = displayName(user);
  if (!name) return "You";
  return name.split(/\s+/)[0];
}

export function initials(user) {
  const name = displayName(user);
  if (name) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }
  return (user?.email?.[0] || "D").toUpperCase();
}
