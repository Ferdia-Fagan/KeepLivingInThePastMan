package session

import com.fasterxml.jackson.core.TreeNode
import com.fasterxml.jackson.databind.json.JsonMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.scala.DefaultScalaModule

import java.time.format.DateTimeFormatter

object Utils {

  /**
   * All dates use this format throughout system
   */
  final val formatter: DateTimeFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy")

  /**
   * Custom json message parser
   *
   * Collection of usefull methods to generate objects from json string, or treeNode, etc.
   */
  object MessageMapper {

    private val Mapper:JsonMapper = JsonMapper.builder()
      .addModule(DefaultScalaModule)
      .build()

    final def GetMessageFromJsonString[T](jsonMsg:String, msgObjType: Class[T]): T ={
      Mapper.readValue(jsonMsg, msgObjType)
    }

    final def GetMessageFromJsonNode[T](jsonMsg:TreeNode, msgObjType: Class[T]): T ={
      Mapper.treeToValue(jsonMsg,msgObjType)
    }

    final def GetBlankJsonObject(): ObjectNode = {
      Mapper.createObjectNode()
    }

    final def GetJsonNodeFromJson[T] (json:Object): T ={
      Mapper.valueToTree(json)
    }

    final def GetValueAsString(value:Object):String = {
      Mapper.writeValueAsString(value)
    }

  }
}
