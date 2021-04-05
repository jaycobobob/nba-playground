import requests
from requests import get
from bs4 import BeautifulSoup
from json import dumps
import multiprocessing.dummy as mp 
from datetime import date, datetime
import string


class NBA:
    # Static Variables
    __headers = {"Accept-Language": "en-US, en;q=0.5"}

    '''
        BEGIN PRIVATE FUNCTION(S)
    '''

    '''
        END PRIVATE FUNCTION(S)
    '''

    def get_one_player_data(url):
        '''
            Collects all the basic stats about a player and returns it as a dictionary
            player_name: firstName lastName of the player
        '''
        
        results = requests.get(url, headers = NBA.__headers)
        dom = BeautifulSoup(results.text, "html.parser")
        try:
            player_name = dom.select_one("#meta > div > h1 > span").text
        except:
            print("ERROR: Could not access a playername for page: {}".format(url))
            input("ERROR: Press any key to continue")
            return []
        print("DEBUG: Getting player data for {}".format(player_name))

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
        return player_stats

    def get_all_player_urls():
        '''
            Returns a list of all Active NBA player URLs
        '''
        FIND_ONLY_ACTIVE = True

        # add 'LETTER/' where LETTER is the a-z, representing all players whose last name
        # starts with that letter.
        url = "https://www.basketball-reference.com/players/"

        out = []
        for letter in string.ascii_lowercase:
            print("DEBUG: Getting players whose last name starts with: " + letter)
            this_url = url + letter + "/"
            results = requests.get(this_url, headers = NBA.__headers)
            dom = BeautifulSoup(results.text, "html.parser")
            for element in dom.select("#players > tbody > tr > th"):
                strong = element.select_one("strong > a")
                if strong != None:
                    out.append("https://www.basketball-reference.com/" + strong["href"])
                elif not FIND_ONLY_ACTIVE:
                    out.append("https://www.basketball-reference.com/" + element["href"])

        return out

    def build_player_json(fname="playerData.js"):
        '''
            Creates a file with all NBA player data inside as a json
            Formats the file in such a way to be readable by JavaScript, with
            the dataset accessable by the value playerData

            fname:  the name of the file to write to, defaults to playerData.js
        '''
        # TODO: Change this to get playerdata for all players in NBA History
        # Currently, there are players whose data is not getting retrieved correctly.
        # An alternate solution is to directly browse the basketball reference boards
        # and only include player names in bold (with <strong> tag)

        # multithreading solution
        outfile = open(fname, "w", encoding="utf-8")
        p = mp.Pool(4)
        players = p.map(NBA.get_one_player_data, NBA.get_all_player_urls()) # takes 93 seconds
        
        p.close()
        p.join()

        # one thread solution
        #players = [NBA.get_one_player_data(player) for player in NBA.get_all_player_urls()] # takes 186 seconds

        outfile.write("var playerData =\n")
        outfile.write(dumps(players, sort_keys=False, indent=4))
        outfile.close()

init_time = datetime.now()
NBA.build_player_json("scripts/playerData.js")
final_time = datetime.now()
print("Time of execution: {}".format(final_time-init_time))