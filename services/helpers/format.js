/**
 * returns the amount of padding to be used based on the index
 * @param {int} index
 * @returns {int} padding length
 */
const calculatePaddingLength = (index) => {
  let padLength;
  switch (index) {
    case 10:
    case 11:
      padLength = 7;
      break;
    default:
      padLength = 5;
      break;
  }
  return padLength;
};

/**
 * formats and returns the header values with each value seperated by `|`
 * @param {string[]} headerValues
 * @returns {string} header string
 */
const formatWeeklyStatsHeader = (headerValues) => {
  const padded = headerValues.map((x, index) =>
    x.replace(/\s/g, '').trim().padEnd(calculatePaddingLength(index), ' ')
  );
  return padded.join(' | ');
};

/**
 * formats and returns the row values with each value seperated by `|`
 * @param {string[]} rowValues
 * @returns {string} row string
 */
const formatWeeklyStatsRow = (rowValues) => {
  const padded = rowValues.map((x, index) =>
    x.toString().trim().padEnd(calculatePaddingLength(index), ' ')
  );
  return padded.join(' | ');
};

module.exports = { formatWeeklyStatsHeader, formatWeeklyStatsRow };
