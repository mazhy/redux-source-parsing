function bindActionCreator(actionCreator, dispatch) {
  return function() {
    return dispatch(actionCreator.apply(this, arguments))
  }
}


export default function bindActionCreators(actionCreators, dispatch) {
  //如果 actionCreators 是一个函数,染回 dispatch(actionCreator.apply(this, arguments))
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch)
  }
  //actionCreators 不是函数,不是对象,不是null
  const keys = Object.keys(actionCreators)
  const boundActionCreators = {}
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const actionCreator = actionCreators[key]
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
    }
  }
  //最后迭代actionCreators里的元素,如果是函数,就按照函数的方式组成数组,返回
  return boundActionCreators
}
