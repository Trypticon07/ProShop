// Overview
const usernameField = document.getElementById("usernameField");
const emailField = document.getElementById("emailField");
const memberSinceField = document.getElementById("memberSinceField");
const idField = document.getElementById("idField");
const username = document.getElementById("username");
const email = document.getElementById("email");

// Edit profile
const usernameInput = document.getElementById("usernameEdit");
const emailInput = document.getElementById("emailEdit");
const emailFeedback = document.querySelector("#emailFeedback");
const usernameFeedback = document.querySelector("#usernameFeedback");
const backendResponse = document.querySelector("#backend-response");

let isValidEmail = false;
let isValidUsername = false;

// Change password
const oldPasswordInput = document.getElementById("oldPasswordInput");
const newPasswordInput = document.getElementById("newPasswordInput");
const oldPasswordFeedback = document.querySelector("#oldPasswordFeedback");
const newPasswordFeedback = document.querySelector("#newPasswordFeedback");
let isValidOldPassword = false;
let isValidNewPassword = false;

const changePasswordBtn = document.getElementById("changePasswordBtn");

const passwordBackendResponse = document.querySelector(
  "#password-backend-response"
);

changePasswordBtn.addEventListener("click", () => {
  changePassword();
});

// Order details
const orderId = document.getElementById("orderId");
const orderFirstName = document.getElementById("orderFirstNameField");
const orderLastName = document.getElementById("orderLastNameField");
const orderEmail = document.getElementById("orderEmailField");
const orderAddress = document.getElementById("orderAddressField");
const orderAddress2 = document.getElementById("orderAddress2Field");
const orderCountry = document.getElementById("orderCountryField");
const orderCity = document.getElementById("orderCityField");
const orderZip = document.getElementById("orderZipField");
const orderPaymentMethod = document.getElementById("orderPaymentMethodField");
const orderDate = document.getElementById("orderDateField");
const orderStatus = document.getElementById("orderStatusField");
const orderTotal = document.getElementById("orderTotalField");
const screen1 = document.getElementById("screen-1");
const screen2 = document.getElementById("screen-2");

screen1.classList.remove("d-none");
screen2.classList.add("d-none");

document.addEventListener("DOMContentLoaded", () => {
  const sidebarLinks = document.querySelectorAll(
    ".nav-pills .nav-link[data-target]"
  );
  const sections = document.querySelectorAll(".section");

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // hide all sections
      sections.forEach((section) => section.classList.add("d-none"));

      // reset links
      sidebarLinks.forEach((l) => {
        l.classList.remove("active");
        l.classList.add("link-body-emphasis");
      });

      // activate clicked link
      link.classList.add("active");
      link.classList.remove("link-body-emphasis");

      // show correct section
      const targetId = link.getAttribute("data-target");
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        targetSection.classList.remove("d-none");

        if (targetId === "#profileSection") {
          const defaultTab = document.querySelector(
            '#profileSection a[href="#overview"]'
          );
          if (defaultTab) {
            const tab = new bootstrap.Tab(defaultTab);
            tab.show();
          }
        }
      }
    });
  });
});

function getOrderDetails(orderId) {
  screen1.classList.add("d-none");
  screen2.classList.remove("d-none");
  fetch("http://localhost:3000/order/details", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.text();
      }
      return res.json();
    })
    .then((response) => {
      const orderDetails = response.order_items[0];
      orderId.textContent = "Order №" + orderDetails.order_id + " details";
      orderFirstName.textContent = orderDetails.first_name;
      orderLastName.textContent = orderDetails.last_name;
      orderEmail.textContent = orderDetails.email;
      orderAddress.textContent = orderDetails.address;
      orderAddress2.textContent = orderDetails.address2;
      orderCountry.textContent = orderDetails.country;
      orderCity.textContent = orderDetails.city;
      orderZip.textContent = orderDetails.zip;
      orderPaymentMethod.textContent = orderDetails.payment_method;
      orderDate.textContent = formatDate(orderDetails.created_at);
      orderStatus.textContent = orderDetails.status;

      orderTotal.textContent =
        "$" +
        orderDetails.items
          .reduce((sum, product) => {
            return sum + product.price * product.quantity;
          }, 0)
          .toFixed(2);

      const orderItems = orderDetails.items;
      const tableBody = document.getElementById("orderItemsTableBody");
      tableBody.innerHTML = "";

      orderItems.forEach((product) => {
        const row = `
        <tr>
          <td>${product.product_id}</td>
          <td>${product.name}</td>
          <td>
            ${product.quantity}
          </td>
          <td>$${product.price.toFixed(2)}</td>
          <td>
            $${(product.price * product.quantity).toFixed(2)}
          </td>
        </tr>
      `;
        tableBody.insertAdjacentHTML("beforeend", row);
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

function renderOrders() {
  fetch("http://localhost:3000/orders/history", {
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) {
        return res.text();
      }
      return res.json();
    })
    .then((response) => {
      const orders = response.orders;
      const tableBody = document.getElementById("ordersTableBody");
      tableBody.innerHTML = "";

      orders.forEach((order) => {
        const row = `
        <tr>
          <td>${order.order_id}</td>
          <td>${formatDate(order.created_at)}</td>
          <td>
            <span class="badge ${
              order.status === "paid"
                ? "bg-success"
                : order.status === "pending"
                ? "bg-warning text-dark"
                : order.status === "failed"
                ? "bg-danger text-dark"
                : order.status === "canceled"
                ? "bg-info text-dark"
                : "bg-dark"
            }">${order.status}</span>
          </td>
          <td>$${Number(order.total_amount).toFixed(2)}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary view-details" data-id="${
              order.order_id
            }">
              View
            </button>
          </td>
        </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", row);
      });
      const viewDetailsBtn = document.querySelectorAll(".view-details");
      viewDetailsBtn.forEach((btn) => {
        btn.addEventListener("click", (event) => {
          const orderId = event.currentTarget.dataset.id;
          getOrderDetails(orderId);
          const detailsTab = document.querySelector('a[href="#orderDetails"]');
          const tab = new bootstrap.Tab(detailsTab);
          tab.show();
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

document.addEventListener("DOMContentLoaded", renderOrders);

(() => {
  const forms = document.querySelectorAll(".needs-validation");

  emailInput.classList.remove("is-invalid");
  usernameInput.classList.remove("is-invalid");
  oldPasswordInput.classList.remove("is-invalid");
  newPasswordInput.classList.remove("is-invalid");

  usernameInput.addEventListener("input", () => {
    const username = usernameInput.value.trim();

    if (username.length < 3) {
      usernameInput.classList.remove("is-valid");
      usernameInput.classList.add("is-invalid");
      usernameFeedback.textContent =
        "Username must be at least 3 characters long.";
    } else {
      usernameInput.classList.remove("is-invalid");
      usernameInput.classList.add("is-valid");
      usernameFeedback.textContent = "";
      isValidUsername = true;
    }
  });

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

  oldPasswordInput.addEventListener("input", () => {
    const password = oldPasswordInput.value;

    if (password.length < 8) {
      oldPasswordInput.classList.remove("is-valid");
      oldPasswordInput.classList.add("is-invalid");
      oldPasswordFeedback.textContent =
        "Password must be at least 8 characters long.";
    } else {
      oldPasswordInput.classList.remove("is-invalid");
      oldPasswordInput.classList.add("is-valid");
      oldPasswordFeedback.textContent = "";
      isValidOldPassword = true;
    }
  });

  newPasswordInput.addEventListener("input", () => {
    const password = newPasswordInput.value;

    if (password.length < 8) {
      newPasswordInput.classList.remove("is-valid");
      newPasswordInput.classList.add("is-invalid");
      newPasswordFeedback.textContent =
        "Password must be at least 8 characters long.";
    } else {
      newPasswordInput.classList.remove("is-invalid");
      newPasswordInput.classList.add("is-valid");
      newPasswordFeedback.textContent = "";
      isValidNewPassword = true;
    }
  });

  Array.from(forms).forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (usernameInput.value === "" || emailInput.value === "") {
        console.log("here1");
        if (!usernameInput.value && isValidEmail) {
          console.log("hereUSer");
          isValidUsername = true;
        }
        if (!emailInput.value && isValidUsername) {
          console.log("hereEmail");
          isValidEmail = true;
        }
      }

      if (!isValidEmail || !isValidUsername) {
        console.log("here2");
        return;
      }

      Submit();
    });
  });
})();

function Submit() {
  axios
    .post(
      "http://localhost:3000/profile/edit",
      {
        username: document.querySelector("#usernameEdit").value,
        email: document.querySelector("#emailEdit").value,
      },
      {
        withCredentials: true,
      }
    )
    .then((response) => {
      console.log(response.data);
      window.location.href = "/client/profile.html";
    })
    .catch((err) => {
      const res = err.response.data;
      const status = err.response?.status;
      if (status === 400) {
        if (res?.isInvalid) {
          if (res.field === "email") {
            emailInput.classList.add("is-invalid");
            emailFeedback.textContent = res.error;
          } else if (res?.field === "username") {
            usernameInput.classList.add("is-invalid");
            usernameFeedback.textContent = res.error;
          }
        }
      } else if (status === 409) {
        if (res.field === "email") {
          emailInput.classList.add("is-invalid");
          emailFeedback.textContent = res.error;
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
            err
        );
      }
    });
}

function changePassword() {
  axios
    .post(
      "http://localhost:3000/profile/changePassword",
      {
        oldPassword: document.querySelector("#oldPasswordInput").value,
        newPassword: document.querySelector("#newPasswordInput").value,
      },
      {
        withCredentials: true,
      }
    )
    .then((response) => {
      console.log(response.data);
      window.location.href = "/client/profile.html";
    })
    .catch((err) => {
      const res = err.response.data;
      const status = err.response?.status;
      if (status === 400) {
        if (res?.isInvalid) {
          if (res.field === "oldPassword") {
            oldPasswordInput.classList.add("is-invalid");
            oldPasswordFeedback.textContent = res.error;
          } else if (res?.field === "newPassword") {
            newPasswordInput.classList.add("is-invalid");
            newPasswordFeedback.textContent = res.error;
          }
        }
      } else if (status === 401) {
        backendResponse.textContent = "Incorrect password";
        backendResponse.classList.remove("d-none");
        backendResponse.classList.add("d-block");
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
            err
        );
      }
    });
}

fetch("http://localhost:3000/profile", {
  credentials: "include",
})
  .then((res) => {
    if (!res.ok) {
      window.location.href = "/client/logIn.html";
      return;
    }
    return res.text();
  })
  .then((response) => {
    if (response) {
      const user = JSON.parse(response);
      usernameField.textContent = user[0].username;
      emailField.textContent = user[0].email;
      memberSinceField.textContent = formatDate(user[0].created_at);
      idField.textContent = user[0].id;
      username.textContent = user[0].username;
      email.textContent = user[0].email;
    }
  })
  .catch((err) => {
    console.error("Error while getting profile info:", err);
  });

function formatDate(timestamp) {
  // Replace space with T to make it ISO-compliant
  const dateObj = new Date(timestamp.replace(" ", "T"));

  // Format options for "Month DD, YYYY"
  const options = { year: "numeric", month: "long", day: "numeric" };

  return dateObj.toLocaleDateString("en-US", options);
}
