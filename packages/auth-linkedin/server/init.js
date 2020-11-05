import Provider from './Provider'
import { Strategy } from 'passport-linkedin-oauth2'
import initRoutes from './initRoutes'
import passport from 'passport'
import { CALLBACK_LINKEDIN_URL } from '../isomorphic'

function validateConfigs ({ clientId, clientSecret }) {
  if (!clientId) {
    throw new Error('[@dmapper/auth-linkedin] Error:', 'Provide Client Id')
  }
  if (!clientSecret) {
    throw new Error('[@dmapper/auth-linkedin] Error:', 'Provide Client Secret')
  }
}

export default function init (opts) {
  console.log('++++++++++ Initialization of LinkedIn auth strategy ++++++++++')

  const { model, config, updateClientSession } = opts
  validateConfigs(config)

  const { clientId, clientSecret } = config

  initRoutes(opts)

  // Append required configs to client session
  updateClientSession({ linkedin: { clientId } })

  passport.use(
    new Strategy(
      {
        clientID: clientId,
        clientSecret,
        callbackURL: CALLBACK_LINKEDIN_URL,
        profileFields: ['first-name', 'last-name', 'email-address'],
        scope: ['r_emailaddress', 'r_liteprofile'],
        state: true
      },
      async function (accessToken, refreshToken, profile, cb) {
        let userId, err
        try {
          const { id, name, displayName, emails } = profile
          const _profile = {
            id,
            name,
            displayName,
            email: emails.pop().value
          }

          const provider = new Provider(model, _profile, config)
          userId = await provider.findOrCreateUser()
        } catch (e) {
          err = e
        }
        return cb(err, userId)
      }
    )
  )
}
