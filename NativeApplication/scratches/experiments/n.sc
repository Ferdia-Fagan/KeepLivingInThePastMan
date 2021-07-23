
trait Y{
  val a: Int
}

trait Z{
  val b: Int
  def count(): Unit ={

  }
}

object X extends Y with Z {
  val a = 10
  val b = 20
}

val q: Z = (X:Z)

q.b



