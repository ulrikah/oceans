from pythonosc import osc_server, dispatcher, udp_client
import argparse

import db

DB = "chemicals.db"


class Client:
    def __init__(self, ip="127.0.0.1", port=5005):
        self.ip = ip
        self.port = int(port)
        self.udp_client = udp_client.SimpleUDPClient(self.ip, self.port)
        self.country_id = 1

    def send(self, payload, channel="/"):
        self.udp_client.send_message(channel, payload)


client = Client()


def year_handler(route, year):
    print(f"[{route}] ~ {year}")
    with db.create_connection(DB) as c:
        res = db.query_year(c, year, client.country_id)[0]
        client.send(res, "/chemicals")


def country_handler(route, country_id: int):
    print(f"[{route}] ~ {country_id}")
    client.country_id = country_id
    with db.create_connection(DB) as c:
        res = db.query_country(c, country_id)[0]
        client.send(res, "/country")


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ip", default="127.0.0.1", help="The IP to listen on")
    parser.add_argument("--port", type=int, default=3000, help="The port to listen on")
    return parser.parse_args()


if __name__ == '__main__':
    args = parse_args()
    # routes = ["/year", "/country"]
    dispatcher = dispatcher.Dispatcher()
    dispatcher.map("/year", year_handler)
    dispatcher.map("/country_id", country_handler)

    server = osc_server.ThreadingOSCUDPServer(
        (args.ip, args.port), dispatcher
    )

    print(f"Serving on {server.server_address}")
    server.serve_forever()
