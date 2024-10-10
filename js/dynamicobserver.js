/**
 *  DynamicObserver
 *  - Makes the extending class able to have Live injections events tied to it
 *  E.g: If we have Tooltip with bs-toggle="tooltip", and something gets added dynamically, we want to be able to initialize the tooltip on that element automatically
 *  ( Observes the DOM for newly added elements and initializes registered Bootstrap components. )
 */
import SelectorEngine from 'bootstrap/js/dist/dom/selector-engine';

class DynamicObserver {
    observer = null;
    componentClasses = []; // Stores registered components
    debounceTimer = null;
    debounceDelay = 100; // milliseconds

    constructor() {
        if (DynamicObserver.instance) {
            return DynamicObserver.instance;
        }

        DynamicObserver.instance = this;

        // Automatically start observing upon instantiation
        this.startObserving();
    }

    /**
     * Registers a component based on its selector.
     */
    add(componentClass) {
        const selector = componentClass.selector;

        if (!selector) {
            console.error(`Component ${componentClass.name} must provide a 'selector' via static getter.`);
            return;
        }

       if (this.componentClasses.includes(componentClass)) {
            return;
        }

        this.componentClasses.push(componentClass);

        // Initialize existing elements matching the selector
        SelectorEngine.find(selector).forEach(element => {
            componentClass.getOrCreateInstance(element);
        });
    }

    /**
     * Initializes existing components on the page.
     */
    initializeExisting() {
        this.componentClasses.forEach(componentClass => {
            SelectorEngine.find(componentClass.selector).forEach(element => {
                if (!componentClass.getInstance(element)) { // Check if instance exists
                    componentClass.getOrCreateInstance(element);
                }
            });
        });
    }

    /**
     * Starts observing the DOM for changes.
     * This method is automatically called in the constructor.
     */
    startObserving() {
        // Initialize existing components first
        this.initializeExisting();

        // Set up the MutationObserver for additions
        this.observer = new MutationObserver((mutationsList) => {
            if (this.debounceTimer) clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                mutationsList.forEach(mutation => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                this.initializeNode(node);
                            }
                        });
                    }
                });
            }, this.debounceDelay);
        });

        // Configuration of the observer:
        const config = { childList: true, subtree: true };
        this.observer.observe(document.body, config);

        // Set up disposal handling
        this.setupDisposalHandling();
    }

    /**
     * Sets up MutationObserver for handling component disposals.
     */
    setupDisposalHandling() {
        const disposalObserver = new MutationObserver((mutationsList) => {
            mutationsList.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                    mutation.removedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.disposeNode(node);
                        }
                    });
                }
            });
        });

        const config = { childList: true, subtree: true };
        disposalObserver.observe(document.body, config);
    }

    /**
     * Disposes of component instances within a removed node.
     */
    disposeNode(node) {
        this.componentClasses.forEach(componentClass => {
            const selector = componentClass.selector;

            // Check if the node itself matches the component selector
            if (node.matches(selector)) {
                const instance = componentClass.getInstance(node);
                if (instance) {
                    instance.dispose();
                }
            }

            // Check descendants of the node for matches
            SelectorEngine.find(selector, node).forEach(child => {
                const instance = componentClass.getInstance(child);
                if (instance) {
                    instance.dispose();
                }
            });
        });
    }

    /**
     * Stops observing the DOM.
     */
    stopObserving() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    /**
     * Initializes a single node and its descendants.
     */
    initializeNode(node) {
        this.componentClasses.forEach(componentClass => {
            const selector = componentClass.selector;

            // Check if the node itself matches the component selector
            if (node.matches(selector)) {
                if (!componentClass.getInstance(node)) { // Check if instance exists
                    componentClass.getOrCreateInstance(node);
                }
            }

            // Check descendants of the node for matches
            SelectorEngine.find(selector, node).forEach(child => {
                if (!componentClass.getInstance(child)) { // Check if instance exists
                    componentClass.getOrCreateInstance(child);
                }
            });
        });
    }

    /**
     * Retrieves the singleton instance.
     */
    static getInstance() {
        if (!DynamicObserver.instance) {
            DynamicObserver.instance = new DynamicObserver();
        }

        return DynamicObserver.instance;
    }
}

const dynamicObserver = DynamicObserver.getInstance();
export default dynamicObserver;