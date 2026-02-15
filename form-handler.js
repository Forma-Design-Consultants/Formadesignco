/* ============================================================
   FORMA ARCHITECTURE - GLOBAL HANDLER
   ============================================================ */

// --- CONFIGURATION ---
(function() {
    emailjs.init("alap2C2Fda-y4hFG8"); 
})();

const serviceID = 'service_d8l3yh6';
const CLIENT_TEMPLATE_ID = 'template_f5ctunh';     // Homeowner Inquiry
const CONTRACTOR_TEMPLATE_ID = 'template_o16az14'; // Partner Applications
const ESTIMATE_TEMPLATE_ID = 'template_h323v4q';   // Project Planner (Admin Notification)
const ESTIMATE_CLIENT_TEMPLATE_ID = 'template_kvdheth'; // Project Planner (Client Copy) - Update ID if different

// --- SELECTORS ---
const contactForm = document.getElementById('contact-form');
const contractorForm = document.getElementById('contractor-form');
const estimateForm = document.getElementById('estimateForm');

let currentStep = 1;

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

        emailjs.sendForm(serviceID, CLIENT_TEMPLATE_ID, this)
            .then(() => {
                submitBtn.innerText = "MESSAGE SENT";
                formStatus.style.display = "block";
                formStatus.className = "status-success";
                formStatus.innerText = "FORMA Architecture: Building with intention. We’ve received your inquiry.";
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
   2. CONTRACTOR PARTNER FORM
   ============================================================ */
if (contractorForm) {
    contractorForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const partnerBtn = this.querySelector('button');
        let statusDiv = document.getElementById('contractor-status') || document.createElement('div');
        
        if (!statusDiv.id) {
            statusDiv.id = 'contractor-status';
            this.appendChild(statusDiv);
        }

        partnerBtn.disabled = true;
        partnerBtn.innerText = "VERIFYING CSLB..."; 

        emailjs.sendForm(serviceID, CONTRACTOR_TEMPLATE_ID, this)
            .then(() => {
                partnerBtn.innerText = "CREDENTIALS SENT";
                statusDiv.style.cssText = "display:block; color:#27ae60; margin-top:15px; font-size:12px; text-transform:uppercase;";
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
                statusDiv.innerText = "Error: Connection timed out.";
            });
    });
}

/* ============================================================
   3. PROJECT PLANNER & ESTIMATE HANDLER
   ============================================================ */

function selectOption(name, rate) {
    document.getElementById('selectedType').value = name;
    document.getElementById('baseRate').value = rate;
    
    // UI Visual Selection
    document.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected'));
    // Use target selection to ensure compatibility
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('selected');
    }

    setTimeout(() => changeStep(1), 300);
}

function changeStep(n) {
    const nextStep = currentStep + n;
    if(nextStep < 1 || nextStep > 3) return;

    document.getElementById('step' + currentStep).classList.remove('active');
    document.getElementById('step' + nextStep).classList.add('active');
    
    currentStep = nextStep;
    
    const progress = (currentStep / 3) * 100;
    const bar = document.getElementById('progressBar');
    if(bar) bar.style.width = progress + '%';
}

function validateAndRun() {
    const btn = document.getElementById('submitBtn');
    const fields = ['fullName', 'userEmail', 'userPhone', 'userAddress'];
    let valid = true;

    fields.forEach(id => {
        const el = document.getElementById(id);
        if (!el || !el.value) {
            el.style.borderColor = "red";
            valid = false;
        } else {
            el.style.borderColor = "#222";
        }
    });

    if (!valid) {
        alert("Please complete all fields to generate your estimate.");
        return;
    }

    btn.innerText = "ANALYZING DATA...";
    btn.disabled = true;
    runAnalytics();
}

function runAnalytics() {
    const type = document.getElementById('selectedType').value;
    const rate = parseFloat(document.getElementById('baseRate').value);
    const sqft = parseFloat(document.getElementById('sqft').value);
    const multiplier = parseFloat(document.getElementById('finishTier').value);

    // Calculation Logic
    const lowEstimate = sqft * rate * multiplier;
    const highEstimate = lowEstimate * 1.15;
    const range = `$${Math.round(lowEstimate).toLocaleString()} — $${Math.round(highEstimate).toLocaleString()}`;

    // Update Result UI
    document.getElementById('res-type').innerText = type;
    document.getElementById('res-time').innerText = (rate > 250) ? "9-14 Months" : "5-8 Months";
    document.getElementById('res-price').innerText = range;

    const templateParams = {
        user_name: document.getElementById('fullName').value,
        user_email: document.getElementById('userEmail').value,
        user_phone: document.getElementById('userPhone').value,
        user_address: document.getElementById('userAddress').value,
        project_type: type,
        sqft: sqft,
        estimate_range: range,
        source: document.getElementById('discoverySource').value
    };

    // DOUBLE-TAP TRANSMISSION: 1 to Admin, 1 to Client
    const adminEmail = emailjs.send(serviceID, ESTIMATE_TEMPLATE_ID, templateParams);
    const clientEmail = emailjs.send(serviceID, ESTIMATE_CLIENT_TEMPLATE_ID, templateParams);

    Promise.all([adminEmail, clientEmail])
        .then(() => {
            console.log('Project data synced successfully.');
            changeStep(1); 
            animateBars();
        })
        .catch((err) => {
            console.error('Transmission Error:', err);
            // Still move forward so user experience isn't broken
            changeStep(1);
            animateBars();
        });
}

function animateBars() {
    setTimeout(() => {
        document.getElementById('bar1').style.height = "55%";
        document.getElementById('bar2').style.height = "80%";
        document.getElementById('bar3').style.height = "95%";
    }, 400);
}

/* ============================================================
   4. UI & MODAL LOGIC
   ============================================================ */

function openContractor() { document.getElementById("contractorModal").style.display = "block"; }
function closeContractor() { document.getElementById("contractorModal").style.display = "none"; }

window.onclick = function(event) {
    if (event.target === document.getElementById("mapModal")) closeMap();
    if (event.target === document.getElementById("contractorModal")) closeContractor();
}

/* ============================================================
   5. SCROLL ANIMATION
   ============================================================ */
function reveal() {
    document.querySelectorAll(".reveal").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 150) {
            el.classList.add("active");
        }
    });
}

window.addEventListener("scroll", reveal);
reveal();
