import { applyMiddleware, createStore, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension'
import persistState from 'redux-localstorage'

import rootReducer from './reducer.ts';
import rootSaga from './saga.ts';

export type RootState = ReturnType<typeof rootReducer>;

export default function configureStore() {
  const sagaMiddleware = createSagaMiddleware()
  const middlewares = [sagaMiddleware]
  const middlewareEnhancer = applyMiddleware(...middlewares)

  const localstorageEnhancer = compose(persistState(['accountReducer'], { key: 'enmachou' }))
  const enhancers = [middlewareEnhancer, localstorageEnhancer]
  const composedEnhancers = composeWithDevTools(...enhancers)

  const store = createStore(rootReducer, composedEnhancers)
  sagaMiddleware.run(rootSaga)
  return store
}
