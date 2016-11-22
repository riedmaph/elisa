Edeka Article Crawlers
======================

 - **edeka.py**: all own brands, many attributes, no prices
 - **edeka24.py**: articles from onlineshop edeka24.de, including online-prices
 - **edeka-lebensmittel.py**: articles from onlineshop edeka-lebensmittel.de, including online-prices


Requirements
-------------
**Python 2.7**
```
sudo apt-get install python
```

Packages: psycopg2 (postgres driver), BeautifulSoup 4 and lxml (HTML parsers)
```
$ pip install psycopg2
$ pip install lxml
$ pip install beautifulsoup
```

Run
------
```
$ python <script.py>
```
e.g.
```
$ python edeka24.py
```