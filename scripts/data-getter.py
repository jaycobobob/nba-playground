import requests
from requests import get
from bs4 import BeautifulSoup
import pandas as pd
import numpy as  np

headers = {"Accept-Language": "en-US, en;q=0.5"}

url = "https://www.basketball-reference.com//players/c/curryst01.html"
results = requests.get(url, headers=headers)
soup = BeautifulSoup(results.text, "html.parser")

# getting the categories
playerdict = {}
keys = soup.select("#per_game > thead > tr > th")
category_heads = [key.text for key in keys]
print(category_heads)
per_game_stats = soup.select("#per_game > tbody > tr")
for year in per_game_stats:
    categories = year.select("th") + year.select("td")
    stats = {}
    playerdict[categories[0].text] = stats
    for i,data_val in enumerate(categories[5:]):
        stats[category_heads[i+5]] = float(data_val.text)

print(playerdict)