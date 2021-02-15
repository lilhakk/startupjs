import React, { useEffect } from 'react'
import { Platform } from 'react-native'
import { observer, useValue, useSession, useError } from 'startupjs'
import {
  Row,
  Div,
  Span,
  Button,
  ObjectInput,
  ErrorWrapper
} from '@startupjs/ui'
import {
  SIGN_UP_SLIDE,
  SIGN_IN_SLIDE,
  RECOVER_PASSWORD_SLIDE
} from '@startupjs/auth/isomorphic'
import { finishAuth } from '@startupjs/auth'
import _get from 'lodash/get'
import PropTypes from 'prop-types'
import { useAuthHelper } from '../../helpers'
import commonSchema from './utils/joi'
import './index.styl'

const IS_WEB = Platform.OS === 'web'

const LOGIN_DEFAULT_INPUTS = {
  email: {
    input: 'text',
    label: 'Email',
    placeholder: 'Enter your email'
  },
  password: {
    input: 'password',
    label: 'Password',
    placeholder: 'Enter your password'
  }
}

function LoginForm ({
  baseUrl,
  redirectUrl,
  properties,
  validateSchema,
  renderActions,
  onSuccess,
  onError,
  onHandleError,
  onChangeSlide
}) {
  const authHelper = useAuthHelper(baseUrl)

  const [localSignUpEnabled] = useSession('auth.local.localSignUpEnabled')

  const [form, $form] = useValue({})
  const [errors, setErrors] = useError({})

  useEffect(() => {
    if (IS_WEB) {
      window.addEventListener('keypress', onKeyPress)
    }

    return () => {
      if (IS_WEB) {
        window.removeEventListener('keypress', onKeyPress)
      }
    }
  }, [])

  // TODO: next input
  function onKeyPress (e) {
    if (e.key === 'Enter') onSubmit()
  }

  const onSubmit = async () => {
    setErrors({})

    let fullSchema = commonSchema
    if (validateSchema) {
      fullSchema = fullSchema.keys(validateSchema)
    }

    if (errors.check(fullSchema, form)) return

    try {
      const res = await authHelper.login(form)

      if (res.data) {
        onSuccess ? onSuccess(res.data, SIGN_IN_SLIDE) : finishAuth(redirectUrl)
      }
    } catch (error) {
      if (onHandleError) {
        onHandleError({ form, setErrors }, error)
      } else {
        onError && onError(error)

        if (error.response && error.response.status === 403) {
          setErrors({ server: 'The email or password you entered is incorrect' })
        } else {
          setErrors({ server: _get(error, 'response.data.message', error.message) })
        }
      }
    }
  }

  const _properties = { ...LOGIN_DEFAULT_INPUTS, ...properties }

  return pug`
    ObjectInput(
      value=form
      $value=$form
      errors=errors
      properties=_properties
    )

    ErrorWrapper(err=errors.server)

    if renderActions
      = renderActions({ onSubmit, onChangeSlide })
    else
      Div.actions
        Button(
          size='l'
          onPress=onSubmit
          color='primary'
          variant='flat'
        ) Log in
        Button.recover(
          onPress=()=> onChangeSlide(RECOVER_PASSWORD_SLIDE)
          color='primary'
          variant='text'
        ) Forgot your password?

        if localSignUpEnabled
          Row.actionChoice
            Span.actionText Don't have an account?
            Button.signUp(
              onPress=()=> onChangeSlide(SIGN_UP_SLIDE)
              color='primary'
              variant='text'
            ) Sign up
  `
}

LoginForm.propTypes = {
  baseUrl: PropTypes.string,
  redirectUrl: PropTypes.string,
  properties: PropTypes.object,
  validateSchema: PropTypes.object,
  renderActions: PropTypes.func,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  onHandleError: PropTypes.func,
  onChangeSlide: PropTypes.func
}

export default observer(LoginForm)
