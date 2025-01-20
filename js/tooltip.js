/**
 *  There's nothing wrong with Bootstrap's Tooltip, excep that the animation is boring with just an opacity transition.
 *  - Let's extend this with a smooth scale animation, but to do so we need to alter the template so it has a container that can be animated.
 *  + Add functionality to have an interactive content (Content that can be "touched")
 */
import BootstrapTooltip from "bootstrap/js/dist/tooltip";
import EventHandler from "bootstrap/js/dist/dom/event-handler";
import DynamicObserver from "./dynamicobserver";

const CLASS_TOOLTIP_CONTAINER = "tooltip-container";
const CLASS_TOOLTIP_INTERACTIVE = "tooltip-interactive";
const EVENT_INSERTED = "inserted";

export default class Tooltip extends BootstrapTooltip {
    static selector = '[data-bs-toggle="tooltip"]';

    // Used for interactive tooltips
    _isTriggerHovered = false;
    _isTooltipHovered = false;
    _hideTimeout = null;

    constructor(element, config = {}) {
        if (Tooltip._isInteractive(element)) {
            config = { ...config, ...{
                trigger: "manual",
                customClass: CLASS_TOOLTIP_INTERACTIVE,
                html: true
            }};
        }

        config.template = config.template ?? Tooltip.defaultTooltipTemplate;

        super(element, config);

        if(Tooltip._isInteractive(element)) {
            this._enableInteractivity();
        }
    }

    _enableInteractivity() {
       // Show tooltip on mouseenter over the trigger
        EventHandler.on(this._element, 'mouseenter', () => {
            this._isTriggerHovered = true;
            this._clearHideTimeout();

            if(this._isShown()) {
                return;
            }

            this.show();
        });

        // Start hide timeout on mouseleave from the trigger
        EventHandler.on(this._element, 'mouseleave', () => {
            this._isTriggerHovered = false;
            this._scheduleHide();
        });

        // Listen for when the tooltip is shown to attach listeners to it
        EventHandler.on(this._element, this.constructor.eventName(EVENT_INSERTED), () => {
            const tipElement = this._getTipElement();

            // Handle mouseenter on tooltip
            EventHandler.on(tipElement, 'mouseenter', () => {
                this._isTooltipHovered = true;
                this._clearHideTimeout();
            });

            // Handle mouseleave on tooltip
            EventHandler.on(tipElement, 'mouseleave', () => {
                this._isTooltipHovered = false;
                this._scheduleHide();
            });
        });
    }

    _scheduleHide() {
        if (this._hideTimeout) {
            this._clearHideTimeout();
        }

        this._hideTimeout = setTimeout(() => {
            if (!this._isTriggerHovered && !this._isTooltipHovered) {
                this.hide();
                this._hideTimeout = null;
            }
        }, 100); // 100ms delay
    }

    _clearHideTimeout() {
        if (this._hideTimeout) {
            clearTimeout(this._hideTimeout);
            this._hideTimeout = null;
        }
    }

    static defaultTooltipTemplate = `
        <div class="tooltip" role="tooltip">
            <div class="${CLASS_TOOLTIP_CONTAINER}">
                <div class="tooltip-arrow"></div>
                <div class="tooltip-inner"></div>
            </div>
        </div>
    `;

    static _isInteractive = (element) => element.getAttribute('data-bs-interactive') !== null;

    // Automatically register the component upon class definition
    static {
        DynamicObserver.add(this);
    }
}