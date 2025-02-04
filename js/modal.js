/**
 *  Bootstrap's modal is awesome, but misses some functionality.
 *  - inline generation
 *  - transitions / navigation
 * 
 *  Provide footerButtons or headerButtons:
 *  - { text: "Cancel", class: "btn-secondary", name: "dismiss" }
 */
import BootstrapModal from "bootstrap/js/dist/modal";
import EventHandler from "bootstrap/js/dist/dom/event-handler";
import ModalNavigation from "./modal-navigation";
import { merge } from "./functions";

const EVENT_KEY = `.bs.modal`;
const EVENT_SUBMIT = `submit${EVENT_KEY}`;

class Modal extends BootstrapModal {
    constructor(elementOrOptions) {
        let modalElement;
        let options = {};
        
        if (typeof elementOrOptions === 'string') {
            modalElement = document.getElementById(elementOrOptions);
            if (!modalElement) {
                throw new Error("Element not found.");
            }
        }
        else if (elementOrOptions instanceof HTMLElement) {
            // Case 2: elementOrOptions is an HTMLElement
            modalElement = elementOrOptions;
        }
        else if (typeof elementOrOptions === 'object') {
            modalElement = Modal.generate(elementOrOptions);
            options = elementOrOptions.options || {};
        }
        else {
            throw new Error("Invalid parameter: Must provide an element ID or options object.");
        }

        // Call the parent constructor with the modal element
        super(modalElement, options);

        // Register callbacks
        this.registerEventListeners();
    }

    addEventListener(...props) {
        this._element.addEventListener(...props)
    }

    registerEventListeners() {
        // If a form is included
        this._element.querySelectorAll('form').forEach(_form => _form.addEventListener('submit', (e) => {
            // Trigger submit-event
            const submitEvent = EventHandler.trigger(this._element, EVENT_SUBMIT, { target: _form }); //e.target });

            // After triggering, check if the event was prevented
            if (submitEvent.defaultPrevented) {
                e.preventDefault(); // Prevent the default form submission only if requested
            }
        }));
    }

    remove() {
        this._element.remove();
    }

    static generate(options = {}) {
        const {
          id = `modal-${Math.random().toString(36).slice(2, 9)}`,
          title = '',
          header = '',
          content = '',
          footerButtons = [], // Array of footer button configurations
          headerButtons = [], // Array of header button configurations
          isForm = false,
          isStatic = false,
          size = 'lg',
          animation = 'fade',
          scrollable = false,
          closeButton = {
            disabled: false,
            text: "" // &times;
          },
          backButton = {
            disabled: false,
            text: "" // &larr;
          }
        } = options;
        let className = options['class'] ?? "";

        const Template = new ModalTemplate(options);

        const modalHTML = Template.generate(id, { title, header }, content, footerButtons, headerButtons, isForm, className, isStatic, size, animation, scrollable);
        const modalFragment = document.createRange().createContextualFragment(modalHTML);

        document.body.append(modalFragment);
        let modalElement = document.querySelector(`#${id}`);
        
        return modalElement;
    }
}

/**
 *  Generates the html for a modal
 */
class ModalTemplate {
    options = {
        closeButton: {
            disabled: false,
            text: "" // &times;
        },
        backButton: {
            disabled: false,
            text: "" // &larr;
        }
    }

    constructor(options) {
        this.options = merge(this.options, options);
    }

    generate = (id, headerObj, content, footerButtons, headerButtons, isForm, className, isStatic, size, animation, scrollable) => {
        const sizeClass = (size) ? `modal-${size}` : ""; // Without size, the modal will default to Medium (md)
        const animationClass = animation ? ` ${animation}` : '';

        return `
            <div id="${id}" class="modal${animationClass} ${className}" tabindex="-1" role="dialog" ${isStatic ? "data-bs-backdrop='static'" : ""}>
                <div class="modal-dialog ${sizeClass} modal-dialog-centered${scrollable && ` modal-dialog-scrollable`}" role="document">
                    <div class="modal-content">
                        ${isForm ? `<form method="post">` : ""}

                            ${this.header(headerObj, headerButtons, isStatic)}

                                <div class="modal-body">${content}</div>

                            ${this.footer(footerButtons)}

                        ${isForm ? `</form>` : ""}
                    </div>
                </div>
            </div>
        `;
    }

    header = (headerObj, buttons = [], isStatic = false) => {
        const { title, header } = headerObj;

        let headerHTML = "";

        if (header) {
            headerHTML += header;
        } 
        else if (title) {
            headerHTML += `
                <h4 class="modal-title">${title}</h4>
            `;
        }

        const buttonElements = buttons.map(button => {
            if(typeof button === "string") {
                return button;
            }

            const buttonAttributes = Object.keys(button)
                .filter(key => key !== 'text' && key !== 'class')
                .map(key => `${key}="${button[key]}"`)
                .join('');

            return `
                <button class="btn ${ac.class ? button.class : "btn-secondary"}" ${buttonAttributes}>
                    ${button.text}
                </button>
            `;
        }).join('');

        if (buttonElements || !this.options.closeButton.disabled) {
            headerHTML += buttonElements;

            if (!this.options.closeButton.disabled || !isStatic) {
                headerHTML += this.closeButton().outerHTML;
            }
        }

        return (headerHTML != "") ? `
            <div class="modal-header">
                ${headerHTML}
            </div>
        ` : "";
    }

    footer = (buttons = []) => {
        const buttonElements = buttons.map(button => {
            if(typeof button === "string") {
                return button;
            }

            // Generate attributes string excluding the "text" property
            button.type = button.type ?? "button";
            const buttonAttributes = Object.keys(button)
                .filter(key => key !== 'text' && key !== 'class')
                .map(key => `${key}="${button[key]}"`);

            const buttonClass = button.class || (button.type === "submit" ? "btn-primary" : "btn-default");

            // If the button does not have a name, set up to dismiss the modal
            if(!button.name && !button.rel) {
                buttonAttributes.push(`data-bs-dismiss="modal"`)
            }

            return `
                <button class="btn ${buttonClass}" ${buttonAttributes.join(" ")}>
                    ${button.text}
                </button>
            `;
        }).join('');

        return buttons.length > 0 ? `<div class="modal-footer">${buttonElements}</div>` : "";
    }

    closeButton = () => {
        let closeBtn = document.createElement("button");
        closeBtn.innerHTML = this.options.closeButton.text;
        closeBtn.setAttribute("rel", "close");
        closeBtn.setAttribute("type", "button");
        closeBtn.classList.add("btn", "btn-sm", "btn-default", "btn-icon", "btn-rounded");
        closeBtn.dataset.bsDismiss = "modal";

        return closeBtn;
    }

    backButton = (_cb) => {
        let backButton = document.createElement("button");
        backButton.innerHTML = this.options.backButton.text;
        backButton.setAttribute("rel", "back");
        backButton.setAttribute("type", "button");
        backButton.classList.add("btn", "btn-sm", "btn-default", "btn-icon", "btn-rounded");
        backButton.addEventListener("click", e => {
            e.preventDefault();
            backButton.blur();

            if(typeof _cb == "function") {
                _cb();
            }
        });

        return backButton;
    }
}

export default Modal;
export { 
    ModalNavigation,
    ModalTemplate
};