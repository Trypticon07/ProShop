const emailInput = document.querySelector("#checkout-email-input");
const firstNameInput = document.querySelector("#first-name-input");
const lastNameInput = document.querySelector("#last-name-input");

const emailFeedback = document.querySelector("#emailFeedback");
const firstNameFeedback = document.querySelector("#firstNameFeedback");
const lastNameFeedback = document.querySelector("#lastNameFeedback");

const addressInput = document.querySelector("#address-input");
const address2Input = document.querySelector("#address2-input");
const countrySelect = document.querySelector("#country-select");
const cityInput = document.querySelector("#city-input");
const zipInput = document.querySelector("#zip-input");

const addressFeedback = document.querySelector("#addressFeedback");
const address2Feedback = document.querySelector("#address2Feedback");
const countryFeedback = document.querySelector("#countryFeedback");
const cityFeedback = document.querySelector("#cityFeedback");
const zipFeedback = document.querySelector("#zipFeedback");

const paymentRadiosElement = document.querySelectorAll(
  "#payment-method input[type='radio']",
);
const paymentRadios = document.querySelectorAll("input[name='paymentMethod']");
const paymentRadiosFeedback = document.querySelector("#paymentRadiosFeedback");

const nameOnCardInput = document.querySelector("#name-on-card-input");
const cardNumberInput = document.querySelector("#card-number-input");
const cardExpirationInput = document.querySelector("#card-expiration-input");
const cardCvvInput = document.querySelector("#card-cvv-code");

const nameOnCardFeedback = document.querySelector("#nameOnCardFeedback");
const cardNumberFeedback = document.querySelector("#cardNumberFeedback");
const cardExpirationFeedback = document.querySelector("#ExpirationFeedback");
const cardCvvFeedback = document.querySelector("#CVVFeedback");

const backendResponse = document.querySelector("#backend-response");

const cartTable = document.querySelector("#cart-table");
const totalInCart = document.querySelector("#total-in-cart");

const totalPriceInCartText = document.querySelector("#total-price");

const submitCheckoutBtn = document.getElementById("submit-checkout");

const screen1 = document.getElementById("screen-1");
const screen2 = document.getElementById("screen-2");
const backBtn = document.querySelector("#to-home-page");

import {
  validateName,
  validateEmail,
  validateCardNumber,
  validateCardExpiration,
  validateAddress,
  validateCity,
  validateZip,
  validateCardName,
  validateCvv,
  validateCountry,
  validatePaymentMethod,
  setupLiveValidation,
} from "./validation.js";
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
    setupLiveValidation(addressInput, () =>
      validateAddress(addressInput, addressFeedback),
    ),
    setupLiveValidation(address2Input, () =>
      validateAddress(address2Input, address2Feedback),
    ),
    setupLiveValidation(countrySelect, () =>
      validateCountry(countrySelect, countryFeedback),
    ),
    setupLiveValidation(cityInput, () => validateCity(cityInput, cityFeedback)),
    setupLiveValidation(zipInput, () => validateZip(zipInput, zipFeedback)),
    setupLiveValidation(paymentRadiosElement, () =>
      validatePaymentMethod(paymentRadios, paymentRadiosFeedback),
    ),
    setupLiveValidation(nameOnCardInput, () =>
      validateCardName(nameOnCardInput, nameOnCardFeedback),
    ),
    setupLiveValidation(cardNumberInput, () =>
      validateCardNumber(cardNumberInput, cardNumberFeedback),
    ),
    setupLiveValidation(cardExpirationInput, () =>
      validateCardExpiration(cardExpirationInput, cardExpirationFeedback),
    ),
    setupLiveValidation(cardCvvInput, () =>
      validateCvv(cardCvvInput, cardCvvFeedback),
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
        city: document.querySelector("#city-input").value,
        zip: document.querySelector("#zip-input").value,
        paymentMethod: selected.id,
        nameOnCard: document
          .querySelector("#name-on-card-input")
          .value.toUpperCase(),
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
