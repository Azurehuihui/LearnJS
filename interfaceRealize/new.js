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