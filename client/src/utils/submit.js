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

    // 3. 401 Unauthorized
    if (
      status === 401 &&
      res.errorType === "unauthorized" &&
      backendResponseEl
    ) {
      backendResponseEl.textContent = res.errorText;
      backendResponseEl.classList.replace("d-none", "d-block");
      return {
        success: false,
        errorType: "auth",
        error: res.errorText,
      };
    }

    // 4. 400 and 409 Field Validation Errors
    if (status === 400 || status === 409) {
      const errorList =
        res.errors ||
        (res.field ? [{ field: res.field, error: res.error }] : []);
      if (errorList.length > 0) {
        errorList.forEach(({ field, error }) => {
          const targetUI = fieldMap[field];
          if (!targetUI) return;
          // Сonvert both Array and NodeList to a regular array.
          const inputs = targetUI.input?.forEach
            ? Array.from(targetUI.input)
            : [targetUI.input];
          inputs.forEach((input) => {
            input.classList.add("is-invalid");
          });
          if (targetUI.feedback) {
            targetUI.feedback.textContent = error;
            targetUI.feedback.classList.add("d-block");
          }
        });
      }
      return { success: false, errorType: "validation", errors: errorList };
    }
    const fallbackMessage =
      res.error || "Something went wrong. Please try again later.";

    if (backendResponseEl) {
      backendResponseEl.textContent = fallbackMessage;
      backendResponseEl.classList.replace("d-none", "d-block");
    }

    return {
      success: false,
      errorType: "server_or_network",
      error: fallbackMessage,
    };
  }
}
