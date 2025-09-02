import Modal, { ModalNavigation } from "bravo/js/modal";
import Dropdown from "bravo/js/dropdown";
import Button from "bravo/js/button";
import Tooltip from "bravo/js/tooltip";

const testModal = new Modal({
    title: "RootModal!",
 //   header: "<div style='width: 100px; height: 50px; background: red; margin: auto;'>HEJ</div>",
    content: "Hejsan ? Hejsan här är jag från ett child med lite mer innehåll än min parent, vi får se hur det blir när vi transformeras fram och tillbaka helt nekelt.<br /><br />Vad tycks?? Hejsan här är jag från ett child med lite mer innehåll än min parent, vi får se hur det blir när vi transformeras fram och tillbaka helt nekelt.<br /><br />Vad tycks??",
    footerButtons: [
        { text: "Stäng" },
        { text: "Next", rel: "child", class: "btn-warning" }
    ],
    isForm: true,
   /* closeButton: {
        disabled: true 
    }*/
});
const childModal = new Modal({
    id: "child",
    title: "ChildModal", 
   // header: "<div style='width: 100px; height: 50px; background: red; margin: auto;'>ohlala</div>",
    content: "chilld....NNNNed är jag från ett child med lite mer innehåll än min parent, vi får se hur det blir när vi transformeras fram o?",
    /*footerButtons: [
        { text: "Lnapp" }
    ]*/
   backButton: {
    //disabled: true
   }
});
const grandchildModal = new Modal({
    title: "GRANDCHILD!",
    content: "Hejsan ? Hejsan här är jag från ett child med lite mer innehåll än min parent, vi får se hur det blir när vi transformeras fram och tillbaka helt nekelt.<br /><br />Vad tycks?? Hejsan här är jag från ett child med lite mer innehåll än min parent, vi får se hur det blir när vi transformeras fram och tillbaka helt nekelt.<br /><br />Vad tycks??"
});

const Nav = new ModalNavigation({
   //animation: "morph",
  /* closeButton: {
    disabled: true
   },*/
   backButton: {
    disabled: true
   }
});
Nav.addEventListener("close.bs.nav", e => {
    console.log("close");
  //  e.stack.forEach(modal => modal.remove());
});
//Nav.push(testModal);

//Nav.push(childModal);
 //Nav.show();

/*

setTimeout(() => Nav.push(testModal), 1000);
setTimeout(() => Nav.push(childModal), 2000);
setTimeout(() => Nav.push(testModal), 3000);

/*setTimeout(() => Nav.push(grandchildModal), 3000);

testModal.addEventListener("submit.bs.modal", e => {
    e.preventDefault();

    console.log(e.target);

    alert("SUBMIT");
});*/

setTimeout(() => {
return;
    document.querySelectorAll("[data-bs-loader]").forEach(btn => btn.showLoader());

    setTimeout(() => document.querySelectorAll("[data-bs-loader]").forEach(btn => btn.hideLoader()), 1500);


    setTimeout(() => {
    const btn = document.createElement("button");
    btn.innerHTML = "Open Modal";
    btn.classList.add("btn", "btn-primary");
    btn.dataset.bsToggle = "tooltip";
    btn.dataset.bsLoader = true;
    btn.title = "Hej hej dynamiskt";

    btn.addEventListener("click", e => {
       btn.showLoader();
    });

    document.body.appendChild(btn);
    }, 500);
}, 1500);