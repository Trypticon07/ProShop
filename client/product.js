const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

const productImage = document.getElementById("productImage");
const productName = document.getElementById("productName");
const productDescription = document.getElementById("productDescription");
const productPrice = document.getElementById("productPrice");

if (productId) {
  // Now fetch the product details
  fetch(`http://localhost:3000/product?id=${productId}`)
    .then((res) => res.json())
    .then((data) => {
      productImage.src = `${
        data[0].image_url || "images/png/projectImage.png"
      }`;
      productName.textContent = data[0].name;
      productDescription.textContent = data[0].description;
      productPrice.textContent = data[0].price;
    })
    .catch((err) => console.error("Error loading product:", err));
}
