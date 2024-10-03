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
import { merge } from "./functions";

const EVENT_KEY = `.bs.modal`;
const EVENT_SUBMIT = `submit${EVENT_KEY}`;
const CLASS_NAVIGATION = "modal-navigation";
const CLASS_NAVIGATION_HAS_STACK = "modal-navigation-stacked";
const CLASS_NAVIGATION_TRANSITION = "modal-animation-transition";
const CLASS_NAVIGATION_TRANSITION_IN = "modal-animation-transition-in"
const CLASS_NAVIGATION_BACK = "modal-animation-direction-back";
const CLASS_NAVIGATION_FORWARD = "modal-animation-direction-forward";

class Modal extends BootstrapModal {
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
        EventHandler.on(this._element, 'hidden.bs.modal', () => {
            this._element.remove();
        });

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
            animation = 'fade',
            closeButton = {
                text: "&times",
                disabled: false
            }
        } = options;
        let className = options['class'] ?? "";

        const Template = new ModalTemplate(options);

        const randomId = `modal-${Math.random().toString(36).slice(2, 9)}`;
        const modalHTML = Template.generate(randomId, title, content, footerButtons, headerButtons, isForm, className, isStatic, size, animation);
        const modalFragment = document.createRange().createContextualFragment(modalHTML);

        document.body.append(modalFragment);
        let modalElement = document.querySelector(`#${randomId}`);
        
        return modalElement;
    }
}

/**
 *  
 */
class Navigation {
    Modal;
    Template;
    options = {
        animation: "slide",
        backButton: {
            text: "&larr;",
            disabled: false
        },
        closeButton: {
            text: "&times;",
            disabled: false
        }
    };
    stack = [];

    constructor(options = {})
    {
        this.options = merge(
            this.options,
            options
        );
        this.Template = new ModalTemplate(this.options);
    }

    setBaseModal(modal) {
        this.Modal = modal;
        this.Modal._element.classList.add(CLASS_NAVIGATION);
        
        EventHandler.on(this.Modal._element, 'hidden.bs.modal', () => {
            this.closeNavigation();
        });
    }

    /**
     * 
     */
    push(childModal) {
        // Use the first modal as the 'base'
        if(this.stack.length == 0) {
            this.setBaseModal(childModal);
        }

		this.stack.push([
			childModal._element.querySelector(".modal-header").cloneNode(true),
			childModal._element.querySelector(".modal-body").cloneNode(true),
			childModal._element.querySelector(".modal-footer")?.cloneNode(true)
		]);

        if(this.stack.length > 1) {
            return new Promise(resolve => {
                this.replace(this.stack[this.stack.length - 1]).then(resolve);
            });
        }

        return new Promise(resolve => resolve());
    }

    /**
     *  
     */
    pop() {
		let currentStack = this.stack.pop(); // Remove last added modal
        const prevStack = this.stack[this.stack.length - 1]; // Revert back to the prevous stack

		this.replace(prevStack, true).then(() => {
			currentStack = null;
		});
    }

    closeNavigation() {
        this.stack = [];
    }

    show() {
        this.Modal.show();
    }

    close() {
        this.Modal.hide();
        this.closeNavigation();
    }

    /**
     *  Actually inject the content (header, body, footer)
     */
	replace(to, _back = false)
	{
        const [ newHeader, newBody, newFooter ] = to;
        const animationObj = animationsMap[this.options.animation] ?? animationsMap.slide;
        const Animation = new animationObj(this.Modal, to);

        return new Promise(resolve => {
            Animation.out(_back).then(() => {
                this.handleHeader(newHeader);
                this.handleBody(newBody);
                this.handleFooter(newFooter);

                return Animation.in(_back);
            }).then(() => {
                this.handleBackButton();
                resolve()
            });

            // Handle the backbutton no matter what type of animation we are running
            this.updateBackButton();
        });
	}

    handleHeader(newHeader) {
        const currentContainer = this.Modal._element.parentNode;
        const currentHeader = this.Modal._element.querySelector(".modal-header");

        if(newHeader) {
            if(currentHeader) {
                this.setHeader(newHeader);
            }
            else {
                currentContainer.prepend(
                    this.setHeader(newHeader)
                );
            }
        }
        else if(currentHeader) {
            currentHeader.remove();
        }
    }

    handleBody(newBody) {
        this.setBody(newBody);
    }

    handleFooter(newFooter) {
        const currentContainer = this.Modal._element.parentNode;
        const currentFooter = this.Modal._element.querySelector(".modal-footer");

        if(newFooter) {
            if(currentFooter) {
                this.setFooter(newFooter);
            }
            else {
                currentContainer.append(
                    this.setFooter(newFooter)
                );
            }
        }
        else if(currentFooter) {
            currentFooter.remove();
        }
    }

    updateBackButton() {
        const modalHeader = this.Modal._element.querySelector(".modal-header");
        const backButton = modalHeader?.querySelector("button[rel=back]") ?? null;
        const shouldHaveBackButton = (this.stack.length > 1 && (this.options.backButton.disabled == undefined || this.options.backButton.disabled === false) && this.stack.length > 1) ? true : false;
        
        // If rootModal
        if (this.stack.length === 1) {
            this.Modal._element.classList.remove(CLASS_NAVIGATION_HAS_STACK);
        } 
        else {
            if(modalHeader && !backButton && shouldHaveBackButton) {
                modalHeader.prepend(this.Template.backButton(() => this.pop()));
            }

            setTimeout(() => this.Modal._element.classList.add(CLASS_NAVIGATION_HAS_STACK), 1);
        }
    }

    handleBackButton() {
        const modalHeader = this.Modal._element.querySelector(".modal-header");
        const backButton = modalHeader?.querySelector("button[rel=back]");

        if(backButton && this.stack.length === 1) {
            backButton.remove()
        }
    }

    setBody(newBody) {
        this.Modal._element.querySelector(".modal-body").innerHTML = newBody.innerHTML;
    }

    setHeader(newHeader) {
        const shouldHaveBackButton = (this.stack.length > 1 && (this.options.backButton.disabled == undefined || this.options.backButton.disabled === false) && this.stack.length > 1) ? true : false;
        const shouldHaveCloseButton = (this.options.closeButton.disabled == undefined || this.options.closeButton.disabled === false) ? true : false;

        let header = this.Modal._element.querySelector(".modal-header"); // If current header
        let h5;
        let backButton;
        let closeButton;

        // Use existing Header
        if(header) {
            h5 = header.querySelector("h5");
            backButton = header.querySelector("button[rel=back]");
            closeButton = header.querySelector("button[rel=close]");

            if(!backButton && shouldHaveBackButton) {
                header.prepend(this.Template.backButton(() => this.pop()));
            }
        }
        else {
            // Create new header
            header = document.createElement("div");
            h5 = document.createElement("h5");
            backButton = this.Template.backButton(() => this.pop());
            closeButton = this.Template.closeButton();
    
            header.classList.add("modal-header");
            h5.classList.add("modal-title");    
        
            if(shouldHaveBackButton) {
                header.append(backButton);
            }

            header.append(h5);

            if(shouldHaveCloseButton) {
                header.append(closeButton);
            }       
        }

        h5.innerHTML = newHeader.querySelector("h5").innerHTML ?? "";

        return header;
    }

    setFooter(footerContent) {
        let footer = document.createElement("div");
        footer.classList.add("modal-footer");
        footer.innerHTML = footerContent;

        return footer;
    }
}

class ModalTemplate {
    options = {
        closeButton: {
            disabled: false,
            text: "&times"
        },
        backButton: {
            disabled: false,
            text: "&larr;"
        }
    }

    constructor(options) {
        this.options = merge(this.options, options);
    }

    generate = (id, title, content, footerButtons, headerButtons, isForm, className, isStatic, size, animation) => {
        const sizeClass = size === 'sm' ? 'modal-sm' : size === 'lg' ? 'modal-lg' : 'modal-md'; // Default to medium
        const animationClass = animation ? ` ${animation}` : '';

        return `
            <div id="${id}" class="modal${animationClass} ${className}" tabindex="-1" role="dialog" ${isStatic ? "data-bs-backdrop='static'" : ""}>
                <div class="modal-dialog ${sizeClass} modal-dialog-centered" role="document">
                    <div class="modal-content">
                        ${isForm ? `<form method="post">` : ""}

                        ${this.header(title, headerButtons)}

                        <div class="modal-body">${content}</div>

                        ${this.footer(footerButtons)}

                        ${isForm ? `</form>` : ""}
                    </div>
                </div>
            </div>
        `;
    }

    header = (title, buttons = []) => {
        const buttonElements = buttons.map(button => {
            const buttonAttributes = Object.keys(button)
                .filter(key => key !== 'text' && key !== 'class')
                .map(key => `${key}="${button[key]}"`)
                .join(' ');

            return `
                <button class="btn ${ac.class ? button.class : "btn-secondary"}" ${buttonAttributes}>
                    ${button.text}
                </button>
            `;
        }).join('');

        return title ? `
            <div class="modal-header">
                <h5 class="modal-title">${title}</h5>

                <div class="modal-header-buttons">
                    ${buttonElements}

                    ${!this.options.closeButton.disabled ? this.closeButton().outerHTML.toString() : ""}
                </div>
            </div>
        ` : "";
    }

    footer = (buttons = []) => {
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
    }

    closeButton = () => {
        let closeBtn = document.createElement("button");
        closeBtn.innerHTML = this.options.closeButton.text;
        closeBtn.setAttribute("rel", "close");
        closeBtn.classList.add("btn", "btn-secondary", "btn-icon", "btn-rounded");
        closeBtn.dataset.bsDismiss = "modal";

        return closeBtn;
    }

    backButton = (_cb) => {
        let backButton = document.createElement("button");
        backButton.innerHTML = this.options.backButton.text;
        backButton.setAttribute("rel", "back");
        backButton.classList.add("btn", "btn-icon", "btn-rounded");
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

class Animation {
    Modal;
    stack;

    constructor(modal, toStack) {
        this.Modal = modal;
        this.stack = toStack;
    }

    out = (directionBack = false, intoModal) => new Promise(resolve => resolve());
    in = (directionBack = false) => new Promise(resolve => resolve());

    /**
     * 
     */
    createFakeModalBody() {
        const [ newHeader, newBody, newFooter] = this.stack;

		newBody.removeAttribute("style");
		const fakeBody = newBody.cloneNode(true);
        fakeBody.style.visibility = "hidden";
        fakeBody.style.zIndex = "-1";

        return fakeBody;
    }

    /**
     * 
     */
    calculateFakeModalBodyHeight(fakeModalBody) {
        this.Modal._element.querySelector(".modal-content").append(fakeModalBody);
        const fakeModalBodyHeight = fakeModalBody.offsetHeight;
        fakeModalBody.remove();

        return fakeModalBodyHeight;
    }

    getAnimationDuration = (element) => {
        let computedStyle = getComputedStyle(element ?? this.Modal._element.querySelector(".modal-body"));
        return parseFloat(
            computedStyle['animation-duration'] ??
            computedStyle['transition-duration']
        ) * 1000;
    }
}

class ModalNavigationTransitionSlide extends Animation {
    className = "modal-animation-slide";

    out = (directionBack = false) => new Promise(resolve => {
        const animationDirection = (directionBack) ? CLASS_NAVIGATION_BACK : CLASS_NAVIGATION_FORWARD;

        // 1) Set current height of the Modal body
        const ModalBody = this.Modal._element.querySelector(".modal-body");
        const currentBodyHeight = ModalBody.offsetHeight;
        ModalBody.style.height = `${currentBodyHeight}px`;

        // 2) Calculate the new height
        const hiddenFakeBody = this.createFakeModalBody();
        const hiddenFakeBodyHeight = this.calculateFakeModalBodyHeight(hiddenFakeBody);

        // 3) Start the animation w setting the animation class
        this.Modal._element.classList.add(this.className, CLASS_NAVIGATION_TRANSITION, animationDirection);
        ModalBody.style.height = `${hiddenFakeBodyHeight}px`;

        const transitionDuration = this.getAnimationDuration();

        setTimeout(() => resolve(), transitionDuration);
    });

    in = (directionBack) => new Promise(resolve => {
        const animationDirection = (directionBack) ? CLASS_NAVIGATION_BACK : CLASS_NAVIGATION_FORWARD;
		const animationOpositeDirection = (directionBack) ? CLASS_NAVIGATION_FORWARD : CLASS_NAVIGATION_BACK;  

        // 1) Animate in the new content
        this.Modal._element.classList.add(animationOpositeDirection);
        this.Modal._element.classList.add(CLASS_NAVIGATION_TRANSITION_IN);
        this.Modal.handleUpdate(); // Adjust modal size

        const transitionDuration = this.getAnimationDuration();

        // Everything's done
        setTimeout(() => {
            // Clear all classes that trigger transitions
            [ Animation.className, CLASS_NAVIGATION_TRANSITION, CLASS_NAVIGATION_TRANSITION_IN, animationDirection, animationOpositeDirection ].forEach(c => this.Modal._element.classList.remove(c));

            // Remove height on the body
            this.Modal._element.querySelector(".modal-body").removeAttribute("style");

            resolve();
        }, transitionDuration);
    });
}

class ModalNavigationTransitionMorph extends Animation {
    className = "modal-animation-morph";
    heightMultiplyer = .85;

    out = (directionBack = false) => new Promise(resolve => {
        // 1) Set current height of the Modal body
        const ModalBody = this.Modal._element.querySelector(".modal-body");
        const currentBodyHeight = ModalBody.offsetHeight;
        ModalBody.style.height = `${currentBodyHeight}px`;
        
        // 2) Start the animation w setting the animation class
        this.Modal._element.classList.add(this.className, CLASS_NAVIGATION_TRANSITION);

        setTimeout(() => ModalBody.style.height = `${currentBodyHeight * this.heightMultiplyer}px`, 10);

        const transitionDuration = this.getAnimationDuration();

        setTimeout(() => resolve(), transitionDuration);
    });

    in = (directionBack) => new Promise(resolve => {
        // 1) Calculate the new height to be
        const hiddenFakeBody = this.createFakeModalBody();
        const hiddenFakeBodyHeight = this.calculateFakeModalBodyHeight(hiddenFakeBody);

        // 2) Animate in the new content
        this.Modal._element.classList.add(CLASS_NAVIGATION_TRANSITION_IN);
        this.Modal._element.querySelector(".modal-body").style.height = `${hiddenFakeBodyHeight}px`;
        this.Modal.handleUpdate(); // Adjust modal size

        const transitionDuration = this.getAnimationDuration();

        // Everything's done
        setTimeout(() => {
            // Clear all classes that trigger transitions
            [ Animation.className, CLASS_NAVIGATION_TRANSITION, CLASS_NAVIGATION_TRANSITION_IN ].forEach(c => this.Modal._element.classList.remove(c));

            // Remove height on the body
            this.Modal._element.querySelector(".modal-body").removeAttribute("style");

            resolve();
        }, transitionDuration);
    });    
}

const animationsMap = {
    slide: ModalNavigationTransitionSlide,
    morph: ModalNavigationTransitionMorph
};

export default Modal;
export { Navigation as ModalNavigation };