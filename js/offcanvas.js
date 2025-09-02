import BootstrapOffcanvas from 'bootstrap/js/src/offcanvas';
import dynamicObserver from "./dynamicobserver";

export default class Offcanvas extends BootstrapOffcanvas {
    static selector = '[data-bs-toggle="offcanvas"]';

    static {
        dynamicObserver.add(this);
    }
}