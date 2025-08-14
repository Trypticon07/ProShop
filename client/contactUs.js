const emailInput = document.querySelector("#contact-email-input");
const firstNameInput = document.querySelector("#first-name-input");
const lastNameInput = document.querySelector("#last-name-input");

const emailFeedback = document.querySelector("#emailFeedback");
const firstNameFeedback = document.querySelector("#firstNameFeedback");
const lastNameFeedback = document.querySelector("#lastNameFeedback");

const checkForm = document.querySelector("#check-form");
const backendResponse = document.querySelector("#backend-response");

const firstSlide = document.querySelector(".first-slide");
const secondSlide = document.querySelector(".second-slide");

const backBtn = document.querySelector("#to-home-page");

let isValidEmail = false;
let isValidFirstName = false;
let isValidLastName = false;

backBtn.addEventListener("click", () => {
  window.location.href = "/client/index.html";
});

firstSlide.classList.remove("d-none");
secondSlide.classList.add("d-none");

(() => {
  const forms = document.querySelectorAll(".needs-validation");

  emailInput.classList.remove("is-invalid");
  firstNameInput.classList.remove("is-invalid");
  lastNameInput.classList.remove("is-invalid");

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
  firstNameInput.addEventListener("input", () => {
    const firstName = firstNameInput.value.trim();

    isValidFirstName = firstName.length >= 1 && firstName.length <= 30;
    if (!isValidFirstName) {
      firstNameInput.classList.remove("is-valid");
      firstNameInput.classList.add("is-invalid");
      firstNameFeedback.textContent = "Please enter a valid first name.";
    } else {
      firstNameInput.classList.remove("is-invalid");
      firstNameInput.classList.add("is-valid");
      firstNameFeedback.textContent = "";
    }
  });

  lastNameInput.addEventListener("input", () => {
    const lastName = lastNameInput.value.trim();

    isValidLastName = lastName.length >= 1 && lastName.length <= 35;
    if (!isValidLastName) {
      lastNameInput.classList.add("is-invalid");
      lastNameInput.classList.remove("is-valid");
      lastNameFeedback.textContent = "Please enter a valid last name.";
    } else {
      lastNameInput.classList.remove("is-invalid");
      lastNameInput.classList.add("is-valid");
      lastNameFeedback.textContent = "";
    }
  });

  Array.from(forms).forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!isValidEmail || !isValidFirstName || !isValidLastName) return;

      checkForm.classList.remove("form-invalid");
      checkForm.classList.add("form-valid");
      Submit();
    });
  });
})();

function Submit() {
  axios
    .post(
      "http://localhost:3000/support",
      {
        email: document.querySelector("#contact-email-input").value,
        firstName: document.querySelector("#first-name-input").value,
        lastName: document.querySelector("#last-name-input").value,
        problem_description: document.querySelector("#problem-description")
          .value,
      },
      {
        withCredentials: true,
      }
    )
    .then((response) => {
      firstSlide.classList.add("d-none");
      secondSlide.classList.remove("d-none");
    })
    .catch((err) => {
      const res = err.response.data;
      const status = err.response?.status;
      if (status === 400) {
        if (res?.isInvalid) {
          if (res.field === "email") {
            emailInput.classList.add("is-invalid");
            emailFeedback.textContent = res.error;
          } else if (res?.field === "firstName") {
            firstNameInput.classList.add("is-invalid");
            firstNameFeedback.textContent = res.error;
          } else if (res?.field === "lastName") {
            lastNameInput.classList.add("is-invalid");
            lastNameFeedback.textContent = res.error;
          }
        }
      } else if (err.response?.status === 429) {
        if (res?.isInvalid) {
          if (res.field === "rateLimit") {
            backendResponse.textContent = res.error;
            backendResponse.classList.remove("d-none");
            backendResponse.classList.add("d-block");
          }
        }
      } else {
        console.log("Error while waiting for server response: " + err);
        alert(
          "There was an error while trying to log in. If this keeps happening, inform the site owner with this info: " +
            err
        );
      }
    });
}
