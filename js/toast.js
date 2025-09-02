import BootstrapToast from 'bootstrap/js/src/toast';
import dynamicObserver from './dynamicobserver';

export default class Toast extends BootstrapToast {
    static selector = '.toast';

    static {
        dynamicObserver.add(this);
    }
}