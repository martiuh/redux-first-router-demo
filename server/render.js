import React from 'react'
import ReactDOM from 'react-dom/server'
import { Provider } from 'react-redux'
import { flushChunkNames } from 'react-universal-component/server'
import flushChunks from 'webpack-flush-chunks'
import configureStore from './configureStore'
import App from '../src/components/App'

export default ({ clientStats }) => async (req, res) => {
  const store = await configureStore(req, res)
  if (!store) return // no store means redirect was already served

  const app = createApp(App, store)
  const appString = ReactDOM.renderToString(app)
  const stateJson = JSON.stringify(store.getState())
  const chunkNames = flushChunkNames()
  const { js, styles, cssHash } = flushChunks(clientStats, { chunkNames })

  console.log('REQUESTED PATH:', req.path)
  console.log('CHUNK NAMES', chunkNames)

  res.render('../buildClient/render.ejs', {
    js,
    styles,
    cssHash,
    appString,
    stateJson: `<script>window.REDUX_STATE=${stateJson}</script>`
  })
}

const createApp = (App, store) => (
  <Provider store={store}>
    <App />
  </Provider>
)
