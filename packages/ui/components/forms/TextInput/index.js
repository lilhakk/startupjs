import React, { useState } from 'react'
import { View } from 'react-native'
import { observer } from 'startupjs'
import PropTypes from 'prop-types'
import { useLayout } from './../../../hooks'
import Input from './input'
import Span from './../../typography/Span'
// import themed from '../../../theming/themed'
import './index.styl'

function TextInput ({
  style,
  wrapperStyle,
  inputStyle,
  iconStyle,
  className,
  label,
  description,
  placeholder,
  layout,
  value,
  size,
  editable,
  disabled,
  readonly,
  onBlur,
  onFocus,
  renderWrapper, // @private - used by Select
  ...props
}, ref) {
  layout = useLayout({ layout, label, description })

  const pure = layout === 'pure'
  const [focused, setFocused] = useState(false)

  function _onBlur () {
    setFocused(false)
  }

  function _onFocus () {
    if (disabled) return
    setFocused(true)
  }

  function renderInput (standalone) {
    if (readonly) {
      return pug`
        Span= value
      `
    }

    return pug`
      Input(
        ref=ref
        style=standalone ? [style, wrapperStyle] : wrapperStyle
        inputStyle=inputStyle
        iconStyle=iconStyle
        className=standalone ? className : undefined
        value=value
        placeholder=placeholder
        disabled=disabled
        focused=focused
        renderWrapper=renderWrapper
        size=size
        editable=editable
        onBlur=(...args) => {
          _onBlur()
          onBlur && onBlur(...args)
        }
        onFocus=(...args) => {
          _onFocus()
          onFocus && onFocus(...args)
        }
        ...props
      )
    `
  }

  if (pure) return renderInput(true)

  label = label || (value && placeholder) || ' '

  return pug`
    View.root(style=style)
      View.info
        if label
          Span.label(styleName={focused})= label
        if description
          Span.description(description)= description
      = renderInput()
  `
}

const ObservedTextInput = observer(TextInput, { forwardRef: true })

ObservedTextInput.defaultProps = {
  size: 'm',
  value: '', // default value is important to prevent error
  disabled: false,
  readonly: false,
  resize: false,
  editable: Input.defaultProps.editable,
  numberOfLines: Input.defaultProps.numberOfLines,
  iconPosition: 'left'
}

ObservedTextInput.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  inputStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  wrapperStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  iconStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  label: PropTypes.string,
  description: PropTypes.string,
  layout: PropTypes.oneOf(['pure', 'rows']),
  placeholder: PropTypes.string,
  value: PropTypes.string,
  size: PropTypes.oneOf(['l', 'm', 's']),
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  resize: PropTypes.bool,
  editable: Input.propTypes.editable,
  numberOfLines: PropTypes.number,
  icon: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  iconPosition: PropTypes.oneOf(['left', 'right']),
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  onChangeText: PropTypes.func,
  onIconPress: PropTypes.func
}

export default ObservedTextInput
