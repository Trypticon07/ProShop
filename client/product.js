const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

const productImage1 = document.getElementById("productImage1");
const productImage2 = document.getElementById("productImage2");
const productImage3 = document.getElementById("productImage3");
console.log(document.getElementById("#productImage3"));
const productName = document.getElementById("productName");
const productDescription = document.getElementById("productDescription");
const productPrice = document.getElementById("productPrice");

if (productId) {
  fetch(`http://localhost:3000/product?id=${productId}`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      console.log(data[0]);
      const imageArray = data[0].image_urls.replace(/[{}]/g, "").split(",");
      let testLet = "images/png/" + imageArray[0];
      console.log(testLet);
      console.log("img1" + productImage1);
      productImage1.src = `${
        "images/png/" + imageArray[0] || "images/png/projectImage.png"
      }`;
      productImage2.src = `${
        "images/png/" + imageArray[1] || "images/png/projectImage.png"
      }`;
      productImage3.src = `${
        "images/png/" + imageArray[2] || "images/png/projectImage.png"
      }`;
      // productImages.forEach((img) => {
      //   console.log(data[0].image_urls);
      //   const imageArray = data[0].image_urls.replace(/[{}]/g, "").split(",");
      //   console.log(imageArray[0]);
      //   img.src = `${
      //     "images/png" + imageArray[0] || "images/png/projectImage.png"
      //   }`;
      // });
      // productImage.src = `${
      //   data[0].image_url || "images/png/projectImage.png"
      // }`;
      productName.textContent = data[0].name;
      productDescription.textContent = data[0].description;
      productPrice.textContent = data[0].price;
    })
    .catch((err) => console.error("Error loading product:", err));
}
