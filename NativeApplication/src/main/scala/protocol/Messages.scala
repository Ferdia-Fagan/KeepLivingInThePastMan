package protocol

object Messages {
  import com.fasterxml.jackson.annotation.JsonProperty

  case class WebPageScrapings(@JsonProperty("webpageLoggingId") webpageLoggingId:Long,
                              @JsonProperty("title") title: String,
                              @JsonProperty("url") url: String, @JsonProperty("imgUrl") imgUrl: String,
                              @JsonProperty("scrapings") scrapings: String)

  case class NewAutoAnnotor(@JsonProperty("id") autoAnnotorId: Int, @JsonProperty("tagIds") tagIds: Array[Int] = null,
                            @JsonProperty("hostIds") hostIds: Array[Int] = null)

  case class TagsUpdateReport(@JsonProperty("addedTags") addedTags:List[Int] = null,
                              @JsonProperty("removedTags") removedTags:List[Int] = null)

  case class UpdateAutoAnnotor(@JsonProperty("id") id: Int, @JsonProperty("updatedTagsById") updatedTagsById: TagsUpdateReport = null,
                               @JsonProperty("hostnamesUpdateReport") hostnamesUpdateReport: TagsUpdateReport = null)

  case class AddHostnameId(@JsonProperty("hostname") hostname: String,@JsonProperty("hostnameId") hostnameId: Int)

}
