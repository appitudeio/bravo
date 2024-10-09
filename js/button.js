/**
 *  Let's add a loader functionality to the Bootstrap's button component
 */
import BootstrapButton from "bootstrap/js/dist/button";
import SelectorEngine from 'bootstrap/js/dist/dom/selector-engine';

const CLASS_LOADING = "loading";

class Button extends BootstrapButton {
    originalContent;
    loadingText;
    spinner;

    constructor(element, config) {
        super(element, config);
        this._initializeLoader();

        /** 
         *  This makes it possible to select the button in the DOM and call these functions directly w/o getOrCreateInstance
         */
        this._element.showLoader = this.showLoader.bind(this);
        this._element.hideLoader = this.hideLoader.bind(this);
    }

    _initializeLoader() {
        this.originalContent = this._element.innerHTML;
        this.loadingText = (this._element.getAttribute('data-bs-loader').trim().toLowerCase() != "true") ? this._element.getAttribute('data-bs-loader') : "";
    }

    showLoader() {
        if(!this.spinner) {
            this.spinner = this.createSpinner();
        }

        this._element.innerHTML = "";
        this._element.appendChild(this.spinner);

        // Insert loading text if specified
        let _loadingText = (this.loadingText !== "") ? this.loadingText : "Loading...";
        const loadingTextNode = this.createLoaderText(_loadingText);

        if (this.loadingText === "") {
            loadingTextNode.classList.add("visually-hidden");
        }

        this._element.appendChild(loadingTextNode);
        this._element.appendChild(document.createTextNode("\u00A0")); // Inject an empty character so the btn holds it's height
        this._element.setAttribute('aria-label', _loadingText);

        // Optionally, add a class to indicate loading state for additional styling
        this._element.classList.add(CLASS_LOADING);
        this._element.setAttribute('aria-busy', 'true'); // Update ARIA attributes for accessibility

        // Disable the button to prevent multiple clicks
        this._element.disabled = true;
    }

    hideLoader() {
        if (!this._element.classList.contains(CLASS_LOADING)) {
            return;
        }
        
        this.spinner.remove();
        this.spinner = null;

        // Restore to original content
        this._element.innerHTML = this.originalContent;
        this._element.classList.remove(CLASS_LOADING);
        this._element.disabled = false;

        // Remove ARIA attributes
        this._element.removeAttribute('aria-busy');
        this._element.removeAttribute('aria-label');
    }

    createSpinner() {
        const spinner = document.createElement('span');
        spinner.classList.add('spinner-border', 'spinner-border-sm');
        spinner.setAttribute('aria-hidden', 'true');

        return spinner;
    }

    createLoaderText(text) {
        const loaderText = document.createElement('span');
        loaderText.setAttribute('role', 'status');
        loaderText.classList.add('ms-2'); // margin-start
        loaderText.textContent = text;

        return loaderText;
    }
}

// Automatically initialize dropdowns with data attributes on page load
SelectorEngine.find('[data-bs-loader]').forEach((buttonElement) => {
    Button.getOrCreateInstance(buttonElement);
});