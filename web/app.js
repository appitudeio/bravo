import { Modal, ModalNavigation } from "bravo";

const testModal = new Modal({
    title: "Hallå!",
    content: "Hejsan ? Hejsan här är jag från ett child med lite mer <button rel='child' class='btn btn-warning'>Rel child</button> innehåll än min parent, vi får se hur det blir när vi transformeras fram och tillbaka helt nekelt.<br /><br />Vad tycks?? Hejsan här är jag från ett child med lite mer innehåll än min parent, vi får se hur det blir när vi transformeras fram och tillbaka helt nekelt.<br /><br />Vad tycks??",
    footerButtons: [
        { text: "Stäng", class: "btn-light" }
    ],
    isForm: true,
   /* closeButton: {
        disabled: true
    }*/
});
const childModal = new Modal({
    id: "child",
    title: "CHILD!",
    content: "NNNNed är jag från ett child med lite mer innehåll än min parent, vi får se hur det blir när vi transformeras fram o?",
    footerButtons: [
        { text: "Lnapp" }
    ]
});
const grandchildModal = new Modal({
    title: "GRANDCHILD!",
    content: "Hejsan ? Hejsan här är jag från ett child med lite mer innehåll än min parent, vi får se hur det blir när vi transformeras fram och tillbaka helt nekelt.<br /><br />Vad tycks?? Hejsan här är jag från ett child med lite mer innehåll än min parent, vi får se hur det blir när vi transformeras fram och tillbaka helt nekelt.<br /><br />Vad tycks??"
});

const Nav = new ModalNavigation({
   animation: "morph",
   closeButton: {
    disabled: true
   },
   /*backButton: {
    disabled: true
   }*/
});
Nav.push(testModal);
Nav.addEventListener("close.bs.nav", e => {
    e.stack.forEach(modal => modal.remove());
});
//Nav.show();

//setTimeout(() => Nav.push(childModal), 1000);

/*setTimeout(() => Nav.push(grandchildModal), 3000);

testModal.addEventListener("submit.bs.modal", e => {
    e.preventDefault();

    console.log(e.target);

    alert("SUBMIT");
});*/