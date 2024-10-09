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
    }

    _initializeLoader() {
        this.originalContent = this._element.innerHTML;
        this.loadingText = this._element.getAttribute('data-bs-loader-text') || "";
    }

    showLoader() {
        const spinner = this.createSpinner();

        this._element.innerHTML = "";
        this._element.appendChild(spinner);

        // Insert loading text if specified
        if (this.loadingText.trim() !== "") {
            const loadingTextNode = document.createTextNode(this._loadingText);
            spinner.classList.add("me-2");
            this._element.appendChild(loadingTextNode);
            this._element.setAttribute('aria-label', this._loadingText);
        }
        else {
            this._element.setAttribute('aria-label', 'Loading...');
        }

        // Optionally, add a class to indicate loading state for additional styling
        this._element.classList.add(CLASS_LOADING);
        this._element.setAttribute('aria-busy', 'true'); // Update ARIA attributes for accessibility

        // Disable the button to prevent multiple clicks
        this._element.disabled = true;
    }

    hideLoader() {
        // Restore to original content
        this._element.innerHTML = this._originalContent;
        this._element.disabled = false;
        this._element.classList.remove(CLASS_LOADING);

        // Remove ARIA attributes
        this._element.removeAttribute('aria-busy');
        this._element.removeAttribute('aria-label');
    }

    createSpinner() {
        const spinner = document.createElement('span');
        spinner.classList.add('spinner-border', 'spinner-border-sm');
        spinner.setAttribute('role', 'status');
        spinner.setAttribute('aria-hidden', 'true');

        return spinner;
    }
}

// Automatically initialize dropdowns with data attributes on page load
SelectorEngine.find('[data-bs-toggle="button"]').forEach((buttonElement) => {
    buttonElement.getOrCreateInstance(buttonElement);
});