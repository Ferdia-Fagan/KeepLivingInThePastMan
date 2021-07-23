name := "NativeApplication"

version := "0.1"

scalaVersion := "2.13.4"

javacOptions ++= Seq("-encoding", "UTF-8")

libraryDependencies ++= {
  Seq("io.reactivex" %% "rxscala" % "0.27.0",
    "org.slf4j" % "slf4j-api" % "1.7.5",
    "org.slf4j" % "slf4j-simple" % "1.7.5",
    //    "org.clapper" %% "grizzled-slf4j" % "1.3.4",
    "com.fasterxml.jackson.core" % "jackson-databind" % "2.2.2",
    "com.fasterxml.jackson.module" %% "jackson-module-scala" % "2.12.0",
    "javax.xml.bind" % "jaxb-api" % "2.3.1",
    "com.typesafe.slick" %% "slick" % "3.3.2",
    //    "org.slf4j" % "slf4j-nop" % "1.7.10",
    "com.h2database" % "h2" % "1.4.187",
    "com.typesafe.slick" %% "slick-hikaricp" % "3.3.2"
  )
}
