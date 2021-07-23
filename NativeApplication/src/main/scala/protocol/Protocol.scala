package protocol

object Protocol {
  import com.fasterxml.jackson.databind.JsonNode
  import com.fasterxml.jackson.annotation.JsonProperty

  sealed trait Input{
    val messageType: String
    val requestResponseId: Option[Int]
    val message: JsonNode
  }

  case class MessageIn(@JsonProperty("type") messageType: String,
                       @JsonProperty("requestResponseId") requestResponseId: Option[Int],
                       @JsonProperty("message") message:JsonNode) extends Input

}
