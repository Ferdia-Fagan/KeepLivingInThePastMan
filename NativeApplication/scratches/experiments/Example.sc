
// Seperate file:

class A {


}

class B {

}

class C {

}

// Seperate file:

class Entry {
  import Entry_Companion._


}

object Entry_Companion {

  val x: X = Other_Other1
  val y: Y = Other_Other2


}

// Seperate file:

trait X {
  val a: A
  val b: B
}

trait Y {
  val c: C
}

object Other_Other1 extends X {
  // For example this contains several dbs a,b, etc
  // a and b use the same threadpool
  val a = new A()
  val b = new B()
}

object Other_Other2 extends Y {
  // And this contains 1 db
  // uses same thread pool
  val c = new C()
}

