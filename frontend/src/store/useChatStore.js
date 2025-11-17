import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // Fetch all users for sidebar
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users", { withCredentials: true });
      set({ users: res.data });
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch users";
      toast.error(message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Fetch messages for a specific user
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`, { withCredentials: true });
      set({ messages: res.data });
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch messages";
      toast.error(message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Send a message to the selected user
  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
        { withCredentials: true }
      );
      set((state) => ({ messages: [...state.messages, res.data] }));
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send message";
      toast.error(message);
    }
  },

  // Subscribe to new messages via socket
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const isMessageFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageFromSelectedUser) return;

      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    });
  },

  // Unsubscribe from socket events
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },

  // Select a user
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
