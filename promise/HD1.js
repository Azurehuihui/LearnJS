class promise {
    static PENDDING = "pendding";
    static FULFILLED = "fulfilled";
    static REJECTED = "rejected";
    constructor(exector) {
        this.status = promise.PENDDING;
        this.value = null;
        this.callbacks = []
        try {
            // exector类似于new Promise((resolve, reject) => {}) 中的函数参数
            exector(this.resolve.bind(this), this.reject.bind(this))
        } catch (error) {
            this.reject(error)
        }
        
    }
    // 要判断一下状态，一旦确定状态后就不能再更改
    // 不判断的话会被后面的状态更改给覆盖
    resolve(value) {
        if (this.status == promise.PENDDING) {
            this.status = promise.FULFILLED;
            this.value = value;
            // 这里的setTimeout是为了实现以下场景
            /**
             * let p = new promise((resolve, reject) => {
                setTimeout(() => {
                    resolve("55");
                    // 这里还有个宏任务
                    console.log("ABC")
                }, 1000)
                })
             */
            setTimeout(() => {
                // 用callbakcs来存储异步任务，也是解决以下场景
                /**
                 * let p = new promise((resolve, reject) => {
                    // 存在异步任务
                    setTimeout(() => {
                        resolve("55");
                    }, 1000)
                    })
                 * 
                 */
                this.callbacks.map(callback => {
                    callback.onFulfilled(value);
                })
            })
            
            
        }
        
    }

    reject(reason) {
        if (this.status == promise.PENDDING) {
            this.status = promise.REJECTED;
            this.value = reason;
            setTimeout(() => {
                this.callbacks.map(callback => {
                    callback.onRejected(reason);
                })
            })
            

            
        }
        
    }

    then(onFulfilled, onRejected) {
        // then的参数不是必须传的，所以当一个都不传时需要设置默认值
        if (typeof onFulfilled !== "function") {
            onFulfilled = () => this.value
        }
        if (typeof onRejected !== "function") {
            onRejected = () => this.value
        }
        // then方法返回的是一个promise
        let newPromise = new promise((resolve, reject) => {
            if (this.status == promise.PENDDING) {
                setTimeout(() => {
                    try {
                        // 当为异步的时候，此时的状态仍未pendding
                        // 所以需要把当前的回调函数存储起来，当状态改变时再执行
                        this.callbacks.push({
                            onFulfilled: value => {
                                this.parse(newPromise, onFulfilled(value), resolve, reject);
                                /**
                                 * try {
                                    // 实现then的链式
                                    // 就是把上一个then的结果去改变新promise对象的状态
                                    // 并用新状态来执行下一个then方法
                                    let result = onFulfilled(value);
                                    // 当then里面的回调函数直接返回一个promise对象时，需要特殊处理 
                                    if (result instanceof promise) {
                                        result.then(resolve, reject);
                                    } else {
                                        // 改变新promise的状态
                                        resolve(result);
                                    }                                                                
                                } catch (error) {
                                    reject(error);
                                }
                                 */                     
                            }, 
                            onRejected: value => {
                                this.parse(onRejected(value), resolve, reject);
                            }})
                    } catch (error) {
                        // 当执行then传递的函数发生异常时，统一交给onRejected来处理错误
                        onRejected(error)
                    }
                })
                
               
            }
            if (this.status == promise.FULFILLED) {
                // 用setTimeout来实现异步宏任务
                setTimeout(() => {
                    this.parse(newPromise, onFulfilled(this.value), resolve, reject);
                })               
            }
            if (this.status == promise.REJECTED) {
                setTimeout(() => {
                    this.parse(newPromise, onRejected(this.value), resolve, reject); 
                })
                
                
            }
        })
        // 返回的新的promise对象的状态仍然是pendding
        // console.log(newPromise)
        return newPromise;
    }

    /**
     * 
     * then返回的promise不能是相同的promise，即
     * let promise = new Promise(resolve => {
        setTimeout(() => {
            resolve("后盾人");
        });
        });
        let p = promise.then(value => {
            return p;
        });
        会报错
        所以需要对then的返回值进行判断，则需要把then的返回值也作为parse的参数
     * 
     */
    parse(genPromise, result, resolve, reject) {
        if (genPromise == result) {
            throw new TypeError("Chaining cycle detected for promise")
        }
        try {
            if (result instanceof promise) {
                result.then(resolve, reject);
            } else {
                resolve(result);
            }           
        } catch (error) {
            reject(error);
        }
    }

    /**
     * 
     * @param  value resolve的内容
     * 类似于 
     * new promise((resolve) => {
     *     resolve(value);
     * })
     */
    static resolve(value) {
        return new promise((resolve, reject) => {
            if (value instanceof promise) {
                value.then(resolve, reject);
            } else {
                resolve(value);
            }
        })
    }

    /**
     * 
     * @param  reason reject的内容
     * 类似于 
     * new promise((_, reject) => {
     *     reject(reason);
     * })
     */
    static reject(reason) {
        return new promise((_, reject) => {
            if (reason instanceof promise) {
                reason.then(_, reject);
            } else {
                resolve(reason);
            }
        })
    }
    /**
     * 
     * @param  promises promise对象数组
     * 返回： 若每个promise都resolve了，则返回所有promise对象的resolve结果
     *        若其中一个promise  reject了，则返回当前reject的内容
     */
    static all(promises) {
        let resolves = [];
        return new promise((resolve, reject) => {
            promises.forEach(promiseItem => {
                promiseItem.then(
                    value => {
                        resolves.push(value);
                        if (resolves.length == promises.length) {
                            resolve(resolves);
                        }

                    },
                    reason => {
                        reject(reason);
                    }
                )
            });
        })        
    }

    /**
     * 
     * @param  promises promise对象数组
     * 返回： 最先resolve的promise对象的resolve结果
     */
    static race(promises) {
        return new promise((resolve, reject) => {
            promises.map(promiseItem => {
                promiseItem.then(
                    value => {resolve(value);}                   
                )
            });
        })
    }
}