import BootstrapAlert from 'bootstrap/js/src/alert';
import dynamicObserver from './dynamicobserver';

export default class Alert extends BootstrapAlert {
    static selector = '.alert';

    static {
        dynamicObserver.add(this);
    }
}