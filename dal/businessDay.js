const { getSettings } = require("../ipc/settings/storeSettings");

// Timestamps are stored as UTC (CURRENT_TIMESTAMP). These helpers build SQLite
// expressions that convert them to the local *business* day, which rolls over at
// the configured dayStartHour instead of midnight (for shops open past midnight).
const getDayStartHour = () => {
  const hour = Number(getSettings().dayStartHour);
  return Number.isInteger(hour) && hour >= 0 && hour <= 6 ? hour : 0;
};

const modifiers = () => `'localtime', '-${getDayStartHour()} hours'`;

// Business date (YYYY-MM-DD) of a UTC column, or of now with "'now'".
const bizDate = (col) => `DATE(${col}, ${modifiers()})`;

// Business month (YYYY-MM) of a UTC column, or of now with "'now'".
const bizMonth = (col) => `strftime('%Y-%m', ${col}, ${modifiers()})`;

module.exports = { getDayStartHour, bizDate, bizMonth };
