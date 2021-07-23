

trait A{
  import A._
  def x(): Int
}

object A{
  def y(): String = {
    "hello"
  }
}


class B extends A{
  def x(): Int ={

    10
  }
}