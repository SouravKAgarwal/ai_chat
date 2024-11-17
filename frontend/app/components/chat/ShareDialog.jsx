import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { FaFacebookF, FaLinkedinIn, FaReddit } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
import { GoCopy } from "react-icons/go";
import { Fragment } from "react";
import { LinkIcon } from "@heroicons/react/24/outline";

const ShareDialog = ({
  shareOpen,
  setShareOpen,
  handleCreateLink,
  shareLink,
  linkCreated,
  setLinkCreated,
}) => {
  const closeModal = () => {
    setShareOpen(false);
    setLinkCreated(false);
  };

  return (
    <>
      <Transition appear show={shareOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#222] p-6 text-left align-middle shadow-xl transition-all">
                  {linkCreated ? (
                    <>
                      <DialogTitle
                        as="h3"
                        className="text-lg font-medium leading-6 text-white"
                      >
                        Public link created
                      </DialogTitle>
                      <p className="mt-2 text-sm text-gray-400">
                        A public link to your chat has been created. Manage
                        previously shared chats at any time via Settings.
                      </p>

                      <div className="mt-4 flex items-center justify-between bg-[#2f2f2f] border border-[hsla(0,0%,100%,.15)] rounded-md p-2">
                        <span className="text-sm text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap flex-1 mr-4">
                          {shareLink}
                        </span>
                        <button
                          className="flex items-center gap-1 px-3 py-2 text-sm text-black bg-white rounded-full hover:bg-[#ececec]"
                          onClick={() =>
                            navigator.clipboard.writeText(shareLink)
                          }
                        >
                          <GoCopy />
                          Copy Link
                        </button>
                      </div>

                      <div className="mt-6 flex justify-around">
                        <div className="w-full items-center text-sm font-semibold flex flex-col gap-2">
                          <button className="p-3 bg-[#2f2f2f] text-white rounded-full hover:bg-gray-600">
                            <FaLinkedinIn />
                          </button>
                          Linkedin
                        </div>
                        <div className="w-full items-center text-sm font-semibold flex flex-col gap-2">
                          <button className="p-3 bg-[#2f2f2f] text-white rounded-full hover:bg-gray-600">
                            <FaFacebookF />
                          </button>
                          Facebook
                        </div>
                        <div className="w-full items-center text-sm font-semibold flex flex-col gap-2">
                          <button className="p-3 bg-[#2f2f2f] text-white rounded-full hover:bg-gray-600">
                            <FaReddit />
                          </button>
                          Reddit
                        </div>
                        <div className="w-full items-center text-sm font-semibold flex flex-col gap-2">
                          <button className="p-3 bg-[#2f2f2f] text-white rounded-full hover:bg-gray-600">
                            <BsTwitterX />
                          </button>
                          X
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <DialogTitle
                        as="h3"
                        className="text-lg font-medium leading-6 text-white"
                      >
                        Share public link to chat
                      </DialogTitle>
                      <p className="mt-2 text-sm text-gray-400">
                        Your name, custom instructions, and any messages you add
                        after sharing stay private.
                      </p>

                      <div className="mt-4 flex items-center justify-between bg-[#2f2f2f] border border-[hsla(0,0%,100%,.15)] rounded-md p-2">
                        <span className="text-sm text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap flex-1 mr-4">
                          {shareLink}
                        </span>
                        <button
                          className="flex items-center gap-1 px-3 py-2 text-sm text-black bg-white rounded-full hover:bg-[#ececec]"
                          onClick={handleCreateLink}
                        >
                          <LinkIcon className="w-5 h-5" />
                          Create Link
                        </button>
                      </div>
                    </>
                  )}
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ShareDialog;
