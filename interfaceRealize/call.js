// 常规call方法的使用 
var newObj = {
    name: "lily"
}

var name = "oliv"

var obj = {
    name: "bob",
    f: function(age, hobby) {
        console.log(this.name + " is " + age + " hobby is " + hobby);
    }
}
// obj.f(10, "jumping") // bob is 10 hobby is jumping
// obj.f.call(newObj, 12, "basketball"); // lily is 12 hobby is basketball
// obj.f.call(1, 12, "finshing"); // undefined is 12 hobby is finshing 
// obj.f.call({}, 12, "walking"); // undefined is 12 hobby is walking

/**
 * 所以call 方法接收 至少两个参数，
 *     第一个参数是调用对象向指向的target
 *     第二个参数是被调用函数的形参列表， 形参可以有多个
 * 因为需要让所有函数都能调用，所有需要把自定义的call方法放到Function的原型上
 * 
 * function的形参没有自动解构的功能， 所以 目标target和 函数形参没有办法自动分开
 * 且 function只定义一个形参的话，他只能接收传进来的第一个参数
 * 这个时候就要借助 函数中自带的arguments属性了
 */

Function.prototype._call = function(target) {
    // 判断调用call方法的对象是否为函数
    // 其实一般普通对象不会走到这里，因为普通对象的原型上和Function的原型是两条路
    // 直接调用 会直接报错 XXX is not a function
    // 这里还有个问题typeof Object 也是function 
    // 但直接 Object.call()也不会报错
    if (typeof this !== 'function') {
        throw new TypeError(this + 'is not a function')
    }
    // 判断obj是否为对象,不是则转换成全局对象
    // void(0)为undefined  undefined 最好是使用 void(0)，因为在非全局作用域 window 和 undefined 都是能被修改的
    if (target === void(0) || target === null) {
        target = (typeof window === "undefined" ? global : window);
    } else {
        // 确保target为对象
        target = new Object(target);
    }
    // console.log(target);
    // 存储形参
    let argList = [];
    // 通过Symbol是防止添加自定义属性与target对象原先的属性相冲突
    // 除了用Symbol来取唯一的键名外，还可以通过时间戳或者随机数的方法
    // Math.random()  new Date().getTime();
    const FUNC = Symbol('func');
    // 改变this的指向
    // 在目标对象上添加 要执行的函数 为其一个属性
    target[FUNC] = this;
    for (let i = 1; i < arguments.length; i++) {
        // arguments是一个类数组， key是索引号， value是参数值，有一个length属性
        argList.push(arguments[i])
    }
    // result为执行结果
    // 直接通过this(...argList)的话
    /**
     * 相当于直接在全局下执行以下函数，此时函数内部的this指向的是全局window
     * ƒ (age, hobby) {
        console.log(this.name + " is " + age + " hobby is " + hobby);
    }
     */
    let result = target[FUNC](...argList);
    // 因为target是引用对象类型，所以在其上添加的属性不删除的会更改target对象
    // target 就变成 {name: "lily", Symbol(func): ƒ}
    delete target[FUNC];
    return result;

}

obj.f._call(newObj, 13, "football"); // lily is 13 hobby is football
obj.f._call(null, 14, "ball"); // oliv is 14 hobby is ball
obj.f._call(undefined, 15, "iceball"); // oliv is 15 hobby is iceball
obj.f._call(1, 16, "handball"); // undefined is 16 hobby is handball
