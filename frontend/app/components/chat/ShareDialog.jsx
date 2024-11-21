import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { FaFacebookF, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
import { GoCopy } from "react-icons/go";
import { Fragment, useState } from "react";
import { LinkIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const ShareDialog = ({
  shareOpen,
  setShareOpen,
  handleCreateLink,
  shareLink,
  linkCreated,
  setLinkCreated,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const closeModal = () => {
    setShareOpen(false);
    setLinkCreated(false);
    setIsCreating(false);
    setCopied(false);
  };

  const handleCreate = async () => {
    setIsCreating(true);
    await handleCreateLink();
    setIsCreating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Transition appear show={shareOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300" />
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
                <DialogPanel className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-[#222] p-6 text-left align-middle shadow-xl transition-all">
                  <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-[#b4b4b4] hover:bg-[#444] p-2 rounded-full hover:text-white transition-all duration-300"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                  {isCreating ? (
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 border-4 border-[#b4b4b4] border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-4 text-sm text-[#b4b4b4]">
                        Creating link...
                      </p>
                    </div>
                  ) : linkCreated ? (
                    <>
                      <DialogTitle
                        as="h3"
                        className="text-lg font-semibold leading-6 text-white"
                      >
                        Public link created
                      </DialogTitle>
                      <p className="mt-2 text-sm text-[#b4b4b4]">
                        A public link to your chat has been created. You can
                        manage it later via Settings.
                      </p>

                      <div className="mt-4 flex items-center justify-between bg-[#2f2f2f] border border-[hsla(0,0%,100%,.15)] rounded-md p-2">
                        <span className="text-sm text-[#b4b4b4] overflow-hidden text-ellipsis whitespace-nowrap flex-1 mr-4">
                          {shareLink}
                        </span>
                        <button
                          className={`flex items-center gap-1 px-3 py-2 text-sm ${
                            copied
                              ? "bg-green-500 text-white"
                              : "bg-white text-black hover:bg-[#ececec]"
                          } rounded-full transition-all duration-300`}
                          onClick={handleCopy}
                        >
                          {copied ? "Copied!" : <GoCopy />}
                        </button>
                      </div>

                      <div className="mt-6 grid grid-cols-4 gap-4">
                        {[
                          {
                            Icon: FaLinkedinIn,
                            name: "LinkedIn",
                            back: "hover:bg-[#0077B5]",
                            href: "",
                          },
                          {
                            Icon: FaFacebookF,
                            name: "Facebook",
                            back: "hover:bg-[#316FF6]",
                            href: "",
                          },
                          {
                            Icon: FaWhatsapp,
                            name: "Whatsapp",
                            back: "hover:bg-[#25D366]",
                            href: `https://api.whatsapp.com/send?text=${shareLink}`,
                          },
                          {
                            Icon: BsTwitterX,
                            name: "X",
                            back: "hover:bg-[#000000]",
                            href: `https://twitter.com/intent/tweet?url=${shareLink}&title=${""}`,
                          },
                        ].map(({ Icon, name, back, href }, idx) => (
                          <Link
                            href={href}
                            target="__blank"
                            key={idx}
                            className="flex flex-col items-center gap-2"
                          >
                            <button
                              className={`p-3 bg-[#2f2f2f] text-white rounded-full ${back}`}
                            >
                              <Icon />
                            </button>
                            <span className="text-sm text-[#b4b4b4]">
                              {name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <DialogTitle
                        as="h3"
                        className="text-lg font-semibold leading-6 text-white"
                      >
                        Share public link to chat
                      </DialogTitle>
                      <p className="mt-2 text-sm text-[#b4b4b4]">
                        Your name, custom instructions, and messages added after
                        sharing will stay private.
                      </p>

                      <div className="mt-4 flex items-center justify-between bg-[#2f2f2f] border border-[hsla(0,0%,100%,.15)] rounded-md p-2">
                        <span className="text-sm text-[#b4b4b4] overflow-hidden text-ellipsis whitespace-nowrap flex-1 mr-4">
                          {shareLink}
                        </span>
                        <button
                          className="flex items-center gap-1 px-3 py-2 text-sm text-black bg-white rounded-full hover:bg-[#ececec] transition-all duration-300"
                          onClick={handleCreate}
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
