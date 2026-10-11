// Client-side only: this is a UI gate, not real security (see docs/ARCHITECTURE.md).
// Placeholder login: user "quiz" / password "quiz123".
// To change the password: node -e "console.log(require('crypto').createHash('sha256').update('NEWPASS').digest('hex'))"
export const USERNAME = 'quiz';
export const PASSWORD_SHA256 = 'ccbbf1c361f2630d21effd7f383e7b25cb2b0e81cc495c37b7bda1c4168c17b3';
