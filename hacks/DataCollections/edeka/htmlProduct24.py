﻿# -*- coding: utf-8 -*-

shop = "edeka24"
url =  "https://www.edeka24.de"

dbhost = "127.0.0.1"
dbport = 5432
dbname = "shoppinglist"
dbuser = "postgres"
dbpass = "elite_se"

import psycopg2

# connect to db
conn = psycopg2.connect(database=dbname, user=dbuser, password=dbpass) #, host=dbhost, port=dbport)
db = conn.cursor()

# obtain shop id (create shop if it does not exist yet)
db.execute('SELECT id FROM shop WHERE "Name"=%s', (shop,))
shopId = db.fetchone()
if shopId==None:
	db.execute('INSERT INTO shop ("Name", url) VALUES (%s, %s) RETURNING id', (shop,url))
	shopId = db.fetchone()[0]
else: 
	shopId = shopId[0]


# delete old articles
db.execute('DELETE FROM article WHERE category IN (SELECT id from category WHERE shop=%s)', (shopId,))
# delete old categories
db.execute('DELETE FROM category WHERE shop=%s', (shopId,))



import urllib
from bs4 import BeautifulSoup as bs
from decimal import *


#def readArticleDetails(artId, artUrl):
	#desc = dom.find('div', id='description')

def readArticles(catId, catUrl):
	catResponse = urllib.urlopen(catUrl)
	catData = catResponse.read()
	catDom = bs(catData, "lxml")

	#divCount = catDom.find("ul", id="jqList")
	#count = divCount.text.strip()
	#count = int(count.split(' ')[0])
	#pageSize = 99
	#offset = 0

	while True:
		items = catDom.find_all("div", class_="product-details")
		for item in items:
			artLink = item.find("a")
			artName = artLink.text.strip()
			artUrl = artLink['href']

			cont = item.find("p").text.strip()
			#cont = item.find("p").text.strip().split(' ')
			#amount = cont[1]
			#unit = cont[2]

			price = item.find("div", class_="price").text.strip()
			
			pBasePrice = item.find("p", class_="price-note")
			if pBasePrice:
				basePrice = pBasePrice.text.strip()
			else:
				basePrice = ''
			
			# remove currency (' €') and replace decimal mark
			price = Decimal(price[:-2].replace('.','').replace(',','.'))

			# write category to db
			db.execute('INSERT INTO Article ("Name", artNo, url, category, price, amount, unit, data) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id', 
				(artName, None, artUrl, catId, price, None, None, cont+"   "+basePrice))
			artId = db.fetchone()[0]

		break
"""
		offset += pageSize
		if offset >= count:
			break
		# load next page
		catResponse = urllib.urlopen(catUrl+"?aoff="+str(offset))
		catData = catResponse.read()
		catDom = bs(catData, "lxml")
"""
	
def readCategories(parentDiv, parentId=None, parentUrl=url, level=0):
	# first list contains categories
	ul = parentDiv.find("ul")
	if ul:
		lis = ul.find_all("li", recursive=False)
		# iterate through all categories on current level
		for li in lis:
			# obtain category name and url
			catLink = li.find("a")
			if catLink == None:
				catLink = li.find("span")
				catName = catLink.text.strip()
				catUrl = catLink['data-link']
			else:
				catName = catLink.contents[0].strip()
				catUrl = catLink['href']

			# write category to db
			db.execute('INSERT INTO Category (parent, "Name", shop, url) VALUES (%s, %s, %s, %s) RETURNING id', (parentId, catName, shopId, catUrl))
			catId = db.fetchone()[0]
			print (4*level*' '), catName, catUrl

			# process next level
			readCategories(li, catId, catUrl, level+1)
	else:
		# no subcategories -> read articles in leaf category
		readArticles(parentId, parentUrl)
		#conn.commit()



# read categories
response = urllib.urlopen(url)
data = response.read()

dom = bs(data, "lxml")

# top-level categories are in div with class mainNavigation
nav = dom.find("nav", class_="main-nav")
readCategories(nav)



# Make the changes to the database persistent
conn.commit()
# Close communication with the database
db.close()
conn.close()