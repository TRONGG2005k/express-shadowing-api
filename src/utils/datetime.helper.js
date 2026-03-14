/**
 * Helper functions for handling datetime with Vietnam timezone (Asia/Ho_Chi_Minh, UTC+7)
 */

// Ensure timezone is set
process.env.TZ = process.env.TZ || 'Asia/Ho_Chi_Minh';

/**
 * Format date to Vietnam timezone string
 * @param {Date} date - Date object
 * @returns {string} Formatted date string in Vietnamese format
 */
function formatVNDate(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Get current date in Vietnam timezone
 * @returns {Date} Current date
 */
function getNow() {
    return new Date();
}

/**
 * Get current date string in Vietnam timezone
 * @returns {string} Current date string
 */
function getNowString() {
    return formatVNDate(new Date());
}

/**
 * Convert any date to Vietnam timezone Date object
 * @param {Date|string} date - Date to convert
 * @returns {Date} Date object
 */
function toVNTimezone(date) {
    if (!date) return null;
    const d = new Date(date);
    return d;
}

/**
 * Check if current system timezone is correctly set to Vietnam
 * @returns {boolean}
 */
function isVietnamTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Ho_Chi_Minh' ||
        Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Saigon';
}

/**
 * Get timezone information
 * @returns {Object} Timezone info
 */
function getTimezoneInfo() {
    const now = new Date();
    return {
        systemTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        envTimezone: process.env.TZ,
        offset: now.getTimezoneOffset(), // in minutes
        offsetHours: -now.getTimezoneOffset() / 60,
        isVietnamTimezone: isVietnamTimezone()
    };
}

module.exports = {
    formatVNDate,
    getNow,
    getNowString,
    toVNTimezone,
    isVietnamTimezone,
    getTimezoneInfo
};
