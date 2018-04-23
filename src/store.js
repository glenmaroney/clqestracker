import { compose, createStore, applyMiddleware } from 'redux';
import reducer from './ducks/reducer.js';
import promiseMiddleware from 'redux-promise-middleware'
import { persistReducer ,persistStore } from 'redux-persist'
import storage from 'redux-persist/es/storage'

const config = {
    key: 'root',
    storage,
  }

const combinedReducer = persistReducer(config, reducer)

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const configureStore = composeEnhancers(
    applyMiddleware(promiseMiddleware()),
  )(createStore)


const createAppStore = () => {
    let store = configureStore(combinedReducer)
    let persistor = persistStore(store)
  
    return { persistor, store }
  }

  export default createAppStore
