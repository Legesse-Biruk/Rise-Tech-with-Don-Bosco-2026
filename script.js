const form = document.getElementById('registrationForm');
const result = document.getElementById('result');
const successBox = document.getElementById('successBox');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    submitBtn.textContent = "Processing & Uploading...";
    submitBtn.disabled = true;
    result.style.display = "block";
    result.style.color = "#1e1e1e";
    result.innerHTML = "Please wait, packing image binary maps...";

    const fileInput = document.getElementById('screenshot');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            const base64String = reader.result;
            sendDataWithScreenshot(base64String);
        };
        reader.onerror = function (error) {
            console.log('Error processing image data: ', error);
            sendDataWithScreenshot("Image processing error occurred.");
        };
    } else {
        sendDataWithScreenshot("No image uploaded.");
    }
});

function sendDataWithScreenshot(imageTextData) {
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    
    // Map data fields cleanly to send to your inbox
    object.message = `
=== ATTACHED SCREENSHOT DATA ===
${imageTextData}

=== REGISTRATION ADDITIONAL SUMMARY ===
Selected Track: ${object.selected_course}
Payment Provider: ${object.payment_provider}
Reference Key ID: ${object.transaction_reference}
    `;
    
    const json = JSON.stringify(object);

    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: json
    })
    .then(async (response) => {
        let resJson = await response.json();
        if (response.status == 200) {
            result.style.display = "none";
            successBox.style.display = 'block';
            form.reset();
            successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            console.log(response);
            result.style.color = "#D32F2F";
            result.innerHTML = resJson.message || "Submission failed.";
            submitBtn.textContent = "Verify Registration";
            submitBtn.disabled = false;
        }
    })
    .catch(error => {
        console.log(error);
        result.style.color = "#D32F2F";
        result.innerHTML = "Something went wrong! Connection error.";
        submitBtn.textContent = "Verify Registration";
        submitBtn.disabled = false;
    });
}
