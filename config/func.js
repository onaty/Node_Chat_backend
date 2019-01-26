module.exports =function Cart(convert){
  this.items = convert;

  this.generateArray = function(){
    var arr = [];
    for (var id in this.items){
      arr.push(this.items[id]);
    }
    return arr;
  };

};
