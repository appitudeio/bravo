import BootstrapPopover from "bootstrap/js/dist/popover";
import DynamicObserver from "./dynamicobserver";

export default class Popover extends BootstrapPopover {
    static selector = '[data-bs-toggle="popover"]';

    static {
        DynamicObserver.add(this);
    }
}