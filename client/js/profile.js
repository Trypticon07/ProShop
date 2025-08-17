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

fetch("http://localhost:3000/order/items", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    orderId: 9,
  }),
})
  .then((res) => {
    if (!res.ok) {
      return res.text();
    }
    return res.json();
  })
  .then((response) => {
    const orderItems = response.order_items;
    console.log(orderItems);
    console.log(orderItems[0]);
    console.log(orderItems[0].product_name);
    console.log(orderItems[1]);
    console.log(orderItems[1].product_name);
  })
  .catch((err) => {
    if (err.response?.status === 401) {
      console.log("err" + err);
    }
  });

// Example: mock data
const orders = [
  { id: 101, date: "2025-07-18", status: "Delivered", total: "$120.50" },
  { id: 102, date: "2025-08-01", status: "Pending", total: "$85.00" },
  { id: 103, date: "2025-08-12", status: "Shipped", total: "$45.30" },
];

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
      console.log(orders);
      console.log(orders[0]);
      console.log(orders[0].product_name);
      console.log(orders[1]);
      console.log(orders[1].product_name);
    })
    .catch((err) => {
      if (err.response?.status === 401) {
        console.log("err" + err);
      }
    });

  const tableBody = document.getElementById("ordersTableBody");
  tableBody.innerHTML = "";

  orders.forEach((order) => {
    const row = `
        <tr>
          <td>${order.id}</td>
          <td>${new Date(order.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</td>
          <td>
            <span class="badge ${
              order.status === "Delivered"
                ? "bg-success"
                : order.status === "Pending"
                ? "bg-warning text-dark"
                : "bg-info text-dark"
            }">${order.status}</span>
          </td>
          <td>${order.total}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary view-details" data-id="${
              order.id
            }">
              View
            </button>
          </td>
        </tr>
      `;
    tableBody.insertAdjacentHTML("beforeend", row);
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

      if (!usernameInput.textContent && isValidEmail) {
        isValidUsername = true;
      }
      if (!emailInput.textContent && isValidUsername) {
        isValidEmail = true;
      }

      if (!isValidEmail || !isValidUsername) {
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
