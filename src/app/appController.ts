import { debounce } from "../shared/debounce";
import { downloadDsl, exportPng, exportSvg } from "../shared/exporters";
import { buildShareUrl, saveToStorage, updateHash } from "../shared/persistence";
import { EXAMPLE_DSL } from "./examples";
import { copyTextToClipboard } from "./clipboard";
import { buildAppLayout } from "./appLayout";
import { DIAGNOSTICS_EMPTY_MESSAGE, DEBOUNCE_MS } from "./constants";
import { DiagnosticsRenderer } from "./diagnosticsRenderer";
import { DiagramBuilder, type DiagramData } from "../diagram";
import { loadInitialDsl } from "./initialDsl";
import { ToolbarCallbacks, ToolbarController } from "./toolbarController";
import { EditorController } from "../editor/editorController";
import { DiagramController } from "../render";

export class AppController {
  private readonly root: HTMLElement;
  private readonly diagnosticsRenderer: DiagnosticsRenderer;
  private readonly diagramController: DiagramController;
  private readonly diagramBuilder: DiagramBuilder;
  private readonly elements: ReturnType<typeof buildAppLayout>;
  private editorController: EditorController | null = null;
  private toolbarController: ToolbarController | null = null;
  private lastValidData: DiagramData | null = null;
  private readonly debouncedApply: (text: string) => void;
  private readonly debouncedPersist: (text: string) => void;

  constructor(root: HTMLElement) {
    this.root = root;
    this.elements = buildAppLayout(this.root);
    this.diagnosticsRenderer = new DiagnosticsRenderer(
      this.elements.diagnosticsHost,
      DIAGNOSTICS_EMPTY_MESSAGE,
    );
    this.diagramController = new DiagramController(this.elements.svg);
    this.diagramBuilder = new DiagramBuilder();
    this.debouncedApply = debounce(this.applyDsl, DEBOUNCE_MS.parse);
    this.debouncedPersist = debounce(this.persistDsl, DEBOUNCE_MS.persist);
  }

  async init(): Promise<void> {
    const initialDsl = await loadInitialDsl(EXAMPLE_DSL);
    this.editorController = new EditorController(
      this.elements.editorHost,
      initialDsl,
      this.handleEditorChange,
    );
    this.toolbarController = new ToolbarController(
      this.elements.controls,
      this.buildToolbarCallbacks(),
    );
    this.setInitialToolbarState();
    this.applyDsl(initialDsl);
  }

  private buildToolbarCallbacks(): ToolbarCallbacks {
    return {
      onResetExample: () => this.requireEditor().setValue(EXAMPLE_DSL),
      onDownloadDsl: () => downloadDsl(this.requireEditor().getValue()),
      onUploadDsl: (text: string) => this.requireEditor().setValue(text),
      onExportSvg: () => exportSvg(this.elements.svg),
      onExportPng: () => this.exportPngSafely(),
      onCopyShareLink: () => void this.copyShareLink(),
      onDebugConnectionsChange: (enabled: boolean) =>
        this.diagramController.setOptions({ debugConnections: enabled }),
      onResetView: () => this.diagramController.resetView(),
    };
  }

  private setInitialToolbarState(): void {
    this.requireToolbar().setDebugConnections(false);
  }

  private handleEditorChange = (text: string): void => {
    this.debouncedPersist(text);
    this.debouncedApply(text);
  };

  private persistDsl = (text: string): void => {
    saveToStorage(text);
    updateHash(text).catch(() => undefined);
  };

  private applyDsl = (text: string): void => {
    const result = this.diagramBuilder.build(text);
    this.diagnosticsRenderer.render(result.diagnostics);

    if (result.data) {
      this.lastValidData = result.data;
      this.diagramController.setData(result.data);
      return;
    }

    if (!this.lastValidData) {
      this.diagramController.setData(null);
    }
  };

  private async copyShareLink(): Promise<void> {
    const url = await buildShareUrl(this.requireEditor().getValue());
    await copyTextToClipboard(url);
  }

  private exportPngSafely(): void {
    exportPng(this.elements.svg).catch(() => undefined);
  }

  private requireEditor(): EditorController {
    if (!this.editorController) {
      throw new Error("Editor is not initialized.");
    }
    return this.editorController;
  }

  private requireToolbar(): ToolbarController {
    if (!this.toolbarController) {
      throw new Error("Toolbar is not initialized.");
    }
    return this.toolbarController;
  }
}
