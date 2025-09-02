import BootstrapCarousel from 'bootstrap/js/src/carousel';
import dynamicObserver from "./dynamicobserver";

export default class Carousel extends BootstrapCarousel {
    static selector = '[data-bs-ride="carousel"]';

    static {
        dynamicObserver.add(this);
    }
}