const emailInput = document.querySelector("#contact-email-input");
const firstNameInput = document.querySelector("#first-name-input");
const lastNameInput = document.querySelector("#last-name-input");
const descriptionInput = document.querySelector("#description-input");

const emailFeedback = document.querySelector("#emailFeedback");
const firstNameFeedback = document.querySelector("#firstNameFeedback");
const lastNameFeedback = document.querySelector("#lastNameFeedback");
const descriptionFeedback = document.querySelector("#descriptionFeedback");

const checkForm = document.querySelector("#check-form");
const backendResponse = document.querySelector("#backend-response");

const firstSlide = document.querySelector(".first-slide");
const secondSlide = document.querySelector(".second-slide");

const backBtn = document.querySelector("#to-home-page");

import {
  validateName,
  validateEmail,
  validateSupportDescription as validateDescription,
  setupLiveValidation,
} from "./validation";

backBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

firstSlide.classList.remove("d-none");
secondSlide.classList.add("d-none");

(() => {
  const forms = document.querySelectorAll(".needs-validation");

  const fieldsToValidate = [
    setupLiveValidation(firstNameInput, () =>
      validateName(firstNameInput, firstNameFeedback),
    ),
    setupLiveValidation(lastNameInput, () =>
      validateName(lastNameInput, lastNameFeedback),
    ),
    setupLiveValidation(emailInput, () =>
      validateEmail(emailInput, emailFeedback),
    ),
    setupLiveValidation(
      descriptionInput,
      () => validateDescription(descriptionInput, descriptionFeedback),
      false,
    ),
  ];

  Array.from(forms).forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopPropagation();

      let isFormValid = true;
      let firstInvalidInput = null;

      fieldsToValidate.forEach((field) => {
        const isValid = field.forceValidate();

        if (!isValid) {
          isFormValid = false;
          if (!firstInvalidInput) {
            firstInvalidInput = field.element;
          }
        }
      });

      if (!isFormValid) {
        if (firstInvalidInput) {
          firstInvalidInput.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        return;
      }

      Submit();
    });
  });
})();

function Submit() {
  axios
    .post(
      `${import.meta.env.VITE_API_URL}/support`,
      {
        email: document.querySelector("#contact-email-input").value,
        firstName: document.querySelector("#first-name-input").value,
        lastName: document.querySelector("#last-name-input").value,
        description: document.querySelector("#description-input").value,
      },
      {
        withCredentials: true,
      },
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
            err,
        );
      }
    });
}
