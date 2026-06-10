
// ================================= GLOBAL VALIDATION FOR FORM =================================

function isFormValid() {

    const phone = document.getElementById('phoneInput').value.trim();

    const dobError = document.getElementById('dateOfBirthError').textContent;

    const phoneError = document.getElementById('phoneError').textContent;

    const emailError = document.getElementById('emailError').textContent;

    if (phone.length !== 10) {
        return false;
    }

    if (dobError !== '') {
        return false;
    }

    if (phoneError !== '') {
        return false;
    }

    if (emailError !== '') {
        return false;
    }

    return true;
}

// ============================ EDIT FORM UPDATE BTN DISABLED ============================

let checkChanges;

document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('staffMgmtForm');
    const updateBtn = document.getElementById('updateStaffBtn');

    const originalValues = {};

    form.querySelectorAll('input, select, textarea').forEach(field => {

        originalValues[field.name] = field.value;

    });

    checkChanges = function () {

        let changed = false;

        form.querySelectorAll('input, select, textarea').forEach(field => {

            if (field.value !== originalValues[field.name]) {
                changed = true;
            }

        });

        updateBtn.disabled = !(changed && isFormValid());

    };

    form.querySelectorAll('input, select, textarea').forEach(field => {

        field.addEventListener('input', checkChanges);
        field.addEventListener('change', checkChanges);

    });

});
// =================================== EMAIL EXISTING VALIDATION ===================================

document.addEventListener('DOMContentLoaded', () => {
    
    const form = document.getElementById('staffMgmtForm');
    const emailInput = document.getElementById('emailInput');
    const emailError = document.getElementById('emailError');
    const staffId = document.getElementById('staffId').value;

    let emailValid = true;

    emailInput.addEventListener('blur', async () => {
        
        const email = emailInput.value.trim()

        if(!email){
            emailError.textContent = '';
            emailInput.classList.remove('error-input');
            emailValid = true;
            return;
        }

        const response = await fetch(
            `/staff/check-email/?email=${encodeURIComponent(email)}&staff_id=${staffId}`
        );

        const data = await response.json()

        if(data.exists){
            emailError.textContent = 'This email already exists!'
            emailInput.classList.add('error-input')
            emailValid = false
        }
        else{
            emailError.textContent = ''
            emailInput.classList.remove('error-input')
            emailValid = true
            return;
        }
        if (typeof checkChanges === 'function') {
            checkChanges();
        }

    });

    form.addEventListener('submit', (e) => {
        if(!emailValid){
            e.preventDefault();

            emailError.textContent = 'This email already exists!';
            emailInput.classList.add('error-input')
        }
    })


})

// =================================== PHONE VALIDATION ===================================

document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('staffMgmtForm');
    const phoneInput = document.getElementById('phoneInput');
    const phoneError = document.getElementById('phoneError');
    const staffId = document.getElementById('staffId').value;

    let phoneValid = true;

    phoneInput.addEventListener('input', async () => {

        // Only numbers allowed
        phoneInput.value = phoneInput.value.replace(/\D/g, '');

        // Maximum 10 digits
        if (phoneInput.value.length > 10) {
            phoneInput.value = phoneInput.value.substring(0, 10);
        }

        const phone = phoneInput.value.trim();

        // Empty field
        if (!phone) {
            phoneError.textContent = '';
            phoneInput.classList.remove('error-input');
            phoneValid = true;
            return;
        }

        // Less than 10 digits
        if (phone.length < 10) {

            phoneError.textContent =
                'Phone number must be 10 digits';

            phoneInput.classList.add('error-input');
            phoneValid = false;
            return;
        }

        // Exactly 10 digits -> check duplicate
        const response = await fetch(
            `/staff/check-phone/?phone=${encodeURIComponent(phone)}&staff_id=${staffId}`
        );

        const data = await response.json();

        if (data.exists) {

            phoneError.textContent =
                'This phone number already exists!';

            phoneInput.classList.add('error-input');
            phoneValid = false;

        } 
        else {

            phoneError.textContent = '';
            phoneInput.classList.remove('error-input');
            phoneValid = true;

        }

        if (typeof checkChanges === 'function') {
            checkChanges();
        }

    });

    form.addEventListener('submit', (e) => {

        const phone = phoneInput.value.trim();

        if (phone.length !== 10) {

            e.preventDefault();

            phoneError.textContent =
                'Phone number must be 10 digits';

            phoneInput.classList.add('error-input');

            return;
        }

        if (!phoneValid) {

            e.preventDefault();

            phoneError.textContent =
                'This phone number already exists!';

            phoneInput.classList.add('error-input');
        }

    });

});

// ========================== FIRST & LAST NAME CONTAINS ONLY STRINGS ============================

document.addEventListener('DOMContentLoaded', ()=>{
    const firstNameInput = document.getElementById('firstNameInput');
    
    firstNameInput.addEventListener('input', ()=>{
        firstNameInput.value = firstNameInput.value.replace(/[^a-zA-Z\s]/g, '');
    });

    const lastNameInput = document.getElementById('lastNameInput');

    lastNameInput.addEventListener('input', ()=>{
        lastNameInput.value = lastNameInput.value.replace(/[^a-zA-Z\s]/g, '');
    });
})

// ================================== DOB & DOJ ENHANCING ==================================

document.addEventListener('DOMContentLoaded', ()=>{
    const dateOfBirthInput = document.getElementById('dateOfBirthInput');
    const dateOfJoiningInput = document.getElementById('dateOfJoiningInput');

    function enableFullDatePicker(input){
        input.addEventListener('click', ()=>{
            if(input.showPicker){
                input.showPicker();
            }
        });
    }

    enableFullDatePicker(dateOfBirthInput);
    enableFullDatePicker(dateOfJoiningInput);

});

// ======================== DATE OF BIRTH VALIDATION ============================

document.addEventListener('DOMContentLoaded', () => {
    const dateOfBirthInput = document.getElementById('dateOfBirthInput');
const dateOfBirthError = document.getElementById('dateOfBirthError');
const originalDob = dateOfBirthInput.value;

const today = new Date().toISOString().split('T')[0];
dateOfBirthInput.setAttribute('max', today);

dateOfBirthInput.addEventListener('change', () => {

    if (!dateOfBirthInput.value) {

    if (originalDob === '') {
            dateOfBirthError.textContent = '';
            dateOfBirthInput.classList.remove('error-input');
            return;
        }

        dateOfBirthError.textContent =
            'Date of Birth is required';

        dateOfBirthInput.classList.add('error-input');
        return;
    }
    
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

    if (!dateOfBirthInput.value) {
        dateOfBirthError.textContent = 'Date of Birth is required';
        dateOfBirthInput.classList.add('error-input');
        return;
    }
    

})
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

// ============================== IMAGE SELECTION ================================= 

document.addEventListener('DOMContentLoaded', () => {

    const photoInput = document.getElementById('profilePhotoInput');
    const currentPhotoSection = document.getElementById('currentPhotoSection');

    if (!photoInput || !currentPhotoSection) return;

    photoInput.addEventListener('change', () => {

        // New image selected
        if (photoInput.files.length > 0) {
            currentPhotoSection.style.display = 'none';
        }

        // Image selection cleared
        else {
            currentPhotoSection.style.display = '';
        }

    });

});