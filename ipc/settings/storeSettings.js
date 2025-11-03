const Store = require("electron-store").default;

const storeSettings = new Store({
  name: "settingsStore",
  defaults: {
    logoPath: "",
    storetype: "General",
    storeAddress: "",
    phone_number: "",
    website: "https://abdulrehman.dev",
    discount: 0,
    footerNote: "Thank you for shopping with us!",
    socials: [],
    owner: "Abdul Rehman",
    theme: "dark",
    currency: "PKR",
    taxRate: 0,
  },
});

const getSettings = () => storeSettings.store;

const updateSettings = (newSettings) => {
  if (!newSettings || typeof newSettings !== "object") {
    throw new TypeError(
      "updateSettings expects an object, got " + typeof newSettings
    );
  }
  storeSettings.set(newSettings);
  return storeSettings.store;
};


const resetSettings = () => {
  storeSettings.clear();
  return storeSettings.store;
};

module.exports = { getSettings, updateSettings, resetSettings };