/**
 * Clamps a value between a minimum and maximum range
 * @param {number} val - The value to clamp
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} The clamped value
 * @throws {TypeError} If any parameter is not a number
 */
function clamp(val, min, max) {
  if (typeof val !== 'number' || typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError('All parameters must be numbers');
  }
  
  if (isNaN(val) || isNaN(min) || isNaN(max)) {
    return NaN;
  }
  
  // Handle case where min > max by swapping them
  if (min > max) {
    [min, max] = [max, min];
  }
  
  return Math.min(Math.max(val, min), max);
}

/**
 * Linear interpolation between two values
 * @param {number} a - The start value
 * @param {number} b - The end value
 * @param {number} t - The interpolation factor (0-1, but can be outside this range)
 * @returns {number} The interpolated value
 * @throws {TypeError} If any parameter is not a number
 */
function lerp(a, b, t) {
  if (typeof a !== 'number' || typeof b !== 'number' || typeof t !== 'number') {
    throw new TypeError('All parameters must be numbers');
  }
  
  if (isNaN(a) || isNaN(b) || isNaN(t)) {
    return NaN;
  }
  
  return a + (b - a) * t;
}

/**
 * Rounds a number to a specified number of decimal places
 * @param {number} num - The number to round
 * @param {number} decimals - The number of decimal places
 * @returns {number} The rounded number
 * @throws {TypeError} If any parameter is not a number
 */
function roundTo(num, decimals) {
  if (typeof num !== 'number' || typeof decimals !== 'number') {
    throw new TypeError('All parameters must be numbers');
  }
  
  if (isNaN(num) || isNaN(decimals)) {
    return NaN;
  }
  
  // Handle negative decimals by treating them as 0
  if (decimals < 0) {
    decimals = 0;
  }
  
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

module.exports = {
  clamp,
  lerp,
  roundTo
};