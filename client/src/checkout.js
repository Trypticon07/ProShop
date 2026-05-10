const emailInput = document.querySelector("#checkout-email-input");
const firstNameInput = document.querySelector("#first-name-input");
const lastNameInput = document.querySelector("#last-name-input");

const emailFeedback = document.querySelector("#emailFeedback");
const firstNameFeedback = document.querySelector("#firstNameFeedback");
const lastNameFeedback = document.querySelector("#lastNameFeedback");

const addressInput = document.querySelector("#address-input");
const address2Input = document.querySelector("#address2-input");
const countrySelect = document.querySelector("#country-select");
const citySelect = document.querySelector("#city-select");
const zipInput = document.querySelector("#zip-input");

const addressFeedback = document.querySelector("#addressFeedback");
const address2Feedback = document.querySelector("#address2Feedback");
const countryFeedback = document.querySelector("#countryFeedback");
const cityFeedback = document.querySelector("#cityFeedback");
const zipFeedback = document.querySelector("#zipFeedback");

const paymentRadios = document.querySelectorAll("input[name='paymentMethod']");

const nameOnCardInput = document.querySelector("#name-on-card-input");
const cardNumberInput = document.querySelector("#card-number-input");
const cardExpirationInput = document.querySelector("#card-expiration-input");
const cardCVVCodeInput = document.querySelector("#card-cvv-code");

const nameOnCardFeedback = document.querySelector("#nameOnCardFeedback");
const cardNumberFeedback = document.querySelector("#cardNumberFeedback");
const cardExpirationFeedback = document.querySelector("#ExpirationFeedback");
const cardCVVCodeFeedback = document.querySelector("#CVVFeedback");

const backendResponse = document.querySelector("#backend-response");

const cartTable = document.querySelector("#cart-table");
const totalInCart = document.querySelector("#total-in-cart");

const totalPriceInCartText = document.querySelector("#total-price");

const submitCheckoutBtn = document.getElementById("submit-checkout");

const screen1 = document.getElementById("screen-1");
const screen2 = document.getElementById("screen-2");
const backBtn = document.querySelector("#to-home-page");

let isValidEmail = false;

let isValidFirstName = false;
let isValidLastName = false;

let isValidAddress = false;
let isValidAddress2 = false;

let isValidCountrySelect = false;
let isValidCitySelect = false;
let isValidZipInput = false;

let isValidPaymentMethod = false;

let isValidNameOnCard = false;
let isValidCardNumber = false;
let isValidCardExpiration = false;
let isValidCVVCode = false;
import { clearCart } from "./common.js";

backBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

fetch(`${import.meta.env.VITE_API_URL}/session`, {
  credentials: "include",
})
  .then((res) => {
    if (!res.ok) {
      window.location.href = "logIn.html";
      return;
    }
    return res.text();
  })
  .catch((err) => {
    console.error("Session error:", err);
    window.location.href = "logIn.html";
  });

let previousCart = JSON.parse(localStorage.getItem("cart")) || [];
function hasQuantityChanged(oldCart, newCart) {
  if (oldCart.length !== newCart.length) return true;
  for (let i = 0; i < oldCart.length; i++) {
    if (
      oldCart[i].product_id !== newCart[i].product_id ||
      oldCart[i].quantity !== newCart[i].quantity
    ) {
      return true;
    }
  }
  return false;
}

setInterval(() => {
  const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
  if (hasQuantityChanged(previousCart, currentCart)) {
    previousCart = currentCart;
    loadCart();
  }
}, 300);

(() => {
  loadCart();
  // checkout = true;
  const forms = document.querySelectorAll(".needs-validation");

  emailInput.classList.remove("is-invalid");
  firstNameInput.classList.remove("is-invalid");
  lastNameInput.classList.remove("is-invalid");

  addressInput.classList.remove("is-invalid");
  address2Input.classList.remove("is-invalid");
  countrySelect.classList.remove("is-invalid");
  citySelect.classList.remove("is-invalid");
  zipInput.classList.remove("is-invalid");

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

  addressInput.addEventListener("input", () => {
    const address = addressInput.value.trim();
    isValidAddress = address.length >= 1 && address.length <= 40;

    if (!isValidAddress) {
      addressInput.classList.remove("is-valid");
      addressInput.classList.add("is-invalid");
      addressFeedback.textContent = "Please enter a valid shipping address.";
    } else {
      addressInput.classList.remove("is-invalid");
      addressInput.classList.add("is-valid");
      addressFeedback.textContent = "";
    }
  });

  address2Input.addEventListener("input", () => {
    const address2 = address2Input.value.trim();
    isValidAddress2 = address2.length >= 1 && address2.length <= 40;

    if (!isValidAddress2) {
      address2Input.classList.remove("is-valid");
      address2Input.classList.add("is-invalid");
      address2Feedback.textContent = "Please enter a valid shipping address.";
    } else {
      address2Input.classList.remove("is-invalid");
      address2Input.classList.add("is-valid");
      address2Feedback.textContent = "";
    }
  });

  countrySelect.addEventListener("change", () => {
    const country = countrySelect.value.trim();
    if (country === "") {
      countrySelect.classList.remove("is-valid");
      countrySelect.classList.add("is-invalid");
      isValidCountrySelect = false;
    } else {
      countrySelect.classList.remove("is-invalid");
      countrySelect.classList.add("is-valid");
      isValidCountrySelect = true;
    }
  });

  citySelect.addEventListener("change", () => {
    const city = citySelect.value.trim();
    if (city === "") {
      citySelect.classList.remove("is-valid");
      citySelect.classList.add("is-invalid");
      isValidCitySelect = false;
    } else {
      citySelect.classList.remove("is-invalid");
      citySelect.classList.add("is-valid");
      isValidCitySelect = true;
    }
  });

  zipInput.addEventListener("input", () => {
    const zip = zipInput.value.trim();
    isValidZipInput = zip.length >= 2 && zip.length <= 8;

    if (!isValidZipInput) {
      zipInput.classList.remove("is-valid");
      zipInput.classList.add("is-invalid");
      zipFeedback.textContent = "Please enter a valid zip code.";
    } else {
      zipInput.classList.remove("is-invalid");
      zipInput.classList.add("is-valid");
      zipFeedback.textContent = "";
    }
  });

  paymentRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      const selected = document.querySelector(
        'input[name="paymentMethod"]:checked',
      );

      paymentRadios.forEach((r) =>
        r.classList.remove("is-valid", "is-invalid"),
      );

      if (selected) {
        const allowedMethods = ["credit", "debit", "paypal"];
        if (allowedMethods.includes(selected.id)) {
          selected.classList.add("is-valid");
          isValidPaymentMethod = true;
        } else {
          paymentRadios.forEach((r) => r.classList.add("is-invalid"));
          isValidPaymentMethod = false;
        }
      } else {
        paymentRadios.forEach((r) => r.classList.add("is-invalid"));
        isValidPaymentMethod = false;
      }
    });
  });

  nameOnCardInput.addEventListener("input", function () {
    const nameOnCard = nameOnCardInput.value.trim();

    const nameRegex = /^[A-Za-z\s'-]+$/;

    if (!nameOnCard) {
      nameOnCardInput.classList.remove("is-valid");
      nameOnCardInput.classList.add("is-invalid");
      nameOnCardFeedback.textContent = "Please enter a valid name on card";
      isValidNameOnCard = false;
    } else if (!nameRegex.test(nameOnCard)) {
      nameOnCardInput.classList.remove("is-valid");
      nameOnCardInput.classList.add("is-invalid");
      nameOnCardFeedback.textContent = "Please enter a valid name on card";
      isValidNameOnCard = false;
    } else if (nameOnCard.length < 2) {
      nameOnCardInput.classList.remove("is-valid");
      nameOnCardInput.classList.add("is-invalid");
      nameOnCardFeedback.textContent = "Please enter a valid name on card";
      isValidNameOnCard = false;
    } else {
      nameOnCardInput.classList.remove("is-invalid");
      nameOnCardInput.classList.add("is-valid");
      nameOnCardFeedback.textContent = "";
      isValidNameOnCard = true;
    }
  });

  cardNumberInput.addEventListener("input", () => {
    const cardNumber = cardNumberInput.value.trim();

    if (CheckCardNumber(cardNumber)) {
      cardNumberInput.classList.remove("is-invalid");
      cardNumberInput.classList.add("is-valid");
      cardNumberFeedback.textContent = "";
      isValidCardNumber = true;
    } else {
      cardNumberInput.classList.remove("is-valid");
      cardNumberInput.classList.add("is-invalid");
      cardNumberFeedback.textContent = "Please enter a valid card number";
      isValidCardNumber = false;
    }
  });

  cardExpirationInput.addEventListener("input", () => {
    const cardExpiration = cardExpirationInput.value.trim();

    if (checkCardExpiration(cardExpiration)) {
      cardExpirationInput.classList.remove("is-invalid");
      cardExpirationInput.classList.add("is-valid");
      cardExpirationFeedback.textContent = "";
      isValidCardExpiration = true;
    } else {
      cardExpirationInput.classList.remove("is-valid");
      cardExpirationInput.classList.add("is-invalid");
      cardExpirationFeedback.textContent =
        "Please enter a valid card expiration date";
      isValidCardExpiration = false;
    }
  });

  cardCVVCodeInput.addEventListener("input", () => {
    const cardCVVCode = cardCVVCodeInput.value.trim();
    isValidCVVCode = /^\d{3,4}$/.test(cardCVVCode);

    if (isValidCVVCode) {
      cardCVVCodeInput.classList.remove("is-invalid");
      cardCVVCodeInput.classList.add("is-valid");
      cardCVVCodeFeedback.textContent = "";
    } else {
      cardCVVCodeInput.classList.remove("is-valid");
      cardCVVCodeInput.classList.add("is-invalid");
      cardCVVCodeFeedback.textContent =
        "Please enter a valid card security code(CVV/CVC)";
    }
  });

  Array.from(forms).forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        !isValidEmail ||
        !isValidFirstName ||
        !isValidLastName ||
        !isValidAddress ||
        !isValidAddress2 ||
        !isValidCitySelect ||
        !isValidCountrySelect ||
        !isValidZipInput ||
        !isValidPaymentMethod ||
        !isValidNameOnCard ||
        !isValidCardNumber ||
        !isValidCardExpiration ||
        !isValidCVVCode
      ) {
        return;
      }

      Submit();
    });
  });
})();

function CheckCardNumber(number) {
  // deleting all spaces
  const digits = number.replace(/\s+/g, "");

  // Only numbers and length 13–19
  if (!/^\d{13,19}$/.test(digits)) return false;

  // Luhn algorithm
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function checkCardExpiration(expiration) {
  // checking format MM/YY or MM/YYYY
  const match = expiration.match(/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/);
  if (!match) return false;

  let month = parseInt(match[1], 10);
  let year = parseInt(match[2], 10);

  // if year format is YY, converting to YYYY
  if (year < 100) {
    const currentYear = new Date().getFullYear();
    const prefix = Math.floor(currentYear / 100) * 100;
    year += prefix;
  }

  const now = new Date();
  const expDate = new Date(year, month - 1, 1);

  return expDate >= new Date(now.getFullYear(), now.getMonth(), 1);
}

async function loadCart() {
  cartTable.innerHTML = "";
  let totalPriceInCart = 0;
  totalPriceInCartText.textContent = totalPriceInCart;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    totalInCart.textContent = 0;
    totalPriceInCartText.textContent = 0;
    cartTable.innerHTML = `<li class="list-group-item text-center">Cart is empty</li>`;
    submitCheckoutBtn.classList.add("disabled");
    return;
  }
  fetch(`${import.meta.env.VITE_API_URL}/cart/history`, {
    method: "GET",
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load cart history");
      return res.json();
    })
    .then((data) => {
      if (!data.cart_items || !Array.isArray(data.cart_items)) return;
      const cart = data.cart_items;
      cart.forEach((cartItem) => {
        let productPrice = cartItem.product_price * cartItem.quantity;
        totalPriceInCart += productPrice;
        totalPriceInCartText.textContent = "$" + totalPriceInCart.toFixed(2);
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between lh-sm";

        li.innerHTML = `
              <div>
                <h6 class="my-0">${cartItem.product_name}</h6>
              </div>
              <span class="text-body-secondary">$${productPrice.toFixed(
                2,
              )}</span>
            `;

        cartTable.appendChild(li);
      });
    })
    .catch((err) => console.error(err));
  let totalProducts = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  if (totalProducts > 0) {
    totalInCart.textContent = totalProducts;
  }
}

function Submit() {
  const selected = document.querySelector(
    'input[name="paymentMethod"]:checked',
  );

  axios
    .post(
      `${import.meta.env.VITE_API_URL}/order/add`,
      {
        firstName: document.querySelector("#first-name-input").value,
        lastName: document.querySelector("#last-name-input").value,
        email: document.querySelector("#checkout-email-input").value,
        address: document.querySelector("#address-input").value,
        address2: document.querySelector("#address2-input").value,
        country: document.querySelector("#country-select").value,
        city: document.querySelector("#city-select").value,
        zip: document.querySelector("#zip-input").value,
        paymentMethod: selected.id,
        nameOnCard: document.querySelector("#name-on-card-input").value,
        cardNumber: document.querySelector("#card-number-input").value,
        expiration: document.querySelector("#card-expiration-input").value,
        cvv: document.querySelector("#card-cvv-code").value,
      },
      {
        withCredentials: true,
      },
    )
    .then((response) => {
      if (response.data) {
        clearCart();
      }
      screen1.classList.add("d-none");
      screen2.classList.remove("d-none");
    })
    .catch((err) => {
      // TODO: add error logging before processing it!
      console.log(err);
      const res = err.response.data;
      const status = err.response?.status;
      if (status === 401) {
        backendResponse.textContent = "Invalid email or password";
        backendResponse.classList.remove("d-none");
        backendResponse.classList.add("d-block");
        checkForm.classList.remove("form-valid");
        checkForm.classList.add("form-invalid");
      } else if (status === 400) {
        if (res?.isInvalid) {
          if (res.field === "email") {
            emailInput.classList.add("is-invalid");
            emailFeedback.textContent = res.error;
          } else if (res?.field === "password") {
            passwordInput.classList.add("is-invalid");
            passwordFeedback.textContent = res.error;
          } else if (res?.field === "captcha") {
            captchaError.textContent = res.error;
            captchaError.classList.remove("d-none");
            captchaError.classList.add("d-block");
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
