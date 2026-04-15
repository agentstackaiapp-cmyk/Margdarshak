# Test Credentials

## Email/Password Auth
- **Register**: POST /api/auth/register `{"name":"Test","email":"test@margdarshak.com","password":"test1234"}`
- **Login**: POST /api/auth/email-login `{"email":"test@margdarshak.com","password":"test1234"}`

## Dev Login (testing only)
- POST /api/auth/dev-login `{"name":"Test User","email":"test@test.com"}`

## Google OAuth
- Redirect URL: `window.location.origin + '/'`
- Email: agentstackaiapp@gmail.com / maithiligeek@gmail.com
