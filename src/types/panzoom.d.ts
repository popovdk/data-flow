declare module "@panzoom/panzoom" {
  export interface PanzoomGlobalOptions {
    maxScale?: number;
    minScale?: number;
    canvas?: boolean;
    excludeClass?: string;
  }

  export interface PanzoomResetOptions {
    animate?: boolean;
    force?: boolean;
  }

  export interface PanzoomPanOptions {
    relative?: boolean;
    force?: boolean;
  }

  export interface PanzoomZoomOptions {
    animate?: boolean;
    force?: boolean;
  }

  export interface PanzoomController {
    reset: (options?: PanzoomResetOptions) => void;
    pan: (x: number, y: number, options?: PanzoomPanOptions) => void;
    zoom: (scale: number, options?: PanzoomZoomOptions) => void;
    zoomWithWheel: (event: WheelEvent) => void;
  }

  const Panzoom: (
    element: HTMLElement | SVGElement,
    options?: PanzoomGlobalOptions,
  ) => PanzoomController;

  export default Panzoom;
}
