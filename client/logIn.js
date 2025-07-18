// // Example starter JavaScript for disabling form submissions if there are invalid fields
// (() => {

//   // Fetch all the forms we want to apply custom Bootstrap validation styles to
//   const forms = document.querySelectorAll('.needs-validation')

//   // Loop over them and prevent submission
//   Array.from(forms).forEach(form => {
//     form.addEventListener('submit', event => {
//       if (!form.checkValidity()) {
//         event.preventDefault()
//         event.stopPropagation()
//       }

//       form.classList.add('was-validated')
//     }, false)
//   })
// })()

(() => {
  const forms = document.querySelectorAll('.needs-validation');

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
        event.preventDefault();
        event.stopPropagation();

        // Get elements and values
        const emailInput = document.querySelector("#email-input");
        const passwordInput = document.querySelector("#password-input");

        const emailFeedback = document.querySelector("#emailFeedback");
        const passwordFeedback = document.querySelector("#passwordFeedback");

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        let isValid = true;

        // Reset previous errors
        emailInput.classList.remove("is-invalid");
        passwordInput.classList.remove("is-invalid");

        // Password: 9-31 characters
        if (password.length < 8 || password.length > 32) {
            passwordInput.classList.remove("is-valid");
            passwordInput.classList.add("is-invalid");
            passwordFeedback.textContent = "Password must be between 7 and 31 characters including both.";
            isValid = false;
        }

        // Email: simple check
        if (
            email.length < 6 ||
            email.length > 64 ||
            !email.includes("@") ||
            !email.includes(".") ||
            email.indexOf("@") === 0 ||
            email.lastIndexOf(".") < email.indexOf("@")  // There must be "." after "@" sign
        ) {
            // Invalid email
            emailInput.classList.remove("is-valid");
            emailInput.classList.add("is-invalid");
            emailFeedback.textContent = "Please enter a valid email address.";
            isValid = false;
        }

        if (!isValid) {
            form.classList.add("was-validated");
            return; // stop submit
        }

        form.classList.add("was-validated");
        Submit();
    });
  });
})();

function Submit() {
  axios
    .post("http://localhost:3000/logIn", {
      password: document.querySelector("#password-input").value,
      email: document.querySelector("#email-input").value,
    })
    .then((response) => {
      console.log(response.data);
      window.location.href = "index.html";
    })
    .catch((err) => {
      console.log("Error while waiting for server responce: " + err);
      alert("There was an error while trying to sing-up, please try again. If the issue presists inform the owner of the site about the issue and provide them with this info: " + err);
    });
}