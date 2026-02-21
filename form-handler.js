/* ============================================================
   FORMA ARCHITECTURE - GLOBAL HANDLER (FINAL SYNC 2026)
   ============================================================ */

// --- CONFIGURATION ---
(function() {
    emailjs.init("alap2C2Fda-y4hFG8"); 
})();

const serviceID = 'service_d8l3yh6';
const CLIENT_TEMPLATE_ID = 'template_f5ctunh';         // Admin: Dark "Incoming Transmission"
const CONTRACTOR_TEMPLATE_ID = 'template_o16az14';     // Admin: Partner Applications
const PARTNER_REPLY_TEMPLATE_ID = 'template_sm2woll';  // NEW: Partner Auto-Reply
const ESTIMATE_TEMPLATE_ID = 'template_h323v4q';       // Project Planner (Admin Notification)
const ESTIMATE_CLIENT_TEMPLATE_ID = 'template_ebamer7'; // Auto-Reply to Homeowner Clients

// --- SELECTORS ---
const contactForm = document.getElementById('contact-form');
const contractorForm = document.getElementById('contractor-form');
const estimateForm = document.getElementById('estimateForm');

let currentStep = 1;

/* ============================================================
   1. HOMEOWNER CONTACT FORM (SCHEDULE CONSULTATION)
   ============================================================ */
if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const submitBtn = document.getElementById('submit-btn');
        const formStatus = document.getElementById('form-status');
        
        submitBtn.disabled = true;
        submitBtn.innerText = "TRANSMITTING...";

        const formData = new FormData(this);
        const templateParams = {
            user_name: formData.get('user_name'),
            user_email: formData.get('user_email'),
            user_phone: formData.get('user_phone'), 
            project_type: formData.get('project_type'),
            message: formData.get('message')
        };

        const adminNotify = emailjs.send(serviceID, CLIENT_TEMPLATE_ID, templateParams);
        const customerReply = emailjs.send(serviceID, ESTIMATE_CLIENT_TEMPLATE_ID, templateParams);

        Promise.all([adminNotify, customerReply])
            .then(() => {
                submitBtn.innerText = "MESSAGE SENT";
                formStatus.style.display = "block";
                formStatus.style.color = "#27ae60"; 
                formStatus.innerText = "FORMA Architecture: Building with intention. We’ve received your inquiry.";
                contactForm.reset();
            })
            .catch((err) => {
                submitBtn.disabled = false;
                submitBtn.innerText = "TRY AGAIN";
                formStatus.style.display = "block";
                formStatus.style.color = "#e74c3c";
                formStatus.innerText = "Transmission Error: " + JSON.stringify(err);
            });
    });
}

/* ============================================================
   2. CONTRACTOR PARTNER FORM (DEDICATED AUTO-REPLY ID)
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
        partnerBtn.innerText = "TRANSMITTING..."; 

        const formData = new FormData(this);
        const templateParams = {
            company_name: formData.get('company_name'),
            contact_person: formData.get('contact_person'),
            user_email: formData.get('user_email'),
            user_phone: formData.get('user_phone')
        };

        // 1. Send to Admin (Original Template)
        const adminNotify = emailjs.send(serviceID, CONTRACTOR_TEMPLATE_ID, templateParams);
        
        // 2. Send Mobile-Optimized Auto-Reply to Partner (New Template)
        const partnerReply = emailjs.send(serviceID, PARTNER_REPLY_TEMPLATE_ID, templateParams);

        Promise.all([adminNotify, partnerReply])
            .then(() => {
                partnerBtn.innerText = "INQUIRY SENT";
                statusDiv.style.cssText = "display:block; color:#27ae60; margin-top:15px; font-size:11px; text-transform:uppercase; letter-spacing:1px; font-weight:700;";
                statusDiv.innerText = "✓ Partnership details received. We have sent a confirmation to your email.";
                
                setTimeout(() => { 
                    if(typeof closeContractor === "function") closeContractor(); 
                    contractorForm.reset(); 
                    partnerBtn.disabled = false;
                    partnerBtn.innerText = "Send Partnership Inquiry";
                    statusDiv.style.display = "none";
                }, 4000);
            })
            .catch((err) => {
                partnerBtn.disabled = false;
                partnerBtn.innerText = "RETRY TRANSMISSION";
                statusDiv.style.cssText = "display:block; color:#e74c3c; margin-top:15px;";
                statusDiv.innerText = "Error: Transmission failed.";
            });
    });
}

/* ============================================================
   3. PROJECT PLANNER & ESTIMATE HANDLER
   ============================================================ */
function selectOption(name, rate) {
    document.getElementById('selectedType').value = name;
    document.getElementById('baseRate').value = rate;
    
    document.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('selected');
    }

    setTimeout(() => changeStep(1), 300);
}

function changeStep(n) {
    const nextStep = currentStep + n;
    if(nextStep < 1 || nextStep > 4) return; 

    const currentStepEl = document.getElementById('step' + currentStep);
    const nextStepEl = document.getElementById('step' + nextStep);

    if(currentStepEl) currentStepEl.classList.remove('active');
    if(nextStepEl) nextStepEl.classList.add('active');
    
    currentStep = nextStep;
    
    const progress = (currentStep / 4) * 100;
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
            if(el) el.style.borderColor = "red";
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

    const lowEstimate = sqft * rate * multiplier;
    const highEstimate = lowEstimate * 1.15;
    const range = `$${Math.round(lowEstimate).toLocaleString()} — $${Math.round(highEstimate).toLocaleString()}`;

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

    const adminEmail = emailjs.send(serviceID, ESTIMATE_TEMPLATE_ID, templateParams);
    const clientEmail = emailjs.send(serviceID, ESTIMATE_CLIENT_TEMPLATE_ID, templateParams);

    Promise.all([adminEmail, clientEmail])
        .then(() => {
            changeStep(1); 
            animateBars();
        })
        .catch((err) => {
            console.error('Transmission Error:', err);
            changeStep(1);
            animateBars();
        });
}

function animateBars() {
    setTimeout(() => {
        if(document.getElementById('bar1')) document.getElementById('bar1').style.height = "55%";
        if(document.getElementById('bar2')) document.getElementById('bar2').style.height = "80%";
        if(document.getElementById('bar3')) document.getElementById('bar3').style.height = "95%";
    }, 400);
}

/* ============================================================
   4. UI & MODAL LOGIC
   ============================================================ */
function openContractor() { 
    const modal = document.getElementById("contractorModal");
    if(modal) modal.style.display = "block"; 
}
function closeContractor() { 
    const modal = document.getElementById("contractorModal");
    if(modal) modal.style.display = "none"; 
}

window.onclick = function(event) {
    const contractModal = document.getElementById("contractorModal");
    if (event.target === contractModal) closeContractor();
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