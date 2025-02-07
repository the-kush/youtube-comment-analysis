class MaskingService {
    maskUsername(username) {
        if(!username) return 'Anonymous';

        const firstChar = username.charAt(0);
        const maskedPart = '*'.repeat(Math.max(username.length - 1, 3));

        return `${firstChar}${maskedPart}`;
    }
}

module.exports = MaskingService;