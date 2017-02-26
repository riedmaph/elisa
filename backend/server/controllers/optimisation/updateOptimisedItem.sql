UPDATE ${schemaname:raw}.OptimisedItem 
SET name=${name}, amount=${amount}, unit=${unit}, offerUser=${offerUser}
WHERE item=${itemid} AND 
      optimisedlist = (SELECT id 
                       FROM ${schemaname:raw}.OptimisedList 
                       WHERE list = ${listid} AND endDate IS NULL 
                       AND startDate = (SELECT MAX(startDate) 
                                        FROM ${schemaname:raw}.OptimisedList 
                                        WHERE list = ${listid}  AND endDate IS NULL))