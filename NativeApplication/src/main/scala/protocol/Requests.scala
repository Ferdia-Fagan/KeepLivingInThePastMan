package protocol

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.JsonNode

object Requests {

  sealed trait Output{
    val requestResponseId: Int
  }

  object LogWebpageVisit{
    case class LogWebpageVisit_Req(@JsonProperty("hostName") hostName:String,
                                   @JsonProperty("pathName") pathName:String, @JsonProperty("hostnameId")hostnameId: Option[Int])

    case class LogWebpageVisit_Resp(@JsonProperty("requestResponseId") requestResponseId: Int,
                                    @JsonProperty("webpageLoggingId") webpageLoggingId:Long, @JsonProperty("isIndexed") isIndexed:Boolean,
                                    @JsonProperty("isTagged") isTagged:Boolean, @JsonProperty("metadata") metadata: JsonNode) extends Output
  }

  object Query {
    case class Query_Req(@JsonProperty("tags") tags: Option[Array[Int]], @JsonProperty("bookmarks") bookmarks: Option[Array[Int]],
                         @JsonProperty("query") query: String, @JsonProperty("filterDates") filterDates: Option[List[String]] = None,
                         @JsonProperty("filterByToday") filterByToday: Boolean)

    /**
     *
     * @param requestResponseId
     * @param results Array[(webpageLoggingId, webpageName, url, imgUrl)]
     */
    case class Query_Resp(@JsonProperty("requestResponseId") requestResponseId: Int,
                          @JsonProperty("results") results: Array[(Long,String,String,String)]) extends Output
  }

}
