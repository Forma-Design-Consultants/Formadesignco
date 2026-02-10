/* ============================================================
   FORMA ARCHITECTURE - GLOBAL HANDLER
   ============================================================ */

const serviceID = 'service_d8l3yh6';
const CLIENT_TEMPLATE_ID = 'template_f5ctunh';     // Homeowner Inquiry
const CONTRACTOR_TEMPLATE_ID = 'template_o16az14'; // Partner App

// 1. Homeowner Form
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const submitBtn = document.getElementById('submit-btn');
        const formStatus = document.getElementById('form-status');
        
        submitBtn.disabled = true;
        submitBtn.innerText = "TRANSMITTING...";

        emailjs.sendForm(serviceID, CLIENT_TEMPLATE_ID, this)
            .then(() => {
                submitBtn.innerText = "MESSAGE SENT";
                formStatus.style.display = "block";
                formStatus.className = "status-success";
                formStatus.innerText = "FORMA Architecture: Inquiry received. We will reach out shortly.";
                contactForm.reset();
            }, (err) => {
                submitBtn.disabled = false;
                submitBtn.innerText = "TRY AGAIN";
                formStatus.style.display = "block";
                formStatus.className = "status-error";
                formStatus.innerText = "Error: " + JSON.stringify(err);
            });
    });
}

// 2. Contractor Form
const contractorForm = document.getElementById('contractor-form');
if (contractorForm) {
    contractorForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const partnerBtn = this.querySelector('button');
        let statusDiv = document.getElementById('contractor-status');
        
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'contractor-status';
            this.appendChild(statusDiv);
        }

        partnerBtn.disabled = true;
        partnerBtn.innerText = "VERIFYING..."; 

        emailjs.sendForm(serviceID, CONTRACTOR_TEMPLATE_ID, this)
            .then(() => {
                partnerBtn.innerText = "CREDENTIALS SENT";
                statusDiv.className = "status-success";
                statusDiv.style.display = "block";
                statusDiv.innerText = "✓ Credentials received. Verification in progress.";
                
                setTimeout(() => { 
                    closeContractor(); 
                    contractorForm.reset(); 
                    partnerBtn.disabled = false;
                    partnerBtn.innerText = "Submit Credentials";
                    statusDiv.style.display = "none";
                }, 3000);
            }, (err) => {
                partnerBtn.disabled = false;
                partnerBtn.innerText = "RETRY";
                statusDiv.className = "status-error";
                statusDiv.style.display = "block";
                statusDiv.innerText = "Connection Error.";
            });
    });
}

// 3. UI Logic (Modals & Maps)
function openContractor() { document.getElementById("contractorModal").style.display = "block"; }
function closeContractor() { document.getElementById("contractorModal").style.display = "none"; }

function openMap(state) {
    const modal = document.getElementById("mapModal");
    const iframe = document.getElementById("mapFrame");
    const maps = {
        'california': 'https://www.google.com/maps/embed?pb=YOUR_CALI_LINK', ',
        'utah': 'https://www.google.com/maps/embed?pb=YOUR_UTAH_LINK'
    };
    if(iframe && maps[state]) {
        iframe.src = maps[state];
        modal.style.display = "block";
    }
}

function closeMap() {
    document.getElementById("mapModal").style.display = "none";
    document.getElementById("mapFrame").src = "";
}

window.onclick = function(event) {
    if (event.target.className === "modal") {
        closeMap();
        closeContractor();
    }
}

// 4. Scroll Reveal
function reveal() {
    document.querySelectorAll(".reveal").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 150) {
            el.classList.add("active");
        }
    });
}
window.addEventListener("scroll", reveal);
reveal();
