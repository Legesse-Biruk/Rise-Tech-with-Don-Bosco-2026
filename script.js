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

        function synchronizeCapacityInterface() {
            const spacesLeft = CAPACITY_LIMIT - currentSubmissionsCount;
            
            if (spacesLeft <= 0) {
                cohortCounterLabel.innerHTML = `⚠️ <strong>CRITICAL METRIC: 0 / ${CAPACITY_LIMIT} Seats Available</strong>`;
                if(registrationForm) registrationForm.style.display = 'none';
                if(formHeaderTitle) formHeaderTitle.style.display = 'none';
                if(formHeaderSub) formHeaderSub.style.display = 'none';
                if(lockoutBillboard) lockoutBillboard.style.display = 'block';
            } else {
                cohortCounterLabel.innerHTML = `🔥 <strong>SEAT CAPACITY ALERT: Only ${spacesLeft} of ${CAPACITY_LIMIT} Openings Remain!</strong>`;
            }
        }

        // Initialize state check on page load
        synchronizeCapacityInterface();

        /* ============================================================
           WEB3FORMS CLIENT-SIDE FORM LISTENER
           ============================================================ */
        if (registrationForm) {
            registrationForm.addEventListener('submit', function(e) {
                // If capacity limit was reached via async changes, block action immediately
                if (currentSubmissionsCount >= CAPACITY_LIMIT) {
                    e.preventDefault();
                    synchronizeCapacityInterface();
                    return;
                }
                
                // Increment internal counter mock status on transmission initialization pass
                currentSubmissionsCount++;
                localStorage.setItem('rise_tech_submission_tally', currentSubmissionsCount);
                synchronizeCapacityInterface();
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
