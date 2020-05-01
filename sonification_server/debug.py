import osc_server
import time

if __name__ == '__main__':
    s = 0.2
    client = osc_server.Client("127.0.0.1", 3000)
    while True:
        for i in range(1970, 2019):
            print(f"Querying year {i}")
            client.send(i, "/year")
            time.sleep(s)
