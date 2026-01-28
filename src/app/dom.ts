type ElementGuard<T extends Element> = (element: Element) => element is T;

const resolveElementById = (id: string): Element => {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element not found: ${id}`);
  }
  return element;
};

export const getRequiredElementById = <T extends Element>(
  id: string,
  guard: ElementGuard<T>,
): T => {
  const element = resolveElementById(id);
  if (!guard(element)) {
    throw new Error(`Element has unexpected type: ${id}`);
  }
  return element;
};

export const isHtmlElement = (element: Element): element is HTMLElement =>
  element instanceof HTMLElement;

export const isInputElement = (element: Element): element is HTMLInputElement =>
  element instanceof HTMLInputElement;

export const isButtonElement = (
  element: Element,
): element is HTMLButtonElement => element instanceof HTMLButtonElement;

export const isSvgElement = (element: Element): element is SVGSVGElement =>
  element instanceof SVGSVGElement;

/**
 * Type-safe clone for SVG elements.
 * cloneNode(true) always returns same type for Element subclasses per DOM spec.
 */
export const cloneSvgElement = <T extends SVGElement>(element: T): T =>
  element.cloneNode(true) as T;

/**
 * Type guard for event.target as HTMLInputElement.
 * Returns null if target is not an input element.
 */
export const getInputTarget = (event: Event): HTMLInputElement | null => {
  const target = event.target;
  if (target instanceof HTMLInputElement) {
    return target;
  }
  return null;
};
