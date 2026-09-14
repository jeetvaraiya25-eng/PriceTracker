export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - 8;
  window.scrollTo({ top, behavior: "smooth" });
  if (window.location.hash !== `#${id}`) {
    history.replaceState(null, "", `#${id}`);
  }
  return true;
}

export function handleHashJump(event, id) {
  event?.preventDefault?.();
  scrollToId(id);
}
