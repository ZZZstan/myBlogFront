<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { useDialogStore } from '@/store/modules/dialog'
import { ElMessage } from 'element-plus'
import CryptocurrencyColorChat from '~icons/cryptocurrency-color/chat';

const userStore = useUserStore()
const dialogStore = useDialogStore()
const ws = ref(null)
const messages = ref([])
const inputMessage = ref('')
const isCollapsed = ref(true)
const onlineCount = ref(0)

// 连接websocket
const connectWebSocket = () => {
  if (!userStore.isLogin) {
    return
  }

  const userId = userStore.userInfo.id
  const wsUrl = import.meta.env.VITE_WS_URL
  ws.value = new WebSocket(`${wsUrl}/ws/chat/${userId}`)
  
  ws.value.onopen = () => {
    console.log('WebSocket连接成功')
  }
  ws.value.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      console.log('解析后的数据:', data)
      
      // 处理不同类型的消息
      if (data.type === 'message') {
        messages.value.push({
          userId: data.data.userId,
          username: data.data.username,
          content: data.data.content,
          time: data.data.time,
          type: 'message'
        })
        // 等待消息渲染后再滚动
        scrollToBottom()
      } else if (data.type === 'system') {
        // 只更新在线人数，不添加系统消息
        const count = parseInt(data.data)
        onlineCount.value = count
      }
    } catch (error) {
      console.error('消息处理错误:', error)
      console.log('原始消息:', event.data)
    }
  }
  
  ws.value.onerror = (error) => {
    console.error('WebSocket错误:', error)
    ElMessage.error('聊天室连接失败')
  }
  
  ws.value.onclose = () => {
    console.log('WebSocket连接关闭')
    // 可以在这里添加重连逻辑
    setTimeout(() => {
      if (userStore.isLogin) {
        connectWebSocket()
      }
    }, 3000)
  }
}

// 发送消息
const sendMessage = () => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    // 通过 store 触发登录弹窗
    dialogStore.showLoginDialog()
    return
  }
  
  if (!inputMessage.value.trim()) {
    return
  }
  
  const message = {
    userId: userStore.userInfo.id,
    username: userStore.userInfo.username,
    content: inputMessage.value,
    time: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-'),
    type: 'message'
  }
  
  ws.value.send(JSON.stringify(message))
  inputMessage.value = ''
}

// 切换聊天室显示状态
const toggleChatRoom = () => {
  isCollapsed.value = !isCollapsed.value
  // 展开时滚动到底部
  if (!isCollapsed.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 优化滚动到底部的方法
const scrollToBottom = () => {
  nextTick(() => {
    const messageBox = document.querySelector('.message-box')
    if (messageBox) {
      // 使用 requestAnimationFrame 确保在下一帧渲染后滚动
      requestAnimationFrame(() => {
        messageBox.scrollTop = messageBox.scrollHeight
      })
    }
  })
}

onMounted(() => {
  if (userStore.isLogin) {
    connectWebSocket()
  }
})

// 添加登录状态监听
watch(() => userStore.isLogin, (newValue) => {
  if (newValue) {
    connectWebSocket()
  } else if (ws.value) {
    ws.value.close()
  }
})

onUnmounted(() => {
  if (ws.value) {
    ws.value.close()
  }
})
</script>

<template>
  <div class="chat-room-container" :class="{ 'collapsed': isCollapsed }">
    <!-- 切换按钮 -->
    <div class="toggle-button" @click="toggleChatRoom">
      <CryptocurrencyColorChat class="icon" />
    </div>
    
    <!-- 聊天室主体 -->
    <div class="chat-room" v-show="!isCollapsed">
      <div class="chat-header">
        <div class="flex items-center justify-between">
          <span>公共聊天室</span>
          <span class="online-count">在线 {{ onlineCount }} 人</span>
        </div>
      </div>
      
      <!-- 消息列表 -->
      <div class="message-box">
        <div v-for="(msg, index) in messages" :key="index" class="message-item">
          <div class="message-header">
            <span class="username">{{ msg.username }}</span>
            <span class="message-time">{{ msg.time }}</span>
          </div>
          <div class="message-content">{{ msg.content }}</div>
        </div>
      </div>
      
      <!-- 输入框 -->
      <div class="input-box">
        <el-input
          v-model="inputMessage"
          placeholder="输入消息..."
          @keyup.enter="sendMessage"
        >
          <template #append>
            <el-button @click="sendMessage">发送</el-button>
          </template>
        </el-input>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-room-container {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
  transition: all 0.3s ease;
  
  &.collapsed {
    width: 50px;
    height: 50px;
  }
}

.toggle-button {
  position: absolute;
  top: -40px;
  right: 0;
  width: 50px;
  height: 50px;
  background-color: var(--el-color-primary);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--el-color-primary-light-3);
  }
  
  .icon {
    width: 30px;
    height: 30px;
    color: currentColor;
  }
}

.chat-room {
  width: 300px;
  height: 400px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color-lighter);
}

.chat-header {
  padding: 10px;
  background-color: var(--el-color-primary-light-9);
  border-bottom: 1px solid var(--el-border-color-lighter);
  border-radius: 8px 8px 0 0;
  font-weight: bold;
  
  .online-count {
    font-size: 12px;
    opacity: 0.8;
  }
}

.message-box {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  scroll-behavior: smooth;
  
  .message-item {
    margin-bottom: 16px;
    padding: 12px;
    background: var(--el-fill-color-blank);
    border-radius: 8px;
    border: 1px solid var(--el-border-color-lighter);
    
    &:hover {
      border-color: var(--el-border-color-darker);
    }
  }
  
  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    
    .username {
      font-weight: bold;
      color: var(--el-color-primary);
      font-size: 14px;
    }
    
    .message-time {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
  
  .message-content {
    color: var(--el-text-color-primary);
    line-height: 1.5;
    word-break: break-word;
  }
}

.input-box {
  padding: 10px;
  border-top: 1px solid var(--el-border-color-lighter);
}

/* 暗黑模式适配 */
:deep(.dark) {
  .chat-room {
    background-color: var(--el-bg-color);
    border-color: var(--el-border-color-darker);
  }
  
  .chat-header {
    background-color: var(--el-color-primary-light-5);
    color: white;
    border-color: var(--el-border-color-darker);
  }
  
  .message-box {
    background-color: var(--el-bg-color);
    
    .message-item {
      background-color: var(--el-bg-color-overlay);
      border-color: var(--el-border-color-darker);
      
      &:hover {
        border-color: var(--el-border-color-light);
      }
    }
  }
  
  .input-box {
    border-color: var(--el-border-color-darker);
    background-color: var(--el-bg-color-overlay);
  }
}
</style> 