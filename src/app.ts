import { AppController } from "./app/appController";
import { ELEMENT_IDS } from "./app/constants";
import { getRequiredElementById, isHtmlElement } from "./app/dom";

export const initApp = async (): Promise<void> => {
  const root = getRequiredElementById(ELEMENT_IDS.appRoot, isHtmlElement);
  const controller = new AppController(root);
  await controller.init();
};
