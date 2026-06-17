import paramiko

PORT = 22

def server_connect(SERVER, USERNAME, PASSWORD):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        client.connect(
            SERVER,
            port=PORT,
            username=USERNAME,
            password=PASSWORD,
            timeout=5
        )
        client.close()
        return True

    except Exception as e:
        print(f"Connection failed: {e}")
        return False
