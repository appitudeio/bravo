import BootstrapDropdown from 'bootstrap/js/dist/dropdown';
import EventHandler from 'bootstrap/js/dist/dom/event-handler';
import DynamicObserver from "./dynamicobserver";

export default class Dropdown extends BootstrapDropdown {
    static selector = '[data-bs-toggle="dropdown"]';

    constructor(element, config) {
        super(element, config);

        if (this._element.getAttribute('data-bs-trigger') === 'hover') {
            this._addHoverListeners();
        }
    }

    _addHoverListeners() {
        // Use the closest dropdown container if available; otherwise, use the parentNode
        const commonParent = this._element.closest('.dropdown') || this._element.parentNode;

        // Attach hover listeners to the common parent to handle enter and leave events
        EventHandler.on(commonParent, 'mouseenter', () => this.show());
        EventHandler.on(commonParent, 'mouseleave', (event) => this._onMouseLeave(event, commonParent));
    }

    // Handler for mouseleave to check if we left the entire dropdown area
    _onMouseLeave(event, commonParent) {
        const relatedTarget = event.relatedTarget;

        // Check if the new element (relatedTarget) is still inside the parent or dropdown menu
        if (!relatedTarget || !commonParent.contains(relatedTarget)) {
            this.hideWithDelay();
        }
    }

    hideWithDelay() {
        setTimeout(() => {
            // Check if both the button and menu are no longer being hovered
            if (!this._element.matches(':hover') && !this._menu.matches(':hover')) {
                this.hide();
            }
        }, 50);
    }

    // Automatically register the component upon class definition
    static {
        DynamicObserver.add(this);
    }
}