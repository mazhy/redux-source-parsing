import $$observable from 'symbol-observable'

import ActionTypes from './utils/actionTypes'

//创建store的api,也是redux中最重要的api,而创建的store用于管理应用中的所有state,且只有一个store
export default function createStore(reducer, preloadedState, enhancer) {
  //简而言之,第二个参数是函数,并且第三个参数是undefined,然后第二第三个参数值互换
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  if (typeof enhancer !== 'undefined') {
    //这个就是中间件,看middleware那篇文章
    return enhancer(createStore)(reducer, preloadedState)
  }

  //保存当前的reducer
  let currentReducer = reducer
  //保存传入的状态
  let currentState = preloadedState
  //设置当前监听集合
  let currentListeners = []
  //将当前的监听集合赋值给下一个监听集合
  let nextListeners = currentListeners
  let isDispatching = false
  //

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      //slice() 没有参数默认begin为0 就是拷贝下
      nextListeners = currentListeners.slice()
    }
  }

  //获取当前状态
  //函数嵌套函数,内部函数引用外部函数的变量,最后返回函数,这是闭包
  function getState() {
    return currentState
  }

  //增加监听,参数listener是一个回调函数,在dispatch里,会调用所有的监听器
  function subscribe(listener) {
    let isSubscribed = true

    ensureCanMutateNextListeners()
    //把新增加的监听加入到当前监听列表中
    nextListeners.push(listener)
    //返回一个函数,用于去除监听
    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }
      //解除监听 isSubscribed 设置为false,意为已经取消监听
      isSubscribed = false

      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      //然后干掉这个监听
      nextListeners.splice(index, 1)
    }
  }

  //这个是比较常用的api=>主要用于触发action,改变状态
  function dispatch(action) {
    try {
      isDispatching = true//正在dispatch
      //执行reducer 返回新state,调用的是combination()方法
      currentState = currentReducer(currentState, action)
    } finally {
      // finally不管报没报错最后都要执行
      isDispatching = false
    }
    //执行所有监听
    const listeners = (currentListeners = nextListeners)
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    return action
  }
  //替换reducer 然后更新store
  function replaceReducer(nextReducer) {
    currentReducer = nextReducer
    dispatch({ type: ActionTypes.REPLACE })
  }

  //这个是留给内部
  function observable() {
    const outerSubscribe = subscribe
    return {
      subscribe(observer) {
        function observeState() {
          if (observer.next) {
            observer.next(getState())
          }
        }

        observeState()
        const unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      [$$observable]() {
        return this
      }
    }
  }
  //初始化store
  dispatch({ type: ActionTypes.INIT })

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
}
