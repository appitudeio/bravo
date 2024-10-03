import { Modal, ModalNavigation } from "bravo";

const testModal = new Modal({
    title: "Hallå!",
    content: "Här är text!!",
    /*footerButtons: [
        { text: "Cancel", class: "btn-warning" },
        { text: "Submit", type: "submit", class: "btn-danger", name: "submit" }
    ],
    isForm: true*/
});
const childModal = new Modal({
    title: "CHILD!",
    content: "Hejsan här är jag från ett child med lite mer innehåll än min parent, vi får se hur det blir när vi transformeras fram och tillbaka helt nekelt.<br /><br />Vad tycks??"
});
const grandchildModal = new Modal({
    title: "GRANDCHILD!",
    content: "Hejsan ?"
});

const Nav = new ModalNavigation();
Nav.push(testModal);
Nav.show();

setTimeout(() => Nav.push(childModal), 1000);
setTimeout(() => Nav.push(grandchildModal), 3000);

testModal.addEventListener("submit.bs.modal", e => {
    e.preventDefault();

    console.log(e.target);

    alert("SUBMIT");
});