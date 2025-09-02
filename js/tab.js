import BootstrapTab from 'bootstrap/js/src/tab';
import dynamicObserver from './dynamicobserver';

export default class Tab extends BootstrapTab {
    static selector = '[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-toggle="list"]';

    // Automatically register the component upon class definition
    static {
        dynamicObserver.add(this);
    }
}