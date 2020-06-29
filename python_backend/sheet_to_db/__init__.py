#    genre.guide - From Google Sheets to Firestore
#    Copyright (C) 2020 Navith
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program. If not, see <https://www.gnu.org/licenses/>.

from os import getenv
from pathlib import Path

from firebase_admin import credentials, firestore, initialize_app
from google.cloud.firestore_v1.client import Client as FirestoreClient
from gspread import service_account, Spreadsheet


CURRENT_DIRECTORY = Path(__file__).parent
CONFIG_DIRECTORY = CURRENT_DIRECTORY.parent.parent / "config"
SHEET_SECRET_PATH = CONFIG_DIRECTORY / "sheet_secret.json"
FIREBASE_SECRET_PATH = CONFIG_DIRECTORY / "firebase_admin_secret.json"

GENRE_INFO_SHEET_NAME = getenv("GENRE_INFO_SHEET_NAME")
GENRE_SHEET_CATALOG_SHEET_NAME = getenv("CATALOG_SHEET_NAME")
GENRE_SHEET_KEY = getenv("GENRE_SHEET_KEY", "")
GENRES_SHEET_NAME = getenv("GENRES_SHEET_NAME")
SUBGENRE_SHEET_KEY = getenv("SUBGENRE_SHEET_KEY", "")


def get_genre_sheet() -> Spreadsheet:
    client = service_account(filename=str(SHEET_SECRET_PATH))

    return client.open_by_key(GENRE_SHEET_KEY)


def get_subgenre_sheet() -> Spreadsheet:
    client = service_account(filename=str(SHEET_SECRET_PATH))

    return client.open_by_key(SUBGENRE_SHEET_KEY)


def get_firestore() -> FirestoreClient:
    # Use the application default credentials
    cred = credentials.Certificate(str(FIREBASE_SECRET_PATH))
    initialize_app(cred)

    db = firestore.client()
    return db
