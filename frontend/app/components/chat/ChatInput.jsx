import { MdOutlineArrowUpward } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";
import { useUploadImageMutation } from "@/redux/features/images/imageApi";
import { RiAttachmentLine } from "react-icons/ri";
import { BiStop } from "react-icons/bi";

const ChatInput = ({
  setFile,
  setImage,
  input,
  setInput,
  previewImage,
  setPreviewImage,
  handleSendMessage,
  loading,
  handleKeyDown,
}) => {
  const [uploadImage, { isSuccess, isError }] = useUploadImageMutation();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setPreviewImage(reader.result);
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await uploadImage(formData).unwrap();
      setFile(response.file);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setImage(null);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const formattedText = pastedText.replace(/\r?\n/g, "\n");
    setInput((prev) => prev + formattedText);
  };

  return (
    <div className="w-full flex justify-center max-h-96 overflow-hidden">
      <div className="relative flex items-center rounded-[26px] p-2 bg-[#2f2f2f] w-full max-w-4xl overflow-hidden">
        <button className="absolute bottom-4 left-4 text-white font-bold">
          <label htmlFor="file-upload" className="cursor-pointer">
            <RiAttachmentLine size={20} />
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </button>

        <div className="flex flex-col w-full px-12 overflow-hidden">
          {previewImage && (
            <div className="relative max-w-24 flex justify-start my-2 overflow-hidden max-h-24">
              <img
                src={previewImage}
                className="h-24 w-24 object-cover rounded-xl border-4 border-gray-400 hover:opacity-40"
                alt="preview-img"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-500 rounded-full p-1 text-white opacity-0 hover:opacity-100 transition-opacity duration-200"
              >
                <AiOutlineClose size={16} />
              </button>
            </div>
          )}

          <textarea
            className="flex resize-none bg-transparent text-[#ddd] py-2 focus:outline-none min-w-0 flex-1 overflow-y-auto h-full max-h-32 whitespace-pre-wrap break-words"
            onChange={(e) => setInput(e.target.value)}
            value={input}
            rows={Math.max(1, input.split("\n").length)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Message MyGPT"
          />
        </div>

        {loading ? (
          <button
            className="absolute bottom-2 right-0 bg-white text-black p-2 rounded-full mr-4"
            onClick={() => {}}
          >
            <BiStop size={20} />
          </button>
        ) : (
          <button
            className="absolute bottom-2 right-0 bg-white text-black p-2 rounded-full mr-4"
            onClick={handleSendMessage}
          >
            <MdOutlineArrowUpward size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
