import BootstrapCollapse from 'bootstrap/js/src/collapse';
import dynamicObserver from "./dynamicobserver";

export default class Collapse extends BootstrapCollapse {
    static selector = '[data-bs-toggle="collapse"]';

    static {
        dynamicObserver.add(this);
    }
}