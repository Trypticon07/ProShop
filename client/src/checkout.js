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

const paymentRadiosElement = [
  // Converting NodeList into an Array.
  ...document.querySelectorAll("#payment-method input[type='radio']"),
];
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
} from "./utils/validation.js";
import { clearCart } from "./common.js";
import { submitFormData } from "./utils/submit.js";
import axios from "axios";

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
    form.addEventListener("submit", async (event) => {
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
      const selectedPaymentMethod = document.querySelector(
        'input[name="paymentMethod"]:checked',
      );

      const fieldMap = {
        firstName: { input: firstNameInput, feedback: firstNameFeedback },
        lastName: { input: lastNameInput, feedback: lastNameFeedback },
        email: { input: emailInput, feedback: emailFeedback },
        address: { input: addressInput, feedback: addressFeedback },
        address2: { input: address2Input, feedback: address2Feedback },
        country: { input: countrySelect, feedback: countryFeedback },
        city: { input: cityInput, feedback: cityFeedback },
        zip: { input: zipInput, feedback: zipFeedback },
        paymentMethod: {
          input: paymentRadiosElement,
          feedback: paymentRadiosFeedback,
        },
        nameOnCard: { input: nameOnCardInput, feedback: nameOnCardFeedback },
        cardNumber: { input: cardNumberInput, feedback: cardNumberFeedback },
        cardExpiration: {
          input: cardExpirationInput,
          feedback: cardExpirationFeedback,
        },
        cardCvv: { input: cardCvvInput, feedback: cardCvvFeedback },
      };
      const payload = {};
      // const payload = {
      //   firstName: firstNameInput.value,
      //   lastName: lastNameInput.value,
      //   email: emailInput.value,
      //   address: addressInput.value,
      //   address2: address2Input.value,
      //   country: countrySelect.value,
      //   city: cityInput.value,
      //   zip: zipInput.value,
      //   paymentMethod: selectedPaymentMethod,
      //   nameOnCard: nameOnCardInput.value.toUpperCase(),
      //   cardNumber: cardNumberInput.value,
      //   cardExpiration: cardExpirationInput.value,
      //   cardCvv: cardCvvInput.value,
      // };
      const result = await submitFormData({
        endpoint: "/order/add",
        payload: payload,
        fieldMap: fieldMap,
        backendResponseEl: backendResponse,
      });
      if (result.success) {
        if (response.data) {
          clearCart();
        }
        screen1.classList.add("d-none");
        screen2.classList.remove("d-none");
      }
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
