const socket = io('http://localhost:3000')

const chatBox = document.getElementById('chatbox')
const chatForm = document.getElementById('chat-form')
const deleteBtn = document.getElementById('delete-btn')
const clearBtn = document.getElementById('clear-btn')
const logoutBtn = document.getElementById('logout-btn')
const roomForm = document.getElementById('room-form')
const joinBtn = document.getElementById('join-btn')

const appendMessage = (message) => {
    //const today = new Date()
    const createdAt = new Date(message.createdAt)
    const hour = String(createdAt.getHours()).padStart(2, "0")// || String(today.getHours()).padStart(2, "0")
    const minute = String(createdAt.getMinutes()).padStart(2, "0")// || String(today.getMinutes()).padStart(2, "0")

    const html =
    `
        <div class="message-block">
            <span>${hour}:${minute} - ${message.roomid ? message.sendername + '(Private)' : message.sendername}</span>
            <br>
            ${message.message || message}
        </div>
    `
    
    chatBox.innerHTML += html
}

const appendNotification = (notif) => {
    const html = `<div class="notif-block">${notif}</div>`
    chatBox.innerHTML += html
}

let username = localStorage.getItem('username')
if (!username){
    username = prompt('Input your name ?')
    localStorage.setItem('username', username);
}
appendNotification('Joined as ' + username)
socket.emit('join', username)

// SOCKET CALLS
socket.on('message', data => {
    appendMessage(data)
})

socket.on('notification', data => {
    appendNotification(data)
})

socket.on('output-chat', data => {
    data.forEach(chat => {
        appendMessage(chat)
    });
})


// BUTTON EVENT HANDLERS
chatForm.addEventListener('submit', e => {
    e.preventDefault()

    if (!chatForm.message.value)
        return

    const msg = {
        message: chatForm.message.value,
        roomid: roomForm.roomid.value,
        senderid: socket.id,
        sendername: username
    }

    socket.emit('chatmessage', msg)
    chatForm.message.value = ''
})

deleteBtn.addEventListener('click', function() {
    if (chatBox.innerText === '')
        alert('Chat history is already empty')

    const allNotifs = document.getElementsByClassName('notif-block')
    chatBox.innerHTML = allNotifs[0].outerHTML + allNotifs[1].outerHTML

    confirm('Delete chat history ?') && socket.emit('delete')
})

clearBtn.addEventListener('click', function() {
    const allNotifs = document.getElementsByClassName('notif-block')
    const allMessages = [...document.getElementsByClassName('message-block')]

    const messageBlocks = allMessages.map(message => message.outerHTML).toString().replace(/,/g, '')

    chatBox.innerHTML = allNotifs[0].outerHTML + allNotifs[1].outerHTML + messageBlocks
    // console.log(allNotifs[0].outerHTML + allNotifs[1].outerHTML)
})

logoutBtn.addEventListener('click', function() {
    if(confirm('Log out ?')) {
        localStorage.removeItem('username')
        window.location.reload()
    }
})

joinBtn.addEventListener('click', function(e) {
    e.preventDefault()
    const roomid = roomForm.roomid.value
    socket.emit('join-room', roomid)
})