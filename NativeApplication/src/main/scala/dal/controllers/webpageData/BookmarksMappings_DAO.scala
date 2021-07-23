package dal.controllers.webpageData

import dal.QueryLibrary.BookmarksMappingsComponent_QueryAPI
import h2.webpageData.BookmarksMappingsComponent
import org.slf4j.LoggerFactory
import slick.jdbc.H2Profile.api._

import scala.concurrent.Future
import java.nio.ByteBuffer
import h2.webpageData.BookmarksMappingsComponent.Bookmark

trait BookmarksMappings_DAO_QueryAPI {
  def getAllWebpagesIdsFromBookmarkFolders(parentBookmarkIds: Array[Int]): Future[Seq[Long]]
}

class BookmarksMappings_DAO(val db:Database) extends BookmarksMappingsComponent_QueryAPI
                                              with BookmarksMappings_DAO_QueryAPI {
  import BookmarksMappingsComponent.Bookmark

  private val logger = LoggerFactory.getLogger(classOf[BookmarksMappings_DAO])

  def addBookmarkForWebpage(bookmarkId:Int,parentBookmarkId: Int,webpageLoggingId: Long): Unit = {
    val bookmarkWebpage = addNewBookmark(Bookmark(bookmarkId,parentBookmarkId,webpageLoggingId))
    db.run(bookmarkWebpage)
  }

  def addBookmarksForWebPages(newBookmarks: Array[Bookmark]): Unit = {
    val addedBookmarksRequest = addNewBookmarks(newBookmarks)
    db.run(addedBookmarksRequest)
  }

  // UPDATE:

  def moveBookmark(bookmarkId: Int, newParentBookmarkId: Int): Unit = {
    val updateBookmarkParentBookmark_Req = getBookmarkBy_BookmarkId(bookmarkId)
      .map(_.parentBookmarkId)
      .update(newParentBookmarkId)
    db.run(updateBookmarkParentBookmark_Req);
  }

  //  TODO: override def moveBookmarks(newBookmarks: Array[(Int, Int)]): Unit = {
  //    val q = bookmarkMappingsT.filter(_.bookmarkId === )
  //  }

  // GET:

  def getAll(): Future[Seq[Bookmark]] = {
    db.run(bookmarkMappingT.result)
  }

//  def getWebpagesInBookmark(parentBookmarkId:Int):Future[Seq[Bookmark]] = {
//    val q = getBookmarksBy_ParentBookmarkId(parentBookmarkId)
//    db.run(q.result)
//  }

  def getAllWebpagesIdsFromBookmarkFolders(parentBookmarkIds: Array[Int]): Future[Seq[Long]] = {
    val webpagesIdsFromBookmarkFolders = getBookmarksBy_ParentBookmarkId(parentBookmarkIds)
      .map(_.webpageLoggingId).distinct
    db.run(webpagesIdsFromBookmarkFolders.result)
  }

//  def getWebpagesInBookmarks(parentBookmarkIds:Array[Int]):Future[Seq[Bookmark]] = {
//    val q = getBookmarksBy_ParentBookmarkId(parentBookmarkIds)
//    db.run(q.result)
//  }

  // REMOVE

//  def remove_BookmarkFoldersWebpages(parentBookmarkId:Int): Unit = {
//    val q = getBookmarksBy_ParentBookmarkId(parentBookmarkId)
//    db.run(q.delete)
//  }

  def remove_BookmarksByIds(bookmarkIds: Array[Int]): Unit = {
    val removeBookmarkById_Req = getBookmarksBy_ParentBookmarkId(bookmarkIds).delete
    db.run(removeBookmarkById_Req)
  }
}