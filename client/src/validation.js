export const updateFieldUI = (input, feedback, isValid, msg) => {
  input.classList.toggle("is-valid", isValid);
  input.classList.toggle("is-invalid", !isValid);
  feedback.textContent = isValid ? "" : msg;
  return isValid;
};

export const validateUsername = (usernameInput, usernameFeedback) => {
  const username = usernameInput.value.trim();

  const isValid = username.length >= 3 && username.length <= 30;
  return updateFieldUI(
    usernameInput,
    usernameFeedback,
    isValid,
    "Username must be at least 3 characters long.",
  );
};

export const validateEmail = (emailInput, emailFeedback) => {
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

export const validatePassword = (passwordInput, passwordFeedback) => {
  return updateFieldUI(
    passwordInput,
    passwordFeedback,
    passwordInput.value.trim().length >= 8,
    "Password must be at least 8 characters long.",
  );
};

export function validateCardNumber(cardNumberInput, cardNumberFeedback) {
  const number = cardNumberInput.value.trim();
  // deleting all spaces
  const digits = number.replace(/\s+/g, "");

  // Only numbers and length 13–19
  if (!/^\d{13,19}$/.test(digits)) {
    return updateFieldUI(
      cardNumberInput,
      cardNumberFeedback,
      false,
      "Card number must be between 13 and 19 characters long.",
    );
  }

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
  const isValid = sum % 10 === 0;
  return updateFieldUI(
    cardNumberInput,
    cardNumberFeedback,
    isValid,
    "Please enter a valid card number.",
  );
}

export function validateCardExpiration(expirationInput, expirationFeedback) {
  const expirationValue = expirationInput.value.trim();
  // checking format MM/YY or MM/YYYY
  const match = expirationValue.match(/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/);
  if (!match) {
    return updateFieldUI(
      expirationInput,
      expirationFeedback,
      false,
      "Expiry date must be in MM/YY or MM/YYYY format.",
    );
  }

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
  const currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const isValid = expDate >= currentDate;
  return updateFieldUI(
    expirationInput,
    expirationFeedback,
    isValid,
    "The card has expired.",
  );
}

export const validateName = (nameInput, nameFeedback) => {
  const trimmedName = nameInput.value.trim();

  if (trimmedName.length < 2 || trimmedName.length > 50) {
    return updateFieldUI(
      nameInput,
      nameFeedback,
      false,
      "Name must be between 2 and 50 characters long.",
    );
  }
  const nameRegex = /^[\p{L}'\s-]+$/u;
  // const nameRegex = /^[\p{L}'-\s]+$/u;
  if (!nameRegex.test(trimmedName)) {
    return updateFieldUI(
      nameInput,
      nameFeedback,
      false,
      "Name can only contain letters, hyphens, apostrophes, and spaces.",
    );
  }

  return updateFieldUI(nameInput, nameFeedback, true, "");
};

export const validateAddress = (addressInput, addressFeedback) => {
  const address = addressInput.value.trim();
  const isValid = address.length >= 5 && address.length <= 100;
  return updateFieldUI(
    addressInput,
    addressFeedback,
    isValid,
    "Address must be between 5 and 100 characters long.",
  );
};

export const validateCity = (cityInput, cityFeedback) => {
  const trimmedCity = cityInput.value.trim();
  const cityRegex = /^[\p{L}\s\-]+$/u;

  if (trimmedCity.length < 2 || trimmedCity.length > 50) {
    return updateFieldUI(
      cityInput,
      cityFeedback,
      false,
      "City name must be between 2 and 50 characters long.",
    );
  }

  if (!cityRegex.test(trimmedCity)) {
    return updateFieldUI(
      cityInput,
      cityFeedback,
      false,
      "City name can only contain letters, spaces, and hyphens.",
    );
  }
  return updateFieldUI(cityInput, cityFeedback, true, "");
};

export const validateZip = (zipInput, zipFeedback) => {
  const trimmedZip = zipInput.value.trim();

  if (trimmedZip.length < 3 || trimmedZip.length > 12) {
    return updateFieldUI(
      zipInput,
      zipFeedback,
      false,
      "Postal code must be between 3 and 12 characters long.",
    );
  }

  const zipRegex = /^[a-zA-Z0-9\s\-]+$/;

  if (!zipRegex.test(trimmedZip)) {
    return updateFieldUI(
      zipInput,
      zipFeedback,
      false,
      "Postal code can only contain letters, numbers, spaces, and hyphens.",
    );
  }

  return updateFieldUI(zipInput, zipFeedback, true, "");
};

export const validateCardName = (cardNameInput, cardNameFeedback) => {
  const trimmedName = cardNameInput.value.trim();

  if (trimmedName.length < 4 || trimmedName.length > 26) {
    return updateFieldUI(
      cardNameInput,
      cardNameFeedback,
      false,
      "Cardholder name must be between 4 and 26 characters long.",
    );
  }

  const cardNameRegex = /^[A-Z\s\.\-]+$/;

  if (!cardNameRegex.test(trimmedName)) {
    return updateFieldUI(
      cardNameInput,
      cardNameFeedback,
      false,
      "Please enter the name exactly as it appears on your card (Latin letters only).",
    );
  }

  return updateFieldUI(cardNameInput, cardNameFeedback, true, "");
};

export const validateCvv = (input = cvvInput, feedback = cvvFeedback) => {
  const trimmedCvv = input.value.trim();

  const cvvRegex = /^\d{3,4}$/;

  return updateFieldUI(
    input,
    feedback,
    cvvRegex.test(trimmedCvv),
    "CVV must be 3 or 4 digits long.",
  );
};

export const validateCountry = (countrySelect, countryFeedback) => {
  const isValid = countrySelect.value !== "";
  return updateFieldUI(
    countrySelect,
    countryFeedback,
    isValid,
    "Please select your country from the list.",
  );
};

export const validateSupportDescription = (
  descriptionInput,
  descriptionFeedback,
) => {
  const trimmedText = descriptionInput.value.trim();

  if (trimmedText.length < 15) {
    return updateFieldUI(
      descriptionInput,
      descriptionFeedback,
      false,
      "Please describe your problem in more detail (minimum 15 characters).",
    );
  }

  if (trimmedText.length > 3000) {
    return updateFieldUI(
      descriptionInput,
      descriptionFeedback,
      false,
      "Your description is too long. Please shorten it to 3000 characters.",
    );
  }

  return updateFieldUI(descriptionInput, descriptionFeedback, true, "");
};

export const validateAgreeCheck = (agreeCheck, agreeFeedback) => {
  return updateFieldUI(
    agreeCheck,
    agreeFeedback,
    agreeCheck.checked,
    "You must agree before submitting.",
  );
};

export const validateCaptcha = (
  captchaResponse,
  captchaFeedback,
  captchaWidget,
) => {
  const isValid = captchaResponse.length > 0;

  if (!isValid) {
    captchaFeedback.textContent = "Please verify that you are not a robot.";
    captchaFeedback.style.display = "block";
    captchaWidget.style.border = "1px solid #dc3545";
    captchaWidget.style.borderRadius = "4px";
  } else {
    captchaFeedback.textContent = "";
    captchaFeedback.style.display = "none";
    captchaWidget.style.border = "none";
  }

  return isValid;
};

export const validatePaymentMethod = (paymentRadios, paymentRadiosFeedback) => {
  const checkedRadio = Array.from(paymentRadios).find((radio) => radio.checked);
  const isValid = !!checkedRadio;

  const errorMessage = "Please select a payment method.";
  paymentRadiosFeedback.classList.toggle("d-block", !isValid);
  paymentRadios.forEach((radio, index) => {
    if (index === 0) {
      updateFieldUI(radio, paymentRadiosFeedback, isValid, errorMessage);
    } else {
      updateFieldUI(radio, {}, isValid, errorMessage);
    }
  });

  return isValid;
};

export const setupLiveValidation = (inputElement, validationFunction) => {
  let hasBeenBlurred = false;

  inputElement.addEventListener("blur", () => {
    hasBeenBlurred = true;
    validationFunction();
  });

  inputElement.addEventListener("input", () => {
    if (inputElement.classList.contains("is-invalid") || hasBeenBlurred) {
      validationFunction();
    }
  });

  return {
    forceValidate: () => {
      hasBeenBlurred = true;
      return validationFunction();
    },
    element: inputElement,
  };
};
