
CREATE USER :dbuser WITH PASSWORD :'dbpass';

CREATE DATABASE :dbname
   WITH OWNER :dbuser
   TEMPLATE template0
   ENCODING 'UTF8'
   TABLESPACE  pg_default
CONNECTION LIMIT -1;