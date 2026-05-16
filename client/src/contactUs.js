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
  window.location.href = "index.html";
});

firstSlide.classList.remove("d-none");
secondSlide.classList.add("d-none");

(() => {
  const forms = document.querySelectorAll(".needs-validation");

  emailInput.classList.remove("is-invalid");
  firstNameInput.classList.remove("is-invalid");
  lastNameInput.classList.remove("is-invalid");

  const updateFieldUI = (input, feedback, isValid, msg) => {
    input.classList.toggle("is-valid", isValid);
    input.classList.toggle("is-invalid", !isValid);
    feedback.textContent = isValid ? "" : msg;
    return isValid;
  };
  const checkName = (input, feedback, msg1) => {
    const nameValue = input.value.trim();
    const nameRegex = /^[a-zA-Z][a-zA-Z\s-]*$/;
    const isValid =
      nameValue.length >= 2 &&
      nameValue.length <= 30 &&
      nameRegex.test(nameValue);
    const errorMsg =
      nameValue.length === 0
        ? msg1
        : "Please use only English letters (2-30 characters)";
    return updateFieldUI(input, feedback, isValid, errorMsg);
  };
  const checkEmail = () => {
    const email = emailInput.value.trim();

    const isValid =
      email.length >= 6 &&
      email.length <= 64 &&
      email.includes("@") &&
      email.includes(".") &&
      email.indexOf("@") !== 0 &&
      email.lastIndexOf(".") > email.indexOf("@") &&
      email.lastIndexOf(".") < email.length - 1;
    return updateFieldUI(
      emailInput,
      emailFeedback,
      isValid,
      "Please enter a valid email address (6-64 characters, must include @ and .)",
    );
  };

  firstNameInput.addEventListener("input", () => {
    checkName(firstNameInput, firstNameFeedback, "First name is required.");
  });

  lastNameInput.addEventListener("input", () => {
    checkName(lastNameInput, lastNameFeedback, "Last name is required.");
  });

  emailInput.addEventListener("input", checkEmail);

  Array.from(forms).forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const isValidEmail = checkEmail();
      const isValidFirstName = checkName(
        firstNameInput,
        firstNameFeedback,
        "First name is required.",
      );
      const isValidLastName = checkName(
        lastNameInput,
        lastNameFeedback,
        "Last name is required.",
      );

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
      `${import.meta.env.VITE_API_URL}/support`,
      {
        email: document.querySelector("#contact-email-input").value,
        firstName: document.querySelector("#first-name-input").value,
        lastName: document.querySelector("#last-name-input").value,
        problem_description: document.querySelector("#problem-description")
          .value,
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
