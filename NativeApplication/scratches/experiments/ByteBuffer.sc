import h2.autoCollector.AutoAnnotatorCollectionComponent._

import java.nio.{ByteBuffer, IntBuffer}
import scala.collection.mutable.ArrayBuffer


//val x = 10
val y = intArrayToByteArray(Array[Int](1,2,34))
val x = AutoCollector(1, y)
x.getTheWebPageIds()
//x.getTheWebPageIds()

val x = Array[Int](100, 200, 300, 400)

val byteBuffer:ByteBuffer = ByteBuffer.allocate(x.length * 4);
val intBuffer:IntBuffer = byteBuffer.asIntBuffer()
val aaa = intBuffer.put(x)
//x.foreach(a => intBuffer.put(a))
//
//val y = byteBuffer.array()
//
//val a = ByteBuffer.wrap(y).getInt
//val b = ByteBuffer.wrap(y).getInt(2)

//Array[Int]
//for(i <- 0 to y.length){}

val y = x.flatMap(theInt =>{
  ByteBuffer.allocate(4).putInt(theInt).array()
})

val bytes = ByteBuffer.wrap(y)

val theWebPageIds = Array.ofDim[Int](bytes.limit()/4)
//println("theWebPageIds: " + theWebPageIds.length)
for(i<- theWebPageIds.indices){
  println(i)
  theWebPageIds(i) = bytes.getInt()
}
theWebPageIds
//theWebPageIds.map(bytes.getInt())
//bytes.getInt()
//val asArray = bytes.array()
//val theWebPageIds = Array[Int](asArray.size)
//for(i<- 0 to asArray.size){
//  theWebPageIds(i) = asArray.slice(0,4)
//}
//a.array()
//while(bytes.hasRemaining()){
//  theWebPageIds += bytes.getInt()
//}
//bytes.getInt()
//bytes.getInt()
//bytes.getInt()
//val a = bytes.asIntBuffer().array()
//    println("theWebPageIds : " + theWebPageIds)

