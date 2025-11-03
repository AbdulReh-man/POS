const Store = require("electron-store").default;

const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const key = crypto.scryptSync("my_secure_key", "salt", 32);
const iv = Buffer.alloc(16, 0);

const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const decrypt = (encryptedText) => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

const secureStore = new Store({ name: "secureStore" });

// Save login data
const saveLogin = (data) => {
  const encrypted = encrypt(JSON.stringify(data));
  secureStore.set("loginData", encrypted);
};

// Get decrypted login data
const getLogin = () => {
  const encrypted = secureStore.get("loginData");
  if (!encrypted) return null;
  return JSON.parse(decrypt(encrypted));
};

// Clear login data
const clearLogin = () => {
  secureStore.delete("loginData");
};

module.exports = { saveLogin, getLogin, clearLogin };
