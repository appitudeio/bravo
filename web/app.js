import { Modal } from "bravo";

const testModal = new Modal({
    title: "Hallå!",
    content: "Här är text!!",
    footerButtons: [
        { text: "Cancel", class: "btn-warning" },
        { text: "Submit", type: "submit", class: "btn-danger", name: "submit" }
    ],
    isForm: true
});
testModal.show();


testModal.addEventListener("submit.bs.modal", e => {
    e.preventDefault();

    console.log(e.target);

    alert("SUBMIT");
});