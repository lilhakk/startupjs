import React, { useRef, useImperativeHandle, useEffect } from 'react'
import {
  Dimensions,
  // NativeModules,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { observer, useValue } from 'startupjs'
import PropTypes from 'prop-types'
import DropdownCaption from './components/Caption'
import DropdownItem from './components/Item'
import { useKeyboard } from './helpers'
import Drawer from '../Drawer'
import Div from '../../Div'
import { PLACEMENTS_ORDER } from '../Popover/constants'
import STYLES from './index.styl'

// const { UIManager } = NativeModules

// TODO: key event change scroll
function Dropdown ({
  style,
  captionStyle,
  contentStyle,
  activeItemStyle,
  children,
  value,
  options,
  renderItem,
  position,
  attachment,
  placements,
  drawerVariant,
  drawerListTitle,
  drawerCancelLabel,
  hasDrawer,
  onChange,
  onDismiss
}, ref) {
  const refScroll = useRef()
  const renderContent = useRef([])

  if (!options) {
    return null
  }

  const [isShow, $isShow] = useValue(false)
  // const [activeInfo, setActiveInfo] = useState(null)
  const [layoutWidth, $layoutWidth] = useValue(Math.min(
    Dimensions.get('window').width,
    Dimensions.get('screen').width
  ))
  const [selectIndexValue] = useKeyboard({
    value,
    isShow,
    renderContent,
    onChange,
    onChangeShow: v => $isShow.setDiff(v)
  })
  const isPopover = !hasDrawer || (layoutWidth > STYLES.media.tablet)

  function handleWidthChange () {
    $isShow.setDiff(false)
    $layoutWidth.setDiff(Math.min(
      Dimensions.get('window').width,
      Dimensions.get('screen').width)
    )
  }

  useEffect(() => {
    Dimensions.addEventListener('change', handleWidthChange)
    return () => {
      $isShow.del()
      Dimensions.removeEventListener('change', handleWidthChange)
    }
  }, [])

  useImperativeHandle(ref, () => ({
    open: () => {
      $isShow.setDiff(true)
    },
    close: () => {
      $isShow.setDiff(false)
    }
  }))

  function onLayoutActive ({ nativeEvent }) {
    // setActiveInfo(nativeEvent.layout)
  }

  function onCancel () {
    onDismiss && onDismiss()
    $isShow.setDiff(false)
  }

  function onRequestOpen () {
    // TODO
    /*
      UIManager.measure(refScroll.current.getScrollableNode(), (x, y, width, curHeight) => {
        if (activeInfo && activeInfo.y >= (curHeight - activeInfo.height)) {
          refScroll.current.scrollTo({ y: activeInfo.y, animated: false })
        }
      })
    */
  }

  renderContent.current = []
  options.forEach((item, index, arr) => {
    const _child = pug`
      DropdownItem(
        item=item
    
        label=item.label
        value=item.value
        to=item.to
        onPress=item.action

        renderItem=renderItem
        _variant=(isPopover ? 'popover' : drawerVariant)
        _activeValue=value
        _index=index
        _selectIndexValue=selectIndexValue
        _childrenLength=arr.length
        _onDismissDropdown=()=> $isShow.setDiff(false)
        _onLayout=(value === options.value) ? onLayoutActive : null
        _onChange=v=> {
          onChange && onChange(v)
          $isShow.setDiff(false)
        }
      )
    `

    renderContent.current.push(_child)
  })

  function renderTooltip () {
    return pug`
      ScrollView= renderContent.current
    `
  }

  function renderTooltipWrapper ({ children }) {
    return pug`
      View.wrapper
        TouchableWithoutFeedback(onPress=()=> $isShow.set(false))
          View.overlay
        = children
    `
  }

  contentStyle = StyleSheet.flatten([contentStyle, STYLES.popover])

  if (isPopover) {
    return pug`
      Div(
        style=style
        _showTooltip=isShow
        renderTooltip=renderTooltip
        renderTooltipWrapper=renderTooltipWrapper
        tooltipProps={
          position,
          attachment,
          placements,
          contentStyle,
          hasWidthCaption: (!contentStyle.width && !contentStyle.minWidth),
          onRequestOpen,
          onDismiss: ()=> $isShow.setDiff(false)
        }
        onPress=()=> $isShow.set(true)
      )= children
    `
  }

  return pug`
    TouchableOpacity.caption(onPress=()=> $isShow.set(!isShow))
      = children
    Drawer(
      visible=isShow
      position='bottom'
      style={ maxHeight: '100%' }
      styleName={ drawerReset: drawerVariant === 'buttons' }
      onDismiss=()=> $isShow.setDiff(false)
      onRequestOpen=onRequestOpen
    )
      View.dropdown(styleName=drawerVariant)
        if drawerVariant === 'list'
          View.caption(styleName=drawerVariant)
            Text.captionText(styleName=drawerVariant)= drawerListTitle
        ScrollView.case(
          ref=refScroll
          showsVerticalScrollIndicator=false
          style=contentStyle
          styleName=drawerVariant
        )= renderContent.current
        if drawerVariant === 'buttons'
          TouchableOpacity(onPress=onCancel)
            View.button(styleName=drawerVariant)
              Text= drawerCancelLabel
  `
}

const ObservedDropdown = observer(Dropdown, { forwardRef: true })

ObservedDropdown.defaultProps = {
  style: [],
  position: 'bottom',
  attachment: 'start',
  value: '',
  drawerVariant: 'buttons',
  drawerListTitle: '',
  drawerCancelLabel: 'Cancel',
  hasDrawer: true
}

ObservedDropdown.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  activeItemStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  attachment: PropTypes.oneOf(['start', 'center', 'end']),
  placements: PropTypes.oneOf(PLACEMENTS_ORDER),
  drawerVariant: PropTypes.oneOf(['list', 'buttons']),
  drawerListTitle: PropTypes.string,
  drawerCancelLabel: PropTypes.string,
  hasDrawer: PropTypes.bool,
  onChange: PropTypes.func,
  onDismiss: PropTypes.func
}

ObservedDropdown.Caption = DropdownCaption
ObservedDropdown.Item = DropdownItem
export default ObservedDropdown
