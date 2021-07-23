
//object X {
//
//
//
//}


class A {
//  import X.x
  implicit val x = "hello"

  implicit val G: Double = 9.81

  def u(): String = {
    val a  = implicitly[String]
    a
  }

}


val a = new A()

a.u



