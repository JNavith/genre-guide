#    genre.guide - Google Sheets download main Python file
#    Copyright (C) 2018 Navith
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

from csv import writer
from itertools import groupby
from operator import attrgetter
from os import getenv

from gspread import authorize
from oauth2client.service_account import ServiceAccountCredentials


def main():
	scope = ["https://www.googleapis.com/auth/drive.readonly"]
	credentials = ServiceAccountCredentials.from_json_keyfile_name("client.secret.json", scope)
	
	client = authorize(credentials)
	
	genre_sheet = client.open_by_key(getenv("SHEET_KEY"))
	catalog = genre_sheet.worksheet(getenv("CATALOG_SHEET_NAME"))
	
	# Includes the header row because I suspect this will be helpful later on
	all_tracks_with_header = catalog.range(1, 1, catalog.row_count, catalog.col_count)
	
	with open("./src/csv/all_tracks.csv", "w") as csv_file:
		csv_writer = writer(csv_file, delimiter="\t")
		
		# For the case that there are no tracks, somehow (a linter thing)
		row_number = 0
		
		for row_number, row in groupby(all_tracks_with_header, key=attrgetter("row")):
			csv_writer.writerow(map(attrgetter("value"), row))
			
			if row_number == 1:
				print("wrote out the 1st track")
			if row_number % 200 == 0:
				print(f"wrote out the {row_number}th track")
		
		print(f"all {row_number} tracks have been written to CSV")


if __name__ == "__main__":
	main()
