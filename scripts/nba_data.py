import requests
from requests import get
from bs4 import BeautifulSoup
from json import dumps
import multiprocessing.dummy as mp 
from datetime import date, datetime

class NBA:
    # Static Variables
    __headers = {"Accept-Language": "en-US, en;q=0.5"}

    '''
        BEGIN PRIVATE FUNCTION(S)
    '''
    def __get_player_url(player_name, id=1):
        '''
            Creates a basketball reference url for a specified player
            player_name: firstName lastName of the player
        '''
        player_name = "".join([c for c in player_name if c not in ",.'-"]).lower().split()
        first_name = player_name[0]
        last_name = player_name[1]
        url = "https://www.basketball-reference.com//players/{}/{}{}0{}.html"\
            .format(last_name[0], last_name[:5], first_name[:2], id)
        return url

    '''
        END PRIVATE FUNCTION(S)
    '''

    def get_one_player_data(player_name, id = 1):
        '''
            Collects all the basic stats about a player and returns it as a dictionary
            player_name: firstName lastName of the player
        '''
        print("DEBUG: Getting player data for {}, attempt {}".format(player_name, id))
        url = NBA.__get_player_url(player_name, id)
        results = requests.get(url, headers = NBA.__headers)
        dom = BeautifulSoup(results.text, "html.parser")

        # getting the categories
        player_stats = {}
        player_stats["name"] = player_name
        player_stats["statsByYear"] = {}
        keys = dom.select("#per_game > thead > tr > th")
        category_heads = [key.text for key in keys]
        per_game_stats = dom.select("#per_game > tbody > tr")
        for year in per_game_stats:
            categories = year.select("th") + year.select("td")
            stats = {}
            player_stats["statsByYear"][categories[0].text] = stats
            for i,data_val in enumerate(categories[5:]):
                try: # if a stat is empty, put zero in it
                    stats[category_heads[i+5]] = float(data_val.text)
                except:
                    stats[category_heads[i+5]] = 0.0
        #if there is a duplicate playerName in NBA history, try to find the one playing today
        if "2020-21" not in player_stats["statsByYear"]:
            return NBA.get_one_player_data(player_name, id + 1)
        return player_stats

    def get_all_player_names():
        '''
            Returns a list of all active NBA players
        '''
        url = "https://basketball.realgm.com/nba/players"
        results = requests.get(url, headers = NBA.__headers)
        dom = BeautifulSoup(results.text, "html.parser")
        players = dom.select('[data-th="Player"]')
        out = [player.text for player in players]

        return out

    def build_player_json(fname="playerData.js"):
        '''
            Creates a file with all NBA player data inside as a json
            Formats the file in such a way to be readable by JavaScript, with
            the dataset accessable by the value playerData

            fname:  the name of the file to write to, defaults to playerData.js
        '''
        # TODO: Change this to get playerdata for all players in NBA History
        outfile = open(fname, "w", encoding="utf-8")
        p = mp.Pool(4)
        players = p.map(NBA.get_one_player_data, NBA.get_all_player_names()) # takes 60 seconds
        #players = [NBA.get_one_player_data(player) for player in NBA.get_all_player_names()] # takes 200 seconds
        p.close()
        p.join()
        outfile.write("var playerData =\n")
        outfile.write(dumps(players, sort_keys=False, indent=4))
        outfile.close()

init_time = datetime.now()
NBA.build_player_json("scripts/playerData.js")
final_time = datetime.now()
print("Time of execution: {}".format(final_time-init_time))