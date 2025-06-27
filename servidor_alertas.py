import asyncio
import websockets
import json
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(message)s')
CONNECTED_CLIENTS = set()

async def broadcast(message):
    if CONNECTED_CLIENTS:
        await asyncio.gather(*[client.send(message) for client in CONNECTED_CLIENTS])

async def handler(websocket):
    CONNECTED_CLIENTS.add(websocket)
    logging.info(f"Novo cliente conectado. Total: {len(CONNECTED_CLIENTS)}")
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                data['timestamp'] = datetime.now().strftime('%H:%M')
                logging.info(f"Alerta recebido: {data}")
                await broadcast(json.dumps(data))
            except json.JSONDecodeError:
                logging.error(f"Erro ao decodificar JSON: {message}")
            except Exception as e:
                logging.error(f"Erro ao processar mensagem: {e}")
    finally:
        CONNECTED_CLIENTS.remove(websocket)
        logging.info(f"Cliente desconectado. Total: {len(CONNECTED_CLIENTS)}")

async def main():
    async with websockets.serve(handler, "0.0.0.0", 8765):
        logging.info("✅ Servidor de Alertas iniciado em ws://localhost:8765")
        await asyncio.Future()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logging.info("Servidor encerrado.")
