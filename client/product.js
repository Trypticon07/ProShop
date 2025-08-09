const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

const productImage1 = document.getElementById("productImage1");
const productImage2 = document.getElementById("productImage2");
const productImage3 = document.getElementById("productImage3");
const productName = document.getElementById("productName");
const productDescription = document.getElementById("productDescription");
const productPrice = document.getElementById("productPrice");

if (productId) {
  fetch(`http://localhost:3000/product?id=${productId}`)
    .then((res) => res.json())
    .then((data) => {
      productName.textContent = data[0].name;
      productDescription.textContent = data[0].description;
      productPrice.textContent = data[0].price;
      if (!data[0].image_urls) {
        productImage1.src = `${"images/png/projectImage.png"}`;
        productImage2.src = `${"images/png/projectImage.png"}`;
        productImage3.src = `${"images/png/projectImage.png"}`;
        return;
      }
      const imageArray = data[0].image_urls.replace(/[{}]/g, "").split(",");
      productImage1.src = `${"images/png/" + imageArray[0]}`;
      productImage2.src = `${"images/png/" + imageArray[1]}`;
      productImage3.src = `${"images/png/" + imageArray[2]}`;
    })
    .catch((err) => console.error("Error loading product:", err));
}
