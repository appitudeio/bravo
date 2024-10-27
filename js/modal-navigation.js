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
const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
const EVENT_NAV_CLOSE = "close.bs.nav";
const EVENT_NAV_OPEN = "open.bs.nav";
const CLASS_NAVIGATION = "modal-navigation";
const CLASS_NAVIGATION_HAS_STACK = "modal-navigation-stacked";
const CLASS_NAVIGATION_TRANSITION = "modal-animation-transition";
const CLASS_NAVIGATION_TRANSITION_IN = "modal-animation-transition-in"
const CLASS_NAVIGATION_BACK = "modal-animation-direction-back";
const CLASS_NAVIGATION_FORWARD = "modal-animation-direction-forward";

/**
 *  
 */
class Navigation {
    Modal;
    Template;
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

    constructor(options = {}) {
        this.options = merge(
            this.options,
            options
        );
        this.Template = new ModalTemplate(this.options);
    }

    setBaseModal(Modal) {
        this.Modal = Modal;
        this.Modal._element.classList.add(CLASS_NAVIGATION);
        
        EventHandler.on(this.Modal._element, EVENT_HIDDEN, () => this.close());
        EventHandler.on(this.Modal._element, "click", "[rel]", e => this.relClickEventListener(e));
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
            console.log("Base");
        }
        else {
            console.log("New");
            // Update current stack with the current modal (if it's been updated)
            this.stack[this.stack.length - 1][0] = this.Modal._element.querySelector(".modal-header")?.cloneNode(true);
            this.stack[this.stack.length - 1][1] = this.Modal._element.querySelector(".modal-body").cloneNode(true);
            this.stack[this.stack.length - 1][2] = this.Modal._element.querySelector(".modal-footer")?.cloneNode(true);

            console.log(this.stack[this.stack.length - 1][1]);
        }

        this.stack.push([
            childModal._element.querySelector(".modal-header")?.cloneNode(true) ?? null,
            childModal._element.querySelector(".modal-body").cloneNode(true),
            childModal._element.querySelector(".modal-footer")?.cloneNode(true) ?? null,
            childModal
        ]);

        // So we can close it when the Navigation closes
        if(this.refs[childModal._element.id] == undefined) {
            this.refs[childModal._element.id] = childModal;
        }

        // If closeButton is disabled via the Nav, remove it from the Modal
        if(this.options.closeButton.disabled === true) {
            childModal._element.querySelector("button[rel=close]")?.remove();
        }

        return new Promise(resolve => {
            if(this.stack.length > 1) {
                this.replace(this.stack[this.stack.length - 1]).then(resolve);
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
        const prevStack = this.stack[this.stack.length - 1]; // Revert back to the prevous stack

		this.replace(prevStack, true).then(() => {
			currentStack = null;
		});
    }

    addEventListener(...props) {
        document.addEventListener(...props);
    }

    close() {
        EventHandler.trigger(document, EVENT_NAV_CLOSE, { stack: Object.values(this.refs) });

        this.stack = [];
        this.Modal = null;
    }

    show() {
        EventHandler.trigger(document, EVENT_NAV_OPEN, { stack: Object.values(this.refs) });

        this.Modal.show();
    }

    /**
     *  Actually inject the content (header, body, footer)
     */
	replace(to, _back = false) {
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

    setBody(newBody) {
        this.Modal._element.querySelector(".modal-body").innerHTML = newBody.innerHTML;
    }

    setHeader(newHeader) {
        const shouldHaveBackButton = (this.stack.length > 1 && (this.options.backButton.disabled == undefined || this.options.backButton.disabled === false) && this.stack.length > 1) ? true : false;
        const shouldHaveCloseButton = (this.options.closeButton.disabled == undefined || this.options.closeButton.disabled === false) ? true : false;

        let header = this.Modal._element.querySelector(".modal-header"); // If current header
        let newTitle = newHeader.querySelector("h1, h2, h3, h4, h5, h6, .modal-title");

        const createNewTitle = (title) => {
            let el = document.createElement("h4");
            el.classList.add("modal-title");
            el.innerHTML = title;
            return el;
        };
 
        // Use existing Header
        if(header) {
            if(newHeader) {
                header.innerHTML = newHeader.innerHTML;
            }

            let backButton = header.querySelector("button[rel=back]");
 
            if(!backButton && shouldHaveBackButton) {
                header.prepend(this.Template.backButton());
            }
        }
        else {
            // Create new header
            header = document.createElement("div");
            header.classList.add("modal-header");
            
            if(newTitle) {
                header.append(createNewTitle(newTitle.innerHTML));
            }

            if(shouldHaveBackButton) {
                header.prepend(this.Template.backButton());
            }

            if(shouldHaveCloseButton) {
                header.append(this.Template.closeButton());
            }       
        }

        return header;
    }

    setFooter(footerContent) {
        let footer = document.createElement("div");
        footer.classList.add("modal-footer");
        footer.innerHTML = footerContent;

        return footer;
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

        // 1) Animate in the new content
        this.Modal._element.classList.add(CLASS_NAVIGATION_TRANSITION_IN);
        this.Modal.handleUpdate(); // Adjust modal size

        const transitionDuration = this.getAnimationDuration();

        // Everything's done
        setTimeout(() => {
            // Clear all classes that trigger transitions
            this.Modal._element.classList.remove(Animation.className, CLASS_NAVIGATION_TRANSITION, CLASS_NAVIGATION_TRANSITION_IN, animationDirection);

            // Remove height on the body
            this.Modal._element.querySelector(".modal-body").removeAttribute("style");

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
            this.Modal._element.classList.remove(Animation.className, CLASS_NAVIGATION_TRANSITION, CLASS_NAVIGATION_TRANSITION_IN);

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

export default Navigation;