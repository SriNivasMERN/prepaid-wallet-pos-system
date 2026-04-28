/**
 * Scrolls an element into view while leaving room for the sticky page header.
 */
export function scrollElementBelowHeader(element, offset = 16) {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  const stickyHeader = document.querySelector(".page-header");
  const headerHeight =
    stickyHeader instanceof HTMLElement ? stickyHeader.getBoundingClientRect().height : 0;
  const targetTop =
    window.scrollY + element.getBoundingClientRect().top - headerHeight - offset;

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: "smooth"
  });
}
