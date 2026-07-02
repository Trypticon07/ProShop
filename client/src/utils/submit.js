import axios from "axios";

export async function submitFormData({
  endpoint,
  payload,
  fieldMap = {},
  backendResponseEl = null,
}) {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}${endpoint}`,
      payload,
      { withCredentials: true },
    );

    return { success: true, data: response.data };
  } catch (err) {
    const res = err.response?.data;
    const status = err.response?.status;
    console.log(res);
    console.log(status);
    // 1. Unexpected or server errors
    if (!status || !res) {
      console.error("Server connection error: ", err);
      alert(
        "There was an error while trying to access the server. Please try again later.",
      );
      return { success: false, errorType: "network", error: err };
    }

    // 2. 429 Rate Limit
    if (status === 429 && res.field === "rateLimit" && backendResponseEl) {
      backendResponseEl.textContent = res.error;
      backendResponseEl.classList.replace("d-none", "d-block");
      return { success: false, errorType: "rateLimit", error: res.error };
    }

    // 3. 400 and 409 Field Validation Errors
    if ((status === 400 || status === 409) && res.field) {
      const targetUI = fieldMap[res.field];
      if (targetUI) {
        if (targetUI === "paymentRadios") {
          paymentRadios.forEach((radio) => {
            radio.classList.add("is-invalid");
          });
          targetUI.feedback.textContent = res.error;
        }
        targetUI.input.classList.add("is-invalid");
        targetUI.feedback.textContent = res.error;
      }
    }

    return { success: false, errorType: "validation", error: res.error };
  }
}
