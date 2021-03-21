import requests
from requests import get
from bs4 import BeautifulSoup
from json import dumps

class NBA:
    # Static Variables
    __headers = {"Accept-Language": "en-US, en;q=0.5"}

    '''
        BEGIN PRIVATE FUNCTION(S)
    '''
    def __get_player_url(player_name):
        '''
            Creates a basketball reference url for a specified player
            player_name: firstName lastName of the player
        '''
        player_name = player_name.lower().split()
        url = "https://www.basketball-reference.com//players/{}/{}{}01.html"\
            .format(player_name[1][0], player_name[1][:5], player_name[0][:2])
        return url

    '''
        END PRIVATE FUNCTION(S)
    '''

    def get_one_player_data(player_name):
        '''
            Collects all the basic stats about a player and returns it as a dictionary
            player_name: firstName lastName of the player
        '''
        print("DEBUG: Getting player data for {}".format(player_name))
        url = NBA.__get_player_url(player_name)
        results = requests.get(url, headers = NBA.__headers)
        dom = BeautifulSoup(results.text, "html.parser")

        # getting the categories
        player_stats = {}
        player_stats["Name"] = player_name
        keys = dom.select("#per_game > thead > tr > th")
        category_heads = [key.text for key in keys]
        per_game_stats = dom.select("#per_game > tbody > tr")
        for year in per_game_stats:
            categories = year.select("th") + year.select("td")
            stats = {}
            player_stats[categories[0].text] = stats
            for i,data_val in enumerate(categories[5:]):
                try: # if a stat is empty, put zero in it
                    stats[category_heads[i+5]] = float(data_val.text)
                except:
                    stats[category_heads[i+5]] = 0.0

        return player_stats

    def get_all_player_names():
        url = "https://basketball.realgm.com/nba/players"
        results = requests.get(url, headers = NBA.__headers)
        dom = BeautifulSoup(results.text, "html.parser")
        players = dom.select('[data-th="Player"]')
        out = [player.text for player in players]

        return out

    def build_player_json(fname):
        outfile = open(fname, "w", encoding="utf-8")
        players = []
        players = [NBA.get_one_player_data(player) for player in NBA.get_all_player_names()]
        outfile.write("var playerData =\n")
        outfile.write(dumps(players, sort_keys=False, indent=4))
        outfile.close()