import BootstrapPopover from "bootstrap/js/src/popover";
import dynamicObserver from "./dynamicobserver";

export default class Popover extends BootstrapPopover {
    static selector = '[data-bs-toggle="popover"]';

    static {
        dynamicObserver.add(this);
    }
}