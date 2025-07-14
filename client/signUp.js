// const forms = document.querySelectorAll('.needs-validation')

//     Array.from(forms).forEach(form => {
//       form.addEventListener('submit', event => {
//         if (!form.checkValidity()) {
//           event.preventDefault()
//           event.stopPropagation()
//         }

//         form.classList.add('was-validated')
//       }, false)
//     })

const checkbox = document.querySelector("#Checkbox");
document.querySelector("#submit").addEventListener("click", () => {
    checkCheckbox(checkbox);
});


function checkCheckbox() {
    if (checkbox.checked) {
      alert('Галочка установлена ✅');
    } else {
      alert('Галочка НЕ установлена ❌');
    }
}