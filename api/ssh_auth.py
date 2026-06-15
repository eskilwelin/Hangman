import paramiko

SERVER = ""
PORT = 22
USERNAME = ""
PASSWORD = ""

def server_connect():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        print(f"Connecting to {SERVER}...")
        client.connect(
            SERVER,
            port=PORT,
            username=USERNAME,
            password=PASSWORD,
            timeout=10
        )
        print("Authenticated.")

        stdin, stdout, stderr = client.exec_command("uname -a && uptime")
        output = stdout.read().decode()
        print(f"\n Reply from server: \n(output)")

        client.close()

    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    server_connect()