import { scrollElementBelowHeader } from "./scrollElementBelowHeader";

/**
 * Brings the first visible validation or request error inside a form/container into view.
 */
export function revealFeedbackInContainer(container) {
  if (!(container instanceof HTMLElement)) {
    return;
  }

  const firstError = container.querySelector(".form-message--error, .field-error");

  if (!(firstError instanceof HTMLElement)) {
    return;
  }

  const scrollTarget =
    firstError.closest(".field-group, .form-message, .form-actions, .section-card") || firstError;

  scrollElementBelowHeader(scrollTarget);
}
