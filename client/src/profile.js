// Overview
const usernameField = document.getElementById("usernameField");
const emailField = document.getElementById("emailField");
const memberSinceField = document.getElementById("memberSinceField");
const idField = document.getElementById("idField");
const username = document.getElementById("username");
const email = document.getElementById("email");

// Edit username
const usernameInput = document.getElementById("usernameEdit");
const usernameFeedback = document.querySelector("#usernameFeedback");
const usernameBackendResponse = document.querySelector(
  "#username-backend-response",
);

// Edit email
const emailInput = document.getElementById("emailEdit");
const emailFeedback = document.querySelector("#emailFeedback");
const emailBackendResponse = document.querySelector("#email-backend-response");

// Change password
const oldPasswordInput = document.getElementById("oldPasswordInput");
const newPasswordInput = document.getElementById("newPasswordInput");
const oldPasswordFeedback = document.querySelector("#oldPasswordFeedback");
const newPasswordFeedback = document.querySelector("#newPasswordFeedback");

const passwordBackendResponse = document.querySelector(
  "#password-backend-response",
);

// Order details
const orderIdField = document.getElementById("orderId");
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
const cancelOrder = document.getElementById("cancelOrder");

let addedListener = false;

screen1.classList.remove("d-none");
screen2.classList.add("d-none");

document
  .getElementById("toggleOldPassword")
  .addEventListener("click", function () {
    const passwordInput = document.getElementById("oldPasswordInput");
    const icon = document.getElementById("toggleOldIcon");
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    icon.className = isHidden ? "bi bi-eye-slash-fill" : "bi bi-eye-fill";
  });

document
  .getElementById("toggleNewPassword")
  .addEventListener("click", function () {
    const passwordInput = document.getElementById("newPasswordInput");
    const icon = document.getElementById("toggleNewIcon");
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    icon.className = isHidden ? "bi bi-eye-slash-fill" : "bi bi-eye-fill";
  });

document.addEventListener("DOMContentLoaded", () => {
  const sidebarLinks = document.querySelectorAll(
    ".nav-pills .nav-link[data-target]",
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
            '#profileSection a[href="#overview"]',
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
  fetch(`${import.meta.env.VITE_API_URL}/order/details`, {
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
      cancelOrder.classList.remove("disabled");

      const orderDetails = response.order_items[0];
      orderIdField.textContent = "Order №" + orderDetails.order_id + " details";
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
      if (orderDetails.status !== "paid" && orderDetails.status !== "pending") {
        cancelOrder.classList.add("disabled");
      }
      if (!addedListener) {
        cancelOrder.addEventListener("click", () => {
          fetch(`${import.meta.env.VITE_API_URL}/order/cancel`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
            }),
          }).then((res) => {
            if (!res.ok) {
              return res.text();
            }
            window.location.href = "profile.html";
          });
        });
        addedListener = true;
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function renderOrders() {
  fetch(`${import.meta.env.VITE_API_URL}/orders/history`, {
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
                  ? "bg-warning"
                  : order.status === "failed"
                    ? "bg-danger"
                    : order.status === "canceled"
                      ? "bg-info"
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

  const updateFieldUI = (input, feedback, isValid, msg) => {
    input.classList.toggle("is-valid", isValid);
    input.classList.toggle("is-invalid", !isValid);
    feedback.textContent = isValid ? "" : msg;
    return isValid;
  };

  const checkEmail = () => {
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

  const checkPassword = (passwordInput, passwordFeedback) => {
    return updateFieldUI(
      passwordInput,
      passwordFeedback,
      passwordInput.value.trim().length >= 8,
      "Password must be at least 8 characters long.",
    );
  };

  const checkUsername = () => {
    return updateFieldUI(
      usernameInput,
      usernameFeedback,
      usernameInput.value.trim().length >= 3,
      "Username must be at least 3 characters long.",
    );
  };

  usernameInput.addEventListener("input", checkUsername);
  emailInput.addEventListener("input", checkEmail);
  oldPasswordInput.addEventListener("input", () => {
    checkPassword(oldPasswordInput, oldPasswordFeedback);
  });
  newPasswordInput.addEventListener("input", () => {
    checkPassword(newPasswordInput, newPasswordFeedback);
  });

  // 1. Username Form
  document.getElementById("usernameForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (checkUsername()) {
      submitProfileUpdate(
        "/profile/editUsername",
        { username: document.querySelector("#usernameEdit").value },
        { username: { input: usernameInput, feedback: usernameFeedback } },
        usernameBackendResponse,
      );
    }
  });

  // 2. Email Form
  document.getElementById("emailForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (checkEmail()) {
      submitProfileUpdate(
        "/profile/editEmail",
        { email: document.querySelector("#emailEdit").value },
        { email: { input: emailInput, feedback: emailFeedback } },
        emailBackendResponse,
      );
    }
  });

  // 3. Password Form
  document.getElementById("passwordForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const isValid =
      checkPassword(oldPasswordInput, oldPasswordFeedback) &&
      checkPassword(newPasswordInput, newPasswordFeedback);

    if (isValid) {
      submitProfileUpdate(
        "/profile/changePassword",
        {
          oldPassword: oldPasswordInput.value,
          newPassword: newPasswordInput.value,
        },
        {
          oldPassword: {
            input: oldPasswordInput,
            feedback: oldPasswordFeedback,
          },
          newPassword: {
            input: newPasswordInput,
            feedback: newPasswordFeedback,
          },
        },
        passwordBackendResponse,
      );
    }
  });
})();

async function submitProfileUpdate(
  endpoint,
  payload,
  fieldMap,
  backendResponseEl,
) {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}${endpoint}`,
      payload,
      { withCredentials: true },
    );

    console.log(response.data);
    window.location.href = "profile.html";
  } catch (err) {
    const res = err.response?.data;
    const status = err.response?.status;
    // 1. Handle unexpected or server errors early
    if (!status || !res) {
      console.log("Error while waiting for server response: ", err);
      alert(
        "There was an error while trying to log in. If this keeps happening, inform the site owner with this info: " +
          err,
      );
      return;
    }

    // 2. Handle 429 Rate Limit
    if (status === 429 && res.field === "rateLimit" && backendResponseEl) {
      backendResponseEl.textContent = res.error;
      backendResponseEl.classList.replace("d-none", "d-block");
      return;
    }

    // 4. Handle 400 and 409 Field Validation Errors
    if ((status === 400 || status === 409) && res.field) {
      const targetUI = fieldMap[res.field];
      if (targetUI) {
        targetUI.input.classList.add("is-invalid");
        targetUI.feedback.textContent = res.error;
      }
    }
  }
}

fetch(`${import.meta.env.VITE_API_URL}/profile`, {
  credentials: "include",
})
  .then((res) => {
    if (!res.ok) {
      window.location.href = "logIn.html";
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
