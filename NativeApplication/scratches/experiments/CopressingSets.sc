import scala.collection.mutable

val x = mutable.Set[Long](1,2,3,4,5)

val theRestList = List(Seq[Long](6,7,8),Seq[Long](9,10,11))
val alternativeTheRest: List[Seq[Long]] = List()
Set.empty ++ alternativeTheRest.foldLeft(x)((totalList,theRest) => totalList ++ theRest)

