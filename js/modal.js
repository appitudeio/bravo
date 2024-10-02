/**
 *  Bootstrap's modal is awesome, but misses some functionality.
 *  - inline generation
 *  - transitions / navigation
 * 
 *  Provide footerButtons or headerButtons:
 *  - { text: "Cancel", className: "btn-secondary", name: "dismiss" }
 */
import BootstrapModal from "bootstrap/js/dist/modal";
import EventHandler from "bootstrap/js/dist/dom/event-handler";

const EVENT_KEY = `.bs.modal`;
const EVENT_SUBMIT = `submit${EVENT_KEY}`;

export default class Modal extends BootstrapModal {
    constructor(elementOrOptions) {
        let modalElement;
        
        if (typeof elementOrOptions === 'object') {
            modalElement = Modal.generate(elementOrOptions);
        } else if (typeof elementOrOptions === 'string') {
            modalElement = document.getElementById(elementOrOptions);
            if (!modalElement) {
                throw new Error("Element not found.");
            }
        } else {
            throw new Error("Invalid parameter: Must provide an element ID or options object.");
        }

        // Call the parent constructor with the modal element
        super(modalElement);

        // Register callbacks
        this.registerEventListeners();
    }

    addEventListener(...props)
    {
        this._element.addEventListener(...props)
    }

    registerEventListeners() {
        // On closing this generatedModal - remove it
        EventHandler.on(this._element, 'hidden.bs.modal', () => this._element.remove());

        // If a form is included
        this._element.querySelectorAll('form').forEach(_form => _form.addEventListener('submit', (e) => {
            // Trigger submit-event
            const submitEvent = EventHandler.trigger(this._element, EVENT_SUBMIT, { target: e.target });

            // After triggering, check if the event was prevented
            if (submitEvent.defaultPrevented) {
                e.preventDefault(); // Prevent the default form submission only if requested
            }
        }));
    }

    static generate(options = {}) {
        const {
            title = '',
            content = '',
            footerButtons = [], // Array of footer button configurations
            headerButtons = [], // Array of header button configurations
            isForm = false,
            isStatic = false,
            size = 'md',
            animation = 'fade'
        } = options;
        let className = options['class'] ?? "";

        const randomId = `modal-${Math.random().toString(36).slice(2, 9)}`;
        const modalHTML = modalTemplate(randomId, title, content, footerButtons, headerButtons, isForm, className, isStatic, size, animation);
        const modalFragment = document.createRange().createContextualFragment(modalHTML);

        document.body.append(modalFragment);
        let modalElement = document.querySelector(`#${randomId}`);
        
        return modalElement;
    }
}

const modalTemplate = (id, title, content, footerButtons, headerButtons, isForm, className, isStatic, size, animation) => {
    const sizeClass = size === 'sm' ? 'modal-sm' : size === 'lg' ? 'modal-lg' : 'modal-md'; // Default to medium
    const animationClass = animation ? ` ${animation}` : '';

    return `
        <div id="${id}" class="modal${animationClass} ${className}" tabindex="-1" role="dialog" ${isStatic ? "data-bs-backdrop='static'" : ""}>
            <div class="modal-dialog ${sizeClass} modal-dialog-centered" role="document">
                <div class="modal-content">
                    ${isForm ? `<form method="post">` : ""}

                    ${modalHeader(title, headerButtons)}

                    <div class="modal-body">${content}</div>

                    ${modalFooter(footerButtons)}

                    ${isForm ? `</form>` : ""}
                </div>
            </div>
        </div>
    `;
};

const modalHeader = (title, buttons = []) => {
    const buttonElements = buttons.map(button => {
        const buttonAttributes = Object.keys(button)
            .filter(key => key !== 'text' && key !== 'class')
            .map(key => `${key}="${button[key]}"`)
            .join(' ');

        return `
            <button class="btn ${button.class ? button.class : "btn-secondary"}" ${buttonAttributes}>
                ${button.text}
            </button>
        `;
    }).join('');

    return title ? `
        <div class="modal-header">
            <h5 class="modal-title">${title}</h5>

            <div class="modal-header-buttons">
                ${buttonElements}

                <button type="button" class="btn btn-secondary btn-icon" data-bs-dismiss="modal" aria-label="Close">X</button>
            </div>
        </div>
    ` : "";
}

const modalFooter = (buttons = []) => {
    const buttonElements = buttons.map(button => {
        // Generate attributes string excluding the "text" property
        button.type = button.type ?? "button";
        const buttonAttributes = Object.keys(button)
            .filter(key => key !== 'text' && key !== 'class')
            .map(key => `${key}="${button[key]}"`);

        const buttonClass = button.class || (button.type === "submit" ? "btn-primary" : "btn-secondary");

        // If the button does not have a name, set up to dismiss the modal
        if(!button.name) {
            buttonAttributes.push(`data-bs-dismiss="modal"`)
        }

        return `
            <button class="btn ${buttonClass}" ${buttonAttributes.join(" ")}>
                ${button.text}
            </button>
        `;
    }).join('');

    return buttons.length > 0 ? `<div class="modal-footer">${buttonElements}</div>` : "";
};