
class A {
  val x = 10

  lazy val y ={
    println("helloo")
    x + 10
  }

}

val i = new A()

i.y
