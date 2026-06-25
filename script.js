/* ============================================================
   DYNAMIC CAPACITY COUNTDOWN ENGINE & DISMISSAL MECHANICS
   ============================================================ */
const CAPACITY_LIMIT = 74;

// Simulating persistent counter storage values locally across compilation sessions
let currentSubmissionsCount = parseInt(localStorage.getItem('rise_tech_submission_tally')) || 68;

const cohortCounterLabel = document.getElementById('cohortCounterLabel');
const registrationForm = document.getElementById('registrationForm');
const lockoutBillboard = document.getElementById('lockoutBillboard');
const formHeaderTitle = document.getElementById('formHeaderTitle');
const formHeaderSub = document.getElementById('formHeaderSub');
const submitBtn = document.getElementById('submitBtn');

// Track the original text of your submit button
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

// Initialize state check on page load
synchronizeCapacityInterface();

/* ============================================================
   WEB3FORMS CLIENT-SIDE FORM LISTENER (WITH AJAX BACKEND)
   ============================================================ */
if (registrationForm) {
    registrationForm.addEventListener('submit', async function(e) {
        // 1. Intercept standard page refresh behavior
        e.preventDefault();
        
        // Block action immediately if capacity limit was reached asynchronously
        if (currentSubmissionsCount >= CAPACITY_LIMIT) {
            synchronizeCapacityInterface();
            return;
        }
        
        // UI Visual transition parameters (loading state)
        registrationForm.style.opacity = '0.5';
        if(submitBtn) {
            submitBtn.textContent = "Processing Transmission...";
            submitBtn.disabled = true;
        }

        // 2. Build form payload context parameters
        const formData = new FormData(registrationForm);

        try {
            // 3. Request API transmission pipeline to Web3Forms
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const jsonResult = await response.json();

            if (response.status === 200) {
                // 4. Success state: Update and save submission tracking counter
                currentSubmissionsCount++;
                localStorage.setItem('rise_tech_submission_tally', currentSubmissionsCount);
                
                // 5. Hide the input fields container layout, swap with success interface
                registrationForm.style.display = 'none';
                if (formHeaderTitle) formHeaderTitle.style.display = 'none';
                if (formHeaderSub) formHeaderSub.style.display = 'none';
                
                // Safely search for and reveal your hidden success message box
                const successCard = document.getElementById('successCard');
                if (successCard) {
                    successCard.style.display = 'block';
                    successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    // Fallback alert if success element div container is completely missing in HTML
                    alert("Submission successful. Our Team members will contact you through Text and Email AS soon as your registration review is done.");
                }
            } else {
                throw new Error(jsonResult.message || 'Web3Forms pipeline processing layout exception flag state detected.');
            }

        } catch (error) {
            console.error('Registration subsystem pipeline transmission layout crash context:', error);
            alert(`Something went wrong: ${error.message || 'Transmission pipeline connection failure.'}\nPlease check your connectivity and try again.`);
        } finally {
            // Reset loading attributes fallback conditions
            registrationForm.style.opacity = '1';
            if(submitBtn) {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
            // Update capacity UI count in real time
            synchronizeCapacityInterface();
        }
    });
}

/* ============================================================
   THEME ENGINE
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
