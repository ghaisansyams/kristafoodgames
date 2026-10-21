import asyncio
import serial
import websockets

# Sesuaikan dengan COM/port Arduino Anda (mis. "COM7" di Windows, "/dev/cu.usbmodemXXXX" di Mac)
SERIAL_PORT = "COM7"
BAUD_RATE = 9600
WS_PORT = 8765

clients = set()


async def handle_browser(websocket):
    clients.add(websocket)
    print("Website terhubung")

    try:
        await websocket.wait_closed()
    finally:
        clients.discard(websocket)
        print("Website terputus")


async def read_arduino():
    try:
        ser = serial.Serial(
            SERIAL_PORT,
            BAUD_RATE,
            timeout=1
        )

        # Arduino biasanya reset ketika Serial dibuka
        await asyncio.sleep(2)
        ser.reset_input_buffer()

        print(f"Arduino terhubung di {SERIAL_PORT}")

        while True:
            line = await asyncio.to_thread(ser.readline)
            message = line.decode(
                "utf-8", errors="ignore"
            ).strip()

            # Dibandingkan tanpa peduli huruf besar/kecil — sketch Arduino bisa saja
            # mengirim "stop" atau "STOP", keduanya tetap terdeteksi sebagai tombol ditekan.
            if message.upper() == "STOP":
                print("STOP")

                # Kirim ke semua halaman website yang terhubung
                if clients:
                    await asyncio.gather(
                        *[
                            client.send("STOP")
                            for client in list(clients)
                        ],
                        return_exceptions=True
                    )

    except serial.SerialException as e:
        print(f"Error Serial: {e}")
        print("Periksa COM port dan koneksi Arduino.")


async def main():
    async with websockets.serve(
        handle_browser,
        "127.0.0.1",
        WS_PORT
    ):
        print(f"Middleware aktif di port {WS_PORT}")
        await read_arduino()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Middleware dihentikan")
