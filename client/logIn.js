const emailInput = document.querySelector("#email-input");
const passwordInput = document.querySelector("#password-input");

const emailFeedback = document.querySelector("#emailFeedback");
const passwordFeedback = document.querySelector("#passwordFeedback");

const captchaError = document.querySelector("#captchaFeedback");
const checkForm = document.querySelector("#check-form");
const invalidEmailOrPassword = document.querySelector(
  "#invalid-email-or-password"
);
let isValidEmail = false;
let isValidPassword = false;

(() => {
  const forms = document.querySelectorAll(".needs-validation");

  emailInput.classList.remove("is-invalid");
  passwordInput.classList.remove("is-invalid");

  emailInput.addEventListener("input", () => {
    const email = emailInput.value.trim();

    isValidEmail =
      email.length >= 6 &&
      email.length <= 64 &&
      email.includes("@") &&
      email.includes(".") &&
      email.indexOf("@") !== 0 &&
      email.lastIndexOf(".") > email.indexOf("@");

    if (!isValidEmail) {
      emailInput.classList.remove("is-valid");
      emailInput.classList.add("is-invalid");
      emailFeedback.textContent = "Please enter a valid email address.";
    } else {
      emailInput.classList.remove("is-invalid");
      emailInput.classList.add("is-valid");
      emailFeedback.textContent = "";
    }
  });
  passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;

    if (password.length < 8) {
      passwordInput.classList.remove("is-valid");
      passwordInput.classList.add("is-invalid");
      passwordFeedback.textContent =
        "Password must be at least 8 characters long";
    } else {
      passwordInput.classList.remove("is-invalid");
      passwordInput.classList.add("is-valid");
      passwordFeedback.textContent = "";
      isValidPassword = true;
    }
  });
  Array.from(forms).forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopPropagation();

      // const captchaResponse = grecaptcha.getResponse();
      // if (captchaResponse) {
      //   grecaptcha.reset();
      // }
      // if (!captchaResponse) {
      //   captchaError.textContent = "Please confirm that you are not a robot.";
      //   captchaError.classList.remove("d-none");
      //   captchaError.classList.add("d-block");
      //   isValid = false;
      // }

      if (!isValidEmail || !isValidPassword) return;
      checkForm.classList.remove("form-invalid");
      checkForm.classList.add("form-valid");
      Submit((captchaResponse = "1234"));
    });
  });
})();

function Submit(captchaToken) {
  const captchaError = document.querySelector("#captcha-error");
  axios
    .post("http://localhost:3000/logIn", {
      password: document.querySelector("#password-input").value,
      email: document.querySelector("#email-input").value,
      captcha: captchaToken,
    })
    .then((response) => {
      console.log(response.data);
      window.location.href = "index.html";
    })
    .catch((err) => {
      const res = err.response.data;
      const status = err.response?.status;
      if (status === 401) {
        invalidEmailOrPassword.textContent = "Invalid email or password";
        invalidEmailOrPassword.classList.remove("d-none");
        invalidEmailOrPassword.classList.add("d-block");
        checkForm.classList.remove("form-valid");
        checkForm.classList.add("form-invalid");
      } else if (status === 400) {
        if (res?.isInvalid) {
          if (res.field === "email") {
            emailInput.classList.remove("is-invalid");
            emailInput.classList.add("is-invalid");
            emailFeedback.textContent = res.error;
          } else if (res?.field === "password") {
            passwordInput.classList.remove("is-invalid");
            passwordInput.classList.add("is-invalid");
            passwordFeedback.textContent = res.error;
          }
        }

        // captchaError.textContent = "Please confirm that you are not a robot.";
        // captchaError.classList.remove("d-none");
        // captchaError.classList.add("d-block");
        //grecaptcha.reset();
      } else {
        console.log("Error while waiting for server response: " + err);
        alert(
          "There was an error while trying to log in. If this keeps happening, inform the site owner with this info: " +
            err
        );
      }
    });
}
