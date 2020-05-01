import sqlite3
from sqlite3 import Error


def create_connection(db_file):
    """ create a database connection to a SQLite database """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        # print(f"Using SQLite version {sqlite3.version}")
        return conn
    except Error as e:
        print(e)


def query_year(conn: sqlite3.Connection, year: int, country_id: int):
    q = f"""
    SELECT year, name, carbon, phosphorus, nitrogen, iron
    FROM chemicals as ch
    INNER JOIN countries AS co ON co.id = ch.country_id
    WHERE year = {year}
    AND country_id = {country_id};
    """

    return query(conn, q, True)


def query_country(conn: sqlite3.Connection, country_id: int):
    q = f"""
        SELECT name
        FROM countries WHERE id = {country_id}
        LIMIT 1;"""
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
    DB = "chemicals.db"
    conn = create_connection(DB)
    with conn:
        print("Connection open")
        rows = query_year(conn, 2019, 1)
        print(rows)
    print("Closing connection")
    conn.close()
