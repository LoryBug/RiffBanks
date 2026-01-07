import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { io } from 'socket.io-client'
import { useAuthStore } from './auth'

export const useSocketStore = defineStore('socket', () => {
  const socket: any = ref(null)
  const connected: any = ref(false)
  const currentRoom: any = ref(null)

  function connect() {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return

    const token = localStorage.getItem('token')
    if (!token) return

    // In dev mode, Vite proxies /socket.io to the backend server
    // Using undefined as URL makes socket.io connect to the same origin
    const newSocket: any = io({
      auth: { token },
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
      connected.value = true
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      connected.value = false
    })

    newSocket.on('connect_error', (err: any) => {
      console.error('Socket connection error:', err.message)
      connected.value = false
    })

    newSocket.on('error', (err: any) => {
      console.error('Socket error:', err)
    })

    socket.value = newSocket
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      connected.value = false
      currentRoom.value = null
    }
  }

  function joinRoom(songId: any) {
    if (socket.value && songId) {
      if (currentRoom.value && currentRoom.value !== songId) {
        socket.value.emit('leave_room', currentRoom.value)
      }
      socket.value.emit('join_room', songId)
      currentRoom.value = songId
    }
  }

  function leaveRoom(songId: any) {
    if (socket.value && songId) {
      socket.value.emit('leave_room', songId)
      if (currentRoom.value === songId) {
        currentRoom.value = null
      }
    }
  }

  function sendMessage(songId: any, text: any) {
    if (socket.value && songId && text) {
      socket.value.emit('send_message', { songId, text })
    }
  }

  function startTyping(songId: any) {
    if (socket.value && songId) {
      socket.value.emit('typing_start', songId)
    }
  }

  function stopTyping(songId: any) {
    if (socket.value && songId) {
      socket.value.emit('typing_stop', songId)
    }
  }

  return {
    socket,
    connected,
    currentRoom,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping
  }
})
