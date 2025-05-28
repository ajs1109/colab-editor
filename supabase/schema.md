| table_name      | column_name      | data_type                |
| --------------- | ---------------- | ------------------------ |
| activities      | id               | uuid                     |
| activities      | created_at       | timestamp with time zone |
| activities      | task_id          | uuid                     |
| activities      | user_id          | uuid                     |
| activities      | content          | ARRAY                    |
| activities      | updated_at       | timestamp with time zone |
| comments        | id               | uuid                     |
| comments        | created_at       | timestamp with time zone |
| comments        | updated_at       | timestamp with time zone |
| comments        | task_id          | uuid                     |
| comments        | user_id          | uuid                     |
| comments        | content          | text                     |
| labels          | id               | uuid                     |
| labels          | created_at       | timestamp with time zone |
| labels          | label            | text                     |
| labels          | description      | text                     |
| labels          | color            | text                     |
| labels          | project_id       | uuid                     |
| labels          | updated_at       | timestamp with time zone |
| priorities      | id               | uuid                     |
| priorities      | created_at       | timestamp with time zone |
| priorities      | label            | text                     |
| priorities      | description      | text                     |
| priorities      | color            | text                     |
| priorities      | project_id       | uuid                     |
| priorities      | updated_at       | timestamp with time zone |
| priorities      | order            | numeric                  |
| project_members | created_at       | timestamp with time zone |
| project_members | project_id       | uuid                     |
| project_members | user_id          | uuid                     |
| project_members | role             | text                     |
| project_members | invitationStatus | text                     |
| project_members | invited_at       | timestamp with time zone |
| project_members | joined_at        | timestamp with time zone |
| project_members | id               | uuid                     |
| project_members | updated_at       | timestamp with time zone |
| projects        | id               | uuid                     |
| projects        | created_at       | timestamp with time zone |
| projects        | updated_at       | timestamp with time zone |
| projects        | name             | text                     |
| projects        | description      | text                     |
| projects        | readme           | text                     |
| projects        | created_by       | uuid                     |
| projects        | closed           | boolean                  |
| sizes           | id               | uuid                     |
| sizes           | created_at       | timestamp with time zone |
| sizes           | label            | text                     |
| sizes           | description      | text                     |
| sizes           | color            | text                     |
| sizes           | project_id       | uuid                     |
| sizes           | updated_at       | timestamp with time zone |
| sizes           | order            | numeric                  |
| statuses        | id               | uuid                     |
| statuses        | created_at       | timestamp with time zone |
| statuses        | label            | text                     |
| statuses        | description      | text                     |
| statuses        | color            | text                     |
| statuses        | project_id       | uuid                     |
| statuses        | updated_at       | timestamp with time zone |
| statuses        | order            | numeric                  |
| statuses        | limit            | numeric                  |
| task_assignees  | created_at       | timestamp with time zone |
| task_assignees  | task_id          | uuid                     |
| task_assignees  | id               | uuid                     |
| task_assignees  | user_id          | uuid                     |
| task_assignees  | updated_at       | timestamp with time zone |
| task_labels     | created_at       | timestamp with time zone |
| task_labels     | label_id         | uuid                     |
| task_labels     | task_id          | uuid                     |
| task_labels     | id               | uuid                     |
| task_labels     | updated_at       | timestamp with time zone |
| tasks           | created_at       | timestamp with time zone |
| tasks           | project_id       | uuid                     |
| tasks           | status_id        | uuid                     |
| tasks           | created_by       | uuid                     |
| tasks           | updated_at       | timestamp with time zone |
| tasks           | title            | text                     |
| tasks           | description      | text                     |
| tasks           | priority         | uuid                     |
| tasks           | size             | uuid                     |
| tasks           | startDate        | timestamp with time zone |
| tasks           | endDate          | timestamp with time zone |
| tasks           | id               | uuid                     |
| tasks           | statusPosition   | numeric                  |
| users           | id               | uuid                     |
| users           | created_at       | timestamp with time zone |
| users           | email            | text                     |
| users           | name             | text                     |
| users           | description      | text                     |
| users           | avatar           | character varying        |
| users           | updated_at       | timestamp with time zone |
| users           | links            | ARRAY                    |
| users           | provider         | text                     |