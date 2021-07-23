package h2.utils

import java.io.{ByteArrayOutputStream, ObjectInputStream, ObjectOutputStream}
import java.nio.{ByteBuffer, ByteOrder}
import java.sql.Blob

import javax.sql.rowset.serial.SerialBlob
import slick.jdbc.H2Profile.api._

//import java.io.{ByteArrayOutputStream, ObjectInputStream, ObjectOutputStream}
//import java.sql.Blob
//import javax.sql.rowset.serial.SerialBlob

//import scala.math.BigInt

object Serialized {

  // THIS IS TAKEN FROM: https://github.com/slick/slick/blob/master/slick-testkit/src/main/scala/com/typesafe/slick/testkit/tests/JdbcTypeTest.scala

  case class Serialized[T](value: T)
//
  implicit def serializedType[T] = MappedColumnType.base[Serialized[T], Blob]({ s =>
    val b  = new ByteArrayOutputStream
    val out = new ObjectOutputStream(b)
    out.writeObject(s.value)
    out.flush
    new SerialBlob(b.toByteArray)
  }, { b =>
    val in = new ObjectInputStream(b.getBinaryStream)
    Serialized[T](in.readObject().asInstanceOf[T])
  })

}
