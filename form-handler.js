/* ============================================================
   FORMA ARCHITECTURE - GLOBAL HANDLER
   ============================================================ */

// --- CONFIGURATION ---
const serviceID = 'service_zxix26i';
const CLIENT_TEMPLATE_ID = 'template_myacve9';     // For Homeowners
const CONTRACTOR_TEMPLATE_ID = 'template_ddigvcd'; // For Partner Applications

// --- SELECTORS ---
const contactForm = document.getElementById('contact-form');
const contractorForm = document.getElementById('contractor-form');

/* ============================================================
   1. HOMEOWNER CONTACT FORM
   ============================================================ */
if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const submitBtn = document.getElementById('submit-btn');
        const formStatus = document.getElementById('form-status');
        
        submitBtn.disabled = true;
        submitBtn.innerText = "TRANSMITTING...";

        // Uses CLIENT_TEMPLATE_ID (template_myacve9)
        emailjs.sendForm(serviceID, CLIENT_TEMPLATE_ID, this)
            .then(() => {
                submitBtn.innerText = "MESSAGE SENT";
                formStatus.style.display = "block";
                formStatus.className = "status-success";
                formStatus.innerText = "FORMA Architecture: Building with intention. We’ve received your inquiry and will reach out shortly.";
                contactForm.reset();
            }, (err) => {
                submitBtn.disabled = false;
                submitBtn.innerText = "TRY AGAIN";
                formStatus.style.display = "block";
                formStatus.className = "status-error";
                formStatus.innerText = "Transmission Error: " + JSON.stringify(err);
            });
    });
}

/* ============================================================
   2. CONTRACTOR PARTNER FORM (MODAL)
   ============================================================ */
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
        partnerBtn.innerText = "VERIFYING CSLB..."; 

        // Uses CONTRACTOR_TEMPLATE_ID (template_ddigvcd)
        emailjs.sendForm(serviceID, CONTRACTOR_TEMPLATE_ID, this)
            .then(() => {
                partnerBtn.innerText = "CREDENTIALS SENT";
                
                statusDiv.style.display = "block";
                statusDiv.style.color = "#27ae60"; 
                statusDiv.style.marginTop = "15px";
                statusDiv.style.fontSize = "12px";
                statusDiv.style.textTransform = "uppercase";
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
                partnerBtn.innerText = "RETRY TRANSMISSION";
                statusDiv.style.display = "block";
                statusDiv.style.color = "#ff4d4d";
                statusDiv.innerText = "Error: Connection timed out.";
            });
    });
}

/* ============================================================
   3. UI & MODAL LOGIC
   ============================================================ */

function openContractor() {
    const modal = document.getElementById("contractorModal");
    if(modal) modal.style.display = "block";
}

function closeContractor() {
    const modal = document.getElementById("contractorModal");
    if(modal) modal.style.display = "none";
}

// Map Functions
function openMap(state) {
    const modal = document.getElementById("mapModal");
    const iframe = document.getElementById("mapFrame");
    const maps = {
        'california': 'https://www.google.com/maps/embed?pb=YOUR_CALI_LINK', 
        'utah': 'https://www.google.com/maps/embed?pb=YOUR_UTAH_LINK'
    };
    if(iframe && maps[state]) {
        iframe.src = maps[state];
        if(modal) modal.style.display = "block";
    }
}

function closeMap() {
    const modal = document.getElementById("mapModal");
    const iframe = document.getElementById("mapFrame");
    if(modal) modal.style.display = "none";
    if(iframe) iframe.src = "";
}

// Close on outside click
window.onclick = function(event) {
    const mapModal = document.getElementById("mapModal");
    const conModal = document.getElementById("contractorModal");
    if (event.target === mapModal) closeMap();
    if (event.target === conModal) closeContractor();
}

/* ============================================================
   4. SCROLL ANIMATION
   ============================================================ */
function reveal() {
    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach(el => {
        let windowHeight = window.innerHeight;
        let elementTop = el.getBoundingClientRect().top;
        if (elementTop < windowHeight - 150) {
            el.classList.add("active");
        }
    });
}

window.addEventListener("scroll", reveal);
reveal(); // Run on load