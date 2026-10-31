export const validateEmail = (email) => {
  if (!email || typeof email !== "string") {
    return {
      isInvalid: true,
      field: "email",
      error: "Please enter a valid email.",
    };
  }
  // remove this:
  const trimmedEmail = email.trim();

  const isValid =
    trimmedEmail.length >= 6 &&
    trimmedEmail.length <= 64 &&
    trimmedEmail.includes("@") &&
    trimmedEmail.includes(".") &&
    trimmedEmail.indexOf("@") !== 0 &&
    trimmedEmail.lastIndexOf(".") > trimmedEmail.indexOf("@") &&
    trimmedEmail.lastIndexOf(".") < trimmedEmail.length - 1;
  if (isValid) {
    return { isInvalid: false };
  } else {
    return {
      // TODO: Change everywhere to isValid
      isInvalid: true,
      field: "email",
      error:
        "Please enter a valid email address (6-64 characters, must include @ and .)",
    };
  }
};

export function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return {
      isInvalid: true,
      field: "password",
      error: "Please enter a password email.",
    };
  }
  if (password.length >= 8 && password.length <= 100) {
    return { isInvalid: false };
  } else {
    return {
      isInvalid: true,
      field: "password",
      error: "Password must be between 8 and 100 characters.",
    };
  }
}

export function validateUsername(username) {
  if (!username || typeof username !== "string") {
    return {
      isInvalid: true,
      field: "username",
      error: "Please enter a valid username.",
    };
  }
  const trimmedUsername = username.trim();
  if (trimmedUsername.length >= 3 && trimmedUsername.length <= 30) {
    return { isInvalid: false };
  } else {
    return {
      isInvalid: true,
      field: "username",
      error: "Username must be between 3 and 30 characters.",
    };
  }
}

export const validateCardNumber = (cardNumber) => {
  if (!cardNumber || typeof cardNumber !== "string") {
    return {
      isInvalid: true,
      field: "cardNumber",
      error: "Please enter a valid cardNumber.",
    };
  }
  const number = cardNumber.trim();
  // Deleting all spaces
  const digits = number.replace(/\s+/g, "");

  // Only numbers and length 13–19
  if (!/^\d{13,19}$/.test(digits)) {
    return {
      isInvalid: true,
      field: "cardNumber",
      error: "Card number must be between 13 and 19 characters long.",
    };
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
  if (isValid) {
    return { isInvalid: false };
  } else {
    return {
      isInvalid: true,
      field: "cardNumber",
      error: "Please enter a valid card number.",
    };
  }
};

export function validateCardExpiration(expiration) {
  if (!expiration || typeof expiration !== "string") {
    return {
      isInvalid: true,
      field: "cardExpiration",
      error: "Please enter a valid expiry date.",
    };
  }
  const expirationValue = expiration.trim();
  // checking format MM/YY or MM/YYYY
  const match = expirationValue.match(/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/);
  if (!match) {
    return {
      isInvalid: true,
      field: "cardExpiration",
      error: "Expiry date must be in MM/YY or MM/YYYY format.",
    };
  }

  let month = parseInt(match[1], 10);
  let year = parseInt(match[2], 10);

  // converting to YYYY
  if (year < 100) {
    const currentYear = new Date().getFullYear();
    const prefix = Math.floor(currentYear / 100) * 100;
    year += prefix;
  }

  const now = new Date();
  const expDate = new Date(year, month - 1, 1);
  const currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const isValid = expDate >= currentDate;
  if (isValid) {
    return { isInvalid: false };
  } else {
    return {
      isInvalid: true,
      field: "cardExpiration",
      error: "The card has expired.",
    };
  }
}

export const validateName = (name, nameType) => {
  if (!name || typeof name !== "string") {
    return {
      isInvalid: true,
      field: `${nameType}`,
      error: "Please enter a valid name.",
    };
  }
  const trimmedName = name.trim();

  if (trimmedName.length < 2 || trimmedName.length > 50) {
    return {
      isInvalid: true,
      field: `${nameType}`,
      error: "Name must be between 2 and 50 characters long.",
    };
  }
  const nameRegex = /^[\p{L}'\s-]+$/u;
  if (nameRegex.test(trimmedName)) {
    return { isInvalid: false };
  } else {
    return {
      isInvalid: true,
      field: `${nameType}`,
      error: "Name can only contain letters, hyphens, apostrophes, and spaces.",
    };
  }
};

export const validateAddress = (address, addressType) => {
  if (!address || typeof address !== "string") {
    return {
      isInvalid: true,
      field: `${addressType}`,
      error: "Please enter a valid address.",
    };
  }
  const trimmedAddress = address.trim();
  const isValid = trimmedAddress.length >= 5 && trimmedAddress.length <= 100;
  if (isValid) {
    return { isInvalid: false };
  } else {
    return {
      isInvalid: true,
      field: `${addressType}`,
      error: "Address must be between 5 and 100 characters long.",
    };
  }
};

export const validateCity = (city) => {
  if (!city || typeof city !== "string") {
    return {
      isInvalid: true,
      field: "city",
      error: "Please enter a valid city.",
    };
  }
  const trimmedCity = city.trim();
  const cityRegex = /^[\p{L}\s\-]+$/u;

  if (trimmedCity.length < 2 || trimmedCity.length > 50) {
    return {
      isInvalid: true,
      field: "city",
      error: "City name must be between 2 and 50 characters long.",
    };
  }

  if (cityRegex.test(trimmedCity)) {
    return { isInvalid: false };
  } else {
    return {
      isInvalid: true,
      field: "city",
      error: "City name can only contain letters, spaces, and hyphens.",
    };
  }
};

export const validateZip = (zip) => {
  if (!zip || typeof zip !== "string") {
    return {
      isInvalid: true,
      field: "zip",
      error: "Please enter a valid zip.",
    };
  }
  const trimmedZip = zip.trim();

  if (trimmedZip.length < 3 || trimmedZip.length > 12) {
    return {
      isInvalid: true,
      field: "zip",
      error: "Postal code must be between 3 and 12 characters long.",
    };
  }

  const zipRegex = /^[a-zA-Z0-9\s\-]+$/;

  if (zipRegex.test(trimmedZip)) {
    return { isInvalid: false };
  } else {
    return {
      isInvalid: true,
      field: "zip",
      error:
        "Postal code can only contain letters, numbers, spaces, and hyphens.",
    };
  }
};

export const validateCardName = (cardName) => {
  if (!cardName || typeof cardName !== "string") {
    return {
      isInvalid: true,
      field: "nameOnCard",
      error: "Please enter a valid card name.",
    };
  }
  const newCardName = cardName.trim().toUpperCase();

  if (newCardName.length < 4 || newCardName.length > 26) {
    return {
      isInvalid: true,
      field: "nameOnCard",
      error: "Cardholder name must be between 4 and 26 characters long.",
    };
  }

  const cardNameRegex = /^[A-Z\s\.\-]+$/;

  if (cardNameRegex.test(newCardName)) {
    return { isInvalid: false };
  } else {
    return {
      isInvalid: true,
      field: "nameOnCard",
      error:
        "Please enter the name exactly as it appears on your card (Latin letters only).",
    };
  }
};

export const validateCvv = (cvv) => {
  if (!cvv || typeof cvv !== "string") {
    return {
      isInvalid: true,
      field: "cardCvv",
      error: "Please enter a valid CVV.",
    };
  }
  const trimmedCvv = cvv.trim();

  const cvvRegex = /^\d{3,4}$/;
  if (cvvRegex.test(trimmedCvv)) {
    return { isInvalid: false };
  } else {
    return {
      isInvalid: true,
      field: "cardCvv",
      error: "CVV must be 3 or 4 digits long.",
    };
  }
};

export const validateCountry = (country) => {
  if (!country || typeof country !== "string") {
    return {
      isInvalid: true,
      field: "country",
      error: "Please select your country from the list.",
    };
  }
  const countries = ["Ukraine", "Poland", "United States"];
  const isValid = countries.includes(country);
  if (isValid) {
    return { isInvalid: false };
  } else {
    return {
      isInvalid: true,
      field: "country",
      error: "Please select your country from the list.",
    };
  }
};

export const validateDescription = (description) => {
  if (!description || typeof description !== "string") {
    return {
      isInvalid: true,
      field: "description",
      error: "Please enter a valid description (15-3000 characters).",
    };
  }
  const trimmedText = description.trim();

  if (trimmedText.length < 15 && trimmedText.length > 3000) {
    return { isInvalid: false };
  } else {
    return {
      isInvalid: true,
      field: "description",
      error: "Please enter a valid description (15-3000 characters).",
    };
  }
};

export const validateAgreeCheck = (agreeTerms) => {
  if (!agreeTerms || typeof agreeTerms !== "boolean") {
    return {
      isInvalid: true,
      field: "agreeTerms",
      error: "You must agree to the terms and conditions.",
    };
  } else {
    return { isInvalid: false };
  }
};

export const validatePaymentMethod = (paymentMethod) => {
  const allowedMethods = ["credit", "debit", "paypal"];
  if (
    !paymentMethod ||
    typeof paymentMethod !== "string" ||
    !allowedMethods.includes(paymentMethod)
  ) {
    return {
      isInvalid: true,
      field: "paymentMethod",
      error: "Please select a payment method form the list.",
    };
  } else {
    return { isInvalid: false };
  }
};
