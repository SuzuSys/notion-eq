# Notion-Eq: An equation numbering tool for Notion

## Getting Started

1. Get a integration token.

1. Prepare a target page and get the page id.

1. Prepare a Multiple-Tags database and get the database id.

1. Install the package

   ```terminal
   npm install @suzu-sys/notion-eq
   ```

1. create `.env` file and write a token and IDs.

   ```.env
   NOTION_TOKEN=*********************
   PAGE_ID=*********************
   MULTIPLE_TAGS_DB_ID=*********************
   ```

1. Execute the command.

   ```terminal
   notion-eq
   ```

## Parameters of .env

| Parameter             | Description                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| `NOTION_TOKEN`        | Integration token                                                                                            |
| `PAGE_ID`             | The ID of the page.                                                                                          |
| `MULTIPLE_TAGS_DB_ID` | The ID of the database containing the block that references a equation block with multiple equation numbers. |

Page and database IDs is 32-character alphanumeric strings. They can be found at the end of a Notion page or database URL.

| Type     | URL and ID part                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Page     | h<span></span>ttps://www.notion.so/Sample-Page-<span style="color: deepskyblue">9a3f0c7d5b8e1f24c6d07b1e4f3a2d8c</span>?pvs=... |
| Database | h<span></span>ttps://www.notion.so/<span style="color: deepskyblue">0f9b3d7ca1e45f28bdc07e2f6a3c9d14</span>?v=...               |

## Properties of Multiple-Tags Database

| Property         | Type  | Format                                                | Example Value                                                    |
| ---------------- | ----- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| `Paragraph Link` | Title | Link to the text block                                | [Link to the block](https://github.com/SuzuSys/notion-eq#readme) |
| `Index`          | Text  | List of the index of the equation number in the block | 1,0,1                                                            |
