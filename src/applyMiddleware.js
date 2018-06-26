import compose from './compose'

//调用applyMiddleware,可以传入多个中间件
export default function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    const store = createStore(...args)
    //调用dispatch()会报错
    let dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`
      )
    }
    //将state和dispatch所指向的函数绑定到middlewareAPI
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    //迭代中间件数组,并执行一遍,将middlewareAPI作为最外层的store,并返回一个相当于next函数的数组
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    //将数组整理成嵌套的函数体,并将store.dispatch传入最内侧的函数的next,并返回经过处理的dispatch
    //dispatch是一个函数,是一个嵌套了多层的函数,其最里面调用的是store.dispatch
    dispatch = compose(...chain)(store.dispatch)
    //返回一个新的store
    return {
      ...store,
      dispatch
    }
  }
}
