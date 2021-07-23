
def x(a:Int) = a + 10;

def y(b:Int) = b * 10

val f3 = x _ andThen y _
f3(10)
f3(110)
