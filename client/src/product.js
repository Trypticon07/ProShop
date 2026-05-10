const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

const productImage1 = document.getElementById("productImage1");
const productImage2 = document.getElementById("productImage2");
const productImage3 = document.getElementById("productImage3");
const productName = document.getElementById("productName");
const productDescription = document.getElementById("productDescription");
const productPrice = document.getElementById("productPrice");

const buyButton = document.querySelector(".buy-btn");
const buyAndCheckOutBtn = document.querySelector(".buy-and-checkout-btn");

import { alertContainer, amountInCart, session, addToCart } from "./common.js";

buyAndCheckOutBtn.addEventListener("click", async () => {
  await Buy();
  window.location.href = "/checkout.html";
});

buyButton.addEventListener("click", () => {
  Buy();
});

if (productId) {
  fetch(`${import.meta.env.VITE_API_URL}/product?id=${productId}`)
    .then((res) => res.json())
    .then((data) => {
      productName.textContent = data[0].name;
      productDescription.textContent = data[0].description;
      productPrice.textContent = `${"$" + data[0].price}`;
      if (!data[0].image_urls) {
        productImage1.src = `${"/images/projectImage.png"}`;
        productImage2.src = `${"/images/projectImage.png"}`;
        productImage3.src = `${"/images/projectImage.png"}`;
        return;
      }
      const imageArray = data[0].image_urls.replace(/[{}]/g, "").split(",");
      productImage1.src = `${"/images/" + imageArray[0]}`;
      productImage2.src = `${"/images/" + imageArray[1]}`;
      productImage3.src = `${"/images/" + imageArray[2]}`;
    })
    .catch((err) => console.error("Error loading product:", err));
}

async function Buy() {
  // Adding message
  const alert = document.createElement("div");
  alert.className = "alert alert-success alert-dismissible fade show mb-2";
  alert.setAttribute("role", "alert");
  alert.innerHTML = `Product added to cart.
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;

  alertContainer.appendChild(alert);

  // If more than 2 messages deliting the old one
  const alerts = alertContainer.querySelectorAll(".alert");
  if (alerts.length > 2) {
    alerts[0].remove();
  }
  setTimeout(() => {
    alert.classList.remove("show");
    alert.classList.add("fade");
    setTimeout(() => alert.remove(), 150);
  }, 2000);

  // Cart logic
  let productName;
  let productPrice;
  let quantity = 1;

  fetch(`${import.meta.env.VITE_API_URL}/product?id=${productId}`)
    .then((res) => res.json())
    .then(async (data) => {
      productName = data[0].name;
      productPrice = data[0].price;

      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      const existing = cart.find((item) => item.product_id == productId);

      if (existing) {
        existing.quantity++;
        quantity = existing.quantity;
      } else {
        cart.push({
          product_id: productId,
          productName,
          productPrice,
          quantity,
        });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      amountInCart.textContent = cart.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0,
      );
      amountInCart.classList.remove("d-none");
      if (session) {
        await addToCart(productId, quantity);
      }
    })
    .catch((err) => console.error("Error loading product:", err));
}
