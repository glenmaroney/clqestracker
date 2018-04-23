import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { HashRouter } from 'react-router-dom';
// import registerServiceWorker from './registerServiceWorker';
import createAppStore from './store'
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react'
const { persistor, store } = createAppStore()

ReactDOM.render(
    <Provider store={store}>
        <PersistGate persistor={persistor}>
            <HashRouter>
                <App />
            </HashRouter>
        </PersistGate>
    </Provider>
    , document.getElementById('root'));
// registerServiceWorker();
