var _instanceOf = function(target, father) {
    while(target) {
        if (target.__proto__ === father.prototype) return true;
        target = target.__proto__;
    }
    return false;
}

// test
console.log(_instanceOf(Object, Function));
console.log( Object instanceof Function);


var throttling = (fn, wait) => 
{   let timer; let context, args; 
    let run = () => 
         { timer=setTimeout(()=>
                            { fn.apply(context,args); clearTimeout(timer);
                                 timer=null; },wait); } 
                                 return function () { 
                                     context=this; 
                                     args=arguments; 
                                     if(!timer){ 
                                         console.log("throttle, set"); 
                                        run(); }
                                     else { console.log("throttle, ignore"); } }
}