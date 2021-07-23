
trait X {
  def x(): String
}

trait Spam {
  def eggs = 10
}

class A {
  def x(): String = {
    "hello"
  }
}

val a = new A() with

def ass(x:X):String ={
  x.x()
}

ass(a)


