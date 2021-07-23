package dal.QueryLibrary

import h2.webpageData.BookmarksMappingsComponent

import slick.jdbc.H2Profile.api._

trait BookmarksMappingsComponent_QueryAPI extends BookmarksMappingsComponent{
  import BookmarksMappingsComponent._

  // ADD:

  def addNewBookmark(newBookmark: Bookmark) =
    bookmarkMappingT += newBookmark

  def addNewBookmarks(newBookmarka: Array[Bookmark]) =
    bookmarkMappingT ++= newBookmarka

  // GET:
  def getBookmarksBy_ParentBookmarkId(parentBookmarkId: Int) =
    bookmarkMappingT.filter(_.parentBookmarkId === parentBookmarkId)

  def getBookmarksBy_ParentBookmarkId(parentBookmarkIds: Array[Int]) =
    bookmarkMappingT.filter(_.parentBookmarkId inSet  parentBookmarkIds)

  def getBookmarkBy_BookmarkId(bookmarkId: Int) =
    bookmarkMappingT.filter(_.bookmarkId === bookmarkId)





}
