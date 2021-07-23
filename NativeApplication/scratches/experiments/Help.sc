
class X(){
  var c = 0

  def call(): Unit ={
    c+=1
    println("c : " + c)
  }
}

class A(val a: X) {

}

class B(val b: X){

}

val x = new X()

val A_inst = new A(x)
val B_inst = new B(x)

A_inst.a.call()
B_inst.b.call()

A_inst.a
B_inst.b

