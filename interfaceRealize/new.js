/**
 * new 之后发生的事情
 * 1、创建了一个新对象
 * 2、继承父类原型上的方法
 * 3、添加父类的属性到新对象上并初始化，保存方法的执行结果
 * 4、如果执行结果有返回值并且是一个对象，则返回执行的结果， 否则返回新创建的对象
 */
function _new(obj, ...Argus) {
    // 基于obj的原型，创建一个新对象
    const newObj = Object.create(obj.prototype);
    // 添加属性到新对象上，并获取obj函数执行的结果
    const result = obj.apply(newObj, Argus);

    // 如果执行结果有返回值并且是一个对象，则返回执行的结果， 否则返回新创建的对象
    return typeof result === 'object' ? result : newObj;
}

// test
function Person(name, age) {
    this.name = name;
    this.age = age;
}
Person.prototype.info = function () {
    return `${this.name} ${this.age}`;
};
const p1 = new Person('kk', 10);
console.log(p1);
const p2 = _new(Person, 'kk', 10);
console.log(p2);  


// 复杂一点的new过程

function new_(constr, ...rests) {
    if (typeof constr !== "function") {
        throw "the first param must be a function";
    }
    new_.target = constr;
    var obj = Object.create(constr.prototype);
    var ret = constr.apply(obj, rests);
    var isObj = typeof ret !== null && typeof ret === "object";
    var isFun = typeof ret === "function";
    //var isObj = typeof ret === "function" || typeof ret === "object" && !!ret;
    if (isObj || isFun) {
        return ret;
    }
    return obj;
}

function Person(name, age) {
    this.name = name;
    this.age = age;
}
Person.prototype.say = function () {
    console.log(this.name);
};
var p1 = new_(Person, 'clloz', '28')
var p2 = new_(Person, 'csx', '31')
console.log(p1); //Person {name: "clloz", age: "28"}
p1.say();  //clloz
console.log(p2);  //Person {name: "csx", age: "31"}
p2.say();  //csx

console.log(p1.__proto__ === Person.prototype);  //true
console.log(p2.__proto__ === Person.prototype);  //true
