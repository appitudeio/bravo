/**
 *  There's nothing wrong with Bootstrap's Tooltip, excep that the animation is boring with just an opacity transition.
 *  - Let's extend this with a smooth scale animation, but to do so we need to alter the template so it has a container that can be animated.
 *  + Add functionality to have an interactive content (Content that can be "touched")
 */
import BootstrapTooltip from 'bootstrap/js/dist/tooltip';
import EventHandler from 'bootstrap/js/dist/dom/event-handler';
import SelectorEngine from 'bootstrap/js/dist/dom/selector-engine';

const CLASS_TOOLTIP_CONTAINER = "tooltip-container";
const CLASS_TOOLTIP_INTERACTIVE = "tooltip-interactive";
const EVENT_INSERTED = "inserted";

class Tooltip extends BootstrapTooltip {
    constructor(element, config = {}) {
        if (isInteractive(element)) {
            config = { ...config, ...{
                trigger: "manual",
                customClass: CLASS_TOOLTIP_INTERACTIVE,
                html: true
            }};
        }

        super(element, config);

        if(isInteractive(element)) {
            this._enableInteractivity();
        }
    }

    _enableInteractivity() {
        EventHandler.on(this._element, 'mouseover', () => this.show());

        EventHandler.on(this._element, this.constructor.eventName(EVENT_INSERTED), () => {
            EventHandler.on(this._getTipElement(), 'mouseleave', () => this.hide());
        });
    }
}

const isInteractive = (element) => element.getAttribute('data-bs-interactive') !== null;

// Automatically initialize tooltips, which differs from Bootstrap since they require manual initialization
SelectorEngine.find('[data-bs-toggle="tooltip"]').forEach((tooltipElement) => {
    Tooltip.getOrCreateInstance(tooltipElement, {
        template: `<div class="tooltip" role="tooltip"><div class="${CLASS_TOOLTIP_CONTAINER}"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div></div>`
    });
});