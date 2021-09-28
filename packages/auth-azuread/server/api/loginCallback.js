import { finishAuth } from '@startupjs/auth/server'
import passport from 'passport'

export default function loginCallback (req, res, next, config) {
  const { onBeforeLoginHook } = config

  passport.authenticate('azuread-openidconnect', function (err, userId, info) {
    if (err) {
      console.log('[@startup/auth-linkedin] Error:', err)
      res.status(500).json({ error: err })
    }

    finishAuth(req, res, { userId, onBeforeLoginHook })
  })(req, res, next)
}
