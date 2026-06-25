/* ============================================================
   DYNAMIC CAPACITY COUNTDOWN ENGINE & DISMISSAL MECHANICS
   ============================================================ */
const CAPACITY_LIMIT = 74;

// Tracks dynamic counter decrementing state sequentially
let currentSubmissionsCount = parseInt(localStorage.getItem('rise_tech_submission_tally'));
if (isNaN(currentSubmissionsCount)) {
    currentSubmissionsCount = 68; // Starting fallback value if no interactions exist yet
    localStorage.setItem('rise_tech_submission_tally', currentSubmissionsCount);
}

const cohortCounterLabel = document.getElementById('cohortCounterLabel');
const registrationForm = document.getElementById('registrationForm');
const lockoutBillboard = document.getElementById('lockoutBillboard');
const formHeaderTitle = document.getElementById('formHeaderTitle');
const formHeaderSub = document.getElementById('formHeaderSub');
const submitBtn = document.getElementById('submitBtn');

const originalBtnText = submitBtn ? submitBtn.textContent : "Transmit Verification Payload";

function synchronizeCapacityInterface() {
    const spacesLeft = CAPACITY_LIMIT - currentSubmissionsCount;
    
    if (spacesLeft <= 0) {
        if(cohortCounterLabel) cohortCounterLabel.innerHTML = `⚠️ <strong>CRITICAL METRIC: 0 / ${CAPACITY_LIMIT} Seats Available</strong>`;
        if(registrationForm) registrationForm.style.display = 'none';
        if(formHeaderTitle) formHeaderTitle.style.display = 'none';
        if(formHeaderSub) formHeaderSub.style.display = 'none';
        if(lockoutBillboard) lockoutBillboard.style.display = 'block';
    } else {
        if(cohortCounterLabel) cohortCounterLabel.innerHTML = `🔥 <strong>SEAT CAPACITY ALERT: Only ${spacesLeft} of ${CAPACITY_LIMIT} Openings Remain!</strong>`;
    }
}

// Run visual initialization pass immediately
synchronizeCapacityInterface();

/* ============================================================
   CLIENT-SIDE FILE TO TEXT STRING CONVERSION WORKAROUND
   ============================================================ */
const receiptImageInput = document.getElementById('receiptImage');
const receiptTextDataHiddenInput = document.getElementById('receiptTextData');

if (receiptImageInput) {
    receiptImageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            // Check file sizing constraint bounds (Keep under 2MB to prevent API timeout rejects)
            if (file.size > 2 * 1024 * 1024) {
                alert("The selected image file size is too large. Please select an image under 2MB.");
                this.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onloadend = function() {
                // reader.result contains the entire image translated into an ASCII text sequence string
                if (receiptTextDataHiddenInput) {
                    receiptTextDataHiddenInput.value = reader.result;
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

/* ============================================================
   WEB3FORMS CLIENT-SIDE FORM LISTENER (WITH TEXT CONVERSION LOGIC)
   ============================================================ */
if (registrationForm) {
    registrationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (currentSubmissionsCount >= CAPACITY_LIMIT) {
            synchronizeCapacityInterface();
            return;
        }
        
        registrationForm.style.opacity = '0.5';
        if(submitBtn) {
            submitBtn.textContent = "Converting Materials & Submitting...";
            submitBtn.disabled = true;
        }

        const formData = new FormData(registrationForm);

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const jsonResult = await response.json();

            if (response.status === 200) {
                // Success: Safely increment data submission tracking counters
                currentSubmissionsCount++;
                localStorage.setItem('rise_tech_submission_tally', currentSubmissionsCount);
                
                registrationForm.style.display = 'none';
                if (formHeaderTitle) formHeaderTitle.style.display = 'none';
                if (formHeaderSub) formHeaderSub.style.display = 'none';
                
                const successCard = document.getElementById('successCard');
                if (successCard) {
                    successCard.style.display = 'block';
                    successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    alert("Submission successful. Our Team members will contact you through Text and Email AS soon as your registration review is done.");
                }
            } else {
                throw new Error(jsonResult.message || 'Web3Forms transaction endpoint rejection occurred.');
            }

        } catch (error) {
            console.error('Submission pipeline tracking error:', error);
            alert(`Something went wrong: ${error.message || 'Network connectivity fault.'}\nPlease try again.`);
        } finally {
            registrationForm.style.opacity = '1';
            if(submitBtn) {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
            synchronizeCapacityInterface();
        }
    });
}

/* ============================================================
   THEME SWITCHING SUB-ROUTINE SYSTEM
   ============================================================ */
const themeToggle = document.getElementById('themeToggle');
if(themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });
    if(localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }
}
