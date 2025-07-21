import express from "express";
import cors from "cors";
import { Client } from "pg";
import bodyParser from "body-parser";
import morgan from "morgan";
import bcrypt from "bcrypt";
import axios from "axios";

function checkEmailAndPassword(emailInput, passwordInput) {
  if (emailInput.length < 6 || emailInput.length > 100) {
    return {
      isInvalid: true,
      field: "email",
      error: "Email must be between 6 and 100 characters.",
    };
  } else if (
    !emailInput.includes("@") ||
    !emailInput.includes(".") ||
    emailInput.indexOf("@") === 0 ||
    emailInput.lastIndexOf(".") < emailInput.indexOf("@")
  ) {
    return {
      isInvalid: true,
      field: "email",
      error: "Email is invalid.",
    };
  }
  if (passwordInput.length < 8 || passwordInput.length > 100) {
    return {
      isInvalid: true,
      field: "password",
      error: "Password must be between 8 and 100 characters.",
    };
  } else {
    return { isInvalid: false };
  }
}
export default checkEmailAndPassword;
