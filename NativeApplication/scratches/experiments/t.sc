trait x{
  def add(): Unit
  def check(): Int
}

trait y{
  def subtract(): Unit
  def check(): Int
}

class A(var t: Int) extends x with y {
  override def add(): Unit = {
    t+=1
  }

  override def subtract(): Unit = {
    t-=1
  }

  override def check(): Int = {
    t
  }
}

val i = new A(10)

val i_X:x = i
val i_y:y = i

i_X.add()
i_y.check()
