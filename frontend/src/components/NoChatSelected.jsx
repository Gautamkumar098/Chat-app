import { MessageCircleMore, ShieldCheck, Sparkles } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-white px-8">

      {/* Chat Icon */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl mb-8 animate-pulse">
        <MessageCircleMore size={52} />
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-bold tracking-wide">
        Welcome to ChatApp
      </h1>

      {/* Description */}
      <p className="text-gray-300 mt-4 text-center max-w-lg leading-7">
        Select a conversation from the sidebar and start chatting instantly.
        Enjoy secure, real-time messaging with a clean and modern interface.
      </p>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-12 w-full max-w-2xl">

        <div className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl p-5 flex gap-4 items-start hover:bg-white/15 transition-all duration-300">

          <div className="bg-blue-500 p-3 rounded-xl">
            <ShieldCheck size={24} />
          </div>

          <div>
            <h2 className="font-semibold text-lg">
              Secure Messaging
            </h2>

            <p className="text-gray-300 text-sm mt-1">
              Private conversations with fast and reliable communication.
            </p>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl p-5 flex gap-4 items-start hover:bg-white/15 transition-all duration-300">

          <div className="bg-purple-500 p-3 rounded-xl">
            <Sparkles size={24} />
          </div>

          <div>
            <h2 className="font-semibold text-lg">
              Real-Time Experience
            </h2>

            <p className="text-gray-300 text-sm mt-1">
              Messages appear instantly with Socket.IO and a smooth UI.
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Text */}

      <p className="mt-12 text-sm text-gray-400 italic">
        🚀 Start by selecting a user from the left panel.
      </p>

    </div>
  );
};

export default NoChatSelected;