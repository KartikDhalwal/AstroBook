import io from "socket.io-client";
import SUPER_BASE_URL from "../SocketUrl"
let socket = null;

export const initSocket = ({ userId, user_type }) => {
  if (socket) return socket;
  
  socket = io(SUPER_BASE_URL, {
  // socket = io('http://192.168.1.16:4000', {
    transports: ["websocket"],
    autoConnect: true,
    query: {
      userId,
      user_type,
    },
  });

  return socket;
};
export const getSocket = () => socket;
