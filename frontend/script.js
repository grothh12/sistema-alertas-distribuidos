document.addEventListener("DOMContentLoaded", () => {
    const alertList = document.getElementById('alert-list');
    const alertForm = document.getElementById('alert-form');
    const alertTypeInput = document.getElementById('alert-type');
    const alertRegionInput = document.getElementById('alert-region');
    const alertMessageInput = document.getElementById('alert-message');

    let userName = "";

    function promptForUserName() {
        userName = prompt("Digite seu nome para identificar quem envia o alerta:");
        if (!userName || userName.trim() === "") {
            userName = "Anônimo";
        }
    }

    promptForUserName();

    const socket = new WebSocket('ws://localhost:8765');

    function addAlertToUI({ type, region, message, user, timestamp }) {
        const alertElement = document.createElement('div');
        alertElement.classList.add('alert-message');

        alertElement.innerHTML = `
            <div class="type">🚨 ${type.toUpperCase()} - ${region}</div>
            <div class="text">${message}</div>
            <div class="meta">
                <span class="user-name">${user}</span>
                <span class="timestamp">${timestamp}</span>
            </div>
        `;

        alertList.appendChild(alertElement);
        alertList.scrollTop = alertList.scrollHeight;
    }

    socket.onopen = () => {
        console.log("Conectado ao servidor de alertas!");
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        addAlertToUI(data);
    };

    socket.onclose = () => {
        console.log("Desconectado do servidor de alertas.");
        const notice = document.createElement('div');
        notice.classList.add('alert-message');
        notice.innerText = "⚠️ Você foi desconectado.";
        alertList.appendChild(notice);
    };

    socket.onerror = (error) => {
        console.error("Erro no WebSocket:", error);
    };

    alertForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const alertType = alertTypeInput.value.trim();
        const alertRegion = alertRegionInput.value.trim();
        const alertMessage = alertMessageInput.value.trim();

        if (alertType && alertRegion && alertMessage && socket.readyState === WebSocket.OPEN) {
            const alertData = {
                type: alertType,
                region: alertRegion,
                message: alertMessage,
                user: userName
            };
            socket.send(JSON.stringify(alertData));
            alertTypeInput.value = '';
            alertRegionInput.value = '';
            alertMessageInput.value = '';
        }
    });
});
