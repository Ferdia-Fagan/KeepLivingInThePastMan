package h2.webpageData

import slick.jdbc.H2Profile.api._
/**
 * Used to store webpage bookmarks.
 */
trait BookmarksMappingsComponent extends WebpageMappingsComponent {
  import BookmarksMappingsComponent._

  lazy val bookmarkMappingT = TableQuery[BookmarksMapping_Table]

  class BookmarksMapping_Table(tag: Tag) extends Table[Bookmark](tag, "BookmarksMappings") {

    /**
     * Id of webpage bookmarked.
     * This is generated within the browser plugin. It is used so can quickly delete the bookmark.
     */
    val bookmarkId = column[Int]("bookmarkId",O.PrimaryKey)

    /**
     * The bookmark folder id of the webpage
     */
    val parentBookmarkId = column[Int]("parentBookmarkId")

    val webpageLoggingId = column[Long]("webpageLoggingId")

    override def * = (bookmarkId,parentBookmarkId,webpageLoggingId).mapTo[Bookmark]

  }

}

object BookmarksMappingsComponent{

  case class Bookmark(bookmarkId:Int, parentBookmarkId:Int,webpageLoggingId: Long)
}