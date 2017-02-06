SELECT market.id, market.name, market.latitude, market.longitude, market.street, market.zip, market.city, (CASE WHEN LOWER(market.name)LIKE'%rewe%'THEN 'REWE' ELSE 'EDEKA' END) as shop
FROM Grocerydata.Market market
WHERE market.zip = ${zip}