import sqlite3
from sqlite3 import Error

DB = "mock.db"


def create_connection(db_file):
    """ create a database connection to a SQLite database """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        print(f"Using SQLite version {sqlite3.version}")
        return conn
    except Error as e:
        print(e)


def query_year(conn: sqlite3.Connection, year: int):
    q = f"SELECT * FROM chemicals WHERE year = {year}"
    return query(conn, q, True)


def query(conn: sqlite3.Connection, q: str, debug=False):
    cursor = conn.execute(q)
    if debug:
        cols = list(map(lambda x: x[0], cursor.description))
        rows = cursor.fetchall()
        print("________________")
        print(*cols, sep="\t")
        print("________________")
        for row in rows:
            print(*row, sep="\t")
    return rows


if __name__ == '__main__':
    conn = create_connection(DB)
    with conn:
        print("Connection open")
        rows = query_year(conn, 2019)
    print("Closing connection")
    conn.close()
