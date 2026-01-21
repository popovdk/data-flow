import { ELEMENT_IDS } from "./constants";
import {
  getRequiredElementById,
  isButtonElement,
  isHtmlElement,
  isInputElement,
  isSvgElement,
} from "./dom";

export interface AppControls {
  debugConnections: HTMLInputElement;
  resetView: HTMLButtonElement;
  resetExample: HTMLButtonElement;
  downloadDsl: HTMLButtonElement;
  uploadDsl: HTMLInputElement;
  exportSvg: HTMLButtonElement;
  exportPng: HTMLButtonElement;
  copyLink: HTMLButtonElement;
}

export interface AppElements {
  editorHost: HTMLElement;
  diagnosticsHost: HTMLElement;
  svg: SVGSVGElement;
  controls: AppControls;
}

const buildToolbarMarkup = (): string => `
  <header class="toolbar">
    <div class="toolbar-group">
      <button id="${ELEMENT_IDS.resetExample}">Reset to example</button>
      <button id="${ELEMENT_IDS.downloadDsl}">Download DSL</button>
      <label class="button">
        Upload DSL
        <input id="${ELEMENT_IDS.uploadDsl}" type="file" accept=".txt,.dsl" />
      </label>
      <button id="${ELEMENT_IDS.exportSvg}">Export SVG</button>
      <button id="${ELEMENT_IDS.exportPng}">Export PNG</button>
      <button id="${ELEMENT_IDS.copyLink}">Copy share link</button>
    </div>
    <div class="toolbar-group">
      <label class="button">
        <input id="${ELEMENT_IDS.debugConnections}" type="checkbox" />
        Debug connections
      </label>
      <button id="${ELEMENT_IDS.resetView}">Reset view</button>
    </div>
  </header>
`;

const buildPaneMarkup = (): string => `
  <main class="pane">
    <section class="editor-pane">
      <div id="${ELEMENT_IDS.editor}"></div>
      <div id="${ELEMENT_IDS.diagnostics}" class="diagnostics"></div>
    </section>
    <section class="diagram-pane">
      <div id="diagram-container">
        <svg id="${ELEMENT_IDS.diagram}"></svg>
      </div>
    </section>
  </main>
`;

const buildLayoutMarkup = (): string =>
  `${buildToolbarMarkup()}${buildPaneMarkup()}`;

const resolveControls = (): AppControls => ({
  debugConnections: getRequiredElementById(
    ELEMENT_IDS.debugConnections,
    isInputElement,
  ),
  resetView: getRequiredElementById(ELEMENT_IDS.resetView, isButtonElement),
  resetExample: getRequiredElementById(
    ELEMENT_IDS.resetExample,
    isButtonElement,
  ),
  downloadDsl: getRequiredElementById(
    ELEMENT_IDS.downloadDsl,
    isButtonElement,
  ),
  uploadDsl: getRequiredElementById(ELEMENT_IDS.uploadDsl, isInputElement),
  exportSvg: getRequiredElementById(ELEMENT_IDS.exportSvg, isButtonElement),
  exportPng: getRequiredElementById(ELEMENT_IDS.exportPng, isButtonElement),
  copyLink: getRequiredElementById(ELEMENT_IDS.copyLink, isButtonElement),
});

export const buildAppLayout = (root: HTMLElement): AppElements => {
  root.innerHTML = buildLayoutMarkup();

  return {
    editorHost: getRequiredElementById(ELEMENT_IDS.editor, isHtmlElement),
    diagnosticsHost: getRequiredElementById(
      ELEMENT_IDS.diagnostics,
      isHtmlElement,
    ),
    svg: getRequiredElementById(ELEMENT_IDS.diagram, isSvgElement),
    controls: resolveControls(),
  };
};
