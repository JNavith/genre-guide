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
from gspread import Client, Spreadsheet, authorize
from oauth2client.service_account import ServiceAccountCredentials


def get_google_sheet() -> Spreadsheet:
	scope: List[str] = ["https://www.googleapis.com/auth/drive.readonly"]
	keyfile = Path(__file__).parent.parent.parent / "config" / "sheet_secret.json"
	credentials: ServiceAccountCredentials = ServiceAccountCredentials.from_json_keyfile_name(str(keyfile), scope)
	client: Client = authorize(credentials)

	return client.open_by_key(getenv("SHEET_KEY"))


def get_firestore() -> FirestoreClient:
	# Use the application default credentials
	keyfile = Path(__file__).parent.parent.parent / "config" / "firebase_admin_secret.json"
	cred = credentials.Certificate(str(keyfile))
	initialize_app(cred)

	db = firestore.client()
	return db
