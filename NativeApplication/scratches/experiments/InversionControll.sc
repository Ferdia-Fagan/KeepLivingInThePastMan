import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

implicit class FakeDatabase(name:String) {

  def getAll(): Future[Int] = Future{
    10
  }

}


//implicit val databaseCreator = (name: String) => {
//  new FakeDatabase(name)
//}


//-----------------------------------------
class FakeService1(val db:FakeDatabase) {

  def getAll(): Future[Int] ={
    db.getAll()
  }

}

class FakeService2(val db:FakeDatabase) {

  def getAll(): Future[Int] ={
    db.getAll()
  }

}



val inst_1 = new FakeService1("name")
val inst_2 = new FakeService2("name")





