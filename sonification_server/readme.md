# oceans

This repository contains the code used for an interactive auditory and visual installation for [NTNU Oceans](https://www.ntnu.edu/oceans).

## setup

To set it up, you need to have python, pip, sqlite and Pure Data (Pd) installed.

The versions that have been used are:

- python 3.7.5
- pip 19.3.1
- Pd 0.50.0
- sqlite 3.24.0

Clone the repository and navigate to the `oceans` folder in your terminal.

```bash
pip install python-osc
cat data/db.sql | sqlite3 chemicals.db
python osc.py
```
