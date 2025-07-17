// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }
      Submit();

      form.classList.add('was-validated')
    }, false)
  })
})()

function Submit() {
      axios
        .post("http://localhost:3000/submitSignUp", {
            username: document.querySelector("#username-input").value,
            password: document.querySelector("#password-input").value,
            email: document.querySelector("#email-input").value,
        })
        .then((response) => {
            console.log(response.data);
            window.location.href = "index.html";
        })
        .catch((err) => {
            console.log("Error while waiting for server responce: " + err)
            alert("There was an error while trying to sing-up, please try again. If the issue presists inform the owner of the site about the issue and provide them with this info: " + err)
        })
}
document.querySelector("#signUpButton").addEventListener("click", () => {

});