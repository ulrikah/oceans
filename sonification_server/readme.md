# Sonification server

This part of the repository contains a prototype of a client-server architecture for sonifying data queried dynamically from either Max For Live or Pure Data (Pd) through an SQLite interface in Python.

## Setup

To set it up, you need to have [python](https://www.python.org/), [pip](https://pypi.org/project/pip/), [sqlite](https://www.sqlite.org/index.html) and [Pd](https://puredata.info/) installed.

The versions that have been used are:

- `python 3.7.5`
- `pip 19.3.1`
- `Pd 0.50.0`
- `sqlite 3.24.0`

Clone the repository and navigate to the `oceans/sonification_server` folder in your terminal.

```bash
pip install python-osc
cat data/db.sql | sqlite3 chemicals.db # filling the database
python osc_server.py # starts the server
```

Open a new tab/window in your shell, and then type the following to imitate client interaction:

```bash
python debug.py # starts a debug script that mocks user interaction
```

## Using the M4L device

Drag `OceansSonification.amxd` onto a MIDI track in Ableton Live and update the parameters as shown in this video.

<video width="640" height="480" controls align="middle"><source src="https://docs.google.com/uc?export=download&id=13lhB8_vazddzqlxZ_mYx5cIBaO8RqH-k" type="video/mp4"></video>

If the Python scripts are running and it is connected at UDP port 8000, you should see the visual indicator in the M4L device.

## Using the Pd client

To open the Pd client, simply open `bridge.pd`. Try stopping the `debug.py` script to interact with the year slider.

