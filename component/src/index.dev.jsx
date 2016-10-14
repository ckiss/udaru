import React from 'react'
import { render } from 'react-dom'
import { browserHistory } from 'react-router'
import injectTapEventPlugin from 'react-tap-event-plugin'

import Routes from './Routes'

import 'muicss/lib/sass/mui.scss'

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin()

render(
  <Routes history={browserHistory} />,
  document.getElementById('app')
)
