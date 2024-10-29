/**
 *  Bootstrap's modal is awesome, but misses some functionality.
 *  - inline generation
 *  - transitions / navigation
 * 
 *  Provide footerButtons or headerButtons:
 *  - { text: "Cancel", class: "btn-secondary", name: "dismiss" }
 */
import EventHandler from "bootstrap/js/dist/dom/event-handler";
import ModalObj, { ModalTemplate } from "./modal";
import { merge } from "./functions";

const EVENT_KEY = `.bs.modal`;
const EVENT_HIDE = `hide${EVENT_KEY}`;
const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
const EVENT_SHOWN = `shown${EVENT_KEY}`
const EVENT_NAV_CLOSE = "close.bs.nav";
const EVENT_NAV_OPEN = "open.bs.nav";
const EVENT_NAV_OPENED = "opened.bs.nav";
const EVENT_NAV_BACK = "back.bs.nav";
const EVENT_NAV_FORWARD = "forward.bs.nav";
const CLASS_NAVIGATION = "modal-navigation";
const CLASS_NAVIGATION_HAS_STACK = "modal-navigation-stacked";
const CLASS_NAVIGATION_TRANSITION = "modal-animation-transition";
const CLASS_NAVIGATION_TRANSITION_IN = "modal-animation-transition-in"
const CLASS_NAVIGATION_BACK = "modal-animation-direction-back";
const CLASS_NAVIGATION_FORWARD = "modal-animation-direction-forward";
const STATE_OPENED = "open";
const STATE_CLOSED = "closed";

/**
 *  
 */
const modalNavigationMap = new WeakMap();

class Navigation {
    Modal;
    Template;
    Animation;
    options = {
        animation: "slide",
        backButton: {
            text: "", // &larr;
            disabled: false
        },
        closeButton: {
            text: "", // &times;
            disabled: false
        }
    };
    stack = [];
    refs = {};
    events = {};
    state = STATE_CLOSED;

    constructor(options = {}) {
        this.options = merge(
            this.options,
            options
        );
        this.Template = new ModalTemplate(this.options);
    }

    setBaseModal(Modal) {
        // Prevent multiple Navigation instances on the same modal
        if (modalNavigationMap.has(Modal._element)) {
            console.warn("A Navigation instance is already attached to this modal.");
            return;
        }

        this.Modal = Modal;
    
        const animationObj = animationsMap[this.options.animation] ?? animationsMap.slide;
        this.Animation = new animationObj(this.Modal);
    
        this.Modal._element.classList.add(CLASS_NAVIGATION);
        this.Modal._element.classList.add(this.Animation.className);
        
        // Define and store event handlers
        this.events.hidden = () => this.close();
        this.events.shown = () => {
            EventHandler.trigger(document, EVENT_NAV_OPENED, { stack: this.refs });
        };
        this.events.click = (e) => this.relClickEventListener(e);
    
        // Attach event listeners using stored handlers
        EventHandler.on(this.Modal._element, EVENT_HIDDEN, this.events.hidden);
        EventHandler.on(this.Modal._element, EVENT_SHOWN, this.events.shown);
        EventHandler.on(this.Modal._element, "click", "[rel]", this.events.click);

        // Track the Navigation instance
        modalNavigationMap.set(this.Modal._element, this);
    }

    relClickEventListener(e) {
        e.preventDefault();
        const rel = e.target.getAttribute("rel");

        if(rel == "back") {
            this.pop();
        }
        else if (rel == "close") {
            this.Modal.hide();
        }
        else {
            this.findAndPushModal(rel);
        }
    }

    findAndPushModal(reference) {
      // Check if reference starts with . or #
      if (!reference.startsWith('.') && !reference.startsWith('#')) {
        reference = `#${reference}`;
      }

      const modalElement = document.querySelector(reference);

      if(!modalElement) {
        throw new Error(`Invalid modal rel, ${reference} doesnt exist.`);
      }

      const modal = ModalObj.getInstance(modalElement);

      this.push(modal);
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
            childModal._element.querySelector(".modal-header"),
            childModal._element.querySelector(".modal-body"),
            childModal._element.querySelector(".modal-footer"),
            childModal
        ]);

        // So we can close it when the Navigation closes
        if(!this.refs[childModal._element.id]) {
            this.refs[childModal._element.id] = childModal;
        }

        // If closeButton is disabled via the Nav, remove it from the Modal
        if(this.options.closeButton.disabled) {
            childModal._element.querySelector("button[rel=close]")?.remove();
        }

        return new Promise(resolve => {
            if(this.stack.length > 1) {
                this.replace(this.stack[this.stack.length - 1]).then(resolve);

                EventHandler.trigger(document, EVENT_NAV_FORWARD, { stack: this.refs });
            }
            else {
                resolve();
            }
        });
    }

    /**
     *  
     */
    pop() {
        let currentStack = this.stack.pop(); // Remove last added modal

        if(currentStack.id != undefined && this.refs[currentStack.id] != undefined) {
            delete this.refs[currentStack.id];
        }

        // If there was no modal to pop, resolve immediately
        if (!currentStack) {
            return Promise.resolve();
        }

        let prevModalContent = currentStack[3]._element.querySelector(".modal-content");
        let prevStack = this.stack[this.stack.length - 1]; // Revert back to the previous stack

        if (!prevStack) {
            // No previous stack exists, hide the modal
            return new Promise(resolve => {
                EventHandler.trigger(document, EVENT_NAV_BACK, { stack: this.stack });
                this.Modal.hide(); // Assuming you want to hide the modal when stack is empty
                resolve();
            });
        }

        return new Promise(resolve => {
            EventHandler.trigger(document, EVENT_NAV_BACK, { stack: this.stack });
            console.log("prevStack", prevStack);
            console.log("currentStack", currentStack);
            EventHandler.trigger(currentStack[3]._element, EVENT_HIDE);

            this.replace(prevStack, true).then(() => {
                prevModalContent.append(currentStack[0], currentStack[1], currentStack[2]); // Put everything back
                currentStack = null;
                prevStack = null;

                resolve();
            });
        });
    }

    addEventListener(...props) {
        document.addEventListener(...props);
    }

    close() {
        this.state = STATE_CLOSED;

        const pops = [];

        // Use a while loop to ensure all modals are popped sequentially
        while (this.stack.length > 0) {
            pops.push(this.pop());
        }

        Promise.all(pops).then(() => {
            EventHandler.trigger(document, EVENT_NAV_CLOSE, { stack: Object.values(this.refs) });

            // Remove event listeners before cleaning up
            if (this.Modal && this.events) {
                EventHandler.off(this.Modal._element, EVENT_HIDDEN, this.events.hidden);
                EventHandler.off(this.Modal._element, EVENT_SHOWN, this.events.shown);
                EventHandler.off(this.Modal._element, "click", "[rel]", this.events.click);
            }

            // Remove from WeakMap
            if (this.Modal) {
                modalNavigationMap.delete(this.Modal._element);
            }

            this.Modal = null;
        });
    }

    show() {
        this.state = STATE_OPENED;

        EventHandler.trigger(document, EVENT_NAV_OPEN, { stack: this.stack });

        this.Modal.show();
    }

    /**
     *  Actually inject the content (header, body, footer)
     */
	replace(to, _back = false) {
        const [ newHeader, newBody, newFooter ] = to;

        return new Promise(resolve => {
            if(_back) {
                this.setStackClass();
            }

            if(this.state == STATE_CLOSED) {
                this.handleContent(newHeader, newBody, newFooter).then(resolve);
            }
            else {
                this.Animation.from(to).out(_back).then(() => {
                    this.handleContent(newHeader, newBody, newFooter);
                    return this.Animation.in(_back);
                }).then(resolve);
            }
        });
	}

    setStackClass() {
        if (this.stack.length === 1) {
            this.Modal._element.classList.remove(CLASS_NAVIGATION_HAS_STACK);
        } 
        else if(!this.Modal._element.classList.contains(CLASS_NAVIGATION_HAS_STACK)) {
            this.Modal._element.classList.add(CLASS_NAVIGATION_HAS_STACK);
        }
    }

    handleContent(newHeader, newBody, newFooter) {
        this.handleHeader(newHeader);
        this.handleBody(newBody);
        this.handleFooter(newFooter);
        this.setStackClass();

        return new Promise(resolve => resolve());
    }

    handleHeader(newHeader) {
        const currentContainer = this.Modal._element.querySelector(".modal-body").parentNode; // It CAN be a form
        const currentHeader = this.Modal._element.querySelector(".modal-header");
        const shouldHaveBackButton = (this.stack.length > 1 && (this.options.backButton.disabled == undefined || this.options.backButton.disabled === false) && this.stack.length > 1) ? true : false;
        const backButton = newHeader?.querySelector("button[rel=back]");

        if (newHeader) {
            // If this isnt the RootModal
            if(this.stack.length > 1 && shouldHaveBackButton && !backButton) {
                newHeader.prepend(this.Template.backButton());
            }
            else if(!shouldHaveBackButton && backButton) {
                backButton.remove();
            }

            if(currentHeader) {
                currentContainer.replaceChild(newHeader, currentHeader);
            }
            else {
                currentContainer.append(newHeader);
            }
        } 
        else if(currentHeader) {
            // If there's no new header, remove the existing one
            currentHeader.remove();
        }
    }

    handleBody(newBody) {
        const currentContainer = this.Modal._element.querySelector(".modal-body").parentNode;
        const currentBody = this.Modal._element.querySelector(".modal-body");
        currentContainer.replaceChild(newBody, currentBody);
    }

    handleFooter(newFooter) {
        const currentContainer = this.Modal._element.querySelector(".modal-body").parentNode; // It CAN be a form
        const currentFooter = this.Modal._element.querySelector(".modal-footer");

        if (newFooter) {
            if(currentFooter) {
                currentContainer.replaceChild(newFooter, currentFooter);
            }
            else {
                currentContainer.append(newFooter);
            }
        } 
        else if(currentFooter) {
            // If there's no new footer, remove the existing one
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
                modalHeader.prepend(this.Template.backButton());
            }

            setTimeout(() => this.Modal._element.classList.add(CLASS_NAVIGATION_HAS_STACK), 10);
        }
    }

    handleBackButton() {
        const modalHeader = this.Modal._element.querySelector(".modal-header");
        const backButton = modalHeader?.querySelector("button[rel=back]");

        if(backButton && this.stack.length === 1) {
            backButton.remove()
        }
    }
}

class Animation {
    Modal;
    stack;

    constructor(modal) {
        this.Modal = modal;
    }

    from(toStack) {
        this.stack = toStack;
        return this;
    }

    out = (directionBack = false, intoModal) => new Promise(resolve => resolve());
    in = (directionBack = false) => new Promise(resolve => resolve());

    /**
     * 
     */
    createFakeModalContent() {
        let cssStyle = "visibility: hidden; z-index: -1;";
        const [ newHeader, newBody, newFooter] = this.stack;

		newBody.removeAttribute("style");
        let fakeContainer = document.createElement("div");
        fakeContainer.style.cssText = cssStyle;
		let fakeBody = newBody.cloneNode(true);
        let fakeHeader = newHeader?.cloneNode(true);
        let fakeFooter = newFooter?.cloneNode(true);

        fakeContainer.append(fakeHeader ?? "", fakeBody, fakeFooter ?? "");

        return fakeContainer;
    }

    /**
     * 
     */
    calculateFakeModalHeight(fakeModalContent) {
        const container = this.Modal._element.querySelector(".modal-body").parentNode;
        container.append(fakeModalContent);
        const fakeModalHeight = fakeModalContent.offsetHeight;
        fakeModalContent.remove();

        return fakeModalHeight;
    }

    getAnimationDuration = (element) => {
        let computedStyle = getComputedStyle(element ?? this.Modal._element.querySelector(".modal-body"));
        return parseFloat(
            computedStyle['animation-duration'] ??
            computedStyle['transition-duration']
        ) * 1000;
    }
}

/**
 *  Slide-effect;
 *      iOS-window slide animation
 */
class ModalNavigationTransitionSlide extends Animation {
    className = "modal-animation-slide";

    out = (directionBack = false) => new Promise(resolve => {
        const animationDirection = (directionBack) ? CLASS_NAVIGATION_BACK : CLASS_NAVIGATION_FORWARD;

        // 1) Set current height of the Modal body
        const ModalBody = this.Modal._element.querySelector(".modal-body");
        const ModalContainer = ModalBody.parentNode;
        const currentContainerHeight = ModalContainer.offsetHeight;
        ModalContainer.style.height = `${currentContainerHeight}px`;

        // 2) Calculate the new height
        const hiddenFakeModalHeight = this.calculateFakeModalHeight(
            this.createFakeModalContent()
        );

        // 3) Start the animation w setting the animation class
        this.Modal._element.classList.add(CLASS_NAVIGATION_TRANSITION, animationDirection);
        ModalContainer.style.height = `${hiddenFakeModalHeight}px`;

        const transitionDuration = this.getAnimationDuration();

        setTimeout(() => resolve(), transitionDuration);
    });

    in = (directionBack) => new Promise(resolve => {
        const animationDirection = (directionBack) ? CLASS_NAVIGATION_BACK : CLASS_NAVIGATION_FORWARD;

        // 1) Animate in the new content
        this.Modal._element.classList.add(CLASS_NAVIGATION_TRANSITION_IN);
        this.Modal.handleUpdate(); // Adjust modal size

        const transitionDuration = this.getAnimationDuration();

        // Everything's done
        setTimeout(() => {
            // Clear all classes that trigger transitions
            this.Modal._element.classList.remove(CLASS_NAVIGATION_TRANSITION, CLASS_NAVIGATION_TRANSITION_IN, animationDirection);

            // Remove height on the body
            this.Modal._element.querySelector(".modal-body").parentNode.removeAttribute("style");

            resolve();
        }, transitionDuration);
    });
}

/**
 *  Morhp-effect;
 *      Go from current size to less, then animate to new size
 */
class ModalNavigationTransitionMorph extends Animation {
    className = "modal-animation-morph";
    heightMultiplyer = .85;

    out = (directionBack = false) => new Promise(resolve => {
        // 1) Set current height of the Modal body
        const ModalBody = this.Modal._element.querySelector(".modal-body");
        const ModalContainer = ModalBody.parentNode;
        const currentContainerHeight = ModalContainer.offsetHeight;
        ModalContainer.style.height = `${currentContainerHeight}px`;
        
        // 2) Start the animation w setting the animation class
        this.Modal._element.classList.add(this.className, CLASS_NAVIGATION_TRANSITION);

        setTimeout(() => ModalContainer.style.height = `${currentContainerHeight * this.heightMultiplyer}px`, 10);

        const transitionDuration = this.getAnimationDuration();

        setTimeout(() => resolve(), transitionDuration);
    });

    in = (directionBack) => new Promise(resolve => {
        const ModalBody = this.Modal._element.querySelector(".modal-body");
        const ModalContainer = ModalBody.parentNode;

        // 1) Calculate the new height to be
        const hiddenFakeModalHeight = this.calculateFakeModalHeight(
            this.createFakeModalContent()
        );

        // 2) Animate in the new content
        this.Modal._element.classList.add(CLASS_NAVIGATION_TRANSITION_IN);
        ModalContainer.style.height = `${hiddenFakeModalHeight}px`;

        this.Modal.handleUpdate(); // Adjust modal size

        const transitionDuration = this.getAnimationDuration();

        // Everything's done
        setTimeout(() => {
            // Clear all classes that trigger transitions
            this.Modal._element.classList.remove(Animation.className, CLASS_NAVIGATION_TRANSITION, CLASS_NAVIGATION_TRANSITION_IN);

            // Remove height on the body
            ModalContainer.removeAttribute("style");

            resolve();
        }, transitionDuration);
    });    
}

const animationsMap = {
    slide: ModalNavigationTransitionSlide,
    morph: ModalNavigationTransitionMorph
};

export default Navigation;