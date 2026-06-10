// ===================== EMAIL VALIDATION =============================

document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('emailInput');
    const emailError = document.getElementById('emailError');

    emailInput.addEventListener('blur', async () =>{

        const email = emailInput.value.trim();

        if(!email){
            emailError.textContent = '';
            emailInput.classList.remove('error-input');
            return;
        }

        const response = await fetch(`/staff/check-email/?email=${encodeURIComponent(email)}`);

        const data = await response.json()

        if(data.exists){
            emailError.textContent = "This email is already exists!"
            emailInput.classList.add('error-input')
        }
        else{
            emailError.textContent = '';
            emailInput.classList.remove('error-input')
        }
    });
});

// ============================= PHONE NUMBER VALIDATION =============================

phoneInput.addEventListener('blur', async () => {

    const phone = phoneInput.value.trim();

    if (!phone) {
        phoneError.textContent = '';
        phoneInput.classList.remove('error-input');
        return;
    }

    if (phone.length !== 10) {
        phoneError.textContent =
            'Phone number must be 10 digits';

        phoneInput.classList.add('error-input');
        return;
    }

    const response = await fetch(
        `/staff/check-phone/?phone=${encodeURIComponent(phone)}`
    );

    const data = await response.json();

    if (data.exists) {
        phoneError.textContent =
            'This phone number already exists!';

        phoneInput.classList.add('error-input');
    } else {
        phoneError.textContent = '';
        phoneInput.classList.remove('error-input');
    }
});

// ================================= MUST CONTAIN 10-DIGITS ==================================

document.addEventListener('DOMContentLoaded', ()=>{
    const phoneInput = document.getElementById('phoneInput');
    const phoneError = document.getElementById('phoneError');

    phoneInput.addEventListener('input', ()=>{
        const phone = phoneInput.value

        if(phone.length > 10){
            phoneInput.value = phone.substring(0, 10);
        }

        if(phone.length > 0 && phone.length < 10){
            phoneError.textContent = 'Phone number must be 10 digits'
            phoneInput.classList.add('error-input')
        }
        else{
            phoneError.textContent = ''
            phoneInput.classList.remove('error-input')
        }
    })
})

// =============================== PHONE NO CONTAINS ONLY NUMBERS ===============================

document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('phoneInput');

    phoneInput.addEventListener('input', () => {
        phoneInput.value = phoneInput.value.replace(/\D/g, '');
    })
})

// ======================== FIRST NAME AND LAST NAME CONTAINS ONLY STRINGS =======================

document.addEventListener('DOMContentLoaded', () => {
    const firstNameInput = document.getElementById('firstNameInput')

    firstNameInput.addEventListener('input', () => {
        firstNameInput.value = firstNameInput.value.replace(/[^a-zA-Z\s]/g, '');
    })
})

document.addEventListener('DOMContentLoaded', () => {
    const lastNameInput = document.getElementById('lastNameInput');

    lastNameInput.addEventListener('input', () => {
        lastNameInput.value = lastNameInput.value.replace(/[^a-zA-Z\s]/g, '');
    })
})

// =========================== DOB & DOJ DATE PICKER UX ============================

document.addEventListener('DOMContentLoaded', () => {
    const dateOfBirthInput = document.getElementById('dateOfBirthInput');
    const dateOfJoiningInput = document.getElementById('dateOfJoiningInput');

    function enableFullDatePicker(input){
        input.addEventListener('click', () => {
            if(input.showPicker){
                input.showPicker()
            }
        });
    }
    enableFullDatePicker(dateOfBirthInput);
    enableFullDatePicker(dateOfJoiningInput);
})

// ======================== DATE OF BIRTH VALIDATION ============================

const dateOfBirthInput = document.getElementById('dateOfBirthInput');
const dateOfBirthError = document.getElementById('dateOfBirthError');

const today = new Date().toISOString().split('T')[0];
dateOfBirthInput.setAttribute('max', today);

dateOfBirthInput.addEventListener('change', () => {
    const dob = new Date(dateOfBirthInput.value)
    const currentDate = new Date()

    if(dob > currentDate){
        dateOfBirthError.textContent = 'Date of birth cannot be in the future';
        dateOfBirthInput.classList.add('error-input');
        return;
    }

    let age = currentDate.getFullYear() - dob.getFullYear();

    const monthDiff = currentDate.getMonth() - dob.getMonth();

    if(
        monthDiff < 0 ||
        (monthDiff === 0 &&
        currentDate.getDate() < dob.getDate())
    ){
        age--;
    }

    if(age<18){
        dateOfBirthError.textContent = 'Employee must be at least 18 years old';
        dateOfBirthInput.classList.add('error-input');
        return;
    }

    dateOfBirthError.textContent = '';
    dateOfBirthInput.classList.remove('error-input');
})

// ==================================== IMAGE PROGRESS BAR ====================================

document.addEventListener('DOMContentLoaded', () => {
    const photoInput = document.getElementById('profilePhotoInput');
    const progressBar = document.getElementById('photoProgressBar');
    const progressText = document.getElementById('progressText');

    photoInput.addEventListener('change', () => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;

            progressBar.style.width = progress + '%'
            progressText.textContent = '% Uploaded'

            if(progress >= 100){
                clearInterval(interval);

                progressText.textContent = '✓ Image Uploaded'
            }
        },50)
    })
})

// ==================================== DOCUMENT PROGRESS BAR ===================================

document.addEventListener('DOMContentLoaded', () => {
    const documentInput = document.getElementById('documentInput');
    const documentProgressBar = document.getElementById('documentProgressBar');
    const documentProgressText = document.getElementById('documentprogressText');

    documentInput.addEventListener('change', () => {
        let progress = 0;

        const interval = setInterval(()=>{
            progress += 10;

            documentProgressBar.style.width = progress + '%'
            documentProgressText.textContent = '% Uploaded'

            if(progress >= 100){
                clearInterval(interval)

                documentProgressText.textContent = '✓ File Uploaded'
            }
        }, 50)
    })
})

// ================================== REMOVE-BUTTON FOR PHOTOS ==================================

document.addEventListener('DOMContentLoaded', () => {

    const photoInput = document.getElementById('profilePhotoInput');
    const removePhotoBtn = document.getElementById('removePhotoBtn');
    const progressBar = document.getElementById('photoProgressBar');
    const progressText = document.getElementById('progressText');

    photoInput.addEventListener('change', () => {
        if(photoInput.files.length > 0){

            removePhotoBtn.style.display = 'flex';
            progressBar.style.width = '100%'
            progressText.textContent = 'Image uploaded successfully!'

        }
        else{
            removePhotoBtn.style.display = 'none';
            progressBar.style.width = '0%'
            progressText.textContent = 'No file selected'
        }
    })

    removePhotoBtn.addEventListener('click', ()=>{
        photoInput.value = '';
        removePhotoBtn.style.display = 'none'
        progressBar.style.width = '0%'
        progressText.textContent = 'No file selected'
    })

});

// ================================== REMOVE-BUTTON FOR DOCUMENTS ==================================
document.addEventListener('DOMContentLoaded', ()=>{

    const documentInput = document.getElementById('documentInput');
    const removeDocBtn = document.getElementById('removeDocumentBtn');
    const progressBar = document.getElementById('documentProgressBar');
    const progressText = document.getElementById('documentprogressText');

    documentInput.addEventListener('change', () => {
        if(documentInput.files.length > 0){
            removeDocBtn.style.display = 'flex';
            progressBar.style.width = '100%';
            progressText.textContent = 'Document uploaded successfully';
        }
        else{
            removeDocBtn.style.display = 'none';
            progressBar.style.width = '0%';
            progressText.textContent = 'No file selected';
        }
    })

    removeDocBtn.addEventListener('click', ()=>{
        documentInput.value = '';
        removeDocBtn.style.display = 'none';
        progressBar.style.width = '0%';
        progressText.textContent = 'No file selected';
    })

});

// ====================== MONTHLY TARGET VALIDATION ======================

document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('staffMgmtForm');
    const monthlyTargetInput = document.getElementById('monthlyTargetInput');
    const monthlyTargetError = document.getElementById('monthlyTargetError');

    monthlyTargetInput.addEventListener('input', () => {

        const target = parseFloat(monthlyTargetInput.value);

        if (target <= 0) {

            monthlyTargetError.textContent =
                'Monthly target must be greater than 0';

            monthlyTargetInput.classList.add('error-input');

        } else {

            monthlyTargetError.textContent = '';
            monthlyTargetInput.classList.remove('error-input');

        }

    });

    form.addEventListener('submit', (e) => {

        const target = parseFloat(monthlyTargetInput.value);

        if (!target || target <= 0) {

            e.preventDefault();

            monthlyTargetError.textContent =
                'Monthly target must be greater than 0';

            monthlyTargetInput.classList.add('error-input');

        }

    });

});