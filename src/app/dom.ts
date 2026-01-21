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
