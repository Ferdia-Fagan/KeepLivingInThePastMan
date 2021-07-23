import java.nio.ByteBuffer


object Serialized {

  case class Serialized[Array[Long]](value: Set[Long])

  implicit def Serialized_Converted = (x: Set[Long]) => {
    x.toArray.flatMap(theLong => {
      ByteBuffer.allocate(8).putLong(theLong).array()
    })
  }

  implicit def DeSerialized_Converted = (x: Array[Byte]) => {
    val bytes = ByteBuffer.wrap(x)
    val theWebPageIds: Array[Long] = Array.ofDim[Long](bytes.limit() / 8)
    for (i <- theWebPageIds.indices) {
      theWebPageIds(i) = bytes.getLong()
    }
    theWebPageIds.toSet
  }

}



val x = Set[Long](10L,11L,12L)

val y = Serialized.Serialized_Converted(x)

Serialized.Serialized(x)

import Serialized._

def change(a: Set[Long]): Set[Long] = {
  a
}


change(y)




