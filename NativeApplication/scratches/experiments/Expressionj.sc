import scala.concurrent.Future

implicit class FakeDatabaseConnection(name:String) {

  def getAll(): Int = {
    10
  }

}

trait table1 {
  val t1: String

}

trait table2 { this: table1 =>
  val t2: String
}

trait table3 { this: table1 with table2 =>
  val t3: String
}

class FakeDAL(val db: FakeDatabaseConnection) extends table1 with table2 with table3 {

  val t1: String = ""
  val t2: String = ""
  val t3: String = ""

  def getAll(): Int = {
    db.getAll()
  }

}

val inst = new FakeDAL("new")

inst
