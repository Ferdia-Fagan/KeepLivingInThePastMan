package browserAdapter

import java.nio.charset.StandardCharsets

import org.slf4j.Logger
import org.slf4j.LoggerFactory

import java.io.{IOException, InputStream, InterruptedIOException}

/**
 * This is imported to either:
 * read messages  {@link InputOutputAdapter.readMessage}
 * send messages  {@link InputOutputAdapter.sendMessage}
 * all through System.out
 */
object InputOutputAdapter {
  val logger = LoggerFactory.getLogger("InputOutputAdapter")
  val STEP_SIZE: Int = 8000;

  private def changeMessageStreamIntoBytes(messageInput: InputStream, msgSize: Int): Array[Byte] = {
    val messageAsBytes = new Array[Byte](msgSize)
    var numberOfRemainingBytes = msgSize
    var currentStreamPosition = 0
    while(currentStreamPosition != msgSize){

      val numberOfBytesReadFromStream = messageInput.read(messageAsBytes, currentStreamPosition,
        if (numberOfRemainingBytes > STEP_SIZE) {STEP_SIZE} else {numberOfRemainingBytes})

      currentStreamPosition += numberOfBytesReadFromStream

      numberOfRemainingBytes -= numberOfBytesReadFromStream
    }
    messageAsBytes
  }

  def readInputAsMessage(input: InputStream):String = {
    var inputBytes = new Array[Byte](4)
    input.read(inputBytes,0,4)

    val size = getLengthFromBytes(inputBytes)

    if (size == 0) throw new InterruptedIOException("Browser plugin is closing down")

    inputBytes = changeMessageStreamIntoBytes(input,size)

    try{
      val theMessage = new String(inputBytes, StandardCharsets.UTF_8)

      theMessage
    }catch {
      case e => {
        throw e
      }
    }

  }

  /**
   * Sends message to browser plugin from this local application.
   * @param message
   * @param addLength
   */
  def sendMessageToBrowserPlugin(message: String, addLength: Int = 0): Unit = {
    System.out.write(getLengthAsBytes(message.length + addLength))
//    logger.info("the message is: " + message)
//    logger.info("the encoded message is: " + message.getBytes(StandardCharsets.UTF_8).mkString(""))
//    logger.info("the decoded message is: " + new String(message.getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8))
    System.out.write(message.getBytes(StandardCharsets.UTF_8))
    System.out.flush()
  }

  private def getLengthFromBytes(messageLengthAsBytes: Array[Byte]): Int =
    ((messageLengthAsBytes(3) << 24) & 0xff000000 |
      (messageLengthAsBytes(2) << 16) & 0x00ff0000 |
      (messageLengthAsBytes(1) << 8) & 0x0000ff00 |
      (messageLengthAsBytes(0) << 0) & 0x000000ff)

  private def getLengthAsBytes(messageLength: Int):Array[Byte] = {
    val lengthAsBytes = new Array[Byte](4)
    lengthAsBytes(0) = (messageLength & 0xFF).toByte
    lengthAsBytes(1) = ((messageLength >> 8) & 0xFF).toByte
    lengthAsBytes(2) = ((messageLength >> 16) & 0xFF).toByte
    lengthAsBytes(3) = ((messageLength >> 24) & 0xFF).toByte
    lengthAsBytes
  }
}
