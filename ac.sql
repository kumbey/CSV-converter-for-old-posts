CREATE VIEW `view_humuus` AS
SELECT
    table2.*
FROM
    article_article_categories AS table1
    RIGHT JOIN ab_view AS table2 ON table1.article_id = table2.id
WHERE
    table1.category_id = 57