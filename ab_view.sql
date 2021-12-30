ALTER ALGORITHM = UNDEFINED DEFINER = `root` @`localhost` SQL SECURITY DEFINER VIEW `ab_view` AS
select
    `table1`.`id` AS `id`,
    `table1`.`title` AS `title`,
    `table1`.`body` AS `body`,
    `table1`.`last_modified` AS `last_modified`,
    `table1`.`created_at` AS `created_at`,
    `table2`.`id` AS `block_id`,
    `table2`.`title` AS `block_title`,
    `table2`.`description` AS `description`,
    `table2`.`image` AS `image`
from
    (
        `article_articleblock` `table2`
        left join `article_article` `table1` on((`table1`.`id` = `table2`.`article_id`))
    )